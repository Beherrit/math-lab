// Probability of simple events: favourable outcomes out of all equally likely outcomes, predictions and experiments.
import { rnd, pick, chance, shuffle, simp, fr, b, k, way, num, frac, choice, table, fracBar } from '../../util.js';
import { tag, plural } from './helpers.js';

const COLOURS = ['red', 'blue', 'green', 'yellow', 'white', 'black'];
const HOLDERS = [['A bag holds', 'marbles', 'One marble is picked without looking.'], ['A box holds', 'counters', 'One counter is taken without looking.'], ['A spinner has equal sections:', 'sections', 'The spinner is spun once.']];
// A set of coloured things: [{ c: 'red', n: 3 }, ...] and the sentence that describes it.
function bag(kinds, max) {
  const cs = shuffle(COLOURS).slice(0, kinds).map(c => ({ c, n: rnd(1, max) })), total = cs.reduce((s, x) => s + x.n, 0), [open, noun, act] = pick(HOLDERS);
  return { cs, total, noun, text: `${open} ${cs.map(x => k(`${x.n} ${x.c}`)).join(', ').replace(/, ([^,]*)$/, ' and $1')} ${noun}. ${act}`, counts: table(cs.map(x => x.c), [cs.map(x => x.n)]) };
}
const probWays = (fav, total, what, list, tries = false) => [
  way(tries ? 'Results out of tries' : 'Favourable out of total', [tries ? 'Nobody can count what is in the bag, so the results are the best guide: probability is about the number of times it happened ÷ the number of tries.'
    : 'Every outcome is equally likely, so probability = the number of outcomes you want ÷ the number of all outcomes.', list,
    `There are ${b(fav)} ${what} out of ${b(total)} in all: ${fr(fav, total, { simplify: false })}${simp(fav, total)[1] !== total ? ` = ${b(fr(fav, total))}` : ''}`]),
  way('Picture it as a strip', [fracBar(fav, total), `Each box is one ${tries ? 'try' : 'equally likely outcome'}. ${fav} of the ${total} boxes are the ones you want, so the probability is ${b(fr(fav, total))}.`]),
];
function colourProb(L) {
  const g = bag(L === 1 ? pick([2, 3]) : 3, L === 1 ? 6 : 8), mode = L === 1 ? 'is' : pick(['not', 'or']), [x, y] = g.cs;
  const fav = mode === 'is' ? x.n : mode === 'not' ? g.total - x.n : x.n + y.n, what = mode === 'is' ? x.c : mode === 'not' ? `that are not ${x.c}` : `that are ${x.c} or ${y.c}`;
  const ways = probWays(fav, g.total, what, `Total: ${g.cs.map(c => c.n).join(' + ')} = ${g.total}.`);
  if (mode === 'not') ways.push(way('Use the opposite', [`P(${x.c}) = ${fr(x.n, g.total, { simplify: false })}. Something always happens, so all the probabilities add to 1.`, `P(not ${x.c}) = 1 − ${fr(x.n, g.total, { simplify: false })} = ${b(fr(fav, g.total))}`]));
  return tag({ story: g.text, ask: `What is the probability of getting ${mode === 'is' ? x.c : mode === 'not' ? `a colour that is NOT ${x.c}` : `${x.c} or ${y.c}`}? Give a fraction.`, visual: g.counts, answer: frac(fav, g.total), ways,
    hint: 'Count how many you want. Then count how many there are altogether.' }, { kind: 'prob', fav: mode === 'is' ? [x.n] : mode === 'not' ? g.cs.slice(1).map(c => c.n) : [x.n, y.n], all: g.cs.map(c => c.n) });
}
function likelihood() {
  const g = bag(2, 9), [x, y] = g.cs, r = Math.random(), ask = r < 0.2 ? pick(COLOURS.filter(c => c !== x.c && c !== y.c)) : r < 0.4 ? `${x.c} or ${y.c}` : x.c;
  const fav = r < 0.2 ? 0 : r < 0.4 ? g.total : x.n;
  if (fav * 2 === g.total) return likelihood();
  const word = fav === 0 ? 'impossible' : fav === g.total ? 'certain' : fav * 2 < g.total ? 'unlikely' : 'likely';
  return tag({ story: g.text, ask: `How likely is it to get ${ask}?`, visual: g.counts, answer: choice(word, [], { all: ['impossible', 'unlikely', 'likely', 'certain'] }),
    ways: [way('Compare with one half', [`${fav} of the ${g.total} ${g.noun} are ${ask}. Half of ${g.total} would be ${g.total / 2}.`,
      fav === 0 ? `None at all means it cannot happen: ${b('impossible')} (probability 0).` : fav === g.total ? `All of them means it must happen: ${b('certain')} (probability 1).` : `${fav} is ${fav * 2 < g.total ? 'less' : 'more'} than half, so it is ${b(word)}.`]),
      way('The probability scale', ['Probability runs from 0 (impossible) to 1 (certain). Below one half is unlikely, above one half is likely.', `Here it is ${fr(fav, g.total, { simplify: false })}: ${b(word)}.`])],
    hint: `How many of the ${g.total} are ${ask}? Is that more or less than half?` }, { kind: 'likely', fav, total: g.total, counts: g.cs.map(c => c.n) });
}
const EVENTS = {
  even: { text: 'an even number', ok: v => v % 2 === 0 }, odd: { text: 'an odd number', ok: v => v % 2 === 1 },
  gt: { text: a => `a number greater than ${a}`, ok: (v, a) => v > a }, lt: { text: a => `a number less than ${a}`, ok: (v, a) => v < a },
  mult: { text: a => `a multiple of ${a}`, ok: (v, a) => v % a === 0 }, prime: { text: 'a prime number', ok: v => v > 1 && [2, 3, 5, 7].every(p => v === p || v % p) },
};
function numberEvent(L) {
  const n = L === 1 ? 6 : pick([6, 8, 10, 12, 20]), ev = L === 1 ? pick(['even', 'odd', 'gt', 'lt']) : pick(Object.keys(EVENTS)), arg = ev === 'mult' ? pick([3, 4, 5]) : rnd(2, n - 1);
  const e = EVENTS[ev], text = typeof e.text === 'string' ? e.text : e.text(arg), all = Array.from({ length: n }, (_, i) => i + 1), hits = all.filter(v => e.ok(v, arg));
  if (!hits.length) return numberEvent(L);
  return tag({ story: n === 6 ? `A fair number cube with faces ${k('1 to 6')} is rolled once.` : `Cards numbered ${k(`1 to ${n}`)} are shuffled and one card is drawn.`, ask: `What is the probability of getting ${text}? Give a fraction.`, answer: frac(hits.length, n),
    ways: probWays(hits.length, n, `${hits.length === 1 ? 'outcome' : 'outcomes'} (${hits.join(', ')})`, `All the outcomes: 1 to ${n}. The ones that count as "${text}": ${b(hits.join(', '))}.`),
    hint: `List the numbers from 1 to ${n} that fit. How many are there?` }, { kind: 'event', n, ev, arg });
}
function predict(experiment) {
  const total = pick([4, 5, 6, 8, 10]), fav = rnd(1, total - 1), base = experiment ? total * pick([2, 5, 10]) : total, hits = fav * base / total, trials = base * pick([3, 4, 5, 10, 20]), c = pick(COLOURS);
  const story = experiment ? `A spinner was spun ${k(plural(base, 'time'))}. It landed on ${c} ${k(plural(hits, 'time'))}.` : `A spinner has ${k(plural(total, 'equal section'))}. ${k(fav + (fav === 1 ? ' is ' : ' are ') + c)}.`;
  return tag({ story, ask: `About how many times would you expect ${c} in ${trials} spins?`, answer: num(hits * trials / base), op: 'multi',
    ways: [way('Probability × number of spins', [`${experiment ? 'From the experiment, the' : 'The'} probability of ${c} is ${fr(hits, base, { simplify: false })}${simp(hits, base)[1] !== base ? ` = ${fr(hits, base)}` : ''}.`, `${fr(hits, base)} of ${trials} = ${trials} ÷ ${simp(hits, base)[1]} × ${simp(hits, base)[0]} = ${b(hits * trials / base)}`]),
      way('Scale it up', [`${trials} spins is ${trials / base} times as many as ${base}.`, `So expect ${trials / base} times as many ${c}s: ${hits} × ${trials / base} = ${b(hits * trials / base)}`, 'It is a prediction, so the real count will be close but probably not exact.'])],
    read: { find: `The expected number of ${c} results.`, know: [`${hits} ${c} out of ${base}`, `${trials} spins`], clue: '"About how many would you expect" means probability times the number of tries.', plan: `${hits}/${base} × ${trials}` },
    hint: `What fraction of the spins land on ${c}? Take that fraction of ${trials}.` }, { kind: 'expect', fav: hits, total: base, trials });
}
function experimental() {
  const cs = shuffle(COLOURS).slice(0, 3), ns = [rnd(3, 15), rnd(3, 15), rnd(3, 15)], total = ns[0] + ns[1] + ns[2];
  return tag({ story: `A bag holds marbles of three colours, but nobody knows how many of each. A marble is taken, noted and put back, ${k(plural(total, 'time'))}. The table shows the results.`, ask: `Based on the results, what is the probability that the next marble is ${cs[0]}? Give a fraction.`,
    visual: table(cs, [ns]), answer: frac(ns[0], total),
    ways: probWays(ns[0], total, `${cs[0]} results`, `This is an experimental probability: use what actually happened. Total tries: ${ns.join(' + ')} = ${total}.`, true),
    hint: `How many times did ${cs[0]} come up, out of how many tries?` }, { kind: 'prob', fav: [ns[0]], all: ns });
}
function missingCount() {
  const [n, d] = pick([[1, 2], [1, 3], [1, 4], [1, 5], [2, 3], [2, 5], [3, 4], [3, 5]]), m = rnd(2, 6), red = n * m, total = d * m;
  return tag({ story: `A bag holds ${k(red + ' red marbles')} and some blue marbles. The probability of picking a red marble is ${k(`${n}/${d}`)}.`, ask: 'How many blue marbles are in the bag?', answer: num(total - red),
    ways: [way('Scale the fraction up', [`${n} out of ${d} are red. The real number of red marbles is ${red}, which is ${n} × ${m}.`, `So the total is ${d} × ${m} = ${b(total)}.`, `Blue: ${total} − ${red} = ${b(total - red)}`]),
      way('Check it', [`${red} red out of ${total} is ${fr(red, total, { simplify: false })} = ${fr(n, d)}, which matches.`])],
    hint: `Red is ${n} out of every ${d} marbles. How many groups of ${n} make ${red}?` }, { kind: 'missingcount', red, n, d });
}
export const probWord = () => predict(chance(0.5));
export function genProb(L) {
  const r = Math.random();
  if (L === 1) return r < 0.45 ? colourProb(1) : r < 0.75 ? numberEvent(1) : likelihood();
  if (L === 2) return r < 0.4 ? colourProb(2) : r < 0.75 ? numberEvent(2) : predict(false);
  return r < 0.35 ? experimental() : r < 0.65 ? predict(true) : missingCount();
}
