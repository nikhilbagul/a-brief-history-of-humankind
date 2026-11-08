import { $, el } from './dom.js';
import { STOPS } from '../data/chapters.js';
import { MILESTONES } from '../data/milestones.js';

const MAX_CHIPS = 5;

/** Info card, progress, chapter Back/Next, event arrows and the start hint. */
export function createHud({ nav, minimap, onChip, onMore }) {
  const hud = $('hud'), card = $('card'), next = $('next'), back = $('back');
  let queued = false;

  next.onclick = () => nav.next();
  back.onclick = () => nav.back();
  $('subPrev').onclick = () => nav.step(-1);
  $('subNext').onclick = () => nav.step(1);
  $('moreBtn').onclick = () => onMore();

  function renderChips(i) {
    const list = MILESTONES.filter(m => m.stop === i), box = $('ms');
    box.replaceChildren();
    $('msWrap').style.display = list.length ? '' : 'none';
    const inventions = list.filter(m => m.inv).slice(0, MAX_CHIPS);
    inventions.forEach(m => {
      const b = el('button', { className: 'inv', onclick: () => onChip(MILESTONES.indexOf(m)) },
        m.y ? el('b', { textContent: m.y }) : null, el('span', { textContent: m.t }));
      box.append(b);
    });
    const rest = list.length - inventions.length;
    if (rest > 0) box.append(el('button', { textContent: `+${rest} more`, onclick: () => onMore() }));
  }

  function render() {
    queued = false;
    const i = nav.cur, s = STOPS[i];
    $('kicker').textContent = s.kicker;
    $('title').textContent = s.title;
    $('blurb').textContent = s.blurb;
    $('stamp').textContent = s.time;
    renderChips(i);
    minimap.update(i);
    $('prog').textContent = `${String(i + 1).padStart(2, '0')} / ${STOPS.length}`;
    $('progbar').style.width = `${((i + 1) / STOPS.length) * 100}%`;
    back.disabled = !nav.canBack();
    next.disabled = !nav.canNext();
    $('subPrev').disabled = !nav.canStep(-1);
    $('subNext').disabled = !nav.canStep(1);
    next.innerHTML = i === STOPS.length - 1 ? 'The End' : 'Next &rarr;';
    $('hint').style.opacity = i === 0 ? 0.75 : 0;
  }

  return {
    /** Coalesced to one DOM update per frame so heavy updates never land on a flight's first frame. */
    refresh() { if (!queued) { queued = true; requestAnimationFrame(render); } },
    renderNow: render,
    show() { hud.classList.remove('away'); },
    showCard() { card.classList.remove('hide'); },
    hideCard() { card.classList.add('hide'); },
    /** Slide bottom-right controls clear of the detail panel. */
    setShift(on) {
      document.querySelector('.nav').classList.toggle('shift', on);
      $('subnav').classList.toggle('shift', on);
    },
  };
}
