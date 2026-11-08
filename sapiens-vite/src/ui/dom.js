export const $ = id => document.getElementById(id);

/** Tiny element builder: el('div', {className:'x'}, 'text', child) */
export function el(tag, props = {}, ...children) {
  const n = document.createElement(tag);
  Object.assign(n, props);
  for (const c of children) if (c != null) n.append(c);
  return n;
}
