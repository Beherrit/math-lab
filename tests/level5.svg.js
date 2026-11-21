// Reads a Level 5 picture back from its SVG text and measures what a phone would show: label size, clipping, overlaps and
// whether every plotted point lies on the visible grid. Used by tests/level5.pictures.test.js. Nothing here imports a generator.
import { readFileSync, readdirSync } from 'node:fs';

export const PHONE_W = 290; // rendered width of a picture on a 320 px wide phone
export const MIN_PX = 11; // smallest label a child can read
const CHAR = 0.58; // average glyph width in em, a little wide so a close fit counts as a fit

const attr = (tag, name) => (tag.match(new RegExp(`\\b${name}="([^"]*)"`)) || [])[1];
const entity = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#?\w+;/g, 'x');

// ---- font sizes from the stylesheets (px rules whose selectors are classes, optionally with one ancestor class) ----
const CSS = (() => {
  const dir = new URL('../css/', import.meta.url), rules = [];
  for (const f of readdirSync(dir).filter(x => x.endsWith('.css'))) {
    for (const m of readFileSync(new URL(f, dir), 'utf8').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const px = (m[2].match(/font-size:\s*([\d.]+)px/) || [])[1];
      if (px) for (const sel of m[1].split(',')) rules.push({ parts: sel.trim().split(/\s+/).map(c => c.split('.').slice(1)), size: +px, order: rules.length });
    }
  }
  return rules.filter(r => r.parts.every(p => p.length));
})();
// The font size of a text in an svg whose root classes are `root`.
function fontSize(textTag, root) {
  const inline = (attr(textTag, 'style') || '').match(/font-size:\s*([\d.]+)px/);
  if (inline) return +inline[1];
  const own = (attr(textTag, 'class') || '').split(/\s+/), best = { spec: -1, order: -1, size: 16 };
  for (const r of CSS) {
    const last = r.parts[r.parts.length - 1], up = r.parts.slice(0, -1).flat();
    if (!last.every(c => own.includes(c)) || !up.every(c => root.includes(c))) continue;
    const spec = last.length + up.length;
    if (spec > best.spec || (spec === best.spec && r.order > best.order)) Object.assign(best, { spec, order: r.order, size: r.size });
  }
  return best.size;
}

// ---- one svg picture ----
export function readSvg(svg) {
  const open = svg.match(/<svg ([^>]*)>/)[1], vb = attr(open, 'viewBox').split(/\s+/).map(Number), root = (attr(open, 'class') || '').split(/\s+/);
  const maxW = +((attr(open, 'style') || '').match(/max-width:\s*([\d.]+)px/) || [])[1] || vb[2], scale = Math.min(maxW, PHONE_W) / vb[2];
  const texts = [...svg.matchAll(/<text ([^>]*)>([\s\S]*?)<\/text>/g)].map(m => {
    const s = entity(m[2].replace(/<[^>]+>/g, '')), size = fontSize(m[1], root), anchor = attr(m[1], 'text-anchor') || 'start', x = +attr(m[1], 'x'), y = +attr(m[1], 'y'), w = s.length * size * CHAR;
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    return { s, size, px: size * scale, x, y, box: { x0, x1: x0 + w, y0: y - 0.78 * size, y1: y + 0.22 * size } };
  });
  const num = (tag, n) => +attr(tag, n);
  const circles = [...svg.matchAll(/<circle ([^>]*)\/>/g)].map(m => ({ cx: num(m[1], 'cx'), cy: num(m[1], 'cy'), r: num(m[1], 'r'), cls: attr(m[1], 'class') || '' }));
  const lines = [...svg.matchAll(/<line ([^>]*)\/>/g)].map(m => ({ x1: num(m[1], 'x1'), y1: num(m[1], 'y1'), x2: num(m[1], 'x2'), y2: num(m[1], 'y2'), cls: attr(m[1], 'class') || '' }));
  const rects = [...svg.matchAll(/<rect ([^>]*)\/>/g)].map(m => ({ x: num(m[1], 'x'), y: num(m[1], 'y'), w: num(m[1], 'width'), h: num(m[1], 'height'), cls: attr(m[1], 'class') || '' }));
  const poly = [...svg.matchAll(/<(?:polyline|polygon) points="([^"]*)"/g)].map(m => m[1].trim().split(/\s+/).map(p => p.split(',').map(Number)));
  return { vb, root, scale, texts, circles, lines, rects, poly };
}
export const splitSvgs = html => String(html ?? '').split('<svg').slice(1).map(s => '<svg' + s.split('</svg>')[0] + '</svg>');

const hit = (a, b, pad = 0.5) => a.x0 < b.x1 + pad && b.x0 < a.x1 + pad && a.y0 < b.y1 + pad && b.y0 < a.y1 + pad;
const near = (t, c) => { const dx = Math.max(t.box.x0 - c.cx, 0, c.cx - t.box.x1), dy = Math.max(t.box.y0 - c.cy, 0, c.cy - t.box.y1); return Math.hypot(dx, dy) < c.r; };
const crosses = (t, l) => hit(t.box, { x0: Math.min(l.x1, l.x2), x1: Math.max(l.x1, l.x2), y0: Math.min(l.y1, l.y2), y1: Math.max(l.y1, l.y2) }, 0);
const names = t => `"${t.s}" (${t.size}px at ${Math.round(t.x)},${Math.round(t.y)})`;

// Every problem found in one picture, as readable strings (empty when the picture is fine).
export function problems(svg) {
  const g = readSvg(svg), [, , W, H] = g.vb, out = [];
  for (const t of g.texts) {
    if (t.s.trim() && t.px < MIN_PX - 1e-9) out.push(`label ${names(t)} renders at ${t.px.toFixed(1)}px on a phone`);
    if (t.box.x0 < 0 || t.box.x1 > W || t.box.y0 < 0 || t.box.y1 > H) out.push(`label ${names(t)} is clipped by the viewBox ${W}x${H}`);
  }
  const edge = (x, y, what) => { if (x < -1e-6 || x > W + 1e-6 || y < -1e-6 || y > H + 1e-6) out.push(`${what} at ${Math.round(x)},${Math.round(y)} is outside the viewBox`); };
  g.circles.forEach(c => { edge(c.cx - c.r, c.cy - c.r, 'circle'); edge(c.cx + c.r, c.cy + c.r, 'circle'); });
  g.lines.forEach(l => { edge(l.x1, l.y1, 'line'); edge(l.x2, l.y2, 'line'); });
  g.rects.forEach(r => { edge(r.x, r.y, 'rect'); edge(r.x + r.w, r.y + r.h, 'rect'); });
  g.poly.forEach(p => p.forEach(([x, y]) => edge(x, y, 'path')));
  const ts = g.texts.filter(t => t.s.trim());
  ts.forEach((a, i) => ts.slice(i + 1).forEach(b => { if (hit(a.box, b.box)) out.push(`labels ${names(a)} and ${names(b)} overlap`); }));
  ts.forEach(t => g.circles.forEach(c => { if (near(t, c)) out.push(`label ${names(t)} touches a dot at ${Math.round(c.cx)},${Math.round(c.cy)}`); }));
  ts.forEach(t => g.lines.filter(l => l.cls === 'tick').forEach(l => { if (crosses(t, l)) out.push(`label ${names(t)} touches a tick at ${Math.round(l.x1)},${Math.round(l.y1)}`); }));
  return [...out, ...offGrid(g)];
}
// Plotted points must sit on the visible grid (grid lines of a plane) or on the drawn axis (a number line or dot plot).
function offGrid(g) {
  const gl = g.lines.filter(l => l.cls === 'gl'), ax = g.lines.filter(l => /\baxis\b/.test(l.cls)), out = [], eps = 0.01;
  const pts = g.circles.filter(c => !/\bgiven\b/.test(c.cls) || true);
  if (gl.length) {
    const b = { x0: Math.min(...gl.map(l => Math.min(l.x1, l.x2))), x1: Math.max(...gl.map(l => Math.max(l.x1, l.x2))), y0: Math.min(...gl.map(l => Math.min(l.y1, l.y2))), y1: Math.max(...gl.map(l => Math.max(l.y1, l.y2))) };
    const bad = (x, y) => x < b.x0 - eps || x > b.x1 + eps || y < b.y0 - eps || y > b.y1 + eps;
    pts.forEach(c => { if (bad(c.cx, c.cy)) out.push(`a point at ${Math.round(c.cx)},${Math.round(c.cy)} is off the visible grid`); });
    g.poly.forEach(p => p.forEach(([x, y]) => { if (bad(x, y)) out.push(`a path corner at ${Math.round(x)},${Math.round(y)} is off the visible grid`); }));
  } else if (ax.length) {
    const x0 = Math.min(...ax.map(l => Math.min(l.x1, l.x2))), x1 = Math.max(...ax.map(l => Math.max(l.x1, l.x2)));
    pts.forEach(c => { if (c.cx < x0 - eps || c.cx > x1 + eps) out.push(`a dot at ${Math.round(c.cx)} is off the drawn axis`); });
  }
  return out;
}
