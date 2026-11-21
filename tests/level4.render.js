// What a child sees: turn generated HTML into plain text, pull the numbers out of it, read simple SVG pictures, and check the
// arithmetic written in worked steps. Used by tests/level4.test.js (a private copy, so other levels' test edits cannot break it).

// Plain text: hidden markers dropped, stacked fractions as n/d, powers as base^exp, entities decoded.
export function plain(html) {
  return String(html ?? '').replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<span class="n">([^<]*)<\/span><span class="d">([^<]*)<\/span>/g, ' $1/$2 ')
    .replace(/<sup>([^<]*)<\/sup>/g, '^$1').replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
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
const attr = (tag, name) => (tag.match(new RegExp(`\\b${name}="([^"]*)"`)) || [])[1];
export const svgRects = svg => [...String(svg).matchAll(/<rect ([^>]*)\/>/g)].map(m => ({ x: +attr(m[1], 'x'), y: +attr(m[1], 'y'), cls: attr(m[1], 'class') }));
export const svgTexts = svg => [...String(svg).matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)].map(m => m[2]);

// ---- Arithmetic written in a worked step: "12 + 8 = 20" must be true ----
const CHAIN = /(\d[\d,]*(?:\.\d+)?(?:\s*[+−×÷]\s*\d[\d,]*(?:\.\d+)?)*)\s*=\s*(\d[\d,]*(?:\.\d+)?)(?![\d,.]*[\d(^/:a-zA-Z%²-⁹]|\s*[+−×÷(]|\s+\d+\/\d|\s+R\s?\d)/g;
const evalSide = s => Function(`return (${s.replace(/,/g, '').replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/')})`)();
// Returns the first false equation in the text, or null.
export function badArithmetic(text) {
  for (const m of String(text).matchAll(CHAIN)) {
    const before = text.slice(0, m.index).trimEnd().slice(-1);
    if (text[m.index - 1] === ':') continue;
    if (/[\d.,)^/×÷+−*(%$]/.test(before) || /(?<![A-Za-z])(of|than|by|to|from|per)\s*$/i.test(text.slice(0, m.index))) continue;
    const right = Number(m[2].replace(/,/g, '')), places = (m[2].split('.')[1] || '').length, left = evalSide(m[1]);
    if (Math.abs(left - right) > 0.5 * 10 ** -places + 1e-9) return `${m[1]} = ${m[2]}`;
  }
  return null;
}
