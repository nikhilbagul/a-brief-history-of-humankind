import * as THREE from 'three';
import { easeInOutCubic, nowSeconds } from '../core/easing.js';

/**
 * Dark study with a desk lamp and the book. The book's centre is the world origin;
 * desk, lamp, props and camera are all placed relative to it.
 */
export function createStudyRoom() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a090c);
  scene.fog = new THREE.Fog(0x0a090c, 1.4, 4.2);

  const rm = (c, o = {}) => new THREE.MeshStandardMaterial({
    color: c, roughness: o.r ?? 0.9, metalness: o.m ?? 0, flatShading: true, side: o.side ?? THREE.FrontSide,
  });
  const box = (w, h, d, m, x, y, z, ry = 0) => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z); o.rotation.y = ry; o.castShadow = o.receiveShadow = true;
    scene.add(o); return o;
  };
  const rod = (a, b, r, m) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), 6), m);
    o.position.copy(a).addScaledVector(dir, 0.5);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    o.castShadow = true; scene.add(o); return o;
  };

  const BOOK_T = 0.038, DESK_Y = -BOOK_T / 2, FLOOR_Y = DESK_Y - 0.75;
  const BOOK_TOP = new THREE.Vector3(0, BOOK_T / 2, 0);

  // shell + desk
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), rm(0x2a2019));
  floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR_Y; floor.receiveShadow = true; scene.add(floor);
  box(8, 3, 0.1, rm(0x3a3029), 0, FLOOR_Y + 1.5, -0.8);
  const wood = rm(0x6e4a32, { r: 0.8 });
  box(1.5, 0.04, 0.8, wood, 0, DESK_Y - 0.02, -0.06);
  [[-0.7, -0.41], [0.7, -0.41], [-0.7, 0.29], [0.7, 0.29]].forEach(([x, z]) => box(0.05, 0.71, 0.05, wood, x, FLOOR_Y + 0.355, z));
  box(1.4, 0.1, 0.03, wood, 0, DESK_Y - 0.09, -0.43);

  // book
  const book = new THREE.Group();
  book.rotation.y = -0.14;
  scene.add(book);
  {
    const board = rm(0xe8e0d2, { r: 0.7 }), pages = rm(0xf4ead2), spine = rm(0xc9502e, { r: 0.7 });
    const cover = new THREE.MeshStandardMaterial({ map: coverTexture(), roughness: 0.85, flatShading: true, color: 0xd8d0c4 });
    const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; book.add(o); };
    add(new THREE.BoxGeometry(0.16, 0.004, 0.24), board, 0, -0.017, 0);
    add(new THREE.BoxGeometry(0.152, 0.03, 0.232), pages, 0.002, 0, 0);
    add(new THREE.BoxGeometry(0.16, 0.004, 0.24), [board, board, cover, board, board, board], 0, 0.017, 0);
    add(new THREE.BoxGeometry(0.008, 0.038, 0.24), spine, -0.082, 0, 0);
  }

  // mug + pencil
  {
    const mug = rm(0x2f5a63, { r: 0.6 });
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.095, 7), mug);
    cup.position.set(0.32, DESK_Y + 0.0475, -0.12); cup.castShadow = true; scene.add(cup);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.008, 4, 6), mug);
    handle.position.set(0.363, DESK_Y + 0.05, -0.12); handle.castShadow = true; scene.add(handle);
    box(0.17, 0.008, 0.008, rm(0xe7b23c), 0.18, DESK_Y + 0.004, 0.07, 0.5);
  }

  // lamp: base -> joint -> head; shade tilted slightly back toward its own stand
  const lampM = rm(0x2f3d33, { r: 0.45, m: 0.4, side: THREE.DoubleSide });
  const LB = new THREE.Vector3(-0.46, DESK_Y, -0.26), LJ = new THREE.Vector3(-0.40, DESK_Y + 0.34, -0.26), LH = new THREE.Vector3(-0.19, DESK_Y + 0.36, -0.11);
  {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.022, 7), lampM);
    base.position.copy(LB).y += 0.011; base.castShadow = base.receiveShadow = true; scene.add(base);
    rod(LB.clone().setY(DESK_Y + 0.02), LJ, 0.008, lampM); rod(LJ, LH, 0.008, lampM);
    const joint = new THREE.Mesh(new THREE.IcosahedronGeometry(0.016, 0), lampM); joint.position.copy(LJ); scene.add(joint);
  }
  const aim = BOOK_TOP.clone().lerp(new THREE.Vector3(LB.x, BOOK_TOP.y, LB.z), 0.15);
  const shadeDir = new THREE.Vector3().subVectors(LH, aim).normalize();
  {
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.12, 8, 1, true), lampM);
    shade.position.copy(LH).addScaledVector(shadeDir, -0.02);
    shade.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), shadeDir);
    shade.castShadow = true; scene.add(shade);
  }
  const bulbP = LH.clone().addScaledVector(shadeDir, -0.06);
  const bulb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.024, 0), new THREE.MeshBasicMaterial({ color: 0xfff1c0 }));
  bulb.position.copy(bulbP); scene.add(bulb);

  const spot = new THREE.SpotLight(0xffbe5c, 4.2, 0, 0.666, 0.75, 2);
  spot.position.copy(bulbP); spot.target.position.copy(aim);
  spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.0005;
  spot.shadow.camera.near = 0.05; spot.shadow.camera.far = 3;
  const glow = new THREE.PointLight(0xffb653, 0.18, 1.4, 2);
  glow.position.copy(bulbP).add(new THREE.Vector3(0, 0.04, 0));
  const ambient = new THREE.AmbientLight(0x3a4466, 0.12);
  scene.add(spot, spot.target, glow, ambient, new THREE.HemisphereLight(0x2c3550, 0x1a120c, 0.18));

  // seated viewpoint centred on the book
  const SEAT = new THREE.Vector3(0, 0.6, 0.52);
  const look = new THREE.Vector3();
  let tween = null;

  return {
    scene, book, spot, glow, ambient,

    /** Camera dives toward the book before the fade to the timeline. */
    beginOpen(camera) {
      tween = { t0: nowSeconds(), dur: 1.7, fromP: camera.position.clone(), toP: BOOK_TOP.clone().add(new THREE.Vector3(0, 0.16, 0.05)), fromL: look.clone(), toL: BOOK_TOP.clone() };
    },

    update(camera, pointer, now) {
      if (tween) {
        const e = easeInOutCubic(Math.min(1, (nowSeconds() - tween.t0) / tween.dur));
        camera.position.lerpVectors(tween.fromP, tween.toP, e);
        look.lerpVectors(tween.fromL, tween.toL, e);
      } else {
        camera.position.copy(SEAT).add(new THREE.Vector3(pointer.sx * 0.06, -pointer.sy * 0.035 + Math.sin(now * 0.8) * 0.004, 0));
      }
      camera.lookAt(look);
    },
  };
}

function coverTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 768;
  const g = c.getContext('2d');
  g.fillStyle = '#f3eee4'; g.fillRect(0, 0, 512, 768);
  g.fillStyle = '#c9502e'; g.fillRect(0, 0, 512, 18); g.fillRect(0, 750, 512, 18);
  g.fillStyle = '#1d1a18'; g.textAlign = 'center';
  g.font = 'italic 400 92px Georgia,serif'; g.fillText('Homo', 256, 330); g.fillText('Sapiens', 256, 425);
  g.fillStyle = '#c9502e'; g.fillRect(176, 452, 160, 4);
  g.fillStyle = '#1d1a18'; g.font = '400 30px Georgia,serif';
  g.fillText('A Brief Interactive', 256, 520); g.fillText('History of Humankind', 256, 560);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
