import * as THREE from 'three';
import { M } from './materials.js';

/** Mesh factory: position, y-rotation, uniform scale; shadows on. */
export function mesh(geo, material, x = 0, y = 0, z = 0, ry = 0, sc = 1) {
  const o = new THREE.Mesh(geo, material);
  o.position.set(x, y, z);
  o.rotation.y = ry;
  if (sc !== 1) o.scale.setScalar(sc);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}

/** Shared low-poly geometries. */
export const G = {
  treeTop: new THREE.CylinderGeometry(0.42, 0.95, 2.6, 4),
  trunk: new THREE.BoxGeometry(0.34, 1, 0.34),
  rock: new THREE.DodecahedronGeometry(1, 0),
  brick: new THREE.BoxGeometry(1.5, 0.62, 0.75),
  log: new THREE.CylinderGeometry(0.16, 0.16, 1.5, 6),
  flame: new THREE.ConeGeometry(0.55, 1.3, 5),
  stem: new THREE.BoxGeometry(0.09, 1.4, 0.09),
  grain: new THREE.ConeGeometry(0.16, 0.7, 4),
  pyramid: new THREE.ConeGeometry(2.2, 2.2, 4),
  slab: new THREE.BoxGeometry(1.6, 2.2, 0.35),
  coin: new THREE.CylinderGeometry(0.62, 0.62, 0.2, 10),
  pillar: new THREE.BoxGeometry(0.55, 2.4, 0.55),
  beam: new THREE.BoxGeometry(3.4, 0.45, 0.7),
  cube: new THREE.BoxGeometry(1, 1, 1),
  tube: new THREE.CylinderGeometry(0.32, 0.32, 2.6, 8),
  cone: new THREE.ConeGeometry(0.55, 1, 8),
  fin: new THREE.BoxGeometry(0.16, 0.9, 0.7),
  sphere: new THREE.IcosahedronGeometry(0.5, 0),
};

/* Composite props, all added to group `g`. */
export function tree(g, x, z, s = 1, alt) {
  g.add(mesh(G.trunk, M.trunk(), x, 0.5 * s, z, 0, s));
  g.add(mesh(G.treeTop, alt ? M.leaf2() : M.leaf(), x, 2.3 * s, z, Math.random() * 3, s));
}
export function rock(g, x, z, s = 1) {
  const r = mesh(G.rock, M.white(), x, 0.55 * s, z, Math.random() * 3, s);
  r.scale.set(s, s * 0.62, s);
  g.add(r);
}
export function bricks(g, x, z, ry, n = 4) {
  for (let r = 0; r < 2; r++) for (let i = 0; i < n - r; i++) {
    const d = (i + r * 0.5) * 1.62;
    const b = mesh(G.brick, M.white(), x + Math.cos(ry) * d, 0.33 + r * 0.64, z + Math.sin(ry) * d, -ry);
    b.rotation.z = (Math.random() - 0.5) * 0.04;
    g.add(b);
  }
}
export function campfire(g, x, z) {
  for (let i = 0; i < 4; i++) {
    g.add(mesh(G.log, M.dark(), x + Math.cos(i * 1.57) * 0.3, 0.18, z + Math.sin(i * 1.57) * 0.3, 0)).rotation.set(Math.PI / 2.3, i * 1.57, 0);
  }
  g.add(mesh(G.flame, M.flame(), x, 0.8, z));
  g.add(mesh(G.flame, M.gold(), x, 1, z, 0, 0.55));
}
export function wheat(g, x, z, n = 7) {
  for (let i = 0; i < n; i++) {
    const a = i * 2.39, r = 0.4 + Math.sqrt(i) * 0.5;
    const wx = x + Math.cos(a) * r, wz = z + Math.sin(a) * r;
    g.add(mesh(G.stem, M.gold(), wx, 0.7, wz));
    g.add(mesh(G.grain, M.gold(), wx, 1.65, wz));
  }
}
export function coins(g, x, z, n = 5) {
  for (let i = 0; i < n; i++) g.add(mesh(G.coin, M.gold(), x + (Math.random() - 0.5) * 0.3, 0.1 + i * 0.21, z + (Math.random() - 0.5) * 0.3, Math.random()));
}
export function arch(g, x, z) {
  g.add(mesh(G.pillar, M.white(), x - 1.4, 1.2, z));
  g.add(mesh(G.pillar, M.white(), x + 1.4, 1.2, z));
  g.add(mesh(G.beam, M.white(), x, 2.6, z));
}
export function rocket(g, x, z, s = 1) {
  g.add(mesh(G.tube, M.white(), x, 1.3 * s, z, 0, s));
  g.add(mesh(G.cone, M.red(), x, 3.1 * s, z, 0, s));
  for (let i = 0; i < 3; i++) g.add(mesh(G.fin, M.red(), x + Math.cos(i * 2.09) * 0.4 * s, 0.45 * s, z + Math.sin(i * 2.09) * 0.4 * s, -i * 2.09));
}
export function house(g, x, z, s = 1, m) {
  g.add(mesh(new THREE.BoxGeometry(1.6, 1.1, 1.4), m || M.white(), x, 0.55 * s, z, 0, s));
  g.add(mesh(new THREE.ConeGeometry(1.35, 0.9, 4), M.red(), x, 1.55 * s, z, Math.PI / 4, s));
}
