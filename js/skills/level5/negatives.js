// Negative numbers: meaning in context, the number line, opposites, absolute value and distance.
import { rnd, pick, chance, fmt, b, k, way, num, choice, signedLine } from '../../util.js';
import { T, numChoice, rndNot, par } from './helpers.js';

const abs = v => `|${fmt(v)}|`;
const line = (lo, hi, pts, step = 2) => signedLine(lo, hi, { points: pts, step });
// s(n) tells a situation worth +n or -n; sign says which.
const CTX = [
  { s: n => `A diver is ${k(n + ' meters below')} sea level.`, sign: -1, zero: 'sea level' }, { s: n => `A drone hovers ${k(n + ' meters above')} sea level.`, sign: 1, zero: 'sea level' },
  { s: n => `The temperature is ${k(n + ' degrees below')} zero.`, sign: -1, zero: 'zero degrees' }, { s: n => `The temperature is ${k(n + ' degrees above')} zero.`, sign: 1, zero: 'zero degrees' },
  { s: n => `A game account ${k('owes ' + n + ' coins')}.`, sign: -1, zero: 'owing nothing' }, { s: n => `A football team ${k('loses ' + n + ' yards')} on a play.`, sign: -1, zero: 'no gain or loss', max: 12 },
  { s: n => `A football team ${k('gains ' + n + ' yards')} on a play.`, sign: 1, zero: 'no gain or loss' }, { s: n => `A parking garage level is ${k(n + ' floors below')} the street.`, sign: -1, zero: 'street level', max: 5 },
  { s: n => `A bank account gets a ${k('withdrawal of $' + n)}.`, sign: -1, zero: 'no change' }, { s: n => `A bank account gets a ${k('deposit of $' + n)}.`, sign: 1, zero: 'no change' },
];
function contextNumber() {
  const c = pick(CTX), n = rnd(2, c.max ?? 40), v = c.sign * n;
  return T({ story: c.s(n), ask: 'Which number describes this?', answer: numChoice(v, [-v, c.sign * (n + 10), 0]),
    ways: [way('Find zero first', [`Zero stands for ${c.zero}.`, c.sign < 0 ? 'Below, owing, losing and taking out all go the opposite way from above, having, gaining and putting in. That side of zero is negative.' : 'Above, gaining and putting in are on the positive side of zero.', `${n} away from zero on that side: ${b(fmt(v))}`]),
      way('Picture a number line', [line(-10, 10, [{ v: c.sign * 6, label: 'this side' }], 5), `Positive numbers sit to the right of 0 (or above it). Negative numbers sit to the left (or below).`, `This situation is on the ${c.sign < 0 ? 'negative' : 'positive'} side: ${b(fmt(v))}`])],
    hint: `What does 0 mean here? Is this above it or below it?` }, 'ctx', { n, sign: c.sign });
}
function readLine() {
  const n = (rnd(0, 3) * 2 + 1) * pick([-1, -1, 1]), lo = n - 1, hi = n + 1;
  return T({ ask: 'What number is at the dot?', visual: line(-8, 8, [{ v: n }]), answer: num(n, { signed: true }),
    ways: [way('Use the labels next to it', [`The dot is halfway between ${fmt(lo)} and ${fmt(hi)}.`, `Counting from ${fmt(lo)}, one step to the right is ${b(fmt(n))}.`]),
      way('Count from zero', [`Each small gap between labels is 2, so halfway is 1 step.`, `The dot is ${Math.abs(n)} step${Math.abs(n) > 1 ? 's' : ''} to the ${n < 0 ? 'left' : 'right'} of 0, so it is ${b(fmt(n))}.`, n < 0 ? 'Left of zero means negative.' : 'Right of zero means positive.'])],
    hint: 'Which side of 0 is the dot on? How many steps away?' }, 'read', { n });
}
function opposite(twice) {
  const n = rndNot(-12, 12, [0]), ans = twice ? n : -n;
  return T({ ask: twice ? `What is the opposite of the opposite of ${b(fmt(n))}?` : `What is the opposite of ${b(fmt(n))}?`, expr: twice ? `−(−${par(n)})` : '', visual: line(-12, 12, [{ v: n, label: fmt(n) }, { v: -n, label: fmt(-n), cls: 'good' }], 4), answer: num(ans, { signed: true }),
    ways: [way('Mirror it across zero', [`Opposites are the same distance from 0, on different sides.`, `${fmt(n)} is ${Math.abs(n)} from 0 on the ${n < 0 ? 'left' : 'right'}. Its opposite is ${Math.abs(n)} from 0 on the ${n < 0 ? 'right' : 'left'}: ${fmt(-n)}`, ...(twice ? [`Mirror again and you are back where you started: ${b(fmt(n))}`] : [`Answer: ${b(fmt(-n))}`])]),
      way('Change the sign', [`Taking the opposite flips the sign and keeps the size.`, twice ? `Flip twice: ${fmt(n)} becomes ${fmt(-n)}, which becomes ${b(fmt(n))}` : `${fmt(n)} becomes ${b(fmt(-n))}`, `Check: a number plus its opposite makes 0. ${fmt(n)} + ${par(-n)} = 0`])],
    hint: 'Opposites are the same distance from zero, on the other side.' }, twice ? 'opp2' : 'opp', { n });
}
function absValue() {
  const n = rnd(1, 25), neg = chance(0.7) ? -n : n;
  return T({ ask: 'What is the absolute value?', expr: abs(neg), answer: num(Math.abs(neg)),
    ways: [way('Distance from zero', [`The bars ask: how far is ${fmt(neg)} from 0?`, `It is ${Math.abs(neg)} steps away. A distance is never negative.`, `${abs(neg)} = ${b(Math.abs(neg))}`]),
      way('Compare with its opposite', [`${fmt(neg)} and ${fmt(-neg)} are the same distance from 0, so they have the same absolute value.`, `${abs(neg)} = ${abs(-neg)} = ${b(Math.abs(neg))}`])],
    hint: 'Absolute value means distance from zero. Can a distance be negative?' }, 'abs', { n: neg });
}
function moveOnLine() {
  const s = rnd(-6, 6), d = rnd(2, 9) * (s > 0 ? -1 : s < 0 ? 1 : pick([-1, 1])), end = s + d, dir = d < 0 ? 'left' : 'right';
  if (Math.abs(end) > 9) return moveOnLine();
  return T({ ask: `Start at ${b(fmt(s))}. Move ${b(Math.abs(d) + ' steps to the ' + dir)}. Where do you land?`, visual: line(-10, 10, [{ v: s, label: 'start' }], 2), answer: num(end, { signed: true }),
    ways: [way('Count the steps', [`Moving ${dir} makes the number ${d < 0 ? 'smaller' : 'bigger'}.`, s !== 0 && Math.sign(s) !== Math.sign(end) && end !== 0 ? `${Math.abs(s)} step${Math.abs(s) > 1 ? 's' : ''} take you to 0. That leaves ${Math.abs(d)} − ${Math.abs(s)} = ${Math.abs(end)} more step${Math.abs(end) > 1 ? 's' : ''} past 0.` : `Count ${Math.abs(d)} steps from ${fmt(s)}.`, `You land on ${b(fmt(end))}.`]),
      s === 0 ? way('From zero', [`Starting at 0, every step ${dir} is one more ${d < 0 ? 'negative' : 'positive'} number.`, `${Math.abs(d)} steps ${dir} of 0 is ${b(fmt(end))}.`])
        : way('Stop at zero on the way', [`From ${fmt(s)} to 0 is ${Math.abs(s)} step${Math.abs(s) === 1 ? '' : 's'}.`, `You have ${Math.abs(d)} steps in all, so ${Math.abs(d) >= Math.abs(s) ? `${Math.abs(d) - Math.abs(s)} more go past 0 on the other side` : `you stop ${Math.abs(s) - Math.abs(d)} short of 0`}.`, `Landing spot: ${b(fmt(end))}`])],
    hint: `Which way is ${dir} on the number line: towards smaller or bigger numbers?` }, 'move', { s, d });
}
// [text, biggest value for the positive number]: a platform above the water cannot be 15 m high.
const GAP = [
  [(a, c) => [`At dawn the temperature was ${k(fmt(a) + '°C')}. By noon it was ${k(c + '°C')}.`, 'By how many degrees did it rise?'], 15],
  [(a, c) => [`A submarine is at ${k(fmt(a) + ' m')} (below sea level). A helicopter is at ${k(c + ' m')} (above sea level).`, 'How many meters apart are they?'], 15],
  [(a, c) => [`A diver starts at ${k(fmt(a) + ' m')} (below the water surface) and climbs onto a boat deck at ${k(c + ' m')} above it.`, 'How many meters does the diver go up?'], 4],
  [(a, c) => [`A game score went from ${k(fmt(a))} points to ${k(c)} points.`, 'How many points were gained?'], 15],
];
export function tempWord() {
  const a = -rnd(2, 15), [make, cMax] = pick(GAP), c = rnd(2, cMax), [story, ask] = make(a, c);
  return T({ story, ask, answer: num(c - a), op: 'add', visual: line(-16, 16, [{ v: a, label: fmt(a) }, { v: c, label: String(c), cls: 'good' }], 4),
    ways: [way('Go through zero', [`From ${fmt(a)} up to 0 is ${abs(a)} = ${-a}.`, `From 0 up to ${c} is ${c}.`, `Total distance: ${-a} + ${c} = ${b(c - a)}`]),
      way('Subtract (top minus bottom)', [`Distance = bigger number − smaller number.`, `${c} − (${fmt(a)}): taking away a negative is the same as adding its opposite.`, `${c} + ${-a} = ${b(c - a)}`])],
    read: { find: 'The distance between the two numbers.', know: [fmt(a), String(c)], clue: 'One number is below zero and one is above, so the gap is both distances from zero put together.', plan: `${-a} + ${c}` },
    hint: 'How far is each number from zero? They are on different sides.' }, 'dist', { a, b: c });
}
function absGreatest() {
  const xs = []; while (xs.length < 4) { const v = rndNot(-20, 20, [0]); if (!xs.some(x => Math.abs(x) === Math.abs(v))) xs.push(v); }
  const top = Math.max(...xs), win = xs.reduce((m, x) => (Math.abs(x) > Math.abs(m) ? x : m));
  if (!xs.some(x => x < 0) || (win === top && chance(0.7))) return absGreatest();
  return T({ ask: 'Which number has the greatest absolute value?', answer: choice(fmt(win), xs.filter(x => x !== win).map(fmt)), choiceBig: true,
    ways: [way('Find each distance from zero', [xs.map(x => `${abs(x)} = ${Math.abs(x)}`).join(', '), `The biggest distance is ${Math.abs(win)}, so the answer is ${b(fmt(win))}.`]),
      win === top ? way('Check the negatives too', [`${fmt(win)} is the greatest number and, this time, also the furthest from 0.`, 'That is not always true: a negative number far to the left can have a bigger absolute value than every positive number in the list.'])
        : way('Why the biggest number can lose', [`${fmt(top)} is the greatest number, but it is only ${Math.abs(top)} from 0.`, `${fmt(win)} is further away from 0, even though it is negative. Absolute value only cares about distance.`])],
    hint: 'Ignore the signs for a moment. Which one is furthest from zero?' }, 'absMax', { xs });
}
export function genNeg(L) {
  if (L === 1) return pick([contextNumber, readLine, () => opposite(false)])();
  if (L === 2) return pick([absValue, moveOnLine, () => opposite(true), absValue])();
  return pick([tempWord, absGreatest, moveOnLine])();
}
