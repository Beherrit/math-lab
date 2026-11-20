// Equivalent fractions: pictures first, then multiplying (or dividing) top and bottom by the same number.
import { rnd, pick, chance, F, b, way, num, choice, fracBar } from '../../util.js';
import { BLANK, oneOf } from './helpers.js';
import { properTop, bar, sameValue } from './frac-util.js';

const SHAPE = [{ d: [2, 6], k: [2, 3], max: 12 }, { d: [2, 12], k: [2, 10], max: 100 }, { d: [3, 12], k: [2, 12], max: 144 }];
function base(L) {
  const s = SHAPE[L - 1];
  for (;;) { const d = rnd(...s.d), k = rnd(...s.k); if (d * k <= s.max) return [properTop(d), d, k]; }
}
function chain(n, d, k) {
  const upto = Math.min(k, 5), list = Array.from({ length: upto }, (_, i) => F(n * (i + 1), d * (i + 1))).join(' = ');
  return way('Count up together', [`The tops count by ${n}s while the bottoms count by ${d}s.`, list + (k > upto ? ' = …' : ''),
    `Step number ${k} in that pattern is ${b(F(n * k, d * k))}.`]);
}
function upWays(n, d, k, part) {
  const follow = part === 'top' ? [`The bottom went from ${d} to ${d * k}. That is × ${k}.`, `Do the same to the top: ${n} × ${k} = ${b(n * k)}`]
    : [`The top went from ${n} to ${n * k}. That is × ${k}.`, `Do the same to the bottom: ${d} × ${k} = ${b(d * k)}`];
  const ways = [way('Multiply top and bottom', [...follow, `Multiplying the top and the bottom by ${k} is the same as multiplying by ${F(k, k)}, which is 1. The value does not change: ${F(n, d)} = ${F(n * k, d * k)}`])];
  if (d * k <= 24) ways.unshift(way('Picture it', [bar(n, d), `Cut every part into ${k} smaller parts. Now there are ${d} × ${k} = ${d * k} parts, and the ${n} shaded ${n > 1 ? 'parts have' : 'part has'} become ${n} × ${k} = ${n * k}.`, bar(n * k, d * k), 'The shaded amount is the same. Only the size of the parts changed.', `The missing ${part === 'top' ? 'top' : 'bottom'} number is ${b(part === 'top' ? n * k : d * k)}.`]));
  return [...ways, chain(n, d, k)];
}
function downWays(n, d, k, part) {
  const follow = part === 'top' ? [`The bottom went from ${d * k} to ${d}. That is ÷ ${k}.`, `Do the same to the top: ${n * k} ÷ ${k} = ${b(n)}`]
    : [`The top went from ${n * k} to ${n}. That is ÷ ${k}.`, `Do the same to the bottom: ${d * k} ÷ ${k} = ${b(d)}`];
  const ways = [way('Divide top and bottom', [...follow, `Dividing the top and the bottom by the same number joins small parts into bigger ones. The value does not change: ${F(n * k, d * k)} = ${F(n, d)}`])];
  if (d * k <= 24) ways.push(way('Picture it', [bar(n * k, d * k), `Join the parts in groups of ${k}. That leaves ${d} bigger parts, with ${n} shaded.`, bar(n, d)]));
  return [...ways, way('Check by multiplying back', [`${F(n, d)}: ${n} × ${k} = ${n * k} and ${d} × ${k} = ${d * k}. That gives ${F(n * k, d * k)} again, so they match.`])];
}

function fromPicture() {
  const [n, d, k] = base(1);
  return { ask: 'The two bars show the same amount. Find the missing top number.', expr: `${F(n, d)} = ${F(BLANK, d * k)}`, visual: bar(n, d) + fracBar(n * k, d * k), answer: num(n * k),
    _t: { kind: 'equiv', a: [n, d], bot: d * k }, ways: upWays(n, d, k, 'top'), hint: 'Count the shaded parts in the second bar. Each part of the first bar was cut into smaller equal parts.' };
}
function missing(L) {
  const [n, d, k] = base(L), part = pick(['top', 'bot']), down = L === 3 && chance(0.6);
  const [ln, ld, rn, rd] = down ? [n * k, d * k, n, d] : [n, d, n * k, d * k];
  return { ask: 'Find the missing number so the fractions are equal.', expr: `${F(ln, ld)} = ${part === 'top' ? F(BLANK, rd) : F(rn, BLANK)}`, answer: num(part === 'top' ? rn : rd),
    _t: { kind: 'equiv', a: [ln, ld], ...(part === 'top' ? { bot: rd } : { top: rn }) }, ways: down ? downWays(n, d, k, part) : upWays(n, d, k, part),
    hint: part === 'top' ? `What was the bottom ${down ? 'divided' : 'multiplied'} by? Do the same to the top.` : `What was the top ${down ? 'divided' : 'multiplied'} by? Do the same to the bottom.` };
}

// Options are [top, bottom] pairs. Wrong ones come from real slips: adding instead of multiplying, or changing only one number.
function whichEqual(L) {
  const [n, d, k] = base(Math.min(L, 2)), not = L === 3 && chance(0.5);
  const equal = not ? [2, 3, 4, 5].filter(x => x !== k).slice(0, 2).map(x => [n * x, d * x]).concat([[n * k, d * k]]) : [[n * k, d * k]];
  const slips = [[n + k, d + k], [n * k, d], [n, d * k], [n * k, d * k + 1]];
  const good = not ? [n + d, d + d] : equal[0], bad = not ? equal : slips.slice(0, 3);
  const verdict = ([x, y]) => (sameValue([x, y], [n, d]) ? `${F(x, y)}: ${n} × ${x / n} = ${x} and ${d} × ${y / d} = ${y}. Same multiplier, so it is equal.`
    : `${F(x, y)}: ${x % n === 0 && y % d === 0 ? `the top was multiplied by ${x / n} but the bottom by ${y / d}` : 'the top and bottom were not multiplied by the same number'}, so it is not equal.`);
  return { ask: not ? `Which fraction is NOT equal to ${F(n, d)}?` : `Which fraction is equal to ${F(n, d)}?`, answer: choice(F(...good), bad.map(p => F(...p))), _t: { kind: 'whicheq', n, d, not },
    hint: 'An equal fraction has its top and bottom multiplied by the same number.',
    ways: [way('Check each choice', [...[good, ...bad].map(verdict), `The answer is ${b(F(...good))}.`]),
      way('Why adding does not work', [`Adding the same number to the top and bottom changes the value. ${F(1, 2)} is not ${F(2, 3)}, even though both went up by 1.`, 'Only multiplying or dividing both by the same number keeps a fraction equal.'])] };
}

const MAKERS = [[fromPicture, fromPicture, missing], [missing, missing, missing, whichEqual], [missing, missing, whichEqual, whichEqual]];
export const genEquiv = L => oneOf(MAKERS[L - 1], L);
