import * as THREE from 'three';
import { M } from './materials.js';
import { mesh, G, tree, rock, bricks, campfire, wheat, coins, arch, rocket, house } from './primitives.js';

/** Scenery around each chapter checkpoint, keyed by STOPS[i].deco. Each builder adds meshes to group g. */
export const DECOS = {
  intro(g){ tree(g,-6,2,1.2); tree(g,6.5,1,1,1); tree(g,8,3.4,.8); rock(g,-4,4,.9); rock(g,-3,4.8,.5); bricks(g,-9,-2,.35,3); },
  campfire(g){ campfire(g,0,3); tree(g,-6,1,1.1); tree(g,6,2,.9,1); rock(g,4,4,.7); rock(g,-4.5,3.6,.6); },
  rocks(g){ rock(g,-3,3,1.2); rock(g,-1.6,4,.7); rock(g,3,3.2,.9); rock(g,4.2,4,.5); tree(g,7,1,.9,1); },
  bigtree(g){ tree(g,0,3.4,1.9); tree(g,-5,2,.8,1); rock(g,4,3,.6); rock(g,5,3.8,.4); },
  camp(g){ campfire(g,-2,3.4); bricks(g,2,3,-.4,3); tree(g,7,1.5,1); },
  boat(g){ const hull=mesh(new THREE.BoxGeometry(3.4,.7,1.2),M.trunk(),0,.4,3.2); hull.scale.z=.9; g.add(hull); g.add(mesh(new THREE.BoxGeometry(.12,2.2,.12),M.dark(),0,1.8,3.2)); g.add(mesh(new THREE.ConeGeometry(.9,1.6,3),M.white(),.5,2.1,3.2,Math.PI/2)); rock(g,-5,2,.7); rock(g,5.4,3,.6); },
  wheatfield(g){ wheat(g,-3,3,9); wheat(g,3.4,3.4,9); tree(g,8,1,.9); },
  wheat(g){ wheat(g,0,3.4,12); rock(g,-5,3,.6); },
  pyramid(g){ g.add(mesh(G.pyramid,M.sand(),0,1.1,3.6,Math.PI/4)); g.add(mesh(G.pyramid,M.sand(),-4.4,.65,2.6,Math.PI/4,.6)); },
  tablet(g){ const s=mesh(G.slab,M.sand(),0,1.1,3.4,-.2); g.add(s); for(let r=0;r<4;r++)for(let i=0;i<3;i++) g.add(mesh(new THREE.BoxGeometry(.28,.08,.06),M.dark(),-.4+i*.4,1.8-r*.42,3.58,-.2)); rock(g,4.6,3,.6); },
  scales(g){ g.add(mesh(G.pillar,M.white(),0,1.2,3.4)); g.add(mesh(new THREE.BoxGeometry(3.2,.22,.4),M.white(),0,2.5,3.4,0)); g.add(mesh(new THREE.BoxGeometry(1,.25,1),M.gold(),-1.4,1.9,3.4)); g.add(mesh(new THREE.BoxGeometry(1,.25,1),M.gold(),1.4,2.9,3.4)); },
  coins(g){ coins(g,-1.5,3.4,6); coins(g,.5,4,4); coins(g,2,3.2,8); },
  arch(g){ arch(g,0,3.6); rock(g,-5,3,.6); rock(g,5,3.4,.5); },
  coinstack(g){ coins(g,-2,3.2,9); coins(g,0,3.8,5); coins(g,1.8,3.2,12); coins(g,3.4,3.9,3); },
  temple(g){ for(let i=0;i<4;i++) g.add(mesh(G.pillar,M.white(),-2.1+i*1.4,1.2,3.6)); g.add(mesh(new THREE.BoxGeometry(6.4,.5,1.2),M.white(),0,2.65,3.6)); g.add(mesh(new THREE.ConeGeometry(3.6,1.2,4),M.sand(),0,3.5,3.6,Math.PI/4)); },
  ziggurat(g){ for(let i=0;i<4;i++) g.add(mesh(new THREE.BoxGeometry(4.4-i*1.1,.62,4.4-i*1.1),M.sand(),0,.31+i*.62,3.8)); },
  dice(g){ g.add(mesh(G.cube,M.white(),-1,.5,3.4,.4)); g.add(mesh(G.cube,M.red(),.6,.5,3.9,-.3)); g.add(mesh(G.cube,M.white(),-.2,1.5,3.6,.9)); },
  rocketpad(g){ rocket(g,0,3.6,1.1); rock(g,-4.4,3,.6); rock(g,4.6,3.2,.5); },
  telescope(g){ g.add(mesh(new THREE.BoxGeometry(.3,1.8,.3),M.dark(),0,.9,3.4)); const t=mesh(new THREE.CylinderGeometry(.4,.55,2.4,8),M.white(),0,2.1,3.4); t.rotation.z=.9; g.add(t); rock(g,4,3,.6); },
  ship(g){ const hull=mesh(new THREE.BoxGeometry(4,.9,1.5),M.trunk(),0,.5,3.4); g.add(hull); g.add(mesh(new THREE.BoxGeometry(.14,2.8,.14),M.dark(),0,2.2,3.4)); g.add(mesh(new THREE.ConeGeometry(1.2,2,3),M.white(),.6,2.4,3.4,Math.PI/2)); },
  chart(g){ const hs=[.8,1.5,2.3,3.1]; hs.forEach((h,i)=>g.add(mesh(new THREE.BoxGeometry(.9,h,.9), i===3?M.gold():M.white(), -2+i*1.3, h/2, 3.6))); },
  factory(g){ g.add(mesh(new THREE.BoxGeometry(4.4,1.8,2.2),M.white(),0,.9,3.8)); g.add(mesh(new THREE.CylinderGeometry(.35,.42,2.4,8),M.red(),-1.3,2.9,3.8)); g.add(mesh(new THREE.CylinderGeometry(.35,.42,1.9,8),M.red(),-.3,2.6,3.8)); g.add(mesh(G.sphere,M.white(),-1.3,4.4,3.8)); },
  city(g){ [[-2.4,2.6],[-.8,3.8],[.9,3],[2.5,2.2]].forEach(([x,h],i)=>g.add(mesh(new THREE.BoxGeometry(1.2,h,1.2), i%2?M.white():M.sand(), x, h/2, 3.8))); },
  houses(g){ house(g,-2.4,3.4,.9); house(g,.4,4,1.1,M.sand()); house(g,3,3.2,.8); tree(g,5.6,2.6,.8,1); },
  rocket(g){ rocket(g,0,3.8,1.4); g.add(mesh(new THREE.ConeGeometry(.7,1,6),M.flame(),0,-0.1,3.8)); rock(g,-5,3,.5); },
};
