import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { $ } from './dom.js';
import { WORLD_ATLAS_URL } from '../config.js';
import { STOPS } from '../data/chapters.js';
import { SITES, STOP_SITES } from '../data/sites.js';

const W = 260, DOT = '#ff3b2f';

/** World minimap with pulsing dots for known human sites at the current checkpoint (d3 + world-atlas). */
export function createMinimap() {
  const state = { ready: false, proj: null, layer: null, pending: 0 };

  (async () => {
    try {
      const topo = await (await fetch(WORLD_ATLAS_URL)).json();
      const land = topojson.feature(topo, topo.objects.land);
      const proj = d3.geoNaturalEarth1().rotate([-10, 0]).fitWidth(W, { type: 'Sphere' });
      const top = proj([0, 83])[1], bot = proj([0, -57])[1];     // crop Antarctica / high Arctic
      proj.translate([proj.translate()[0], proj.translate()[1] - top + 4]);
      const H = Math.ceil(bot - top + 8);
      const svg = d3.select('#mmSvg').attr('viewBox', `0 0 ${W} ${H}`);
      svg.append('defs').append('clipPath').attr('id', 'mmClip').append('rect').attr('width', W).attr('height', H);
      svg.append('g').attr('clip-path', 'url(#mmClip)').append('path').datum(land).attr('d', d3.geoPath(proj))
        .attr('fill', 'rgba(255,255,255,.5)').attr('stroke', 'rgba(255,255,255,.5)').attr('stroke-width', 2.6).attr('stroke-linejoin', 'round');
      Object.assign(state, { ready: true, proj, layer: svg.append('g') });
      update(state.pending);
    } catch (err) {
      console.warn('minimap failed', err);
      $('minimap').style.display = 'none';
    }
  })();

  function update(i) {
    $('mmWhen').textContent = STOPS[i].time;
    state.pending = i;
    if (!state.ready) return;
    const data = (STOP_SITES[i] || []).map(k => ({ k, s: SITES[k] })).filter(d => d.s);
    const sel = state.layer.selectAll('g.site').data(data, d => d.k);
    sel.exit().transition().duration(300).attr('opacity', 0).remove();
    const enter = sel.enter().append('g').attr('class', 'site').attr('opacity', 0)
      .attr('transform', d => { const p = state.proj([d.s[1], d.s[2]]); return `translate(${p[0]},${p[1]})`; });
    enter.append('title').text(d => d.s[0]);
    enter.append('circle').attr('class', 'pulse').attr('r', 3.2).attr('fill', DOT);
    enter.append('circle').attr('r', 0).attr('fill', DOT).attr('stroke', 'rgba(255,255,255,.85)').attr('stroke-width', 0.8)
      .transition().delay((d, k) => 200 + k * 45).duration(420).ease(d3.easeBackOut.overshoot(2.2)).attr('r', 3.6);
    enter.transition().delay((d, k) => 200 + k * 45).duration(200).attr('opacity', 1);
  }

  return { update };
}
