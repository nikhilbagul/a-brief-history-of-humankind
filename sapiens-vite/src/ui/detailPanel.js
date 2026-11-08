import { $, el } from './dom.js';
import { STOPS } from '../data/chapters.js';
import { MILESTONES } from '../data/milestones.js';

/** Right-hand "Read more" panel: chapter summary + that chapter's dated events. */
export function createDetailPanel({ world, onOpen, onClose }) {
  const panel = $('detailPanel'), body = panel.querySelector('.body');
  $('closeDetail').onclick = () => close();

  function open(i) {
    if (!world.isReachable(i)) return false;
    const s = STOPS[i];
    $('dKicker').textContent = s.kicker;
    $('dTitle').textContent = s.title;
    $('dWhen').textContent = s.time;
    $('dSections').replaceChildren(...(s.detail || []).map(([h, p]) =>
      el('div', { className: 'sec' }, el('h4', { textContent: h }), el('p', { textContent: p }))));

    const list = MILESTONES.filter(m => m.stop === i);
    const rows = list.map(m => {
      const title = el('h5', { textContent: m.t }, m.inv ? el('span', { textContent: 'Invention' }) : null);
      const row = el('div', { className: 'mi' },
        el('div', { className: 'y', textContent: m.when }), title, el('p', { textContent: m.d }),
        m.gen ? el('p', { className: 'gen', textContent: m.gen }) : null);
      row.dataset.ms = MILESTONES.indexOf(m);
      return row;
    });
    $('dMilestones').replaceChildren(...(list.length ? [
      el('div', { className: 'msh' }, el('h4', { textContent: 'Timeline of Humanity' }), el('p', { textContent: 'What the archaeological record shows for this period' })),
      ...rows,
    ] : []));

    panel.classList.add('open');
    onOpen();
    return true;
  }

  /** Open the owning chapter and scroll to / flash one event. */
  function openMilestone(idx) {
    if (!open(MILESTONES[idx].stop)) return;
    const row = panel.querySelector(`.mi[data-ms="${idx}"]`);
    if (!row) return;
    body.scrollTop = row.offsetTop - body.offsetTop - 80;
    row.classList.add('flash');
    setTimeout(() => row.classList.remove('flash'), 1600);
  }

  function close() {
    if (!isOpen()) return;
    panel.classList.remove('open');
    onClose();
  }

  const isOpen = () => panel.classList.contains('open');

  return { open, openMilestone, close, isOpen };
}
