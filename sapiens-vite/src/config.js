import * as THREE from 'three';

/** Camera framing for the timeline. CAM_OFFSET is mutated by the "Camera" tweak; everything reads it live. */
export const CAM_OFFSET = new THREE.Vector3(-9, 22, 26);
/** Fixed facing for 3D text and props, captured from the initial offset so tweaks never re-orient the world. */
export const YAW = Math.atan2(CAM_OFFSET.x, CAM_OFFSET.z);

export const CAMERA = {
  fov: { room: 50, timeline: 40 },
  near: 0.1,
  far: 400,
  lookHeight: 1.5,      // chapter view looks this far above the checkpoint origin
  zoomFactor: 0.16,     // zoomed offset = CAM_OFFSET * zoomFactor
  stationY: 0.16,       // look-at height when focused on a timeline station
  settleRate: 2.5,      // exp-damping rate for offset drift when idle
  parallax: { x: 2.2, y: 1.4, rate: 5 },
};

/** Mutable runtime settings (tweaks). */
export const settings = { camSpeed: 1 };

/** Flight duration from travel distance, scaled by the camera-speed tweak. */
export function flightDuration(distance, min = 0.9) {
  return Math.min(2.8, Math.max(min, 0.9 + distance / 45)) * settings.camSpeed;
}

export const LAYOUT = {
  spacing: { min: 12, max: 80, step: 2, default: 28 },
  transitOffset: 7.6,                 // ground timeline sits this far toward the camera
  standLanes: [4.2, -4.5, -8, 5.6],   // sideways offsets for event stands
  eventSpan: [0.16, 0.84],            // events spread across this fraction of a gap
};

export const COLORS = {
  orange: 0xf8823a,
  gray: 0xc9b8ab,
  white: 0xffffff,
};

export const STORAGE = { spacing: 'sapiens.spacing', resume: 'sapiens.resume' };

export const FONT_URL = 'https://unpkg.com/three@0.184.0/examples/fonts/helvetiker_bold.typeface.json';
export const WORLD_ATLAS_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
