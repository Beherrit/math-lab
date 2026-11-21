// Experimental and theoretical probability: relative frequency from a table of trials, predicting, and why the two differ.
import { R, rnd, pick, shuffle, fmt, b, way, nm, NAMES, num, frac, choice, table, fracBar } from '../../util.js';
import { snum, tag, plural } from './helpers.js';

const COLOURS = ['red', 'blue', 'green', 'yellow', 'white', 'black'];
const trialsTable = k => {
  const cs = shuffle(COLOURS).slice(0, k), ns = cs.map(() => rnd(3, 20)), total = ns.reduce((s, v) => s + v, 0);
  return { cs, ns, total, visual: table(cs, [ns]), story: `A spinner was spun ${total} times. The table shows how often it landed on each colour.` };
};
const ways2 = (fav, total, what, extra) => [way('Count out of the total', [`Add the results to get the number of spins: ${extra}.`, `${what} came up ${fav} times out of ${total}: ${b(`${fav}/${total}`)}, which simplifies if it can.`]),
  way('Picture it as a strip', [fracBar(fav, total), `${fav} of the ${total} boxes are the ones you want.`])];

function relFreq(two) {
  const t = trialsTable(pick([3, 4])), idx = two ? [0, 1] : [0], fav = idx.reduce((s, i) => s + t.ns[i], 0), what = idx.map(i => t.cs[i]).join(' or ');
  return tag({ story: t.story, ask: `What is the relative frequency of ${what}? Give a fraction.`, visual: t.visual, answer: frac(fav, t.total), ways: ways2(fav, t.total, what, `${t.ns.join(' + ')} = ${t.total}`),
    hint: 'Relative frequency is how many times it happened out of how many tries.' }, { kind: 'prob', shape: two ? 'twoevent' : 'relfreq', fav: idx.map(i => t.ns[i]), all: t.ns });
}
function theoretical() {
  const n = pick([4, 5, 6, 8, 10]), k = rnd(1, n - 1), c = pick(COLOURS);
  return tag({ story: `A fair spinner has ${n} equal sections. ${plural(k, 'section')} ${k === 1 ? 'is' : 'are'} ${c}.`, ask: `What is the theoretical probability of landing on ${c}? Give a fraction.`, answer: frac(k, n),
    ways: [way('Equal outcomes', [`Every section is equally likely, so probability = sections you want ÷ all sections.`, `${k} ÷ ${n}: ${b(`${k}/${n}`)} (simplified if it can be).`]), way('Picture it', [fracBar(k, n), `${k} of the ${n} equal parts are ${c}.`])],
    hint: 'Theoretical probability comes from counting equal sections, not from trying it.' }, { kind: 'prob', shape: 'theory', fav: [k], all: [n] });
}
function expectTheory() {
  const n = pick([4, 5, 8, 10]), k = rnd(1, n - 1), N = n * pick([2, 3, 4, 6]), c = pick(COLOURS);
  return tag({ story: `A fair spinner has ${n} equal sections and ${k} of them are ${c}. It is spun ${N} times.`, ask: `About how many times should it land on ${c}?`, answer: num(N * k / n), op: 'multi',
    ways: [way('Probability times spins', [`P(${c}) = ${k}/${n}.`, `${k}/${n} of ${N} = ${N} ÷ ${n} × ${k} = ${b(fmt(N * k / n))}`]), way('Scale up', [`In every ${n} spins, expect ${k} ${c}.`, `${N} ÷ ${n} = ${N / n} groups of ${n} spins, so ${N / n} × ${k} = ${b(fmt(N * k / n))}.`])],
    hint: 'Find the probability of landing on that colour. Take that part of all the spins.' }, { kind: 'expect', shape: 'expectation', fav: k, total: n, trials: N });
}
function whyDiffer() {
  const N = pick([10, 20]), h = N / 2 + pick([-3, -2, 2, 3]);
  const right = 'Small numbers of trials often differ from the theoretical probability just by chance';
  return tag({ ask: `A fair coin is flipped ${N} times and lands heads ${h} times. Which statement is true?`, answer: choice(right, ['The coin must be unfair', 'The next flips must make up the difference', 'The theoretical probability was wrong']), choiceBig: true,
    ways: [way('Chance varies', [`Half of ${N} is ${N / 2}, but each flip is random, so ${h} is not surprising.`, `${right}.`]), way('Think of more flips', ['With more and more flips, the relative frequency usually settles closer to the theoretical probability, but it need not match exactly.'])],
    hint: 'Each flip is separate. Does a coin remember what happened before?' }, { kind: 'fixed', shape: 'whydiffer', nums: [N, h] });
}
function predictFromTable() {
  const t = trialsTable(3), N = t.total * pick([5, 10, 20]);
  return tag({ story: t.story, ask: `Using these results, about how many times would you expect ${t.cs[0]} in ${N} spins?`, visual: t.visual, answer: num(t.ns[0] * N / t.total), op: 'multi',
    ways: [way('Relative frequency times spins', [`${t.cs[0]}: ${t.ns[0]} out of ${t.total}.`, `${t.ns[0]}/${t.total} of ${N} = ${b(fmt(R(t.ns[0] * N / t.total)))}`]), way('Scale up', [`${N} is ${N / t.total} times as many spins as ${t.total}.`, `So expect ${N / t.total} times as many: ${t.ns[0]} × ${N / t.total} = ${b(fmt(t.ns[0] * N / t.total))}`])],
    hint: 'Use the results as your best guide to the chance. Scale that chance up to the new number of spins.' }, { kind: 'expect', shape: 'predict', fav: t.ns[0], total: t.total, trials: N, ns: t.ns });
}
function deviation(hard) {
  for (;;) {
    const n = pick(hard ? [3, 8, 5, 10] : [4, 6, 2]), k = hard ? rnd(1, n - 1) : 1, N = n * pick([10, 20, 30]), exp = N * k / n, a = Math.round(exp) + rnd(-6, 6);
    if (a === exp || a < 0) continue;
    return tag({ story: `A fair spinner has ${n} equal sections and ${k === 1 ? 'one' : plural(k, 'section')} ${k === 1 ? 'is' : 'are'} green. It is spun ${N} times and lands on green ${a} times.`, ask: 'How many more times than expected is that? Use a minus sign if it was fewer.', answer: snum(a - exp),
      ways: [way('Expected, then compare', [`Expected: ${k}/${n} of ${N} = ${fmt(exp)}.`, `Actual minus expected: ${a} − ${fmt(exp)} = ${b(fmt(a - exp))}`]), way('Number line', [`Place ${fmt(exp)} (expected) and ${a} (actual) on a number line.`, `The actual is ${a > exp ? 'above' : 'below'} the expected by ${fmt(Math.abs(a - exp))}, so the answer is ${b(fmt(a - exp))}.`])],
      hint: 'First work out the expected number. Then see whether the actual result is above or below it.' }, { kind: 'devi', shape: hard ? 'devihard' : 'devi', fav: k, total: n, trials: N, actual: a });
  }
}
function closer() {
  for (;;) {
    const n1 = pick([10, 20, 40]), n2 = pick([50, 100, 200]), h1 = Math.round(n1 / 2) + rnd(-3, 3), h2 = Math.round(n2 / 2) + rnd(-6, 6), d1 = Math.abs(h1 / n1 - 0.5), d2 = Math.abs(h2 / n2 - 0.5);
    if (R(d1) === R(d2)) continue;
    const win = d1 < d2 ? 'Experiment A' : 'Experiment B';
    return tag({ story: `A fair coin is flipped in two experiments. Experiment A: ${h1} heads in ${n1} flips. Experiment B: ${h2} heads in ${n2} flips.`, ask: 'Which experiment has a relative frequency of heads closer to the theoretical probability?', answer: choice(win, [], { all: ['Experiment A', 'Experiment B'] }), choiceBig: true,
      ways: [way('Compare each with one half', [`A: ${h1}/${n1} = ${fmt(R(h1 / n1))}, which is ${fmt(R(d1))} from 0.5.`, `B: ${h2}/${n2} = ${fmt(R(h2 / n2))}, which is ${fmt(R(d2))} from 0.5.`, `The smaller gap wins: ${b(win)}.`]), way('Use percents', [`A: ${fmt(R(h1 / n1 * 100))}%. B: ${fmt(R(h2 / n2 * 100))}%. The theoretical probability is 50%.`, `Closer to 50%: ${b(win)}.`])],
      hint: 'The theoretical probability of heads is one half. Turn each result into a decimal and see which is nearer to 0.5.' }, { kind: 'closerexp', shape: 'closer', n1, h1, n2, h2 });
  }
}
function biggerExperiment() {
  const [x, y] = shuffle([10, 20, 50, 100, 200, 500]).slice(0, 2), [n1, n2] = shuffle(NAMES).slice(0, 2);
  return tag({ story: `${n1} flips a fair coin ${x} times. ${n2} flips a fair coin ${y} times.`, ask: 'Whose relative frequency of heads is more likely to be close to the theoretical probability?', answer: choice(x > y ? n1 : n2, [], { all: [n1, n2] }), choiceBig: true,
    ways: [way('More trials settle down', ['Chance has more room to throw results off in a short experiment. In a long one the ups and downs even out.', `${b(x > y ? n1 : n2)} did more flips.`]), way('Think about one odd flip', [`One extra head changes ${Math.min(x, y)} flips a lot more than ${Math.max(x, y)} flips.`, `So ${b(x > y ? n1 : n2)} is steadier.`])],
    hint: 'Which experiment has more trials? One unusual result matters less there.' }, { kind: 'biggerexp', shape: 'moretrials', a: x, c: y, who: [n1, n2] });
}
function combined() {
  for (;;) {
    const n1 = pick([20, 30, 40, 50]), n2 = pick([30, 40, 50, 60]), h1 = rnd(3, n1 - 5), h2 = rnd(3, n2 - 5), N = pick([200, 400, 500, 1000]), v = (h1 + h2) / (n1 + n2) * N;
    if (n1 === n2 || !Number.isInteger(R(v * 100))) continue;
    return tag({ story: `Two groups spin the same spinner. One group spins ${n1} times and gets red ${h1} times. The other spins ${n2} times and gets red ${h2} times.`, ask: `Using all the spins together, about how many reds would you expect in ${N} spins?`, answer: num(R(v)), op: 'multi',
      ways: [way('Combine, then scale', [`Red: ${h1} + ${h2} = ${h1 + h2}. Spins: ${n1} + ${n2} = ${n1 + n2}.`, `${h1 + h2}/${n1 + n2} of ${N} = ${b(fmt(R(v)))}`]), way('Relative frequency as a decimal', [`${h1 + h2} ÷ ${n1 + n2} = ${fmt(R((h1 + h2) / (n1 + n2)))}.`, `${fmt(R((h1 + h2) / (n1 + n2)))} × ${N} = ${b(fmt(R(v)))}`])],
      hint: 'More spins give a better guide, so use all of them together. Add the reds and add the spins first.' }, { kind: 'combo', shape: 'combined', h1, n1, h2, n2, N });
  }
}
export function genExpProb(L) {
  const r = Math.random();
  if (L === 1) return r < 0.3 ? relFreq(false) : r < 0.55 ? theoretical() : r < 0.8 ? expectTheory() : whyDiffer();
  if (L === 2) return r < 0.3 ? deviation(false) : r < 0.55 ? predictFromTable() : r < 0.8 ? closer() : relFreq(false);
  return r < 0.25 ? biggerExperiment() : r < 0.5 ? relFreq(true) : r < 0.75 ? deviation(true) : combined();
}
