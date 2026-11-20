// Mean, median, mode and range of a small data set.
import { R, rnd, pick, chance, fmt, b, k, way, nm, num, choice, table } from '../../util.js';
import { T, sum, sorted } from './helpers.js';

const DATA = [['Points scored in', 'games', 2, 24], ['Minutes of guitar practice on', 'days', 10, 45], ['Push-ups done in', 'training sessions', 5, 30], ['Songs added to a playlist in', 'weeks', 1, 15], ['Kilometers cycled on', 'rides', 4, 28], ['Photos taken on', 'day trips', 6, 40]];
const list = xs => xs.join(', ');
const counts = xs => { const m = new Map(); for (const x of xs) m.set(x, (m.get(x) || 0) + 1); return m; };
function modeOf(xs) { const m = counts(xs), top = Math.max(...m.values()), hits = [...m].filter(([, c]) => c === top).map(([v]) => v); return top > 1 && hits.length === 1 ? hits[0] : null; }
const medianOf = xs => { const s = sorted(xs), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
// A data set that suits the measure asked for (whole-number mean, a single mode, ...).
function makeSet(n, lo, hi, want) {
  for (;;) {
    const xs = Array.from({ length: n }, () => rnd(lo, hi));
    if (want === 'mode') xs[rnd(1, n - 1)] = xs[0];
    if (want === 'mean' && sum(xs) % n) continue;
    if (want === 'mode' && modeOf(xs) === null) continue;
    if (Math.max(...xs) === Math.min(...xs)) continue;
    return xs;
  }
}
function meanWays(xs) {
  const n = xs.length, s = sum(xs), m = s / n, up = xs.filter(x => x > m), down = xs.filter(x => x < m);
  return [way('Add, then share equally', [`The mean is what everyone would get if the total were shared out equally.`, `Total: ${xs.join(' + ')} = ${s}`, `Shared between ${n} values: ${s} ÷ ${n} = ${b(fmt(m))}`]),
    way('Level it out', [`Check ${fmt(m)} as the balance point. Values above it have extra: ${up.map(x => `${x} has ${fmt(R(x - m))}`).join(', ')}. Extra in all: ${fmt(R(sum(up) - m * up.length))}.`, `Values below it are short: ${down.map(x => `${x} needs ${fmt(R(m - x))}`).join(', ')}. Short in all: ${fmt(R(m * down.length - sum(down)))}.`, `The extra exactly fills the gaps, so the mean is ${b(fmt(m))}.`])];
}
function medianWays(xs) {
  const s = sorted(xs), n = s.length, med = medianOf(xs), even = n % 2 === 0;
  return [way('Line them up and close in', [`Put them in order: ${list(s)}`, `Cross off the smallest and the biggest, again and again, until ${even ? 'two are' : 'one is'} left: ${even ? `${s[n / 2 - 1]} and ${s[n / 2]}` : s[(n - 1) / 2]}.`, even ? `With two in the middle, go halfway between them: (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${b(fmt(med))}` : `The median is ${b(med)}.`]),
    way('Count to the middle place', [`In order: ${list(s)}. There are ${n} values.`, even ? `${n} is even, so the middle is between place ${n / 2} and place ${n / 2 + 1}: ${s[n / 2 - 1]} and ${s[n / 2]}. Halfway is ${b(fmt(med))}.` : `The middle place is number ${(n + 1) / 2}, with ${(n - 1) / 2} values on each side: ${b(med)}.`, 'Half of the data is at or below the median and half is at or above it.'])];
}
function modeWays(xs) {
  const m = counts(xs), mo = modeOf(xs);
  return [way('Tally each value', [table(['value', 'how many'], sorted([...m.keys()]).map(v => (v === mo ? [b(v), b(m.get(v))] : [v, m.get(v)]))), `The mode is the value that shows up most often: ${b(mo)} (${m.get(mo)} times).`]),
    way('Sort and look for repeats', [`In order: ${list(sorted(xs))}`, `Equal values now sit next to each other. The longest run is ${b(mo)}.`])];
}
function rangeWays(xs) {
  const lo = Math.min(...xs), hi = Math.max(...xs);
  return [way('Biggest minus smallest', ['The range tells you how spread out the data is.', `Biggest value: ${hi}. Smallest value: ${lo}.`, `Range = ${hi} − ${lo} = ${b(hi - lo)}`]),
    way('Count up on a number line', [`In order: ${list(sorted(xs))}`, `From ${lo} up to ${hi} is a jump of ${b(hi - lo)}.`])];
}
const MEASURE = { mean: ['mean', meanWays, 'Add all the values, then divide by how many there are.'], median: ['median', medianWays, 'Put the values in order first. Which one is in the middle?'], mode: ['mode', modeWays, 'Which value appears most often?'], range: ['range', rangeWays, 'Find the biggest and the smallest value.'] };
const VALUE = { mean: xs => sum(xs) / xs.length, median: medianOf, mode: modeOf, range: xs => Math.max(...xs) - Math.min(...xs) };
function measure(L) {
  const want = pick(['mean', 'median', 'mode', 'range', 'mean', 'median']), [title, cnt, lo, hi] = pick(DATA);
  const n = L === 1 ? 5 : want === 'median' ? pick([6, 8]) : rnd(6, 8), xs = makeSet(n, lo, L === 1 ? Math.min(hi, lo + 12) : hi, want), [name, ways, hint] = MEASURE[want];
  return T({ story: `${title} ${n} ${cnt}:`, ask: `What is the ${b(name)}?`, expr: list(xs), exprSmall: true, answer: num(VALUE[want](xs)), ways: ways(xs), hint }, 'stat', { xs, want });
}
function missingValue() {
  const [title, cnt, lo, hi] = pick(DATA), n = rnd(4, 6), m = rnd(lo + 3, hi - 3), known = Array.from({ length: n - 1 }, () => rnd(Math.max(lo, m - 6), Math.min(hi, m + 6))), need = m * n - sum(known);
  if (need < 0 || need > hi + 10) return missingValue();
  return T({ story: `${title} the first ${n - 1} of ${n} ${cnt}: ${k(list(known))}.`, ask: `What must the last value be so that the mean of all ${n} is ${b(m)}?`, answer: num(need),
    ways: [way('Work back from the total', [`A mean of ${m} over ${n} values needs a total of ${m} × ${n} = ${m * n}.`, `So far: ${known.join(' + ')} = ${sum(known)}`, `Still needed: ${m * n} − ${sum(known)} = ${b(need)}`]),
      way('Balance around the mean', [`Compare each value with ${m}: ${known.map(x => (x === m ? 'level' : x > m ? `${x - m} over` : `${m - x} under`)).join(', ')}.`, `Altogether that is ${sum(known) - m * (n - 1) === 0 ? 'exactly level' : sum(known) > m * (n - 1) ? `${sum(known) - m * (n - 1)} over` : `${m * (n - 1) - sum(known)} under`}.`, `The last value has to cancel that out: ${m} ${sum(known) > m * (n - 1) ? '−' : '+'} ${Math.abs(sum(known) - m * (n - 1))} = ${b(need)}`])],
    hint: `What total do ${n} values need for a mean of ${m}?` }, 'missing', { xs: known, m, n });
}
// Leaving the outlier out: the mean moves a lot, the median hardly at all.
function dropOutlier(all, out, mean, med) {
  const rest = all.filter(v => v !== out), mean5 = R(sum(rest) / 5), med5 = medianOf(rest), near = v => (Number.isInteger(v) ? fmt(v) : 'about ' + fmt(Math.round(v * 10) / 10));
  return T({ story: `Minutes six students spent on homework last night: ${k(list(all))}.`, ask: `The time of ${b(out)} minutes is left out and both measures are worked out again. Which one changes more: the mean or the median?`, answer: choice('mean', [], { all: ['mean', 'median'] }), choiceBig: true,
    ways: [way('Work out both, twice', [`With all six: mean ${sum(all)} ÷ 6 = ${fmt(mean)}, median ${fmt(med)}.`, `Without ${out}: mean ${sum(rest)} ÷ 5 = ${near(mean5)}, median ${fmt(med5)} (the middle of ${list(sorted(rest))}).`, `The mean moved from ${fmt(mean)} to ${near(mean5)}. The median moved from ${fmt(med)} to ${fmt(med5)}. The ${b('mean')} changes more.`]),
      way('Think about what each one uses', [`The mean uses the total, and ${out} is a big part of the total. Take it away and the mean drops a lot.`, `The median only looks at the middle of the ordered list. The middle values are all close together, so it hardly moves.`, `The ${b('mean')} changes more.`])],
    hint: 'Which measure uses the total of all the values? What happens to the total when the biggest value goes?' }, 'typical', { xs: all, drop: out });
}
function typical() {
  const base = rnd(8, 20), xs = Array.from({ length: 5 }, () => base + rnd(-3, 3)); let out = base * rnd(4, 6); while ((sum(xs) + out) % 6) out++;
  const all = [...xs, out].sort(() => Math.random() - 0.5), mean = (sum(xs) + out) / 6, med = medianOf(all);
  if (chance(0.5)) return dropOutlier(all, out, mean, med);
  return T({ story: `Minutes six students spent on homework last night: ${k(list(all))}.`, ask: 'Which gives a better picture of a typical time: the mean or the median?', answer: choice('median', [], { all: ['mean', 'median'] }), choiceBig: true,
    ways: [way('Work out both', [`Mean: ${all.join(' + ')} = ${sum(all)}, and ${sum(all)} ÷ 6 = ${fmt(mean)}.`, `Median: in order ${list(sorted(all))}, the middle two give ${fmt(med)}.`, `Five of the six students spent close to ${fmt(med)} minutes. Nobody took about ${fmt(mean)}. The ${b('median')} is more typical.`]),
      way('Spot the outlier', [`${out} is far away from all the other values. It is an outlier.`, `One huge value drags the mean up, because the mean uses the total. The median only looks at the middle, so it hardly moves.`, `With an outlier, the ${b('median')} describes the group better.`])],
    hint: 'Is there one value that is very different from the rest? Which measure does it pull on?' }, 'typical', { xs: all });
}
export function statWord() {
  const n = pick([4, 5, 6]), xs = makeSet(n, 4, 30, 'mean'), who = nm(), [what, unit] = pick([['scored', 'points'], ['cycled', 'km'], ['practiced for', 'minutes'], ['read', 'pages']]);
  return T({ story: `Over ${n} days ${who} ${what} ${k(list(xs))} ${unit}.`, ask: `What is the mean number of ${unit} per day?`, answer: num(sum(xs) / n), op: 'multi', ways: meanWays(xs),
    read: { find: `The mean (average) ${unit} for one day.`, know: [list(xs), `${n} days`], clue: '“Mean” means share the total out equally: add everything, then divide by how many.', plan: `(${xs.join(' + ')}) ÷ ${n}` }, hint: 'Add all the values, then divide by how many there are.' }, 'stat', { xs, want: 'mean' });
}
export function genStats(L) {
  if (L < 3) return L === 2 && chance(0.2) ? statWord() : measure(L);
  return pick([missingValue, missingValue, typical, () => measure(2)])();
}
