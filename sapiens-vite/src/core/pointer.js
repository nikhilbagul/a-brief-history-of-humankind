import { damp } from './easing.js';

/** Normalised pointer position (-1..1) plus a smoothed copy used for camera parallax. */
export const pointer = { x: 0, y: 0, sx: 0, sy: 0 };

addEventListener('pointermove', e => {
  pointer.x = (e.clientX / innerWidth - 0.5) * 2;
  pointer.y = (e.clientY / innerHeight - 0.5) * 2;
});

export function updatePointer(dt) {
  const k = damp(3.7, dt);
  pointer.sx += (pointer.x - pointer.sx) * k;
  pointer.sy += (pointer.y - pointer.sy) * k;
}
