// Shared pieces for the Early Start level: plurals, number words, hidden markers and the one choice builder.
// Every problem here carries `say` (what a parent would read aloud) and, for choices, `sayOptions`.
import { shuffle, choice, num } from '../../util.js';

export const STRAND = { n: 'Numbers', a: 'Adding and subtracting', s: 'Shapes and space', c: 'Colors', l: 'Letters' };
export const cnt = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
// A hidden marker keeps repeats detectable when the picture is the only thing that changes.
export const tag = (...p) => `<!--${p.join(' ').replace(/-+/g, ' ')}-->`;
export const big = t => `<span style="font-size:2.3em;font-weight:800;line-height:1.1">${t}</span>`;
export const BLANK = '<span class="blank">?</span>';
export const countOn = n => Array.from({ length: n }, (_, i) => i + 1).join(', ');

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
  'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
export function numWord(n) {
  if (n < 20) return ONES[n];
  if (n === 100) return 'one hundred';
  return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
}
export const sayCnt = (n, one, many = one + 's') => `${numWord(n)} ${n === 1 ? one : many}`;
export const numList = xs => xs.map(numWord).join(', ');
export const plural = w => (w.endsWith('s') ? w : w + 's');

// One answer option: `h` is the html on the button, `s` is how it is said aloud.
export const opt = (h, s) => ({ h: String(h), s });
export const numOpt = n => opt(n, numWord(n));
export const numOpts = xs => xs.map(numOpt);

// Distinct numbers near `v` inside lo..hi, never `v` itself.
export function others(v, lo, hi, k = 3, spread = 3) {
  const pool = [];
  for (let d = -spread; d <= spread; d++) if (d && v + d >= lo && v + d <= hi) pool.push(v + d);
  for (let x = lo; x <= hi && pool.length < k; x++) if (x !== v && !pool.includes(x)) pool.push(x);
  return shuffle(pool).slice(0, k);
}

// mode: 'find' (the question names the answer, so options are never read), 'ask' (the answer must not be spoken), 'pick'.
// `t` is the generator's own record of its operands (the tests recompute from the picture, not from this).
export function pickQ({ ask, say, expr, visual, right, wrong, big: bigBtn, mode = 'ask', quiet = false, hint, ways, t }) {
  const seen = new Set([right.h]);
  const rest = wrong.filter(o => o && !seen.has(o.h) && seen.add(o.h)).slice(0, 3);
  if (!rest.length) throw new Error(`need two options: ${ask}`);
  const items = shuffle([right, ...rest]);
  const answer = choice(right.h, [], { all: items.map(o => o.h) });
  const sayOptions = quiet || mode === 'find' ? null : items.map(o => o.s);
  return { ask, expr, say, sayOptions, visual, answer, choiceBig: bigBtn, hint, ways, _t: { ...t, mode } };
}

// A typed counting answer (only used at step 3 of the two counting skills).
export function numQ({ ask, say, expr, visual, value, hint, ways, t }) {
  return { ask, expr, say, sayOptions: null, visual, answer: num(value), hint, ways, _t: { ...t, mode: 'ask' } };
}
