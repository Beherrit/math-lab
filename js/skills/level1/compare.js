// Comparing and ordering numbers: which is greater, the sign that makes it true, the greatest of three, and a list in order.
import { rnd, pick, chance, shuffle, b, way, choice, pvChart } from '../../util.js';
import { BLANK, cnt, digits, PLACES } from './words.js';

const UNITS = ['hundred', 'ten', 'one'], LT = '&lt;', GT = '&gt;';
function firstDiff(a, c) {
  const A = digits(a), C = digits(c);
  return [0, 1, 2].find(i => A[i] !== C[i]) ?? -1;
}
function cmpWays(a, c) {
  const hi = Math.max(a, c), lo = Math.min(a, c), i = firstDiff(a, c), A = digits(a), C = digits(c);
  const steps = [pvChart([{ x: a }, { x: c }], { maxP: hi > 99 ? 2 : 1 }), 'Start at the biggest place, on the left.'];
  if (i < 0) steps.push(`Every place matches, so the numbers are ${b('equal')}.`);
  else {
    for (let j = hi > 99 ? 0 : 1; j < i; j++) steps.push(`Both have ${cnt(A[j], UNITS[j])}. That place is a tie, so move one place right.`);
    steps.push(`${a} has ${cnt(A[i], UNITS[i])} and ${c} has ${cnt(C[i], UNITS[i])}. More ${PLACES[i]} wins, so ${b(hi)} is greater and ${b(lo)} is less.`);
  }
  const ways = [way('Compare place by place', steps)];
  if (i >= 0) ways.push(way('Think of counting', [`Counting up, you say ${lo} first and reach ${hi} later.`, `${hi} is ${hi - lo} further along, so ${b(hi)} is greater and ${b(lo)} is less.`]));
  else ways.push(way('Read them aloud', ['Both numbers are said exactly the same way.', `They are the same number, so the sign is ${b('=')}.`]));
  return ways;
}
// Two numbers that are easy to mix up: same tens, swapped digits, or close together.
function closePair(L) {
  if (L === 1) {
    const [t, o, o2] = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]), kind = pick(['tens', 'swap', 'any']);
    return kind === 'tens' ? [t * 10 + o, t * 10 + o2] : kind === 'swap' ? [t * 10 + o, o * 10 + t] : [t * 10 + o, o2 * 10 + rnd(0, 9)];
  }
  const [h, t, o, x] = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]), n = h * 100 + t * 10 + o;
  return [n, pick([h * 100 + o * 10 + t, h * 100 + t * 10 + x, h * 100 + x * 10 + o, t * 100 + h * 10 + o, rnd(89, 99)])];
}
function orderQ() {
  const [h, t, o] = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const xs = shuffle([h * 100 + t * 10 + o, h * 100 + o * 10 + t, t * 100 + h * 10 + o, o * 100 + t * 10 + h]).slice(0, 3);
  const up = xs.slice().sort((p, q) => p - q), [s, m, g] = up, show = arr => arr.join(', ');
  return { ask: `Which list puts ${b(show(xs))} in order from least to greatest?`, answer: choice(show(up), [show([g, m, s]), show([m, s, g]), show([s, g, m])]),
    hint: 'Find the smallest number first. Look at the hundreds.', _t: { f: 'sorted', xs },
    ways: [way('Smallest first', [pvChart(xs.map(x => ({ x })), { maxP: 2 }), `Compare the hundreds, then the tens if the hundreds tie. The least is ${s}.`, `Of the two left, ${m} is less than ${g}.`, `In order: ${b(show(up))}.`]),
      way('Check the order', [`Read your list left to right. Each number should be greater than the one before.`, `${s} is less than ${m}, and ${m} is less than ${g}.`])] };
}
function pickQ() {
  const [h, t, o, x] = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]), most = chance(0.5);
  const xs = shuffle([h * 100 + t * 10 + o, h * 100 + o * 10 + t, h * 100 + t * 10 + x, t * 100 + h * 10 + o]);
  const want = most ? Math.max(...xs) : Math.min(...xs);
  return { ask: `Which number is the ${b(most ? 'greatest' : 'least')}?`, expr: xs.join(', '), exprSmall: true, answer: choice(String(want), xs.filter(v => v !== want).map(String)), choiceBig: true,
    hint: 'Compare the hundreds first. If they tie, compare the tens.', _t: { f: most ? 'max' : 'min', xs },
    ways: [way('Compare place by place', [pvChart(xs.map(v => ({ x: v })), { maxP: 2 }), `Look down the hundreds column for the ${most ? 'biggest' : 'smallest'} digit.`, `If two numbers tie there, look at their tens, then their ones.`, `The ${most ? 'greatest' : 'least'} is ${b(want)}.`]),
      way('Put them all in order', [`From least to greatest: ${xs.slice().sort((p, q) => p - q).join(', ')}.`, `The ${most ? 'last' : 'first'} one is ${b(want)}.`])] };
}
// Where to look first: the biggest place, or the first place after the ones that match.
function cmpHint(a, c) {
  const i = firstDiff(a, c), lead = Math.max(a, c) > 99 ? 0 : 1;
  if (i < 0) return 'Look at every place. Do the numbers differ anywhere?';
  if (i === lead) return `Look at the ${PLACES[lead]} first.`;
  return `The ${PLACES.slice(lead, i).join(' and ')} match, so look at the ${PLACES[i]}.`;
}
function pairQ(a, c) {
  const most = chance(0.5), want = most ? Math.max(a, c) : Math.min(a, c);
  return { ask: `Which number is ${b(most ? 'greater' : 'less')}?`, expr: `${a} or ${c}`, answer: choice(String(want), [String(a + c - want)]), choiceBig: true,
    hint: cmpHint(a, c), ways: cmpWays(a, c), _t: { f: most ? 'max' : 'min', xs: [a, c] } };
}
// The greatest or least of three two-digit numbers that use the same digits.
function pickTwoQ() {
  const [t, o, x] = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]), most = chance(0.5);
  const xs = shuffle([t * 10 + o, o * 10 + t, t * 10 + x]), want = most ? Math.max(...xs) : Math.min(...xs);
  return { ask: `Which number is the ${b(most ? 'greatest' : 'least')}?`, expr: xs.join(', '), exprSmall: true, answer: choice(String(want), xs.filter(v => v !== want).map(String)), choiceBig: true,
    hint: 'Compare the tens first. If they tie, compare the ones.', _t: { f: most ? 'max' : 'min', xs },
    ways: [way('Compare place by place', [pvChart(xs.map(v => ({ x: v })), { maxP: 1 }), `Look down the tens column for the ${most ? 'biggest' : 'smallest'} digit.`, 'If two numbers tie there, look at their ones.', `The ${most ? 'greatest' : 'least'} is ${b(want)}.`]),
      way('Put them all in order', [`From least to greatest: ${xs.slice().sort((p, q) => p - q).join(', ')}.`, `The ${most ? 'last' : 'first'} one is ${b(want)}.`])] };
}
// "True or false?" about a comparison such as 47 > 39.
function cmpTrueQ(a, c) {
  const real = a < c ? LT : a > c ? GT : '=', ok = chance(0.5), shown = ok ? real : pick([LT, GT, '='].filter(v => v !== real));
  return { ask: 'True or false?', expr: `${a} ${shown} ${c}`, answer: choice(ok ? 'True' : 'False', [], { all: ['True', 'False'] }), choiceBig: true, hint: cmpHint(a, c), _t: { f: 'tf', ok },
    ways: [...cmpWays(a, c).slice(0, 1), way('Say it in words', [`${a} compared with ${c}: the true sign is ${b(real)}.`, ok ? `The sentence uses ${real}, so it is true.` : `The sentence uses ${shown}, so it is false.`])] };
}
function signQ(a, c) {
  if (chance(0.08)) c = a;
  const sign = a < c ? LT : a > c ? GT : '=';
  return { ask: 'Pick the sign that makes this true.', expr: `${a} ${BLANK} ${c}`, answer: choice(sign, [], { all: [LT, GT, '='] }), choiceBig: true,
    hint: 'The open side of the sign faces the greater number.', _t: { f: 'sign', a, b: c },
    ways: [...cmpWays(a, c), way('Reading the sign', [`${LT} means "is less than" and ${GT} means "is greater than".`, 'The wide, open side always faces the greater number.', `${a} ${b(sign)} ${c}`])] };
}
export function genCmp(L) {
  if (L === 3 && chance(0.7)) return chance(0.5) ? orderQ() : pickQ();
  const [a, c] = closePair(L === 1 ? 1 : 2);
  if (L === 1) { const t = pick(['pair', 'pair', 'pick', 'tf']); return t === 'pair' ? pairQ(a, c) : t === 'pick' ? pickTwoQ() : cmpTrueQ(a, c); }
  const t = pick(['sign', 'pair', 'tf']);
  return L === 3 || t === 'sign' ? signQ(a, c) : t === 'pair' ? pairQ(a, c) : cmpTrueQ(a, c);
}
