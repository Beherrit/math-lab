// Sampling and inference: random or biased, scaling a sample up to a whole group, and how much estimates vary.
import { R, rnd, pick, chance, shuffle, fmt, b, way, nm, num, choice } from '../../util.js';
import { tag, plural } from './helpers.js';

const SCEN = [
  ['To find the favourite music of a whole school, the principal asks only the members of the school band.', true], ['To find the favourite music of a whole school, a computer picks 80 names at random from the full student list.', false],
  ['To find how many people in a town own a bike, a survey is done outside a bike shop.', true], ['To find how many people in a town own a bike, 150 homes are chosen at random from a list of every home in the town.', false],
  ['To find the favourite sport of a club, the coach asks the first 10 players who arrive at practice.', true], ['To find the favourite sport of a school, every 12th name on the full school list is chosen.', false],
  ['To learn how much sleep teenagers get, an app asks only the users who are online after midnight.', true], ['To learn how much sleep teenagers get, a researcher picks 200 teenagers at random from several towns.', false],
];
const FAIR = [
  { ask: 'A zoo wants to know which animal ALL its visitors like best. Which sample is most likely to give a fair picture?', right: 'Every 20th visitor who walks through the gate', wrong: ['Visitors at the penguin exhibit', 'People who buy a membership', 'Visitors who fill in a form on the website'] },
  { ask: 'A phone company wants to know how happy ALL its customers are. Which sample is most likely to give a fair picture?', right: '300 customers chosen at random from its customer list', wrong: ['Customers who called the help line', 'Customers who joined this week', 'Customers who left a review'] },
  { ask: 'A school wants to know how long ALL its students take to get to school. Which sample is most likely to give a fair picture?', right: 'Ten students picked at random from each year group', wrong: ['Students on the first bus', 'Students in the running club', 'Students who arrive early'] },
];
const THINGS = ['walk to school', 'play an instrument', 'own a bike', 'want a longer break', 'have a pet', 'like pizza best'];

function biasName() {
  const [s, biased] = pick(SCEN), nums = (s.match(/\d+/g) || []).map(Number);
  return tag({ ask: `${s} Is this sample random or biased?`, answer: choice(biased ? 'Biased' : 'Random', [], { all: ['Random', 'Biased'] }), choiceBig: true,
    ways: [way('Does everyone have the same chance?', ['A random sample gives every member of the whole group an equal chance of being picked. A biased sample leaves some people out or favours others.', biased ? 'Here the people picked share something, like a hobby or a place, so they are not like everyone: biased.' : 'Here the people are picked by chance from everyone, so no one is favoured: random.']),
      way('Would the answers match the whole group?', [biased ? 'Ask: would these people answer like everybody else? No, they are likely to tilt the result one way.' : 'Ask: would these people answer like everybody else? Yes, because they were not picked for any reason connected to the question.'])],
    hint: 'Ask: who could not possibly be picked this way? Does everyone in the whole group have the same chance?' }, { kind: 'fixed', shape: 'biasname', nums });
}
function fairSample() {
  const f = pick(FAIR);
  return tag({ ask: f.ask, answer: choice(f.right, f.wrong), ways: [way('Everyone needs the same chance', ['A fair sample is picked so that every member of the whole group has the same chance.', `"${f.right}" does that.`]), way('Spot the bias', ['Each of the other samples picks people who share something, so they are likely to answer differently from everyone else.'])],
    hint: 'Look for the choice where nobody is more likely to be asked than anybody else.' }, { kind: 'fixed', shape: 'fairsample' });
}
function scaleUp(L) {
  const n = pick(L === 1 ? [10, 20, 25, 50] : [40, 50, 80, 100]), hit = rnd(2, n / 5 * 3), pop = n * pick(L === 1 ? [4, 5, 10] : [6, 10, 12, 20]), thing = pick(THINGS);
  if (!Number.isInteger(R(hit * pop / n))) return scaleUp(L);
  return tag({ story: `In a random sample of ${plural(n, 'student')}, ${plural(hit, 'student')} say they ${thing}. The school has ${plural(pop, 'student')}.`, ask: `About how many students in the whole school would you expect to say they ${thing}?`, answer: num(hit * pop / n), op: 'multi',
    ways: [way('Scale the sample up', [`The school is ${fmt(pop)} ÷ ${n} = ${fmt(pop / n)} times as big as the sample.`, `${hit} × ${fmt(pop / n)} = ${b(fmt(hit * pop / n))}`]), way('Use the fraction', [`${hit} out of ${n} is ${fmt(R(hit / n))} of the sample.`, `${fmt(R(hit / n))} × ${fmt(pop)} = ${b(fmt(hit * pop / n))}. It is an estimate: the real number will be close, not exact.`])],
    hint: 'A random sample is a small copy of the whole group. How many times bigger is the whole group?' }, { kind: 'expect', shape: 'scaleup', fav: hit, total: n, trials: pop });
}
function percentSample() {
  for (;;) {
    const n = pick([20, 25, 40, 50, 80]), hit = rnd(2, n - 2), p = R(hit / n * 100);
    if (!Number.isInteger(p)) continue;
    return tag({ story: `A random sample of ${plural(n, 'student')} was asked about the new lunch menu. ${plural(hit, 'student')} liked it.`, ask: 'What percent of the sample liked the new menu?', answer: num(p), suffix: '%',
      ways: [way('Part out of whole', [`${hit} out of ${n}: ${hit} ÷ ${n} = ${fmt(R(hit / n))}.`, `${fmt(R(hit / n))} = ${b(p + '%')}`]), way('Find 1% of the sample', [`1% of ${n} is ${fmt(n / 100)}.`, `${hit} ÷ ${fmt(n / 100)} = ${b(p)}, so ${b(p + '%')}.`])],
      hint: 'Divide the number who liked it by the size of the sample. Write that as a percent.' }, { kind: 'whatpct', shape: 'percent', part: hit, whole: n });
  }
}
function predict() {
  const p = pick([20, 25, 35, 40, 45, 60]), pop = pick([400, 500, 800, 1200]), ans = R(pop * p / 100), thing = pick(THINGS);
  return tag({ story: `A random sample showed that ${p}% of students ${thing}. The whole school has ${plural(pop, 'student')}.`, ask: 'About how many students in the school is that?', answer: num(ans), op: 'multi',
    ways: [way('Percent of the whole', [`${p}% = ${fmt(p / 100)}.`, `${fmt(p / 100)} × ${fmt(pop)} = ${b(fmt(ans))}`]), way('Build it from 10%', [`10% of ${fmt(pop)} is ${fmt(pop / 10)}.`, `${p}% is ${fmt(R(p / 10))} lots of that: ${fmt(R(p / 10))} × ${fmt(pop / 10)} = ${b(fmt(ans))}`])],
    hint: 'The sample percent should also hold for the whole school. Find that percent of the whole.' }, { kind: 'pctamt', shape: 'predict', price: pop, p });
}
function sizeBetter() {
  const [a, c] = shuffle([10, 20, 30, 50, 100, 200, 500]).slice(0, 2).sort((p, q) => p - q), opts = shuffle([`The sample of ${a}`, `The sample of ${c}`]);
  return tag({ story: `Two groups each take a random sample of students to estimate how many like pizza best. One sample has ${a} students. The other has ${c} students.`, ask: 'Which sample is likely to give the more trustworthy estimate?', answer: choice(`The sample of ${c}`, [], { all: opts }), choiceBig: true,
    ways: [way('Bigger samples vary less', ['Small samples can be thrown off by a few unusual people. A bigger random sample is closer to the whole group, so its estimate usually lands nearer the truth.', `So ${b(`the sample of ${c}`)} is better.`]), way('Think of extremes', [`With ${a} students, one more or fewer changes the percent a lot.`, `With ${c} students, one person hardly matters. ${b(`The sample of ${c}`)} is steadier.`])],
    hint: 'One unusual person matters much more in a small sample. Which sample is less affected?' }, { kind: 'bigger', shape: 'sizebetter', a, c });
}
function variation() {
  const n = pick([40, 50, 100]), base = Math.round(n * pick([0.3, 0.4, 0.5])), xs = Array.from({ length: 5 }, () => base + rnd(-4, 4));
  if (new Set(xs).size < 3) return variation();
  return tag({ story: `Five different random samples of ${plural(n, 'student')} were taken from one school. In each sample, the number of students who walk to school was: ${xs.join(', ')}.`, ask: 'What is the range of these five counts, from the smallest to the largest?', answer: num(Math.max(...xs) - Math.min(...xs)),
    ways: [way('Largest minus smallest', [`Largest: ${Math.max(...xs)}. Smallest: ${Math.min(...xs)}.`, `${Math.max(...xs)} − ${Math.min(...xs)} = ${b(Math.max(...xs) - Math.min(...xs))}`]), way('List them in order', [`In order: ${xs.slice().sort((p, q) => p - q).join(', ')}.`, `The counts spread over ${b(Math.max(...xs) - Math.min(...xs))}. That spread shows how much random samples vary even when nobody made a mistake.`])],
    hint: 'Find the largest and the smallest count. How far apart are they?' }, { kind: 'range', shape: 'variation', xs, n });
}
function meanEstimate() {
  for (;;) {
    const n = pick([40, 50, 100]), pop = pick([600, 800, 1000, 2000]), base = n * pick([0.3, 0.4]), xs = [base + rnd(-4, 4), base + rnd(-4, 4), base + rnd(-4, 4)], mean = (xs[0] + xs[1] + xs[2]) / 3, est = R(mean / n * pop);
    if (!Number.isInteger(R(mean * 100)) || !Number.isInteger(est)) continue;
    return tag({ story: `Three random samples of ${plural(n, 'student')} each were asked if they have a pet. ${xs.join(', ')} said yes. The school has ${plural(pop, 'student')}.`, ask: 'Use the mean of the three samples to estimate how many students in the school have a pet.', answer: num(est), op: 'multi',
      ways: [way('Mean first, then scale up', [`Mean of the samples: (${xs.join(' + ')}) ÷ 3 = ${fmt(mean)}.`, `${fmt(mean)} out of ${n}, scaled to ${fmt(pop)}: ${fmt(mean)} × ${fmt(pop / n)} = ${b(fmt(est))}`]), way('Join them into one big sample', [`Together: ${xs.join(' + ')} = ${xs[0] + xs[1] + xs[2]} out of ${3 * n}.`, `${fmt(xs[0] + xs[1] + xs[2])} ÷ ${3 * n} × ${fmt(pop)} = ${b(fmt(est))}`])],
      hint: 'Average the three counts. Then scale that average up from the sample size to the whole school.' }, { kind: 'meanest', shape: 'meanest', xs, n, pop });
  }
}
function capture() {
  for (;;) {
    const T = pick([20, 30, 40, 50]), C = pick([20, 30, 40, 50]), k = pick([2, 3, 4, 5, 6]), total = T * C / k;
    if (!Number.isInteger(total) || total > 1200) continue;
    return tag({ story: `Rangers tag ${T} fish in a lake and let them go. Later they catch ${C} fish, and ${k} of them have tags.`, ask: 'About how many fish are in the lake?', answer: num(total), op: 'multi',
      ways: [way('Same fraction tagged', [`In the second catch, ${k} out of ${C} are tagged, which is ${fmt(R(k / C))} of them.`, `That should match the whole lake: ${T} tagged fish are ${fmt(R(k / C))} of all the fish, so ${T} ÷ ${fmt(R(k / C))} = ${b(fmt(total))}`]), way('Proportion', [`tagged in the catch : fish in the catch = all tagged : all fish, so ${k} : ${C} = ${T} : ?`, `? = ${C} × ${T} ÷ ${k} = ${b(fmt(total))}`])],
      read: { find: 'The number of fish in the lake.', know: [`${T} tagged`, `catch of ${C}`, `${k} tagged in the catch`], clue: 'The catch is a small random sample of the lake.', plan: `${C} × ${T} ÷ ${k}` },
      hint: 'The tagged fraction in the second catch should match the tagged fraction in the whole lake.' }, { kind: 'capture', shape: 'capture', tagged: T, caught: C, found: k });
  }
}
function pooled() {
  for (;;) {
    const n1 = pick([20, 30, 40, 50, 60]), n2 = pick([40, 50, 60, 100]), h1 = rnd(3, n1 - 3), h2 = rnd(3, n2 - 3), p = R((h1 + h2) / (n1 + n2) * 100);
    if (n1 === n2 || !Number.isInteger(p)) continue;
    return tag({ story: `Two random samples were asked if they like the school uniform. In a sample of ${n1} students, ${h1} said yes. In a sample of ${n2} students, ${h2} said yes.`, ask: 'Put the two samples together. What percent said yes?', answer: num(p), suffix: '%', op: 'multi',
      ways: [way('Add the counts and the sizes', [`Yes: ${h1} + ${h2} = ${h1 + h2}. Students: ${n1} + ${n2} = ${n1 + n2}.`, `${h1 + h2} ÷ ${n1 + n2} = ${fmt(R(p / 100))} = ${b(p + '%')}`]), way('Compare with each sample', [`Sample 1: ${fmt(R(h1 / n1 * 100))}%. Sample 2: ${fmt(R(h2 / n2 * 100))}%.`, `The bigger sample counts for more, so the answer lies between them, nearer the bigger one: ${b(p + '%')}.`])],
      hint: 'Do not average the two percents. Add the yes counts and add the sample sizes first.' }, { kind: 'whatpct', shape: 'pooled', part: h1 + h2, whole: n1 + n2, n1, n2, h1, h2 });
  }
}
function trustBig() {
  const n1 = pick([20, 30, 40]), n2 = pick([300, 400, 500]), p1 = pick([30, 40, 50]), p2 = pick([35, 45, 55]), N = pick([2000, 3000, 4000, 5000]), ans = R(N * p2 / 100);
  return tag({ story: `Two random samples were taken from a town of ${fmt(N)} people. A sample of ${n1} people found ${p1}% walk to work. A sample of ${n2} people found ${p2}% walk to work.`, ask: 'Use the more trustworthy sample to estimate how many people in the town walk to work.', answer: num(ans), op: 'multi',
    ways: [way('Pick the bigger sample', [`The sample of ${n2} is much bigger than the sample of ${n1}, so it should vary less from the truth.`, `${p2}% of ${fmt(N)} = ${fmt(p2 / 100)} × ${fmt(N)} = ${b(fmt(ans))}`]), way('See what the other would say', [`The small sample would give ${p1}% of ${fmt(N)} = ${fmt(R(N * p1 / 100))}.`, `But ${n1} people is too few to trust, so use the bigger sample: ${b(fmt(ans))}.`])],
    hint: 'Decide which sample to trust first. Then take its percent of the whole town.' }, { kind: 'pctamt', shape: 'trustbig', price: N, p: p2, n1, n2, p1 });
}
export function genSampling(L) {
  const r = Math.random();
  if (L === 1) return r < 0.3 ? biasName() : r < 0.5 ? fairSample() : r < 0.75 ? scaleUp(1) : percentSample();
  if (L === 2) return r < 0.25 ? biasName() : r < 0.45 ? scaleUp(2) : r < 0.65 ? sizeBetter() : r < 0.85 ? variation() : predict();
  return r < 0.25 ? meanEstimate() : r < 0.5 ? capture() : r < 0.75 ? pooled() : trustBig();
}
