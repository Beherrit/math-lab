// Reading pictures back for the level 0 tests: attributes, counts, shapes, positions and well-formedness.
export const strip = s => String(s ?? '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '');
export const attrAll = (html, name) => [...String(html ?? '').matchAll(new RegExp(`\\sdata-${name}="([^"]*)"`, 'g'))].map(m => m[1]);
export const attr = (html, name) => attrAll(html, name)[0];
export const countOf = (html, name, value) => attrAll(html, name).filter(v => value === undefined || v === String(value)).length;
export const fillOf = html => (String(html).match(/\sfill="(#[0-9a-fA-F]{6})"/) || [])[1];
export const root = html => String(html).match(/^<svg[^>]*>/)?.[0] ?? '';

// Text elements with their attributes and text, in document order.
export function texts(html) {
  return [...String(html).matchAll(/<text([^>]*)>([^<]*)<\/text>/g)].map(m => ({ attrs: m[1], text: m[2], i: (m[1].match(/data-i="(\d+)"/) || [])[1], v: (m[1].match(/data-v="(\d+)"/) || [])[1], hidden: /data-hidden/.test(m[1]), letter: (m[1].match(/data-letter="([^"]*)"/) || [])[1] }));
}
// Everything in a pattern row in order: its data-key or "HOLE".
export function rowKeys(html) {
  return [...String(html).matchAll(/data-key="([^"]+)"|data-hole="1"/g)].map(m => m[1] ?? 'HOLE');
}
// Shapes placed in a scene: <g data-shape transform="translate(x y)">.
export function sceneShapes(html) {
  return [...String(html).matchAll(/<g data-shape="(\w+)" transform="translate\(([-\d.]+) ([-\d.]+)\)"/g)].map((m, order) => ({ shape: m[1], x: +m[2], y: +m[3], order }));
}
// How many vertices a flat shape tile really has: polygon points, or 0 for round shapes.
export function corners(html) {
  const poly = String(html).match(/<polygon[^>]*points="([^"]+)"/);
  if (poly) return poly[1].trim().split(/\s+/).length;
  if (/<circle|<ellipse/.test(html)) return 0;
  return NaN;
}
// The measured length of a size tile, read from its geometry (not from data-size).
export function measure(html) {
  const dim = attr(html, 'dim');
  const c = String(html).match(/<circle[^>]*\sr="([\d.]+)"/);
  if (c) return 2 * +c[1];
  const w = +String(html).match(/<rect[^>]*\swidth="([\d.]+)"/)[1], h = +String(html).match(/<rect[^>]*\sheight="([\d.]+)"/)[1];
  return dim === 'tall' ? h : w;
}
// Balanced tags, no NaN or undefined in any attribute.
export function wellFormed(html) {
  const s = String(html).replace(/<!--[\s\S]*?-->/g, '');
  if (!/<svg/.test(s)) return true;
  if (/NaN|undefined|Infinity|null/.test(s)) return false;
  const stack = [];
  for (const m of s.matchAll(/<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g)) {
    const [, close, name, , self] = m;
    if (self) continue;
    if (close) { if (stack.pop() !== name) return false; } else stack.push(name);
  }
  return stack.length === 0;
}
