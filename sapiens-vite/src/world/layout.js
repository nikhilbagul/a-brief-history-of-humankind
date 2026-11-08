import * as THREE from 'three';
import { yearsAgo } from '../data/eras.js';

/**
 * Places checkpoints along X. Each gap = base spacing
 *   + a share scaled by the real time gap (log years, sqrt-compressed)
 *   + extra room per event in that gap.
 * Z follows a gentle double sine so the path winds.
 */
export function createLayout({ eras, milestones, spacing }) {
  const ya = eras.map(yearsAgo);
  const gaps = ya.slice(0, -1).map((y, i) => Math.abs(Math.log(y / Math.max(ya[i + 1], 0.1))));
  const gmax = Math.max(...gaps);
  const xs = [0];
  gaps.forEach((g, i) => {
    const events = milestones.filter(m => m.stop === i + 1).length;
    xs.push(xs[i] + spacing * (0.7 + 0.8 * Math.sqrt(g / gmax)) + events * spacing * 0.2);
  });

  return {
    spacing,
    length: xs[xs.length - 1],
    /** World position of checkpoint i (new vector each call). */
    stopPos: i => new THREE.Vector3(xs[i], 0, Math.sin(i * 0.7) * 14 + Math.cos(i * 0.31) * 6),
  };
}
