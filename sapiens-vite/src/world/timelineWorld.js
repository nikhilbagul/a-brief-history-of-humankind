import * as THREE from 'three';
import { YAW, LAYOUT } from '../config.js';
import { STOPS } from '../data/chapters.js';
import { MILESTONES } from '../data/milestones.js';
import { ERA_LABELS } from '../data/eras.js';
import { M, GRAY, TRANSIT_MATS, grayOut, lightUp } from './materials.js';
import { mesh } from './primitives.js';
import { DECOS } from './decos.js';
import { ICONS } from './icons.js';
import { text3d } from './text3d.js';
import { popScale, nowSeconds } from '../core/easing.js';

/**
 * Station = anything the camera can focus on.
 *   { kind:'chapter', stop, data, root, content, ring, disc, label, seg, anchor, unlocked }
 *   { kind:'event',   stop, idx, m, t, root, group, miniRing, miniDot, anchor, unlocked }
 * Every pickable mesh/group carries userData.station so picking resolves with a parent walk.
 */
export function createTimelineWorld({ scene, layout }) {
  const N = STOPS.length;
  const chapters = STOPS.map((data, i) => ({ kind: 'chapter', stop: i, data, unlocked: false, unlockAt: -1 }));
  const events = [];
  const tag = (obj, st) => { obj.userData.station = st; };

  buildChapterModels();
  const dotMaterial = buildFootpath();
  buildEventStands();
  buildTransitLine();

  /** Timeline order: chapter 0, then for each chapter s its events (by position) followed by chapter s. */
  const stations = [chapters[0]];
  for (let s = 1; s < N; s++) {
    eventsOf(s).sort((a, b) => a.t - b.t).forEach(e => stations.push(e));
    stations.push(chapters[s]);
  }

  function eventsOf(stop) { return events.filter(e => e.stop === stop); }

  function buildChapterModels() {
    chapters.forEach((ch, i) => {
      const root = new THREE.Group();
      root.position.copy(layout.stopPos(i));
      root.rotation.y = YAW;
      const content = new THREE.Group();
      root.add(content);
      if (i > 0) {
        const isNum = /^\d+$/.test(ch.data.label);
        const txt = text3d(ch.data.label, isNum ? 0.42 : 0.26, M.cream());
        txt.position.z = -2.2;
        content.add(txt);
      }
      (DECOS[ch.data.deco] || DECOS.rocks)(content);
      grayOut(content);
      tag(content, ch);
      scene.add(root);
      Object.assign(ch, { root, content });
    });
  }

  function buildFootpath() {
    const geo = new THREE.BoxGeometry(1.1, 0.06, 1.1);
    const material = new THREE.MeshStandardMaterial({ color: 0xffc38f, roughness: 1 });
    for (let i = 0; i < N - 1; i++) {
      const a = layout.stopPos(i), b = layout.stopPos(i + 1);
      const n = Math.max(5, Math.round(a.distanceTo(b) / 3.4));
      for (let k = 2; k < n - 1; k++) {
        const d = new THREE.Mesh(geo, material);
        d.position.lerpVectors(a, b, k / n).setY(0.03);
        d.rotation.y = Math.random();
        d.receiveShadow = true;
        scene.add(d);
      }
    }
    return material;
  }

  function buildEventStands() {
    const pedestal = new THREE.CylinderGeometry(0.7, 0.8, 0.3, 6);
    const goldRing = new THREE.CylinderGeometry(0.82, 0.82, 0.08, 6);
    const [f0, f1] = LAYOUT.eventSpan;
    const lanes = LAYOUT.standLanes;
    [...new Set(MILESTONES.map(m => m.stop))].forEach(stop => {
      const list = MILESTONES.filter(m => m.stop === stop), n = list.length;
      const a = layout.stopPos(stop - 1), b = layout.stopPos(stop);
      const d = new THREE.Vector3().subVectors(b, a);
      const perp = new THREE.Vector3(-d.z, 0, d.x).normalize();
      list.forEach((m, k) => {
        const t = n === 1 ? 0.5 : f0 + (f1 - f0) * k / (n - 1);
        const root = new THREE.Group();
        root.position.copy(a).addScaledVector(d, t).addScaledVector(perp, lanes[k % lanes.length]);
        root.rotation.y = YAW;
        const group = new THREE.Group();
        root.add(group);
        group.add(mesh(pedestal, M.cream(), 0, 0.15, 0));
        if (m.inv) group.add(mesh(goldRing, M.gold(), 0, 0.04, 0));
        const icon = new THREE.Group(); icon.position.y = 0.3;
        (ICONS[m.icon] || ICONS.rock)(icon);
        group.add(icon);
        if (m.y) { const tx = text3d(m.y, 0.0075, M.white(), 2); tx.position.set(0, 0.3, 0.85); tx.rotation.x = -0.25; group.add(tx); }
        grayOut(group);
        scene.add(root);
        const ev = { kind: 'event', stop, idx: MILESTONES.indexOf(m), m, t, root, group, unlocked: false, unlockAt: -1 };
        tag(group, ev);
        events.push(ev);
      });
    });
  }

  function buildTransitLine() {
    const toCamera = new THREE.Vector3(Math.sin(YAW), 0, Math.cos(YAW));
    const pts = chapters.map((_, i) => layout.stopPos(i).addScaledVector(toCamera, LAYOUT.transitOffset).setY(0.3));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    // arc-length parameter of each station on the curve
    const S = 3000, samples = Array.from({ length: S + 1 }, (_, k) => curve.getPointAt(k / S));
    const tAt = pts.map(p => { let best = 0, bd = Infinity; samples.forEach((s, k) => { const dd = s.distanceToSquared(p); if (dd < bd) { bd = dd; best = k; } }); return best / S; });
    class SubCurve extends THREE.Curve {
      constructor(a, b) { super(); this.a = a; this.b = b; }
      getPoint(t, o = new THREE.Vector3()) { return curve.getPointAt(this.a + (this.b - this.a) * t, o); }
    }
    const geo = {
      disc: new THREE.CylinderGeometry(0.62, 0.62, 0.34, 32), ring: new THREE.CylinderGeometry(0.95, 0.95, 0.26, 32),
      bigDisc: new THREE.CylinderGeometry(0.85, 0.85, 0.36, 32), bigRing: new THREE.CylinderGeometry(1.3, 1.3, 0.28, 32),
      miniDot: new THREE.CylinderGeometry(0.24, 0.24, 0.3, 20), miniRing: new THREE.CylinderGeometry(0.38, 0.38, 0.24, 20),
    };
    const LABEL = 0.043;
    chapters.forEach((ch, i) => {
      const p = pts[i], big = /^PART|SAPIENS/.test(ch.data.label);
      const ring = new THREE.Mesh(big ? geo.bigRing : geo.ring, TRANSIT_MATS.lineLocked);
      ring.position.set(p.x, 0.14, p.z); ring.castShadow = ring.receiveShadow = true;
      const disc = new THREE.Mesh(big ? geo.bigDisc : geo.disc, GRAY);
      disc.position.set(p.x, 0.18, p.z); disc.receiveShadow = true;
      scene.add(ring, disc);
      tag(ring, ch); tag(disc, ch);

      // date label lies flat beside the station, parallel to the line, on the camera side
      const tan = curve.getTangentAt(tAt[i]).setY(0).normalize();
      const side = new THREE.Vector3(-tan.z, 0, tan.x);
      if (side.dot(toCamera) < 0) { side.negate(); tan.negate(); }
      const label = text3d(ERA_LABELS[i], LABEL, GRAY, 1.4);
      label.rotation.x = -Math.PI / 2;
      const holder = new THREE.Group();
      holder.position.copy(p).addScaledVector(side, (big ? 1.3 : 0.95) + 0.4 + LABEL * 12 * 1.1).setY(0.02);
      holder.rotation.y = Math.atan2(-tan.z, tan.x);
      holder.add(label);
      scene.add(holder);

      let seg = null;
      if (i < N - 1) {
        const g = new THREE.TubeGeometry(new SubCurve(tAt[i], tAt[i + 1]), 40, 0.34, 10, false);
        g.scale(1, 0.35, 1);
        seg = new THREE.Mesh(g, TRANSIT_MATS.lineLocked);
        seg.position.y = 0.02; seg.receiveShadow = true;
        scene.add(seg);
      }
      Object.assign(ch, { ring, disc, label, seg, anchor: disc });
    });

    events.forEach(ev => {
      const p = curve.getPointAt(tAt[ev.stop - 1] + (tAt[ev.stop] - tAt[ev.stop - 1]) * ev.t);
      const miniRing = new THREE.Mesh(geo.miniRing, TRANSIT_MATS.lineLocked);
      miniRing.position.set(p.x, 0.13, p.z); miniRing.receiveShadow = true;
      const miniDot = new THREE.Mesh(geo.miniDot, GRAY);
      miniDot.position.set(p.x, 0.16, p.z);
      scene.add(miniRing, miniDot);
      tag(miniRing, ev); tag(miniDot, ev);
      Object.assign(ev, { miniRing, miniDot, anchor: miniDot });
    });
  }

  function unlockEvent(ev, { animate = true } = {}) {
    if (ev.unlocked) return;
    ev.unlocked = true;
    ev.miniRing.material = TRANSIT_MATS.lineLit;
    ev.miniDot.material = TRANSIT_MATS.stationLit;
    lightUp(ev.group);
    if (animate) ev.unlockAt = nowSeconds();
  }

  function unlockChapter(i, { animate = true } = {}) {
    const ch = chapters[i];
    ch.ring.material = TRANSIT_MATS.lineLit;
    ch.disc.material = TRANSIT_MATS.stationLit;
    ch.label.material = M.white();
    if (i > 0) chapters[i - 1].seg.material = TRANSIT_MATS.lineLit;
    eventsOf(i).forEach(e => unlockEvent(e, { animate }));
    if (ch.unlocked) return;
    ch.unlocked = true;
    lightUp(ch.content);
    if (animate) ch.unlockAt = nowSeconds();
  }

  return {
    chapters, events, stations, dotMaterial, eventsOf, unlockChapter, unlockEvent,

    /** A chapter can open its panel once reached, or once any of its events has been reached. */
    isReachable: i => chapters[i].unlocked || eventsOf(i).some(e => e.unlocked),

    /** Pickable roots for unlocked stations. */
    pickables() {
      const list = [];
      chapters.forEach(c => { if (c.unlocked) list.push(c.content, c.ring, c.disc); });
      events.forEach(e => { if (e.unlocked) list.push(e.group, e.miniRing, e.miniDot); });
      return list;
    },

    resolve(obj) {
      for (let o = obj; o; o = o.parent) if (o.userData.station) return o.userData.station;
      return null;
    },

    /** Unlock pop animations. */
    update(now) {
      chapters.forEach(c => {
        if (c.unlockAt < 0) return;
        const t = (now - c.unlockAt) / 0.7;
        c.content.scale.setScalar(popScale(Math.min(1, Math.max(0, t))));
        if (t > 1) c.unlockAt = -1;
      });
      events.forEach(e => {
        if (e.unlockAt < 0) return;
        const t = Math.min(1, Math.max(0, (now - e.unlockAt) / 0.6));
        e.group.scale.setScalar(popScale(t) * (1 + 0.25 * Math.sin(t * Math.PI)));
        if (t >= 1) { e.unlockAt = -1; e.group.scale.setScalar(1); }
      });
    },
  };
}
