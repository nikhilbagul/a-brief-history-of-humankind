import { $ } from './dom.js';

/** Top-centre debug bar: FOV (live, per scene) and checkpoint spacing (applied on reload). Toggle with D. */
export function createDebugPanel({ fov, mode, setFov, spacing, onSpacingCommit }) {
  const fovIn = $('fovIn'), fovOut = $('fovOut'), spIn = $('spIn'), spOut = $('spOut');
  const key = () => (mode() === 'timeline' ? 'timeline' : 'room');

  function sync() { fovIn.value = fov[key()]; fovOut.textContent = `${fov[key()]}°`; }

  fovIn.addEventListener('input', () => {
    fov[key()] = +fovIn.value;
    fovOut.textContent = `${fovIn.value}°`;
    setFov(fov[key()]);
  });

  spIn.value = spacing; spOut.textContent = spacing;
  spIn.addEventListener('input', () => { spOut.textContent = spIn.value; });
  spIn.addEventListener('change', () => onSpacingCommit(+spIn.value));

  addEventListener('keydown', e => { if (e.key === 'd' || e.key === 'D') $('debug').classList.toggle('hidden'); });

  sync();
  return { sync };
}
