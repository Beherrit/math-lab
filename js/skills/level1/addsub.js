// Adding and subtracting 2 and 3 digit numbers: break apart, column with trades, number line.
import { rnd, pick, chance, b, way, num, column } from '../../util.js';
import { blocks, hops } from './pics.js';
import { BLANK, cnt, digits, PLACES } from './words.js';
import { errorQ, tfQ, estQ } from './forms.js';

const VAL = [100, 10, 1], UNIT = ['hundred', 'ten', 'one'];
const cap = s => s[0].toUpperCase() + s.slice(1);
// How many columns need a trade (a carry when adding, a borrow when subtracting).
export function trades(a, c, sub = false) {
  const A = digits(a), C = digits(c); let n = 0, carry = 0;
  for (let i = 2; i >= 0; i--) {
    const over = sub ? A[i] - carry < C[i] : A[i] + C[i] + carry > 9;
    if (over && (sub || i > 0)) n++;
    carry = over ? 1 : 0;
  }
  return n;
}
function untilOk(make, ok) {
  for (let t = 0; t < 400; t++) { const p = make(); if (ok(...p)) return p; }
  return null;
}

function splitAddWay(a, c, pictures) {
  const A = digits(a).map((v, i) => v * VAL[i]), C = digits(c).map((v, i) => v * VAL[i]), sums = A.map((v, i) => v + C[i]);
  const lines = PLACES.map((p, i) => (A[i] || C[i] ? `${cap(p)}: ${A[i]} + ${C[i]} = ${sums[i]}.` : '')).filter(Boolean);
  const pics = pictures ? [blocks(...digits(a)), blocks(...digits(c))] : [];
  return way('Break apart by place value', [...pics, `Split each number into ${a > 99 || c > 99 ? 'hundreds, ' : ''}tens and ones, and add the same kind together.`, ...lines,
    `Put the parts together: ${sums.filter(Boolean).join(' + ')} = ${b(a + c)}.`]);
}
function columnAddWay(a, c) {
  const A = digits(a), C = digits(c), steps = [column([String(a), String(c)], '+', String(a + c)), 'Line up the ones under the ones. Start on the right.'];
  let carry = 0;
  for (let i = 2; i >= 0; i--) {
    const s = A[i] + C[i] + carry;
    if (i === 0 && !s) break;
    let line = `${cap(PLACES[i])}: ${A[i]} + ${C[i]}${carry ? ' + 1 (the trade)' : ''} = ${s}.`;
    if (s > 9 && i > 0) line += ` ${cnt(s, UNIT[i])} is ${cnt(1, UNIT[i - 1])} and ${cnt(s - 10, UNIT[i])}: write ${s - 10} and move the 1 ${UNIT[i - 1]} over.`;
    steps.push(line); carry = s > 9 ? 1 : 0;
  }
  return way('Column method', [...steps, `Answer: ${b(a + c)}.`]);
}
function lineAddWay(a, c) {
  const C = digits(c).map((v, i) => v * VAL[i]).filter(Boolean), pts = [a];
  for (const v of C) pts.push(pts[pts.length - 1] + v);
  return way('Jump along a number line', [hops(pts), C.length > 1 ? `Start at ${a}. Add ${c} in friendly jumps: ${C.join(', then ')}.` : `Start at ${a} and add ${c} in one jump.`, `You land on ${b(a + c)}.`]);
}
function addNums(L) {
  if (L === 1) return chance(0.25) ? [rnd(11, 59), rnd(1, 4) * 10] : untilOk(() => [rnd(11, 78), rnd(11, 78)], (a, c) => trades(a, c) === 0 && a + c < 100);
  if (L === 2) return chance(0.7) ? untilOk(() => [rnd(15, 89), rnd(13, 89)], (a, c) => a % 10 + c % 10 > 9)
    : untilOk(() => [rnd(105, 880), rnd(14, 98)], (a, c) => trades(a, c) >= 1 && a + c < 1000);
  return untilOk(() => [rnd(125, 799), rnd(115, 799)], (a, c) => trades(a, c) >= 1 && a + c <= 1000);
}
export function addBigWays(a, c) {
  return [splitAddWay(a, c, a < 100 && c < 100 && a + c < 100), columnAddWay(a, c), lineAddWay(a, c)];
}
const nearBig = (v, big) => v + pick(big ? [-10, 10, -1, 1] : [-10, 10]);
const sumQ = (a, c, hint) => ({ ask: 'Add.', expr: `${a} + ${c}`, answer: num(a + c), ways: addBigWays(a, c), _t: { f: 'add', xs: [a, c] }, hint });
function missingSumQ(a, c) {
  const s = a + c;
  return { ask: 'What number is missing?', expr: `${a} + ${BLANK} = ${s}`, answer: num(c), hint: 'Take the part you know away from the whole.', _t: { f: 'sub', a: s, b: a },
    ways: [way('Take the part you know away', [`The whole is ${s} and one part is ${a}.`, `${s} − ${a} = ${b(c)}.`]), columnSubWay(s, a)] };
}
function slipSumQ(a, c, L) {
  const s = a + c, wrong = L === 1 ? a + c % 10 : s - 10;
  return errorQ({ a, c, op: 'add', wrong, ways: addBigWays(a, c), hint: L === 1 ? 'Check that every place has been added.' : 'Check each place. Did a trade get lost?',
    slip: L === 1 ? `The tens of ${c} were never added in.` : `A column went over 9, but the trade of 10 ones for 1 ten was not added to the next place.` });
}
function tfSumQ(a, c) {
  const s = a + c, ok = chance(0.5), r = ok ? s : nearBig(s, true);
  return tfQ({ left: `${a} + ${c}`, right: String(r), ok, hint: 'Work out the left side first, then compare.', why: [`${a} + ${c} = ${s}.`, ok ? `${s} matches, so it is ${b('true')}.` : `${r} is not ${s}, so it is ${b('false')}.`] });
}
export function genAddBig(L) {
  const [a, c] = addNums(L), hint = L === 1 ? 'Add the tens together and the ones together.' : 'Start with the ones. If you get 10 or more, trade 10 ones for 1 ten.';
  const t = pick(L === 1 ? ['calc', 'calc', 'calc', 'miss', 'tf', 'slip'] : ['calc', 'calc', 'miss', 'tf', 'slip', 'est']);
  if (t === 'miss') return missingSumQ(a, c);
  if (t === 'tf') return tfSumQ(a, c);
  if (t === 'slip') return slipSumQ(a, c, L);
  if (t === 'est') return estQ({ a, c, op: 'add' });
  return sumQ(a, c, hint);
}

function columnSubWay(a, c) {
  const A = digits(a), C = digits(c), steps = [column([String(a), String(c)], '−', String(a - c)), 'Line up the ones under the ones. Start on the right.'];
  for (let i = 2; i >= 0; i--) {
    if (i === 0 && a < 100) break;
    if (A[i] < C[i]) {
      let j = i - 1; while (A[j] === 0) j--;
      if (j < i - 1) {
        steps.push(`Ones: ${A[i]} − ${C[i]} is not possible yet, and there are 0 tens to trade. Go to the hundreds: trade 1 hundred for 10 tens, then trade 1 of those tens for 10 ones.`);
        A[j]--; A[j + 1] = 9;
      } else {
        steps.push(`${cap(PLACES[i])}: ${A[i]} − ${C[i]} is not possible yet. Trade 1 ${UNIT[j]} for 10 ${PLACES[i]}. That leaves ${cnt(A[j] - 1, UNIT[j])}.`);
        A[j]--;
      }
      A[i] += 10;
    }
    steps.push(`${cap(PLACES[i])}: ${A[i]} − ${C[i]} = ${A[i] - C[i]}.`);
  }
  return way('Column method', [...steps, `Answer: ${b(a - c)}.`]);
}
// Friendly stopping points when counting up from c to a: next ten, next hundred, then a's hundreds and tens.
function countUpPts(c, a) {
  const pts = [c]; let x = c;
  const go = v => { if (v > x && v <= a) { pts.push(v); x = v; } };
  go(Math.ceil(x / 10) * 10); go(Math.ceil(x / 100) * 100);
  go(Math.floor(a / 100) * 100); go(Math.floor(a / 10) * 10); go(a);
  return pts;
}
function countUpWay(a, c) {
  const pts = countUpPts(c, a), jumps = pts.slice(1).map((v, i) => v - pts[i]);
  return way('Count up (think addition)', [`Subtracting asks how far apart the numbers are. Start at ${c} and jump up to ${a}.`, hops(pts),
    jumps.length > 1 ? `Add the jumps: ${jumps.join(' + ')} = ${b(a - c)}.` : `The jump is ${b(a - c)}.`]);
}
export function subBigWays(a, c) {
  return [columnSubWay(a, c), countUpWay(a, c), way('Check by adding', ['Adding undoes subtracting.', `${a - c} + ${c} = ${a}, so ${b(a - c)} fits.`])];
}
function subNums(L) {
  if (L === 1) return chance(0.25) ? untilOk(() => [rnd(31, 99), rnd(1, 8) * 10], (a, c) => a - c > 10)
    : untilOk(() => [rnd(25, 99), rnd(11, 88)], (a, c) => a - c > 0 && trades(a, c, true) === 0);
  if (L === 2) return chance(0.7) ? untilOk(() => [rnd(31, 98), rnd(12, 89)], (a, c) => a - c > 3 && a % 10 < c % 10)
    : untilOk(() => [rnd(120, 990), rnd(14, 98)], (a, c) => trades(a, c, true) >= 1);
  if (chance(0.45)) return untilOk(() => [rnd(2, 9) * 100 + rnd(0, 7), rnd(104, 889)], (a, c) => a - c > 20 && a % 10 < c % 10);
  return untilOk(() => [rnd(230, 999), rnd(112, 889)], (a, c) => a - c > 20 && trades(a, c, true) >= 1);
}
const subQ = (a, c, hint) => ({ ask: 'Subtract.', expr: `${a} − ${c}`, answer: num(a - c), ways: subBigWays(a, c), _t: { f: 'sub', a, b: c }, hint });
function missingDiffQ(a, c) {
  const r = a - c;
  return { ask: 'What number is missing?', expr: `${a} − ${BLANK} = ${r}`, answer: num(c), hint: `How far is it from ${r} up to ${a}?`, _t: { f: 'sub', a, b: r },
    ways: [countUpWay(a, r), columnSubWay(a, r)] };
}
// The classic slip: in each place take the smaller digit from the bigger one, whichever number it belongs to.
function slipDiffQ(a, c, L) {
  const A = digits(a), C = digits(c), r = a - c;
  const swapped = Math.abs(A[0] - C[0]) * 100 + Math.abs(A[1] - C[1]) * 10 + Math.abs(A[2] - C[2]), wrong = L === 1 || swapped === r ? r + 10 : swapped;
  return errorQ({ a, c, op: 'sub', wrong, ways: subBigWays(a, c), hint: L === 1 ? 'Check each place on its own.' : 'Check each place. Was a trade needed?',
    slip: L === 1 || swapped === r ? 'One ten too few was taken away.' : 'In a place where the top digit was smaller, the smaller digit was taken from the bigger one instead of trading.' });
}
function tfDiffQ(a, c) {
  const d = a - c, ok = chance(0.5), r = ok ? d : nearBig(d, true);
  return tfQ({ left: `${a} − ${c}`, right: String(r), ok, hint: 'Work out the left side first, then compare.', why: [`${a} − ${c} = ${d}.`, ok ? `${d} matches, so it is ${b('true')}.` : `${r} is not ${d}, so it is ${b('false')}.`] });
}
export function genSubBig(L) {
  const [a, c] = subNums(L), zero = L === 3 && digits(a)[1] === 0 && a % 10 < c % 10;
  const hint = L === 1 ? 'Take the tens from the tens and the ones from the ones.' : zero ? 'The tens place is 0, so go to the hundreds for a trade first.' : 'Start with the ones. Not enough to take from? Trade 1 ten for 10 ones.';
  const t = pick(L === 1 ? ['calc', 'calc', 'calc', 'miss', 'tf', 'slip'] : ['calc', 'calc', 'miss', 'tf', 'slip', 'est']);
  if (t === 'miss') return missingDiffQ(a, c);
  if (t === 'tf') return tfDiffQ(a, c);
  if (t === 'slip') return slipDiffQ(a, c, L);
  if (t === 'est' && a - c >= 40) return estQ({ a, c, op: 'sub' });
  return subQ(a, c, hint);
}
