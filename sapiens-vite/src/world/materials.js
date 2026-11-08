import * as THREE from 'three';
import { COLORS } from '../config.js';

const cache = {};
/** Shared flat-shaded material, created once per name. */
export function mat(name, color, opts = {}) {
  if (!cache[name]) {
    cache[name] = new THREE.MeshStandardMaterial({
      name, color, roughness: opts.rough ?? 0.95, metalness: opts.metal ?? 0, flatShading: true,
    });
  }
  return cache[name];
}

/** Palette used by props, icons and text. */
export const M = {
  cream: () => mat('cream', 0xf7efe5),
  white: () => mat('white', 0xfdf9f4),
  leaf: () => mat('leaf', 0xd9e356),
  leaf2: () => mat('leaf2', 0xc4d13f),
  trunk: () => mat('trunk', 0xe0aa72),
  red: () => mat('red', 0xe8563f),
  dark: () => mat('dark', 0x4a3b30),
  gold: () => mat('gold', 0xf6bd3a),
  sand: () => mat('sand', 0xf3d9a8),
  blue: () => mat('blue', 0x7fc6c9),
  flame: () => mat('flame', 0xff8c33),
};

/** Locked (not yet reached) look. */
export const GRAY = new THREE.MeshStandardMaterial({
  name: 'gray', color: COLORS.gray, roughness: 1, flatShading: true, transparent: true, opacity: 0.85,
});

/** Ground timeline (transit line) materials. */
export const TRANSIT_MATS = {
  lineLit: new THREE.MeshStandardMaterial({ color: COLORS.white, roughness: 0.55 }),
  lineLocked: new THREE.MeshStandardMaterial({ color: COLORS.gray, roughness: 0.8 }),
  stationLit: new THREE.MeshStandardMaterial({ color: COLORS.orange, roughness: 0.5 }),
};

/** Swap every mesh under `root` to GRAY, remembering the lit material. */
export function grayOut(root) {
  root.traverse(o => { if (o.isMesh) { o.userData.litMat = o.material; o.material = GRAY; } });
}
export function lightUp(root) {
  root.traverse(o => { if (o.isMesh && o.userData.litMat) o.material = o.userData.litMat; });
}
