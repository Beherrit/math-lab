// Capital letters (l0upper), small letters (l0lower) and matching the two (l0match).
import { rnd, pick, shuffle, way } from '../../util.js';
import { pickQ, opt, numOpt, numOpts, others, big, tag } from './kit.js';
import { bigGlyph, svg, text } from './svg.js';
import { alphabet, lookOf, letterSet, trapTargets, spokenLetter } from './letterdata.js';

const k = L => (L === 1 ? 3 : 4);
const letterWays = (ch, kind) => [way('Say it and look', [`This is the ${kind === 'upper' ? 'capital' : 'small'} letter ${ch.toUpperCase()}.`, 'Look at its shape. Which parts does it have?'])];
const letterOpt = (c, kind) => opt(c, spokenLetter(c, kind));
const pickTarget = (kind, L) => pick(L === 3 ? trapTargets(kind) : alphabet(kind));

function findLetter(kind, L) {
  const t = pickTarget(kind, L), set = letterSet(kind, t, k(L), L === 3), word = kind === 'upper' ? 'capital' : 'small';
  return pickQ({ ask: `Tap the ${word} letter ${big(t)}` + tag('find', kind, t), say: `Tap the ${word} letter ${t.toUpperCase()}.`, right: letterOpt(t, kind), wrong: set.filter(c => c !== t).map(c => letterOpt(c, kind)), big: true, mode: 'find',
    hint: 'Say its name. Then look for its shape.', ways: letterWays(t, kind), t: { f: 'letterfind', letter: t, kind, target: { letter: t, kind }, q: 'find' } });
}
function nameLetter(kind, L) {
  const t = pickTarget(kind, L), set = letterSet(kind, t, k(L), L === 3);
  return pickQ({ ask: 'Which letter is this?' + tag('name', kind, t), say: 'Which letter is this?', visual: bigGlyph(t, { letter: t }), right: letterOpt(t, kind), wrong: set.filter(c => c !== t).map(c => letterOpt(c, kind)), big: true,
    hint: 'Look at the shape. Say the names of the letters.', ways: letterWays(t, kind), t: { f: 'lettername', letter: t, kind, q: 'name' } });
}
function countRow(kind, L) {
  const t = pickTarget(kind, L), n = rnd(1, L === 1 ? 3 : 4), rest = alphabet(kind).filter(c => c !== t);
  const pool = L === 3 ? [...lookOf(kind, t), ...rest] : rest.filter(c => !lookOf(kind, t).includes(c));
  const row = shuffle([...Array(n).fill(t), ...Array.from({ length: 8 - n }, () => pick(pool))]);
  const inner = row.map((c, i) => text(c, 24 + i * 38, 46, 34, { 'data-letter': c })).join('');
  return pickQ({ ask: `How many ${big(t)}?` + tag('count', kind, t, row.join('')), say: `How many times do you see the letter ${t.toUpperCase()}?`, visual: svg(320, 64, inner, { label: 'a row of letters' }), right: numOpt(n), wrong: numOpts(others(n, 1, 5, 3, 2)), big: true, mode: 'ask',
    hint: 'Touch each letter in the row. Is it the same as the big one?', ways: letterWays(t, kind), t: { f: 'lettercount', letter: t, kind, q: 'count' } });
}
const make = kind => L => pick([findLetter, findLetter, nameLetter, countRow])(kind, L);
export const genUpper = make('upper');
export const genLower = make('lower');

// ---- matching a capital with its small letter ----
const POOL = alphabet('upper').filter(c => c !== 'I');
const wordOf = kind => (kind === 'upper' ? 'capital' : 'small');
function matchOne(from, L) {
  const to = from === 'upper' ? 'lower' : 'upper';
  const base = pick(L === 3 ? trapTargets(to).filter(c => POOL.includes(c.toUpperCase())) : POOL).toUpperCase();
  const shown = from === 'upper' ? base : base.toLowerCase(), answer = to === 'upper' ? base : base.toLowerCase();
  const set = letterSet(to, answer, k(L), L === 3, ['i']);
  return pickQ({ ask: `Which ${wordOf(to)} letter goes with this one?` + tag('match', from, shown), say: `Which ${wordOf(to)} letter goes with the ${wordOf(from)} letter ${base}?`, visual: bigGlyph(shown, { letter: shown }),
    right: letterOpt(answer, to), wrong: set.filter(c => c !== answer).map(c => letterOpt(c, to)), big: true, mode: 'ask',
    hint: 'Look at the shape. The small letter and the capital letter are two ways to write one letter.', ways: letterWays(shown, from), t: { f: 'letterpair', dir: from, letter: shown, q: from === 'upper' ? 'up2low' : 'low2up' } });
}
const mix = (prefer, rest) => [...new Set([...shuffle(prefer), ...shuffle(rest)])];
function samePair(L) {
  const t = pick(POOL), low = t.toLowerCase(), trap = L === 3;
  const lows = mix(trap ? lookOf('lower', low) : [], alphabet('lower').filter(c => c !== low)).filter(c => c !== 'i');
  const ups = mix(trap ? lookOf('upper', t) : [], POOL.filter(c => c !== t)).filter(c => c !== 'I');
  const pairs = [[t, low], [t, lows[0]], [ups[0], low]];
  if (L > 1) pairs.push([ups.find((u, i) => i > 0 && u.toLowerCase() !== lows[1]), lows[1]]);
  const o = ([a, b]) => opt(`${a} ${b}`, `capital ${a} and small ${b.toUpperCase()}`);
  return pickQ({ ask: 'Which pair is the same letter?' + tag('pair', t), say: 'Which pair is the same letter?', right: o(pairs[0]), wrong: pairs.slice(1).map(o), mode: 'pick',
    hint: 'The capital and the small letter must be the same letter.', ways: letterWays(t, 'upper'), t: { f: 'letterpair', dir: 'pair', letter: t, q: 'pair' } });
}
export const genMatch = L => pick([() => matchOne('upper', L), () => matchOne('lower', L), () => samePair(L)])();
