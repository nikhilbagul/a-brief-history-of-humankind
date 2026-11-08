/**
 * Homo Sapiens — A Brief Interactive History of Humankind
 * Composition root: builds scenes, wires navigation <-> UI, runs the frame loop.
 *
 *   data/      chapters, milestones, eras, sites (pure data)
 *   core/      engine (renderer/camera/timer), pointer, easing
 *   world/     materials, primitives, decos, icons, text3d, layout, environment, timelineWorld
 *   room/      study-room intro scene
 *   camera/    CameraRig (all timeline camera motion)
 *   nav/       Navigator (cur chapter / focus state machine)
 *   input/     picking
 *   ui/        hud, detail panel, index menu, minimap, debug panel
 */
import * as THREE from 'three';
import { CAMERA } from './config.js';
import { MILESTONES } from './data/milestones.js';
import { ERA_LABELS } from './data/eras.js';
import { createEngine } from './core/engine.js';
import { pointer, updatePointer } from './core/pointer.js';
import { nowSeconds } from './core/easing.js';
import { loadFont } from './world/text3d.js';
import { createLayout } from './world/layout.js';
import { createEnvironment } from './world/environment.js';
import { createTimelineWorld } from './world/timelineWorld.js';
import { createStudyRoom } from './room/studyRoom.js';
import { CameraRig } from './camera/cameraRig.js';
import { Navigator } from './nav/navigator.js';
import { createPicker } from './input/picking.js';
import { createHud } from './ui/hud.js';
import { createDetailPanel } from './ui/detailPanel.js';
import { createIndexMenu } from './ui/indexMenu.js';
import { createMinimap } from './ui/minimap.js';
import { createDebugPanel } from './ui/debugPanel.js';
import { createTweaks } from './tweaks.js';
import { session } from './session.js';
import { $ } from './ui/dom.js';

await loadFont();

/* ---------- scenes ---------- */
const { renderer, camera, timer, setFov } = createEngine($('scene'));
const app = { mode: 'room', fov: { ...CAMERA.fov } };   // mode: 'room' | 'opening' | 'timeline'

const scene = new THREE.Scene();
const layout = createLayout({ eras: ERA_LABELS, milestones: MILESTONES, spacing: session.spacing() });
const env = createEnvironment(scene, layout.length);
const world = createTimelineWorld({ scene, layout });
world.unlockChapter(0, { animate: false });
const room = createStudyRoom();
const rig = new CameraRig(camera);

/* ---------- navigation + UI ---------- */
let hud, detail;
const nav = new Navigator({
  world, layout, rig,
  hooks: {
    onDepart: () => hud.hideCard(),
    onArrive: i => { if (detail.isOpen()) detail.open(i); else hud.showCard(); hud.refresh(); },
    onZoom: (st, open) => { if (open) st.kind === 'event' ? detail.openMilestone(st.idx) : detail.open(st.stop); },
    refresh: () => hud.refresh(),
  },
});
const minimap = createMinimap();
detail = createDetailPanel({
  world,
  onOpen: () => { hud.setShift(true); hud.hideCard(); },
  onClose: () => { hud.setShift(false); if (nav.focus) nav.leaveFocus(); else hud.showCard(); },
});
hud = createHud({ nav, minimap, onChip: idx => detail.openMilestone(idx), onMore: () => detail.open(nav.cur) });
const menu = createIndexMenu({ current: () => nav.cur, isUnlocked: i => world.chapters[i].unlocked, onSelect: i => nav.jumpTo(i) });
const debug = createDebugPanel({
  fov: app.fov, mode: () => app.mode, setFov, spacing: layout.spacing,
  onSpacingCommit: v => { session.saveSpacing(v); session.stashResume({ cur: nav.cur, fov: app.fov }); location.reload(); },
});

/* ---------- input ---------- */
createPicker({
  dom: renderer.domElement, camera,
  isActive: () => app.mode === 'timeline',
  objects: () => world.pickables(),
  resolve: o => world.resolve(o),
  onPick: st => nav.pick(st),   // chapter models, stations, event stands: one zoom flight
});
createPicker({
  dom: renderer.domElement, camera,
  isActive: () => app.mode === 'room',
  objects: () => [room.book],
  resolve: () => room.book,
  onPick: () => openBook(),
});
$('openBook').onclick = () => openBook();

addEventListener('keydown', e => {
  if (app.mode === 'room') { if (['Enter', 'ArrowRight', ' '].includes(e.key)) openBook(); return; }
  if (app.mode !== 'timeline') return;
  switch (e.key) {
    case 'ArrowRight': case 'Enter': nav.next(); break;
    case 'ArrowLeft': nav.back(); break;
    case ',': nav.step(-1); break;
    case '.': nav.step(1); break;
    case 'Escape': menu.close(); detail.close(); break;
  }
});

/* ---------- study room -> timeline ---------- */
function enterTimeline() {
  app.mode = 'timeline';
  setFov(app.fov.timeline);
  debug.sync();
  $('roomUI').classList.add('gone');
  hud.show();
}

function openBook() {
  if (app.mode !== 'room') return;
  app.mode = 'opening';
  $('roomUI').classList.add('gone');
  renderer.domElement.style.cursor = 'default';
  room.beginOpen(camera);
  setTimeout(() => { $('fade').style.opacity = 1; }, 1150);
  setTimeout(() => { enterTimeline(); nav.startIntro(); $('fade').style.opacity = 0; }, 1750);
}

/* ---------- look presets (see tweaks.js for options) ---------- */
const applyTweaks = createTweaks({ env, world, room, fadeEl: $('fade') });
applyTweaks({ world: 'Golden hour', camera: 'Balanced', lamp: 'Reading' });
window.applyTweaks = applyTweaks;

/* ---------- resume after a spacing reload ---------- */
const resume = session.takeResume();
if (resume) {
  if (resume.fov) Object.assign(app.fov, resume.fov);
  enterTimeline();
  nav.resumeAt(resume.cur);
}
hud.renderNow();

/* ---------- frame loop ---------- */
function frame(dt) {
  updatePointer(dt);
  if (app.mode !== 'timeline') {
    room.update(camera, pointer, timer.getElapsed());
    renderer.render(room.scene, camera);
    return;
  }
  rig.update(dt, pointer);
  world.update(nowSeconds());
  env.follow(rig.target);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(time => {
  timer.update(time);
  frame(Math.min(timer.getDelta(), 0.1));
});

/** Dev handle for the console. */
if (import.meta.env.DEV) window.__sapiens = { app, nav, rig, world, hud, detail, frame: (dt = 1 / 60) => { frame(dt); hud.renderNow(); } };
