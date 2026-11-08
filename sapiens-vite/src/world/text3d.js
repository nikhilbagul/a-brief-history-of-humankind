import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FONT_URL } from '../config.js';

let font = null;
const geoCache = new Map();

export async function loadFont() {
  font = await new FontLoader().loadAsync(FONT_URL);
}

/**
 * Extruded, bevelled 3D text. Geometry is centred on X/Z with its baseline at y=0, and cached per (text,size,depth).
 * `cell` is the legacy size unit (size = cell * 12).
 */
export function text3d(text, cell, material, depth = 2.4) {
  if (!font) throw new Error('text3d: call loadFont() first');
  const size = cell * 12, key = `${text}|${size}|${depth}`;
  let geo = geoCache.get(key);
  if (!geo) {
    geo = new TextGeometry(text, {
      font, size, depth: size * 0.32 * depth / 2.4, curveSegments: 3,
      bevelEnabled: true, bevelThickness: size * 0.06, bevelSize: size * 0.035, bevelOffset: 0, bevelSegments: 1,
    });
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
    geo.computeVertexNormals();
    geoCache.set(key, geo);
  }
  const m = new THREE.Mesh(geo, material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
