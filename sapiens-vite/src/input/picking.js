import * as THREE from 'three';

const DRAG_TOLERANCE = 6;

/**
 * Click + hover picking on a canvas. `objects()` returns candidates, `resolve(mesh)` maps a hit
 * to a domain object (or null). The nearest resolvable hit wins.
 */
export function createPicker({ dom, camera, isActive, objects, resolve, onPick }) {
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let down = null;

  const pick = e => {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    for (const h of ray.intersectObjects(objects(), true)) {
      const r = resolve(h.object);
      if (r) return r;
    }
    return null;
  };

  dom.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
  dom.addEventListener('pointerup', e => {
    if (!isActive() || !down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > DRAG_TOLERANCE;
    down = null;
    if (moved) return;
    const r = pick(e);
    if (r) onPick(r);
  });
  dom.addEventListener('pointermove', e => {
    if (isActive()) dom.style.cursor = pick(e) ? 'pointer' : 'default';
  });
}
