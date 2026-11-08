import { CAM_OFFSET, settings } from './config.js';

const PALETTES = {
  'Golden hour': { sky: ['#ffa64d', '#f8823a', '#ee6c32'], ground: 0xffa055, dots: 0xffc38f, ambient: 0xffe6c8, ambientIntensity: 1.15, hemiSky: 0xffd9b0, hemiGround: 0xd96a2e, sun: 0xfff2df, sunIntensity: 2.1 },
  'Dusk':        { sky: ['#7b5cc4', '#c25a8f', '#e8766b'], ground: 0xd27a8c, dots: 0xf2b0bc, ambient: 0xf0d8ff, ambientIntensity: 1.05, hemiSky: 0xffc6e0, hemiGround: 0x7a3d7a, sun: 0xffd6c2, sunIntensity: 1.9 },
  'Seafoam':     { sky: ['#a6dccd', '#6fbfae', '#4fa597'], ground: 0x86cbb8, dots: 0xc8eee2, ambient: 0xf0fff8, ambientIntensity: 1.15, hemiSky: 0xe0fff4, hemiGround: 0x3e8a7e, sun: 0xfffaf0, sunIntensity: 2.1 },
  'Night':       { sky: ['#1b2650', '#2c3d6e', '#3c4f86'], ground: 0x3d5088, dots: 0x7088c8, ambient: 0xb0c0ff, ambientIntensity: 0.8, hemiSky: 0x9fb2ff, hemiGround: 0x1c2547, sun: 0xd6e0ff, sunIntensity: 1.3 },
};
const CAMS = {
  Cinematic: { offset: [-11, 27, 32], speed: 1.6 },
  Balanced: { offset: [-9, 22, 26], speed: 1 },
  Snappy: { offset: [-6.5, 13, 18.5], speed: 0.6 },
};
const LAMPS = {
  Candle: { color: 0xff9436, intensity: 2.2, angle: 0.58, ambient: 0.07 },
  Reading: { color: 0xffbe5c, intensity: 4.2, angle: 0.666, ambient: 0.12 },
  Daylight: { color: 0xfff1dc, intensity: 7, angle: 0.81, ambient: 0.26 },
};

/** Returns applyTweaks(t) for the host Tweaks panel: { world, camera, lamp }. */
export function createTweaks({ env, world, room, fadeEl }) {
  return function applyTweaks(t) {
    const p = PALETTES[t.world] || PALETTES['Golden hour'];
    env.setPalette(p);
    world.dotMaterial.color.setHex(p.dots);
    document.body.style.background = `linear-gradient(160deg,${p.sky.join(',')})`;
    fadeEl.style.background = p.sky[1];

    const cam = CAMS[t.camera] || CAMS.Balanced;
    CAM_OFFSET.set(...cam.offset);   // the rig eases toward the new framing
    settings.camSpeed = cam.speed;

    const l = LAMPS[t.lamp] || LAMPS.Reading;
    room.spot.color.setHex(l.color); room.spot.intensity = l.intensity; room.spot.angle = l.angle;
    room.glow.color.setHex(l.color); room.ambient.intensity = l.ambient;
  };
}
