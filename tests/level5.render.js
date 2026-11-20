// What a child actually sees: turn generated HTML into plain text, pull the numbers out of it, read simple SVG pictures,
// and check the arithmetic written in worked steps. Used by tests/level5.test.js.

// Plain text: hidden markers dropped, stacked fractions as n/d, powers as base^exp, entities decoded.
export function plain(html) {
  return String(html ?? '').replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<span class="n">([^<]*)<\/span><span class="d">([^<]*)<\/span>/g, ' $1/$2 ')
    .replace(/<sup>([^<]*)<\/sup>/g, '^$1').replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}
// The question as shown: story, question, expression and the words inside any picture.
export function rendered(p) {
  const labels = [...String(p.visual ?? '').matchAll(/aria-label="([^"]*)"/g)].map(m => m[1]);
  return plain([p.story, p.ask, p.expr, p.visual, ...labels].filter(Boolean).join(' '));
}
const NUM = /(?<![\w.])([−-])?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?/g;
const val = (sign, whole, dec) => (sign ? -1 : 1) * Number(whole.replace(/,/g, '') + (dec ? '.' + dec : ''));
// Every number a child can read in the text: plain numbers, fractions (as n, d and n/d) and mixed numbers.
export function numbers(text) {
  const out = []; let rest = String(text);
  rest = rest.replace(/(?:(\d+) )?(\d+)\/(\d+)/g, (m, w, n, d) => { out.push(Number(n) / Number(d), Number(n), Number(d)); if (w) out.push(Number(w), Number(w) + Number(n) / Number(d)); return ' '; });
  for (const m of rest.matchAll(NUM)) out.push(val(m[1] && (m[1] === '−' || m.index === 0 || /[\s(]/.test(rest[m.index - 1] ?? ' ')) ? m[1] : '', m[2], m[3]));
  return out;
}
export const has = (nums, v) => nums.some(x => Math.abs(x - v) < 1e-9);
export const count = (nums, v) => nums.filter(x => Math.abs(x - v) < 1e-9).length;

// ---- Reading the SVG pictures ----
const attr = (tag, name) => (tag.match(new RegExp(`\\b${name}="([^"]*)"`)) || [])[1];
export const svgTexts = svg => [...String(svg).matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)].map(m => ({ x: +attr(m[1], 'x'), y: +attr(m[1], 'y'), cls: attr(m[1], 'class'), anchor: attr(m[1], 'text-anchor'), s: m[2] }));
export const svgCircles = svg => [...String(svg).matchAll(/<circle ([^>]*)\/>/g)].map(m => ({ cx: +attr(m[1], 'cx'), cy: +attr(m[1], 'cy'), cls: attr(m[1], 'class'), style: attr(m[1], 'style') }));
export const svgRects = svg => [...String(svg).matchAll(/<rect ([^>]*)\/>/g)].map(m => ({ x: +attr(m[1], 'x'), y: +attr(m[1], 'y'), h: +attr(m[1], 'height'), cls: attr(m[1], 'class') }));
// Number-line pixel to value, from the numbered labels.
export function lineScale(svg) {
  const ls = svgTexts(svg).filter(t => t.s.trim() !== '').map(t => ({ x: t.x, v: Number(t.s.replace('−', '-')) })).filter(t => Number.isFinite(t.v)).sort((a, b) => a.x - b.x);
  const [a, z] = [ls[0], ls[ls.length - 1]];
  return px => a.v + (px - a.x) * (z.v - a.v) / (z.x - a.x);
}
// Points on a four-quadrant plane (js/skills/level5/visuals.js plane4: 320 wide, 16 margin, radius from the biggest label).
export function planePoints(svg) {
  const r = Math.max(...svgTexts(svg).filter(t => t.cls === 'tk').map(t => Math.abs(Number(t.s.replace('−', '-'))))), u = (320 - 32) / (2 * r);
  const names = svgTexts(svg).filter(t => t.cls === 'ptl').map(t => t.s);
  return svgCircles(svg).filter(c => /\bpt\b/.test(c.cls)).map((c, i) => ({ x: Math.round((c.cx - 160) / u), y: Math.round((160 - c.cy) / u), name: names[i] }));
}

// ---- Arithmetic written in a worked step: "12 + 8 = 20" must be true ----
const CHAIN = /(\d[\d,]*(?:\.\d+)?(?:\s*[+−×÷]\s*\d[\d,]*(?:\.\d+)?)*)\s*=\s*(\d[\d,]*(?:\.\d+)?)(?![\d,.]*[\d(^/:a-zA-Z%²-⁹]|\s*[+−×÷(]|\s+\d+\/\d)/g;
const evalSide = s => Function(`return (${s.replace(/,/g, '').replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/')})`)();
// Returns the first false equation in the text, or null.
export function badArithmetic(text) {
  for (const m of String(text).matchAll(CHAIN)) {
    const before = text.slice(0, m.index).trimEnd().slice(-1);
    if (text[m.index - 1] === ':') continue; // a ratio such as 16:12 is not a sum
    if (/[\d.,)^/×÷+−*(%$]/.test(before) || /(?<![A-Za-z])(of|than|by|to|from|per)\s*$/i.test(text.slice(0, m.index))) continue;
    const right = Number(m[2].replace(/,/g, '')), places = (m[2].split('.')[1] || '').length, left = evalSide(m[1]);
    if (Math.abs(left - right) > 0.5 * 10 ** -places + 1e-9) return `${m[1]} = ${m[2]}`;
  }
  return null;
}
