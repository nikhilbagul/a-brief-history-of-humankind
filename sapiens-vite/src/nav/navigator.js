import * as THREE from 'three';
import { CAM_OFFSET, CAMERA, flightDuration } from '../config.js';
import { clamp } from '../core/easing.js';

/**
 * Navigation state machine.
 *   cur   – chapter shown in the HUD.
 *   focus – station the camera is zoomed on (null = chapter overview).
 * Every move is a single camera flight from wherever the camera is now; there are no chained
 * "fly to chapter, then fly back to the event" sequences.
 *
 * hooks: { onDepart(), onArrive(chapterIndex), onZoom(station, openPanel), refresh() }
 */
export class Navigator {
  constructor({ world, layout, rig, hooks }) {
    this.world = world;
    this.layout = layout;
    this.rig = rig;
    this.hooks = hooks;
    this.count = world.chapters.length;
    this.cur = 0;
    this.focus = null;
  }

  get busy() { return this.rig.busy; }

  chapterTarget(i) {
    return this.layout.stopPos(i).add(new THREE.Vector3(0, CAMERA.lookHeight, 0));
  }

  stationTarget(st) {
    const v = st.anchor.getWorldPosition(new THREE.Vector3());
    v.y = CAMERA.stationY;
    return v;
  }

  /** Opening shot after the study-room transition. */
  startIntro() {
    const t = this.chapterTarget(0);
    this.rig.snap(t.clone().add(new THREE.Vector3(10, 0, 0)), new THREE.Vector3(-30, 70, 60));
    this.rig.flyTo({ target: t, offset: CAM_OFFSET, duration: 2.4, onArrive: () => this.hooks.onArrive(0) });
    this.hooks.onDepart();
    this.hooks.refresh();
  }

  /** Restore a chapter instantly (after a spacing reload). */
  resumeAt(i) {
    this.cur = clamp(i | 0, 0, this.count - 1);
    for (let k = 0; k <= this.cur; k++) this.world.unlockChapter(k, { animate: false });
    this.rig.setZoomed(false);
    this.rig.snap(this.chapterTarget(this.cur), CAM_OFFSET);
    this.hooks.onArrive(this.cur);
  }

  /** Chapter overview. Events of the destination light up as the camera passes them. */
  goToChapter(i) {
    if (i < 0 || i >= this.count) return;
    this.focus = null;
    this.cur = i;
    this.rig.setZoomed(false);
    const target = this.chapterTarget(i);
    const pending = this.world.eventsOf(i).filter(e => !e.unlocked);
    this.rig.flyTo({
      target, offset: CAM_OFFSET,
      duration: flightDuration(this.rig.target.distanceTo(target)),
      onProgress: e => pending.forEach(ev => { if (!ev.unlocked && e >= ev.t) this.world.unlockEvent(ev); }),
      onArrive: () => { this.world.unlockChapter(i); this.hooks.onArrive(i); },
    });
    this.hooks.onDepart();
    this.hooks.refresh();
  }

  /** Zoom straight onto a station on the ground timeline, keeping it centred. */
  zoomTo(st, { openPanel = true } = {}) {
    if (st.kind === 'event') {
      this.world.unlockEvent(st);
      // An event of the next, unreached chapter keeps the HUD on the current chapter.
      if (this.world.chapters[st.stop].unlocked) this.cur = st.stop;
    } else {
      this.cur = st.stop;
    }
    this.focus = st;
    this.rig.setZoomed(true);
    const target = this.stationTarget(st);
    this.rig.flyTo({
      target, offset: this.rig.zoomOffset().clone(),
      duration: flightDuration(this.rig.target.distanceTo(target), 1.1),
      onArrive: () => { if (st.kind === 'chapter') this.world.unlockChapter(st.stop); this.hooks.refresh(); },
    });
    this.hooks.onZoom(st, openPanel);
    this.hooks.refresh();
  }

  /** Back to the chapter overview from a zoomed station. */
  leaveFocus() {
    if (this.focus) this.goToChapter(this.cur);
  }

  /* ----- user commands (ignored while the camera is flying) ----- */

  stationIndex() {
    const s = this.world.stations;
    return this.focus ? s.indexOf(this.focus) : s.indexOf(this.world.chapters[this.cur]);
  }

  canStep(dir) {
    if (this.busy) return false;
    const k = this.stationIndex() + dir;
    return k >= 0 && k < this.world.stations.length;
  }

  /** Arrow buttons: events get a close-up, chapter stations get the overview. */
  step(dir) {
    if (this.busy) return;
    const st = this.world.stations[this.stationIndex() + dir];
    if (!st) return;
    if (st.kind === 'chapter') this.goToChapter(st.stop);
    else this.zoomTo(st);
  }

  /** An event sits between chapter stop-1 and stop; Back/Next go to the chapters either side of it. */
  backTarget() { return this.focus?.kind === 'event' ? this.focus.stop - 1 : this.cur - 1; }
  nextTarget() { return this.focus?.kind === 'event' ? this.focus.stop : this.cur + 1; }
  canBack() { return !this.busy && this.backTarget() >= 0; }
  canNext() { return !this.busy && this.nextTarget() <= this.count - 1; }
  back() { if (this.canBack()) this.goToChapter(this.backTarget()); }
  next() { if (this.canNext()) this.goToChapter(this.nextTarget()); }

  jumpTo(i) { if (!this.busy && i !== this.cur) this.goToChapter(i); }

  pick(st) { if (!this.busy && st) this.zoomTo(st); }
}
