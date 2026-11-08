// Generated from the original monolith. Pure data, no side effects.
/** Representative date for each checkpoint's station on the ground timeline. */
export const ERA_LABELS=['2.8M YRS AGO','2.5M YRS AGO','300,000 YRS AGO','70,000 YRS AGO','60,000 YRS AGO','45,000 YRS AGO','12,000 YRS AGO','9500 BCE','3500 BCE','3400 BCE','1500 BCE','1000 BCE','800 BCE','640 BCE','550 BCE','313 CE','1000 CE','1500 CE','1543 CE','1600 CE','1719 CE','1800 CE','1900 CE','TODAY','TOMORROW'];

/** Parse an era label into "years before present" (used to scale distances). */
export function yearsAgo(label){
  const s=label.replace(/,/g,''); let m;
  if(/TODAY/.test(s)) return 1;
  if(/TOMORROW/.test(s)) return .5;
  if((m=s.match(/([\d.]+)M YRS/))) return +m[1]*1e6;
  if((m=s.match(/([\d.]+) BN/))) return +m[1]*1e9;
  if((m=s.match(/([\d.]+) YRS/))) return +m[1];
  if((m=s.match(/(\d+) BCE/))) return +m[1]+2026;
  if((m=s.match(/(\d+) CE/))) return 2026-m[1];
  return 1;
}
