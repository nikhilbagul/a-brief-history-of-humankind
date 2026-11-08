import { STORAGE, LAYOUT } from './config.js';
import { clamp } from './core/easing.js';

/** Persisted spacing + one-shot resume state used across a spacing reload. */
export const session = {
  spacing() {
    const s = LAYOUT.spacing;
    return clamp(+(localStorage.getItem(STORAGE.spacing) || s.default), s.min, s.max);
  },
  saveSpacing(v) { localStorage.setItem(STORAGE.spacing, String(v)); },
  stashResume(state) { sessionStorage.setItem(STORAGE.resume, JSON.stringify(state)); },
  takeResume() {
    const raw = sessionStorage.getItem(STORAGE.resume);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE.resume);
    try { return JSON.parse(raw); } catch { return null; }
  },
};
