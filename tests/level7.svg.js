// Reading a drawn picture back into numbers, so a test can compare what is DRAWN with what the question SAYS.
// Mappings follow the grids the app draws: the 0..10 plane (30px margin) and the four-quadrant grid (14px margin).
const attr = (tag, name) => { const m = new RegExp(`${name}="([^"]*)"`).exec(tag); return m ? m[1] : null; };
const svgs = html => String(html || '').split('<svg').slice(1).map(s => `<svg${s}`);
const num = v => Number(v);
function mapping(svg) {
  const quad = /aria-label="coordinate grid from [^"]*? to (\d+)"/.exec(svg);
  if (quad) { const r = num(quad[1]), u = (320 - 28) / (2 * r); return { X: px => (px - 160) / u, Y: py => (160 - py) / u }; }
  const max = num(attr(svg, 'data-max') || 10), u = (320 - 30 - 14) / max;
  return { X: px => (px - 30) / u, Y: py => (290 - py) / u };
}
// Everything one picture draws: full lines, dashed pieces, dots (with their label) and polygons, in grid units.
export function decode(html) {
  const out = { lines: [], dashed: [], dots: [], polys: [], path: [] };
  for (const svg of svgs(html)) {
    const M = mapping(svg), pt = (x, y) => [Math.round(M.X(num(x)) * 100) / 100, Math.round(M.Y(num(y)) * 100) / 100];
    for (const tag of svg.match(/<line [^>]*style="stroke:[^>]*>/g) || []) {
      const a = pt(attr(tag, 'x1'), attr(tag, 'y1')), c = pt(attr(tag, 'x2'), attr(tag, 'y2')), dash = /dasharray/.test(tag);
      if (dash) out.dashed.push([a, c]);
      else out.lines.push({ a, b: c, m: (c[1] - a[1]) / (c[0] - a[0]), c: a[1] - ((c[1] - a[1]) / (c[0] - a[0])) * a[0] });
    }
    for (const m of svg.matchAll(/<circle ([^>]*class="pt[^"]*"[^>]*)\/>(?:<text [^>]*class="ptl"[^>]*>([^<]*)<\/text>)?/g)) out.dots.push({ at: pt(attr(m[1], 'cx'), attr(m[1], 'cy')), label: m[2] || '' });
    for (const tag of svg.match(/<polygon points="[^"]*" style="fill:[^>]*>/g) || []) out.polys.push(attr(tag, 'points').split(' ').map(s => pt(...s.split(','))));
    for (const tag of svg.match(/<polyline [^>]*class="story"[^>]*>/g) || []) out.path.push(attr(tag, 'points').split(' ').map(s => pt(...s.split(','))));
  }
  return out;
}
const close = (x, y, e = 0.06) => Math.abs(x - y) <= e;
// Does a drawn line have this slope and intercept? (a vertical or missing line never matches)
export const lineIs = (l, m, c) => !!l && close(l.m, m) && close(l.c, c);
export const dotOn = (d, m, c) => close(d.at[1], m * d.at[0] + c);
export const near2 = (p, q) => close(p[0], q[0]) && close(p[1], q[1]);
export { close };
export const noSvg = html => String(html || '').replace(/<svg[\s\S]*?<\/svg>/g, '');
// The value a number line marks with its dot: the end labels are the first two plain labels, the dot sits between them.
export function lineDot(html) {
  const [lo, hi] = [...String(html).matchAll(/class="lbl">([^<]*)<\/text>/g)].map(m => Number(m[1])), cx = Number(/<circle cx="([\d.]+)"[^>]*class="dot"/.exec(html)[1]);
  return lo + ((cx - 26) / (300 - 52)) * (hi - lo);
}
