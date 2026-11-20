// Readers for the pictures the new level 2 skills draw. Each one rebuilds the numbers from the SVG or HTML itself, so a test can compare them
// with the answer without trusting the generator that drew the picture.
export const plain = s => String(s ?? '').replace(/<!--[\s\S]*?-->/g, '').replace(/<\/span><span class="d">/g, '/').replace(/<span class="mxs"><\/span>/g, ' ').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
export const nums = s => (plain(s).replace(/(\d),(\d{3})/g, '$1$2').match(/\d+(?:\.\d+)?/g) || []).map(Number);
export const tags = (s, name) => [...String(s).matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map(m => m[0]);
export const at = (tag, a) => (tag.match(new RegExp(`\\b${a}="([^"]*)"`)) || [])[1];
export const withClass = (s, name, cls) => tags(s, name).filter(t => new RegExp(`class="([^"]* )?${cls}( [^"]*)?"`).test(t));
export const texts = s => [...String(s).matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)].map(m => ({ attrs: m[1], text: m[2], x: +at(m[1], 'x'), y: +at(m[1], 'y') }));
export const svgs = html => String(html).split('<svg').slice(1).map(x => '<svg' + x);
export const mixed = t => { const m = plain(t).trim().match(/^(?:(\d+) )?(?:(\d+)\/(\d+))?$/); return m ? +(m[1] || 0) + (m[2] ? m[2] / m[3] : 0) : NaN; };

const deg = ([x, y]) => (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
export function readClock(svg) {
  const hand = c => { const t = withClass(svg, 'line', c)[0]; return [+at(t, 'x2') - 80, 80 - +at(t, 'y2')]; };
  const md = deg(hand('mh')), hd = deg(hand('hh')), m = Math.round(md / 6) % 60, h = Math.round((hd - m * 0.5) / 30) % 12 || 12;
  return { h, m, text: `${h}:${String(m).padStart(2, '0')}`, exact: Math.abs(md / 6 - Math.round(md / 6)) < 0.1 };
}
// A gauge (jug or pointer scale): every tick carries data-v, the level is the line "lvl". Interpolates along the two outer ticks.
export function readGauge(svg) {
  const pos = t => (at(t, 'y1') === at(t, 'y2') ? +at(t, 'y1') : +at(t, 'x1')), ticks = withClass(svg, 'line', 'tick').map(t => ({ v: +at(t, 'data-v'), p: pos(t) })).sort((a, b) => a.v - b.v);
  const lo = ticks[0], hi = ticks[ticks.length - 1], level = pos(withClass(svg, 'line', 'lvl')[0]);
  return { value: lo.v + (level - lo.p) * (hi.v - lo.v) / (hi.p - lo.p), max: hi.v };
}
// A bar graph: names under the bars, heights against the grid lines. A picture graph: circles per row times the key.
export function readGraph(svg) {
  if (svg.includes('class="bar"')) {
    const g = withClass(svg, 'line', 'gl').map(t => ({ v: +at(t, 'data-v'), y: +at(t, 'y1') })).sort((a, b) => a.v - b.v), ppu = (g[0].y - g[g.length - 1].y) / (g[g.length - 1].v - g[0].v);
    return { cats: texts(svg).filter(t => /\bcat\b/.test(t.attrs)).map(t => t.text), vals: withClass(svg, 'rect', 'bar').map(t => Math.round(+at(t, 'height') / ppu * 1000) / 1000), kind: 'bar' };
  }
  const key = +svg.match(/Each circle stands for (\d+)/)[1], rows = texts(svg).filter(t => t.x === 6 && !/dim/.test(t.attrs)), vals = rows.map(() => 0);
  const rowOf = y => rows.findIndex(r => Math.abs(r.y - 5 - y) < 1);
  for (const c of withClass(svg, 'circle', 'sym')) vals[rowOf(+at(c, 'cy'))] += key;
  for (const h of withClass(svg, 'path', 'half')) vals[rowOf(+(at(h, 'd').match(/M[\d.]+ ([\d.]+)/)[1]) + 8)] += key / 2;
  return { cats: rows.map(r => r.text), vals, kind: 'pic' };
}
export function readRuler(svg) {
  const ticks = withClass(svg, 'line', 'tick'), xs = ticks.map(t => +at(t, 'x1')), wholes = ticks.filter(t => +at(t, 'y2') - +at(t, 'y1') > 20).length, max = wholes - 1, sub = (ticks.length - 1) / max;
  const ppi = (xs[xs.length - 1] - xs[0]) / max;
  return { sub, inches: +at(withClass(svg, 'rect', 'obj')[0], 'width') / ppi };
}
export function readPlot(svg) {
  const ticks = withClass(svg, 'line', 'tick').map(t => +at(t, 'x1')), labels = texts(svg).filter(t => /lbl dim/.test(t.attrs)), max = mixed(labels[labels.length - 1].text), sub = (ticks.length - 1) / max, counts = Array(ticks.length).fill(0);
  for (const c of withClass(svg, 'circle', 'pt')) counts[Math.round((+at(c, 'cx') - ticks[0]) / (ticks[ticks.length - 1] - ticks[0]) * (ticks.length - 1))]++;
  return { counts, sub };
}
export const polygons = html => tags(html, 'polygon').map(t => at(t, 'points').trim().split(/\s+/).map(p => p.split(',').map(Number)));
export function readGrid(html) {
  const rows = [...String(html).matchAll(/<tr>(.*?)<\/tr>/g)].map(m => [...m[1].matchAll(/<t[hd]>(.*?)<\/t[hd]>/g)].map(c => plain(c[1])));
  for (const r of rows.slice(1)) { const c = r.indexOf('?'); if (c > 0) return { row: +r[0], col: +rows[0][c] }; }
}
// Geometry of a polygon: side lengths, equal sides, square corners, and pairs of parallel sides.
export function shapeFacts(pts) {
  const n = pts.length, side = i => [pts[(i + 1) % n][0] - pts[i][0], pts[(i + 1) % n][1] - pts[i][1]], len = v => Math.hypot(...v), L = pts.map((_, i) => len(side(i)));
  const near = (a, b) => Math.abs(a - b) / Math.max(a, b) < 0.015, cross = (a, b) => Math.abs(a[0] * b[1] - a[1] * b[0]) / (len(a) * len(b)), dot = (a, b) => Math.abs(a[0] * b[0] + a[1] * b[1]) / (len(a) * len(b));
  const rights = pts.filter((_, i) => dot(side((i + n - 1) % n), side(i)) < 0.02).length, pairs = n === 4 ? [0, 1].filter(i => cross(side(i), side(i + 2)) < 0.02).length : 0;
  const equal = L.every(l => near(l, L[0])), adj = n === 4 && ((near(L[0], L[1]) && near(L[2], L[3])) || (near(L[1], L[2]) && near(L[3], L[0])));
  const name = n === 3 ? 'triangle' : n === 5 ? 'pentagon' : n === 6 ? 'hexagon' : equal && rights === 4 ? 'square' : rights === 4 ? 'rectangle' : equal ? 'rhombus' : pairs === 2 ? 'parallelogram' : pairs === 1 ? 'trapezoid' : adj ? 'kite' : 'quad';
  return { n, equal, rights, pairs, name };
}
