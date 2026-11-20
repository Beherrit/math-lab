// Comparing data sets: mean, median, spread (range and mean absolute deviation), and what a sample can tell you.
import { R, rnd, pick, chance, shuffle, fmt, b, k, way, nm, num, choice, table, linePlot } from '../../util.js';
import { tag, plural } from './helpers.js';

const sum = xs => xs.reduce((s, v) => s + v, 0);
const sorted = xs => xs.slice().sort((p, q) => p - q);
const medianOf = xs => { const s = sorted(xs), m = s.length / 2; return s.length % 2 ? s[(s.length - 1) / 2] : (s[m - 1] + s[m]) / 2; };
const WHAT = ['points scored in each game', 'minutes spent practising each day', 'laps swum in each practice', 'pages read each night', 'text messages sent each day', 'push-ups done each day'];
// n whole numbers from lo to hi whose mean is a whole number.
function niceSet(n, lo, hi) {
  for (;;) { const xs = Array.from({ length: n }, () => rnd(lo, hi)); if (sum(xs) % n === 0 && new Set(xs).size > 2) return xs; }
}
const meanWays = xs => { const m = sum(xs) / xs.length; return [
  way('Add them up, then share equally', [`The mean is what each value would be if the total were shared out evenly.`, `Total: ${xs.join(' + ')} = ${b(sum(xs))}.`, `There are ${xs.length} values: ${sum(xs)} ÷ ${xs.length} = ${b(m)}`]),
  way('Check by balancing', [`Compare each value with ${m}: ${xs.map(v => fmt(v - m)).join(', ')}.`, `The amounts above and below cancel out (they add to 0), so ${b(m)} is the balance point.`])]; };
const medianWays = xs => { const s = sorted(xs), n = s.length, med = medianOf(xs); return [
  way('Put them in order, find the middle', [`In order: ${s.join(', ')}.`, n % 2 ? `There are ${n} values, so the middle one is number ${(n + 1) / 2}: ${b(med)}` : `There are ${n} values, so two are in the middle: ${s[n / 2 - 1]} and ${s[n / 2]}. The median is halfway between them: (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${b(fmt(med))}`]),
  way('Cross off from both ends', [`Cross off the smallest and the largest, again and again: ${s.join(', ')}.`, `What is left in the middle gives the median: ${b(fmt(med))}. Half of the values are below it and half are above.`])]; };
function single(L) {
  const what = pick(WHAT), kind = L === 1 ? pick(['mean', 'median', 'range']) : 'median', n = kind === 'median' ? (L === 1 ? pick([5, 7]) : pick([6, 8])) : rnd(4, 6);
  const xs = kind === 'mean' ? niceSet(n, 2, 20) : Array.from({ length: n }, () => rnd(2, 30)), s = sorted(xs), val = kind === 'mean' ? sum(xs) / n : kind === 'median' ? medianOf(xs) : s[n - 1] - s[0];
  const ways = kind === 'mean' ? meanWays(xs) : kind === 'median' ? medianWays(xs) : [
    way('Largest minus smallest', [`The range tells you how spread out the data is.`, `Largest: ${s[n - 1]}. Smallest: ${s[0]}.`, `${s[n - 1]} − ${s[0]} = ${b(val)}`]),
    way('Put them in order first', [`In order: ${s.join(', ')}.`, `The two ends are ${s[0]} and ${s[n - 1]}, and the gap between them is ${b(val)}.`])];
  return tag({ story: `${nm()} wrote down the ${what}: ${k(xs.join(', '))}.`, ask: `What is the ${kind} of the data?`, answer: num(val), ways,
    hint: kind === 'mean' ? 'Add all the values, then divide by how many there are.' : kind === 'median' ? 'Put the values in order from smallest to largest first.' : 'Find the largest and the smallest value.' }, { kind, xs });
}
function dotPlot() {
  const n = pick([7, 9]), xs = Array.from({ length: n }, () => rnd(1, 9)), counts = Array(11).fill(0), kind = pick(['median', 'range']), s = sorted(xs);
  xs.forEach(v => counts[v]++);
  const val = kind === 'median' ? medianOf(xs) : s[n - 1] - s[0];
  return tag({ ask: `Each mark on the dot plot is one student's answer to "How many books did you read this month?". What is the ${kind}?`, visual: linePlot(1, 10, counts, { title: 'books read' }), answer: num(val),
    ways: kind === 'median' ? medianWays(xs) : [way('Read the two ends', [`The lowest mark is above ${s[0]} and the highest is above ${s[n - 1]}.`, `Range = ${s[n - 1]} − ${s[0]} = ${b(val)}`]), way('List the data', [`Reading the plot left to right: ${s.join(', ')}.`, `Largest minus smallest: ${b(val)}`])],
    hint: kind === 'median' ? `There are ${n} marks. Count in from both ends to the middle one.` : 'Look at the mark furthest left and the mark furthest right.' }, { kind, xs });
}
function twoSets() {
  for (;;) {
    const n = pick([4, 5]), A = niceSet(n, 5, 25), B = niceSet(n, 5, 25), ma = sum(A) / n, mb = sum(B) / n, ra = Math.max(...A) - Math.min(...A), rb = Math.max(...B) - Math.min(...B);
    if (ma === mb || ra === rb) continue;
    const visual = table(['', ...A.map((_, i) => `game ${i + 1}`)], [['Team A', ...A], ['Team B', ...B]]);
    if (chance(0.55)) return tag({ ask: 'The table shows the points two teams scored. How much greater is the larger mean than the smaller mean?', visual, answer: num(Math.abs(ma - mb)),
      ways: [way('Find each mean', [`Team A: ${A.join(' + ')} = ${sum(A)}, and ${sum(A)} ÷ ${n} = ${b(ma)}.`, `Team B: ${B.join(' + ')} = ${sum(B)}, and ${sum(B)} ÷ ${n} = ${b(mb)}.`, `Difference: ${Math.max(ma, mb)} − ${Math.min(ma, mb)} = ${b(Math.abs(ma - mb))}`]),
        way('Compare the totals', [`Both teams played ${n} games, so compare totals first: ${sum(A)} and ${sum(B)} differ by ${Math.abs(sum(A) - sum(B))}.`, `Shared over ${n} games: ${Math.abs(sum(A) - sum(B))} ÷ ${n} = ${b(Math.abs(ma - mb))}`])],
      hint: 'Work out the mean for each team separately.' }, { kind: 'meandiff', A, B });
    const win = ra > rb ? 'Team A' : 'Team B';
    return tag({ ask: 'The table shows the points two teams scored. Which team was LESS consistent (its scores are more spread out)?', visual, answer: choice(win, [], { all: ['Team A', 'Team B'] }), choiceBig: true,
      ways: [way('Compare the ranges', [`Team A: ${Math.max(...A)} − ${Math.min(...A)} = ${b(ra)}.`, `Team B: ${Math.max(...B)} − ${Math.min(...B)} = ${b(rb)}.`, `A bigger range means the scores jump around more: ${b(win)}.`]),
        way('Look at the lists in order', [`Team A in order: ${sorted(A).join(', ')}. Team B in order: ${sorted(B).join(', ')}.`, `${win}'s scores stretch further from lowest to highest.`])],
      hint: 'Spread is about how far apart the scores are, not how big they are. Try the range.' }, { kind: 'spread', A, B });
  }
}
function mad() {
  for (;;) {
    const xs = niceSet(pick([4, 5]), 2, 20), m = sum(xs) / xs.length, ds = xs.map(v => Math.abs(v - m)), val = sum(ds) / xs.length;
    if (!Number.isInteger(val * 10) || val === 0) continue;
    return tag({ ask: `Find the mean absolute deviation of this data: the average distance of the values from the mean. Data: ${xs.join(', ')}`, visual: table(['value', ...xs], [['distance from mean', ...xs.map(() => '?')]]), answer: num(val),
      ways: [way('Mean, distances, mean again', [`Mean: ${sum(xs)} ÷ ${xs.length} = ${b(m)}.`, table(['value', ...xs], [['distance from ' + m, ...ds]]), `Distances are never negative: how far, not which way. Their mean: (${ds.join(' + ')}) ÷ ${xs.length} = ${sum(ds)} ÷ ${xs.length} = ${b(fmt(val))}`]),
        way('What the answer means', [`On average, a value is ${fmt(val)} away from ${m}.`, 'A small number means the data is bunched close to the mean. A big number means it is spread out.'])],
      hint: 'Find the mean first. Then find how far each value is from it.' }, { kind: 'mad', xs });
  }
}
function madMultiple() {
  const d = pick([2, 3, 4, 5]), times = pick([1.5, 2, 2.5, 3, 4]), mb = rnd(10, 40), ma = mb + d * times;
  return tag({ story: `Class A's test scores have a mean of ${k(fmt(ma))}. Class B's have a mean of ${k(fmt(mb))}. In both classes the mean absolute deviation is ${k(String(d))}.`, ask: 'The difference between the means is how many times the mean absolute deviation?', answer: num(times),
    ways: [way('Difference ÷ spread', [`Difference between the means: ${fmt(ma)} − ${mb} = ${b(fmt(ma - mb))}.`, `Measure it in "spreads": ${fmt(ma - mb)} ÷ ${d} = ${b(fmt(times))}`]),
      way('What the answer means', [`The centres are ${fmt(times)} spreads apart.`, times >= 2 ? 'That is a big gap compared with the spread, so the two sets of scores barely overlap.' : 'That is a small gap compared with the spread, so the two sets of scores overlap a lot.'])],
    hint: 'Find how far apart the two means are. Then divide by the mean absolute deviation.' }, { kind: 'quot', a: R(ma - mb), c: d, means: [ma, mb] });
}
const FAIR = [
  { q: 'A school wants to know the favourite sport of ALL its students. Which sample is most likely to give a fair picture?', c: 'Every 10th student on the school list', d: ['The basketball team', 'The first 20 students to arrive at the gym', 'One group of friends at lunch'] },
  { q: 'A town wants to know if people want a new library. Which sample is most likely to give a fair picture?', c: '200 homes picked at random from the whole town', d: ['People leaving the old library', 'Members of a book club', 'The mayor’s neighbours'] },
  { q: 'An app wants to know how many hours a day teenagers spend on phones. Which sample is most likely to give a fair picture?', c: 'Teenagers picked at random from many schools', d: ['Teenagers at a gaming contest', 'Teenagers who answered an online phone survey at midnight', 'The members of one chess club'] },
];
function fairSample() {
  const f = pick(FAIR);
  return tag({ ask: f.q, answer: choice(f.c, f.d), ways: [way('Everyone needs the same chance', ['A sample is fair (representative) when every member of the whole group has the same chance of being picked.', `"${f.c}" does that. It is a random sample.`]),
    way('Spot the bias', [`The other samples all pick people who share something, such as a hobby or a place. They are likely to answer differently from the rest, so they would tilt the result.`])], hint: 'Look for the choice where nobody is more likely to be asked than anybody else.' }, { kind: 'fixed' });
}
export function sampleWord() {
  const n = pick([20, 25, 40, 50]), hit = rnd(2, n / 5 * 3), pop = n * pick([4, 6, 10, 12, 20]), thing = pick(['walk to school', 'play an instrument', 'prefer the later lunch', 'own a bike', 'want a longer break']);
  return tag({ story: `In a random sample of ${k(plural(n, 'student'))}, ${k(plural(hit, 'student'))} say they ${thing}. The school has ${k(plural(pop, 'student'))}.`, ask: `About how many students in the whole school would you expect to say they ${thing}?`, answer: num(hit * pop / n), op: 'multi',
    ways: [way('Scale the sample up', [`The school is ${fmt(pop)} ÷ ${n} = ${b(pop / n)} times as big as the sample.`, `A random sample looks like a small copy of the school, so scale the count the same way: ${hit} × ${pop / n} = ${b(fmt(hit * pop / n))}`]),
      way('Use the fraction', [`${hit} out of ${n} is ${fmt(hit / n)} of the sample.`, `${fmt(hit / n)} × ${fmt(pop)} = ${b(fmt(hit * pop / n))}`, 'It is an estimate: the real number will be close, not exact.'])],
    read: { find: 'An estimate for the whole school.', know: [`sample: ${hit} out of ${n}`, `school: ${fmt(pop)} students`], clue: '"Random sample" means the same fraction should hold for everyone.', plan: `${hit}/${n} = ?/${fmt(pop)}` },
    hint: 'How many times bigger is the school than the sample?' }, { kind: 'expect', fav: hit, total: n, trials: pop });
}
export function meanWord() {
  const n = pick([4, 5]), m = rnd(12, 30), xs = Array.from({ length: n - 1 }, () => m + rnd(-6, 6)), need = m * n - sum(xs), who = nm();
  if (need < 0 || need > 2 * m) return meanWord();
  return tag({ story: `${who} has scored ${k(xs.join(', '))} points in the first ${plural(n - 1, 'game')} of a season. ${who} wants a mean of ${k(plural(m, 'point'))} over ${k(plural(n, 'game'))}.`, ask: `How many points does ${who} need in game ${n}?`, answer: num(need), op: 'multi',
    ways: [way('Total needed minus total so far', [`A mean of ${m} over ${n} games needs a total of ${m} × ${n} = ${b(m * n)}.`, `So far: ${xs.join(' + ')} = ${b(sum(xs))}.`, `Still needed: ${m * n} − ${sum(xs)} = ${b(need)}`]),
      way('Balance around the mean', [`Compare each score with ${m}: ${xs.map(v => fmt(v - m)).join(', ')}. Together that is ${fmt(sum(xs) - m * (n - 1))}.`, `The last game must cancel that out: ${m} ${sum(xs) - m * (n - 1) > 0 ? '−' : '+'} ${Math.abs(sum(xs) - m * (n - 1))} = ${b(need)}`])],
    read: { find: `The score needed in game ${n}.`, know: [`scores so far: ${xs.join(', ')}`, `target mean: ${m}`, `${n} games`], clue: 'Mean × number of games gives the total that is needed.', plan: `${m} × ${n} − (${xs.join(' + ')})` },
    hint: `What total gives a mean of ${m} over ${n} games?` }, { kind: 'needmean', xs, m, n, played: n - 1 });
}
export function genData(L) {
  const r = Math.random();
  if (L === 1) return r < 0.75 ? single(1) : dotPlot();
  if (L === 2) return r < 0.5 ? twoSets() : r < 0.8 ? mad() : single(2);
  return r < 0.25 ? sampleWord() : r < 0.45 ? fairSample() : r < 0.65 ? madMultiple() : r < 0.85 ? meanWord() : mad();
}
