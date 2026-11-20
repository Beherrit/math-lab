// Multiplying: up to 4 digits by 1 digit, and 2 digits by 2 digits (area model, then partial products).
import { rnd, pick, chance, fmt, b, k, way, nm, num, column, areaModel, splitPV } from '../../util.js';
import { digit, lead, sum, oneOf, estimateWay, tagged } from './helpers.js';
import { areaBlank } from './visuals.js';

const boxes = (a, c) => splitPV(c).flatMap(y => splitPV(a).map(x => [x, y]));
function areaWay(a, c) {
  const ap = splitPV(a), cp = splitPV(c), bs = boxes(a, c);
  return way('Area model', [`Break the numbers into place values: ${fmt(a)} = ${ap.map(fmt).join(' + ')}${cp.length > 1 ? ` and ${c} = ${cp.join(' + ')}` : ''}.`, areaModel(ap, cp),
    'Each box is one small multiplication: multiply the digits, then put the zeros back.', `Add the boxes: ${bs.map(([x, y]) => fmt(x * y)).join(' + ')} = ${b(fmt(a * c))}`]);
}
function partialsWay(a, c) {
  const bs = boxes(a, c);
  return way('Partial products', ['These are the same pieces as the boxes in the area model, written in a stack and added.',
    column(bs.map(([x, y]) => fmt(x * y)), '+', fmt(a * c), bs.map(([x, y]) => `${fmt(x)} × ${fmt(y)}`)), `Answer: ${b(fmt(a * c))}`]);
}
// The short written method for a one-digit multiplier, one digit at a time with carrying.
function carryWay(a, c) {
  const steps = []; let carry = 0;
  for (let p = 0; p < String(a).length; p++) {
    const t = digit(a, p) * c + carry, last = p === String(a).length - 1;
    steps.push(`${c} × ${digit(a, p)}${carry ? ` + ${carry} carried` : ''} = ${t}. ${last ? `Write ${t}.` : `Write ${t % 10}${t >= 10 ? `, carry ${Math.floor(t / 10)}` : ''}.`}`);
    carry = Math.floor(t / 10);
  }
  return way('Short method', [`Multiply ${c} by each digit of ${fmt(a)}, starting with the ones. A carried digit is just a partial product’s tens moving to the next place.`, ...steps, `Answer: ${b(fmt(a * c))}`]);
}
const roughly = (a, c) => estimateWay(`${fmt(a)} is about ${fmt(lead(a))}${c > 9 ? ` and ${c} is about ${lead(c)}` : ''}. ${fmt(lead(a))} × ${lead(c)} = ${fmt(lead(a) * lead(c))}.`, fmt(a * c));
const ways1 = (a, c) => [areaWay(a, c), partialsWay(a, c), carryWay(a, c), roughly(a, c)];
const ways2 = (a, c) => [areaWay(a, c), partialsWay(a, c), roughly(a, c)];

function tensFact() {
  const d = rnd(2, 9), z = pick([10, 10, 100]), c = rnd(2, 9), a = d * z, unit = z === 10 ? 'tens' : 'hundreds';
  return { ask: 'Multiply.', expr: `${c} × ${a}`, answer: num(a * c), _t: { kind: 'mul', a, c }, hint: `${a} is ${d} ${unit}. Use the fact ${c} × ${d}.`,
    ways: [way('Think in ' + unit, [`${a} is ${d} ${unit}.`, `${c} × ${d} ${unit} = ${c * d} ${unit}.`, `${c * d} ${unit} is ${b(fmt(a * c))}.`]),
      way('Add it up', [`${c} × ${a} means ${c} lots of ${a}.`, `${Array(c).fill(a).join(' + ')} = ${b(fmt(a * c))}`])] };
}
const NUMS1 = [() => [rnd(1, 9) * 10 + rnd(1, 9), rnd(2, 9)], () => [rnd(102, 999), rnd(2, 9)], () => [rnd(1002, 9999), rnd(2, 9)]];
function plain1(L) {
  const [a, c] = NUMS1[L - 1]();
  return { ask: 'Multiply.', expr: `${fmt(a)} × ${c}`, answer: num(a * c), _t: { kind: 'mul', a, c }, ways: ways1(a, c), hint: `Break ${fmt(a)} into place values and multiply each part by ${c}.` };
}

// Each story knows how big its numbers can believably be: cap is the most for the big number (a).
const CTX1 = [
  { cap: 5000, f: (a, c) => [`A stadium has ${k(c + ' sections')} with ${k(a + ' seats')} in each section.`, 'How many seats are in the stadium?', 'The seats in all the sections together.', [`${c} sections`, `${a} seats in each section`]] },
  { cap: 9999, f: (a, c) => [`A cargo plane flies ${k(a + ' km')} every week.`, `How far does it fly in ${k(c + ' weeks')}?`, `The distance for ${c} weeks.`, [`${a} km each week`, `${c} weeks`]] },
  { cap: 6000, f: (a, c) => [`Each truck holds ${k(a + ' cans')}. A warehouse gets ${k(c + ' trucks')}.`, 'How many cans is that?', 'The cans in all the trucks.', [`${a} cans in each truck`, `${c} trucks`]] },
  { cap: 9999, f: (a, c, n) => [`A game gives ${k(a + ' points')} for each level cleared. ${n} clears ${k(c + ' levels')}.`, `How many points does ${n} earn?`, 'The points for all the levels.', [`${a} points for each level`, `${c} levels`]] },
  { cap: 900, f: (a, c, n) => [`${n}’s band pays ${k('$' + a)} a month to rent a rehearsal room.`, `How much does the room cost for ${k(c + ' months')}?`, `The cost for ${c} months.`, [`$${a} each month`, `${c} months`]] },
];
// Two-digit stories: a and c each have their own believable range.
const CTX2 = [
  { a: [12, 40], c: [12, 25], f: (a, c) => [`A cinema has ${k(c + ' rows')} of ${k(a + ' seats')}.`, 'How many seats does it have?', 'The seats in all the rows together.', [`${c} rows`, `${a} seats in each row`]] },
  { a: [12, 45], c: [12, 99], f: (a, c, n) => [`${n} practices guitar for ${k(a + ' minutes')} every day.`, `How many minutes is that in ${k(c + ' days')}?`, `The minutes for ${c} days.`, [`${a} minutes each day`, `${c} days`]] },
  { a: [12, 99], c: [12, 99], f: (a, c) => [`A print shop ties flyers in bundles of ${k(String(a))}. It makes ${k(c + ' bundles')}.`, 'How many flyers is that?', 'The flyers in all the bundles.', [`${a} flyers in each bundle`, `${c} bundles`]] },
  { a: [12, 60], c: [12, 40], f: (a, c) => [`A bus carries ${k(a + ' passengers')} on each trip. It makes ${k(c + ' trips')} this week.`, 'How many passengers does it carry this week?', 'The passengers on all the trips.', [`${a} passengers each trip`, `${c} trips`]] },
  { a: [12, 25], c: [12, 30], f: (a, c) => [`A league has ${k(c + ' teams')}. Each team has ${k(a + ' players')}.`, 'How many players are in the league?', 'The players on all the teams.', [`${c} teams`, `${a} players on each team`]] },
];
function word(f, a, c, ways) {
  const [story, ask, find, know] = f(fmt(a), c, nm());
  return { story, ask, answer: num(a * c), op: 'mul', ways, _t: { kind: 'mul', a, c }, hint: 'The same amount again and again. Which operation is a shortcut for that?',
    read: { find, know, clue: '“Each” and “every” mean equal groups of the same size, so multiply.', plan: `${fmt(a)} × ${c}` } };
}
const RANGE1 = [[11, 99], [102, 999], [1002, 9999]];
export function mul1Word(L) {
  const [lo, hi] = RANGE1[L - 1], ctx = pick(CTX1.filter(x => x.cap >= lo)), a = rnd(lo, Math.min(hi, ctx.cap)), c = rnd(2, 9);
  return word(ctx.f, a, c, ways1(a, c));
}
export function genMul1(L) {
  if (L === 1 && chance(0.3)) return tensFact();
  return L > 1 && chance(L === 3 ? 0.35 : 0.2) ? mul1Word(L) : plain1(L);
}

const RANGE2 = [[11, 19], [12, 59], [25, 99]];
const NUMS2 = RANGE2.map(([lo, hi]) => () => [rnd(lo, hi), rnd(lo, hi)]);
function twoDigit(L) {
  for (;;) { const [a, c] = NUMS2[L - 1](); if (a % 10 && c % 10) return [a, c]; }
}
function plain2(L) {
  const [a, c] = twoDigit(L), scaffold = L === 1 ? { ask: 'The area model is filled in. Add the boxes to finish the multiplication.', visual: areaModel(splitPV(a), splitPV(c)) } : { ask: 'Multiply.' };
  return { ...scaffold, expr: `${a} × ${c}`, answer: num(a * c), _t: { kind: 'mul', a, c }, ways: ways2(a, c), hint: 'Break both numbers into tens and ones. That makes four small multiplications.' };
}
function tensTimes() {
  const a = rnd(2, 9) * 10, c = rnd(1, 4) * 10 + rnd(1, 9);
  return { ask: 'Multiply.', expr: `${a} × ${c}`, answer: num(a * c), _t: { kind: 'mul', a, c }, hint: `${a} is ${a / 10} tens. Work out ${a / 10} × ${c} first.`,
    ways: [way('Tens first', [`${a} is ${a / 10} tens, so ${a} × ${c} is ${a / 10} × ${c} tens.`, `${a / 10} × ${c} = ${a / 10 * c}`, `${a / 10 * c} tens is ${b(fmt(a * c))}.`]), areaWay(c, a)] };
}
const lone = v => (v >= 10 ? v / 10 : v);
// One box (one partial product) is hidden: with the picture on step 1, from a list on step 3.
function missingBox(L) {
  const [a, c] = twoDigit(L), bs = boxes(a, c), i = rnd(0, 3), [x, y] = bs[i], shown = bs.filter((_, j) => j !== i).map(([p, q]) => p * q);
  const pic = areaBlank(splitPV(a), splitPV(c), [Math.floor(i / 2), i % 2]);
  const base = { answer: num(x * y), _t: { kind: 'box', x, y, a, c, shown }, hint: 'Each box multiplies the number above it by the number beside it.',
    ways: [way('Read the row and column', [pic, `The missing box is in the ${x} column and the ${y} row, so it is ${x} × ${y}.`, x < 10 && y < 10 ? `${x} × ${y} = ${b(x * y)}` : `Multiply the front digits: ${lone(x)} × ${lone(y)} = ${lone(x) * lone(y)}. Then put the zeros back: ${x} × ${y} = ${b(fmt(x * y))}`]),
      way('Subtract from the total', [`All four boxes add up to ${a} × ${c} = ${fmt(a * c)}.`, `The three boxes you can see add up to ${shown.map(fmt).join(' + ')} = ${fmt(sum(shown))}.`, `${fmt(a * c)} − ${fmt(sum(shown))} = ${b(fmt(x * y))}`])] };
  if (L === 1) return tagged({ ...base, ask: `This area model shows ${a} × ${c}. What number belongs in the empty box?`, visual: pic }, { i });
  return { ...base, ask: `${a} × ${c} is split into four partial products. Three of them are ${shown.map(fmt).join(', ')}. What is the fourth?` };
}
const fit = (range, own) => { const lo = Math.max(range[0], own[0]), hi = Math.min(range[1], own[1]); return lo > hi ? own : [lo, hi]; };
export function mul2Word(L) {
  const ctx = pick(CTX2), ra = fit(RANGE2[L - 1], ctx.a), rc = fit(RANGE2[L - 1], ctx.c);
  let a, c;
  for (let t = 0; t < 50; t++) { a = rnd(...ra); c = rnd(...rc); if (a % 10 && c % 10) break; }
  return word(ctx.f, a, c, ways2(a, c));
}
const MAKERS2 = [[plain2, plain2, tensTimes, missingBox], [plain2, plain2, plain2, tensTimes, mul2Word], [plain2, plain2, mul2Word, mul2Word, missingBox]];
export const genMul2 = L => oneOf(MAKERS2[L - 1], L);
