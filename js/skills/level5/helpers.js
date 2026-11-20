// Level 5 local helpers: test tagging, choice builders, plural words, shared story contexts.
import { choice, rnd, fmt, gcd } from '../../util.js';

// Attach the raw operands under _t so tests can recompute the answer on their own.
// A picture is not part of the repeat-detection key, so problems that differ only in the picture get an invisible
// HTML comment with their numbers added to the question text.
const mark = t => `<!--${JSON.stringify(t).replace(/null/g, '').replace(/[^\w.-]+/g, ' ').trim()}-->`;
export const T = (p, k, t = {}) => ({ ...p, ask: p.visual ? p.ask + mark(t) : p.ask, _t: { k, ...t } });
export const ratio = (a, b) => `${a}:${b}`;
export const pl = (n, one, many = one + 's') => `${fmt(n)} ${n === 1 ? one : many}`;
export const rndNot = (a, b, bad = []) => { let v; do v = rnd(a, b); while (bad.includes(v)); return v; };
// Two different whole numbers with no shared factor.
export function coprime(lo, hi) {
  for (;;) { const a = rnd(lo, hi), b = rnd(lo, hi); if (a !== b && gcd(a, b) === 1) return [a, b]; }
}
// Choice of numbers: every option is formatted the same way so equal values can never appear twice.
export const numChoice = (c, ds, f = fmt) => choice(f(c), ds.filter(d => d !== c && Number.isFinite(d)).map(f));
// Unit names written out for sentences: "square inches", not "square in".
export const longU = u => ({ ft: 'feet', in: 'inches' }[u] ?? u);
export const sum = xs => xs.reduce((a, x) => a + x, 0);
export const sorted = xs => xs.slice().sort((a, b) => a - b);
// Signed number inside a sentence or expression: negatives get brackets.
// Comparison signs inside HTML text must be escaped: a bare < would be read as the start of a tag.
export const sg = s => ({ '<': '&lt;', '>': '&gt;' }[s] ?? s);
export const par = v => (v < 0 ? `(${fmt(v)})` : fmt(v));
// Values joined for a sentence, and a percent written with its sign.
export const list = xs => xs.map(fmt).join(', ');
export const pct = v => `${fmt(v)}%`;
// Distinct whole numbers in a range (for data sets and wrong answers).
export function distinct(n, lo, hi) { const xs = new Set(); while (xs.size < n) xs.add(rnd(lo, hi)); return [...xs]; }

// Pairs of things for ratio stories. s(x, y) is the sentence; a, b name the two groups; all names both together.
export const PAIRS = [
  { a: 'rock songs', b: 'pop songs', all: 'songs', s: (x, y) => `A playlist has ${x} rock songs and ${y} pop songs.` },
  { a: 'wins', b: 'losses', all: 'games', s: (x, y) => `A team has ${x} wins and ${y} losses this season.` },
  { a: 'cats', b: 'dogs', all: 'animals', s: (x, y) => `A shelter is looking after ${x} cats and ${y} dogs.` },
  { a: 'photos', b: 'videos', all: 'files', s: (x, y) => `A phone album holds ${x} photos and ${y} videos.` },
  { a: 'blue tiles', b: 'white tiles', all: 'tiles', s: (x, y) => `A floor pattern uses ${x} blue tiles and ${y} white tiles.` },
  { a: 'guitars', b: 'keyboards', all: 'instruments', s: (x, y) => `A music store has ${x} guitars and ${y} keyboards.` },
  { a: 'made shots', b: 'missed shots', all: 'shots', s: (x, y) => `In practice a player has ${x} made shots and ${y} missed shots.` },
  { a: 'bikes', b: 'scooters', all: 'rides', s: (x, y) => `A rental stand has ${x} bikes and ${y} scooters.` },
];
// Recipes that scale: for every x of a there are y of b.
export const MIXES = [
  { a: 'cups of rice', b: 'cups of water', what: 'A school kitchen rice recipe' },
  { a: 'scoops of powder', b: 'cups of milk', what: 'A smoothie bar shake mix' },
  { a: 'cans of blue paint', b: 'cans of yellow paint', what: 'A paint shop green mix' },
  { a: 'spoons of oil', b: 'spoons of vinegar', what: 'A catering dressing recipe' },
  { a: 'bags of cement', b: 'bags of sand', what: 'A concrete mix' },
  { a: 'cups of oats', b: 'cups of nuts', what: 'A camp trail mix' },
];
