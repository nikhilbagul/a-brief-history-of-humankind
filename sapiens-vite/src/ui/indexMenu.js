import { $, el } from './dom.js';
import { STOPS } from '../data/chapters.js';

/** Hamburger "Contents" menu. */
export function createIndexMenu({ current, isUnlocked, onSelect }) {
  const panel = $('indexPanel'), list = $('indexNav');

  STOPS.forEach((s, i) => {
    if (i === 0) list.append(el('div', { className: 'part', textContent: 'Introduction' }));
    if (s.part && /^PART/.test(s.label)) list.append(el('div', { className: 'part', textContent: s.kicker }));
    const b = el('button', { className: 'item', onclick: () => { onSelect(i); close(); } },
      el('span', { className: 'no', textContent: /^\d+$/.test(s.label) ? s.label : '\u2022' }),
      el('span', { textContent: s.title }));
    b.dataset.i = i;
    list.append(b);
  });

  function refresh() {
    list.querySelectorAll('button.item').forEach(b => {
      const i = +b.dataset.i;
      b.classList.toggle('active', i === current());
      b.classList.toggle('locked', !isUnlocked(i) && i !== current());
    });
  }
  function open() { refresh(); panel.classList.add('open'); }
  function close() { panel.classList.remove('open'); }

  $('menuBtn').onclick = open;
  $('closeIndex').onclick = close;
  return { open, close };
}
