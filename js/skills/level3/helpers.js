// Small shared bits for the level 3 generators: number facts, wording and common answer shapes.
import { choice, column, fmt, pick, way } from '../../util.js';

export const BLANK = '<span class="blank">?</span>';
export const SIGNS = ['<', '=', '>'];
export const signOf = diff => (diff < 0 ? '<' : diff > 0 ? '>' : '=');
// diff is (left − right); the three signs always appear in the same order.
export const signChoice = diff => choice(signOf(diff), [], { all: SIGNS });
// The sign as safe HTML for worked steps (answer buttons keep the plain character).
export const sg = s => ({ '<': '&lt;', '>': '&gt;' }[s] ?? s);
export const signWord = s => (s === '<' ? 'is less than' : s === '>' ? 'is greater than' : 'is equal to');
export const yesNo = yes => choice(yes ? 'Yes' : 'No', [], { all: ['Yes', 'No'] });
// The choices of a choice answer written into the question, in button order: "a, b or c".
export const listed = a => `${a.options.slice(0, -1).join(', ')} or ${a.options.at(-1)}`;
export const plural = (n, one, many = one + 's') => `${fmt(n)} ${n === 1 ? one : many}`;
export const sum = xs => xs.reduce((a, x) => a + x, 0);
export const digit = (n, p) => Math.floor(n / 10 ** p) % 10;
export const factorsOf = n => { const f = []; for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i); return f; };
export const pairsOf = n => factorsOf(n).filter(a => a * a <= n).map(a => [a, n / a]);
export const isPrime = n => n > 1 && factorsOf(n).length === 2;
export const roundTo = (n, to) => Math.floor(n / to) * to + (n % to >= to / 2 ? to : 0);
// Round to the leading digit, for quick estimates: 4,612 -> 5,000.
export const lead = n => (n < 10 ? n : roundTo(n, 10 ** (String(n).length - 1)));
export const stack = (a, c, op) => column([fmt(a), fmt(c)], op, fmt(op === '+' ? a + c : a - c));
// Pick one maker from a list and run it. A maker may return null to ask for another try with new numbers.
export function oneOf(makers, L) {
  const mk = pick(makers);
  for (let t = 0; t < 30; t++) { const p = mk(L); if (p) return p; }
  return null;
}
// The app's repeat key is expr + story + ask and leaves the picture out, so a question that differs only in its picture
// gets an invisible HTML comment with its numbers added to the question text.
export const tagged = (p, t) => ({ ...p, ask: `${p.ask}<!--${Object.values(t).join(' ')}-->` });
// A short fingerprint of a picture, for the marker of a question that is nothing but a picture.
export const sig = svg => [...String(svg)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
export const estimateWay = (text, shown) => way('Estimate to check', [text, `The exact answer ${shown} is close to that, so it makes sense.`]);
