// Readers for the pictures added with the newer Level 5 skills: they turn the drawing back into numbers.
import { svgTexts } from './level5.render.js';

const attr = (tag, name) => (tag.match(new RegExp(`\\b${name}="([^"]*)"`)) || [])[1];
const lines = svg => [...String(svg).matchAll(/<line ([^>]*)\/>/g)].map(m => ({ x1: +attr(m[1], 'x1'), x2: +attr(m[1], 'x2'), cls: attr(m[1], 'class') }));
const num = s => Number(String(s).replace('−', '-'));

// Double number line: the labels on the top line and on the bottom line, tick by tick.
export function doubleRead(svg) {
  const ts = svgTexts(svg).filter(t => t.anchor === 'middle');
  return { top: ts.filter(t => t.y === 22).map(t => t.s), bottom: ts.filter(t => t.y === 110).map(t => t.s) };
}
// Number line with fraction ticks: value at a pixel from the whole-number labels.
export function lineValue(svg) {
  const ls = svgTexts(svg).filter(t => t.s.trim() !== '' && Number.isFinite(num(t.s))).sort((a, b) => a.x - b.x), [a, z] = [ls[0], ls[ls.length - 1]];
  return px => num(a.s) + (px - a.x) * (num(z.s) - num(a.s)) / (z.x - a.x);
}
export const dotsOn = svg => [...String(svg).matchAll(/<circle ([^>]*)\/>/g)].map(m => ({ cx: +attr(m[1], 'cx'), cls: attr(m[1], 'class') })).filter(c => /\bdot\b/.test(c.cls));
// Box plot (one or more svgs): five numbers in order least, Q1, median, Q3, greatest.
export function boxRead(svgs) {
  return String(svgs).split('<svg').slice(1).map(svg => {
    const ts = svgTexts(svg).filter(t => t.cls === 'tk' && Number.isFinite(num(t.s))), a = ts[0], z = ts[ts.length - 1], at = px => num(a.s) + (px - a.x) * (num(z.s) - num(a.s)) / (z.x - a.x);
    const box = svg.match(/<rect x="([\d.]+)" y="[\d.]+" width="([\d.]+)"/), med = lines(svg).find(l => l.cls === 'med'), caps = lines(svg).filter(l => l.cls === 'cap');
    return [at(caps[0].x1), at(+box[1]), at(med.x1), at(+box[1] + +box[2]), at(caps[1].x1)].map(v => Math.round(v * 1000) / 1000);
  });
}
// Shared plane (first quadrant): the plotted points and the straight lines from the origin, as coordinates.
export function gridRead(svg, max = 10) {
  const u = (320 - 30 - 14) / max, X = px => Math.round((px - 30) / u * 1000) / 1000, Y = py => Math.round((290 - py) / u * 1000) / 1000;
  const pts = [...String(svg).matchAll(/<circle ([^>]*)\/>/g)].map(m => ({ x: X(+attr(m[1], 'cx')), y: Y(+attr(m[1], 'cy')), cls: attr(m[1], 'class') })).filter(c => /\bpt\b/.test(c.cls));
  const segs = [...String(svg).matchAll(/<polyline points="([^"]*)"/g)].map(m => m[1].trim().split(/\s+/).map(p => p.split(',').map(Number)).map(([px, py]) => ({ x: X(px), y: Y(py) })));
  return { pts, segs };
}
