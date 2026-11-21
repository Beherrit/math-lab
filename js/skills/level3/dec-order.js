// Comparing and ordering decimals to hundredths: grids, a number line, lists, money, and decimals against fractions.
import { R, rnd, pick, chance, shuffle, fixed, plain, F, b, way, choice, numberLine, pvChart } from '../../util.js';
import { BLANK, signChoice, signOf, sg, oneOf, tagged } from './helpers.js';
import { hundredGrid } from './visuals.js';

// Every decimal here is kept as whole hundredths (h) so comparing is exact. shown writes it the short way: 3.4, 3.04, 0.45.
const shown = h => plain(h / 100);
const two = h => fixed(h / 100, 2);
const dollars = h => `$${two(h)}`;
const side = pair => `<div style="display:flex;gap:18px;justify-content:center;align-items:center">${pair.map(hundredGrid).join('')}</div>`;
const chart = hs => pvChart(hs.map(h => ({ x: h / 100, label: shown(h), dp: 2 })), { minP: -2 });

function gridPair() {
  const a = rnd(5, 95), c = rnd(5, 95);
  if (Math.abs(a - c) < 5) return null;
  const bigger = a > c ? 'The first grid' : 'The second grid';
  return tagged({ ask: 'Each grid is one whole. Which grid has the greater decimal shaded?', visual: side([a, c]), answer: choice(bigger, [], { all: ['The first grid', 'The second grid'] }), choiceBig: true, _t: { kind: 'dogrid', a, c },
    hint: 'Count the shaded squares in each grid. The grid with more shaded squares is the greater decimal.',
    ways: [way('Count the squares', [side([a, c]), `The first grid has ${a} of 100 squares shaded and the second has ${c} of 100.`, `${a > c ? a : c} is more than ${a > c ? c : a}, so ${b(bigger.toLowerCase())} is greater.`]),
      way('Write them as decimals', [`${a} hundredths is ${two(a)} and ${c} hundredths is ${two(c)}.`, `${two(Math.max(a, c))} is greater than ${two(Math.min(a, c))}, so ${b(bigger.toLowerCase())} is greater.`])] }, { a, c });
}
function between(L) {
  const w = L === 1 ? 0 : rnd(0, 9), t = rnd(0, 8), lo = w * 100 + t * 10, hi = lo + 10, good = lo + rnd(1, 9);
  const bad = [lo - rnd(1, 9), hi + rnd(1, 9), L === 1 ? lo + 10 * rnd(2, 3) : lo, hi].filter(h => h > 0);
  return { ask: `Which decimal is between ${shown(lo)} and ${shown(hi)}?`, answer: choice(shown(good), shuffle(bad).slice(0, 3).map(shown)), _t: { kind: 'dobetween', lo: R(lo / 100), hi: R(hi / 100) },
    hint: `Give both numbers two places after the point. ${shown(lo)} is ${two(lo)} and ${shown(hi)} is ${two(hi)}. Which hundredths fit between?`,
    ways: [way('Use hundredths', [`${shown(lo)} = ${two(lo)} and ${shown(hi)} = ${two(hi)}.`, `Between ${lo} hundredths and ${hi} hundredths are ${lo + 1} to ${hi - 1} hundredths.`, `${shown(good)} is ${good} hundredths, so ${b(shown(good))} fits.`]),
      way('Number line', [chart([lo, good, hi]), `${shown(good)} sits after ${shown(lo)} and before ${shown(hi)}: ${b(shown(good))}.`])] };
}
function closer(L) {
  const t = rnd(0, 8), i = pick([1, 2, 3, 4, 6, 7, 8, 9]), lo = t / 10, hi = (t + 1) / 10, x = R(lo + i / 100), near = i < 5 ? lo : hi;
  return tagged({ ask: `The dot is between ${plain(lo)} and ${plain(hi)}. Which tenth is it closer to?`, visual: numberLine(lo, hi, x, { loL: plain(lo), hiL: plain(hi), xL: '' }), answer: choice(plain(near), [plain(i < 5 ? hi : lo)]), choiceBig: true, _t: { kind: 'docloser', lo, hi, i },
    hint: `The halfway mark between ${plain(lo)} and ${plain(hi)} is the middle tick. Is the dot before it or after it?`,
    ways: [way('Use the halfway mark', [numberLine(lo, hi, x, { loL: plain(lo), hiL: plain(hi), xL: fixed(x, 2) }), `The middle tick is ${fixed(lo + 0.05, 2)}. The dot, ${fixed(x, 2)}, is ${i < 5 ? 'before' : 'after'} it.`, `So it is closer to ${b(plain(near))}.`]),
      way('Measure each gap', [`From ${fixed(lo, 2)} to the dot is ${i} hundredths. From the dot to ${fixed(hi, 2)} is ${10 - i} hundredths.`, `The smaller gap is ${Math.min(i, 10 - i)}, so it is closer to ${b(plain(near))}.`])] }, { lo, i });
}
// A short list of different decimals with tempting traps: 0.5 beats 0.45, and 3.04 is smaller than 3.4.
function listOf(L) {
  const base = L === 3 ? rnd(1, 8) * 100 : 0, t = rnd(1, 8) * 10, set = new Set([base + t, base + t + rnd(1, 9), base + t - rnd(1, 9), base + t + 10, L === 3 ? base + rnd(1, 9) : base + rnd(1, 9)]);
  return shuffle([...set]).slice(0, L === 3 ? 4 : 3);
}
function order(L) {
  const hs = listOf(L), up = chance(0.5), sorted = hs.slice().sort((p, q) => (up ? p - q : q - p));
  const text = xs => xs.map(shown).join(', '), good = text(sorted);
  const bad = [text(sorted.slice().reverse()), text(hs.slice().sort((p, q) => String(shown(p)).length - String(shown(q)).length || q - p)), text([sorted[1], sorted[0], ...sorted.slice(2)]), text(hs)].filter(x => x !== good);
  if (hs.length < (L === 3 ? 4 : 3) || new Set(bad).size < 3) return null;
  return { ask: `Which list is in order from ${up ? 'least to greatest' : 'greatest to least'}?`, answer: choice(good, bad.slice(0, 3)), _t: { kind: 'doorder', up },
    hint: 'Give every number two places after the point first, then compare them as hundredths.',
    ways: [way('Give them all two places', [`${hs.map(h => `${shown(h)} = ${two(h)}`).join(', ')}`, `As hundredths: ${hs.map(h => h).join(', ')}. In order from ${up ? 'least to greatest' : 'greatest to least'}: ${sorted.join(', ')}.`, `The list is ${b(good)}.`]),
      way('Compare place by place', [chart(sorted), `Start at the left. The first place where the digits differ decides which is bigger.`, `The list is ${b(good)}.`])] };
}
function money(L) {
  const base = rnd(1, 9) * 100, t = rnd(1, 9) * 10, most = chance(0.5), hs = [base + t, base + t / 10, base + 10 * rnd(1, 9) + rnd(1, 9), base + t + rnd(1, 9)], set = [...new Set(hs)];
  if (set.length < 4 || set.some(h => h % 100 === 0)) return null;
  const sorted = set.slice().sort((p, q) => q - p), best = most ? sorted[0] : sorted[3];
  if (sorted.filter(h => h === best).length !== 1) return null;
  return { ask: `Which is ${most ? 'the most' : 'the least'} money?`, answer: choice(dollars(best), set.filter(h => h !== best).map(dollars)), _t: { kind: 'domoney', most },
    hint: 'Compare the dollars first. If they match, compare the dimes, then the pennies.',
    ways: [way('Count it in cents', [set.map(h => `${dollars(h)} = ${h} cents`).join(', '), `${most ? 'Most' : 'Least'} is ${best} cents, which is ${b(dollars(best))}.`]),
      way('Line the decimals up', [chart(set), `Look from the left: the dollars, then the tenths, then the hundredths. ${most ? 'The biggest' : 'The smallest'} is ${b(dollars(best))}.`])] };
}
function fracCompare(L) {
  const d = pick([10, 100]), n = rnd(1, d - 1), x = chance(0.3) ? n * 100 / d : (chance(0.5) ? n * 100 / d + pick([-1, 1]) * rnd(1, 9) : rnd(5, 95)), flip = chance(0.5);
  if (x < 1 || x > 99) return null;
  const diff = x * d - n * 100, s = signOf(flip ? -diff : diff), dec = shown(x), fr = F(n, d), parts = flip ? [fr, dec] : [dec, fr];
  return { ask: 'Which sign makes it true?', expr: `${parts[0]} ${BLANK} ${parts[1]}`, answer: signChoice(flip ? -diff : diff), choiceBig: true, _t: { kind: 'dofcmp', x: R(x / 100), n, d }, hint: 'Write both as hundredths: a tenth is the same as 10 hundredths.',
    ways: [way('Use hundredths', [`${dec} = ${F(x, 100)} and ${fr} = ${F(n * 100 / d, 100)}.`, `Compare ${x} hundredths with ${n * 100 / d} hundredths: ${flip ? n * 100 / d : x} ${sg(s)} ${flip ? x : n * 100 / d}.`, `${parts[0]} ${b(sg(s))} ${parts[1]}`]),
      way('Use decimals', [`${fr} as a decimal is ${shown(n * 100 / d)}.`, `${dec} and ${shown(n * 100 / d)}: give both two places, ${two(x)} and ${two(n * 100 / d)}.`, `${parts[0]} ${b(sg(s))} ${parts[1]}`])] };
}
function plainCompare(L) {
  const w = L === 3 ? rnd(1, 9) * 100 : 0, t = rnd(1, 9), A = w + 10 * t, C = w + pick([t, 10 * t - rnd(1, 9), 10 * t + rnd(1, 9), 10 * t]), flip = chance(0.5), [x, y] = flip ? [C, A] : [A, C], diff = x - y, sx = shown(x), sy = two(y);
  return { ask: 'Which sign makes it true?', expr: `${sx} ${BLANK} ${sy}`, answer: signChoice(diff), choiceBig: true, _t: { kind: 'dcmp', a: sx, c: sy }, hint: 'Give both numbers two digits after the point, then compare.',
    ways: [way('Give both two places', [`${sx} = ${two(x)}. Both now have two places: ${two(x)} and ${sy}.`, `${x} hundredths and ${y} hundredths: ${x} ${sg(signOf(diff))} ${y}.`, `${sx} ${b(sg(signOf(diff)))} ${sy}`]),
      way('Compare place by place', [chart([x, y]), `Start at the left. The first place where the digits differ decides it.`, `${sx} ${b(sg(signOf(diff)))} ${sy}`])] };
}

const MAKERS = [[gridPair, between, closer, plainCompare], [between, order, money, fracCompare, closer, plainCompare], [order, money, fracCompare, plainCompare, between, order]];
export const genDecOrder = L => oneOf(MAKERS[L - 1], L);
