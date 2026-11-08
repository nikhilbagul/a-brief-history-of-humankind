import * as THREE from 'three';
import { CAM_OFFSET, CAMERA } from '../config.js';
import { easeInOutCubic, damp, nowSeconds } from '../core/easing.js';

/**
 * Single source of truth for the timeline camera.
 *   position = target + offset + parallax * parallaxWeight
 * Flights interpolate target and offset together from the current state, so a new flight
 * can start at any moment (even mid-flight) without a jump. Parallax is faded rather than
 * toggled, which removes the snap when entering/leaving the zoomed view.
 */
export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.target = new THREE.Vector3();
    this.offset = CAM_OFFSET.clone();
    this.zoomed = false;
    this.parallaxWeight = 1;
    this.flight = null;
    this._fallback = 0;
    this._zoomOffset = new THREE.Vector3();
  }

  get busy() { return !!this.flight; }

  /** Offset the rig drifts back to when idle (follows live tweaks to CAM_OFFSET). */
  restOffset() {
    return this.zoomed ? this.zoomOffset() : CAM_OFFSET;
  }

  zoomOffset() { return this._zoomOffset.copy(CAM_OFFSET).multiplyScalar(CAMERA.zoomFactor); }

  setZoomed(z) { this.zoomed = z; }

  snap(target, offset) {
    this._cancel();
    this.target.copy(target);
    this.offset.copy(offset);
  }

  /** Fly to target/offset. onProgress(easedT) runs every frame; onArrive once at the end. */
  flyTo({ target, offset, duration, onProgress, onArrive }) {
    this._cancel();
    const f = {
      t0: nowSeconds(), dur: Math.max(0.05, duration),
      fromT: this.target.clone(), toT: target.clone(),
      fromO: this.offset.clone(), toO: offset.clone(),
      onProgress, onArrive,
    };
    this.flight = f;
    // If rAF is throttled (background tab), still complete so navigation never locks up.
    this._fallback = setTimeout(() => { if (this.flight === f) this._step(f, f.t0 + f.dur); }, f.dur * 1000 + 300);
  }

  update(dt, pointer) {
    if (this.flight) this._step(this.flight, nowSeconds());
    else this.offset.lerp(this.restOffset(), damp(CAMERA.settleRate, dt));

    const p = CAMERA.parallax;
    this.parallaxWeight += ((this.zoomed ? 0 : 1) - this.parallaxWeight) * damp(p.rate, dt);
    const w = this.parallaxWeight;

    this.camera.position.copy(this.target).add(this.offset);
    this.camera.position.x += pointer.sx * p.x * w;
    this.camera.position.y -= pointer.sy * p.y * w;
    this.camera.lookAt(this.target);
  }

  _step(f, now) {
    const k = Math.min(1, (now - f.t0) / f.dur), e = easeInOutCubic(k);
    this.target.lerpVectors(f.fromT, f.toT, e);
    this.offset.lerpVectors(f.fromO, f.toO, e);
    f.onProgress?.(e);
    if (k >= 1) {
      this.flight = null;
      clearTimeout(this._fallback);
      f.onArrive?.();
    }
  }

  _cancel() {
    this.flight = null;
    clearTimeout(this._fallback);
  }
}
