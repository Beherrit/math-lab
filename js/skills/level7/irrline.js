// Irrational numbers on the number line: square roots and pi placed between tenths, compared, ordered and counted.
import { R, rnd, pick, chance, shuffle, b, way, fmt, num, choice, numberLine } from '../../util.js';
import { sqrt, cbrt, yesNo, fixedChoice } from './h.js';

const sq = n => n * n;
const t1 = v => R(v).toFixed(1);
const nonSquare = (lo, hi) => { const n = rnd(lo, hi); return Number.isInteger(Math.sqrt(n)) ? nonSquare(lo, hi) : n; };
// A value whose digit after the tenths place is not too close to a tenth or to the halfway point, so the tenths are clear.
const clear = v => { const f = (v * 10) % 1; return f > 0.04 && f < 0.96 && Math.abs(f - 0.5) > 0.04; };
const pair = v => { const lo = Math.floor(v * 10 + 1e-9) / 10; return [lo, R(lo + 0.1)]; };
const both = (lo, hi) => `${t1(lo)} and ${t1(hi)}`;
const CONST = [['π', Math.PI], ['2π', 2 * Math.PI], ['3π', 3 * Math.PI], ['π + 1', Math.PI + 1], ['π − 1', Math.PI - 1], ['1 + √2', 1 + Math.SQRT2], ['√2', Math.SQRT2], ['√3', Math.sqrt(3)], ['2√2', 2 * Math.SQRT2]];
function squaresWay(N, lo, hi, deg = 2) {
  const f = x => R(x ** deg);
  return way(deg === 2 ? 'Square the tenths' : 'Cube the tenths', [`${t1(lo)} × ${t1(lo)}${deg === 3 ? ` × ${t1(lo)}` : ''} = ${fmt(f(lo))}, which is below ${fmt(N)}.`, `${t1(hi)} × ${t1(hi)}${deg === 3 ? ` × ${t1(hi)}` : ''} = ${fmt(f(hi))}, which is above ${fmt(N)}.`, `So the root is between ${b(both(lo, hi))}.`]);
}
function betweenTenth(deg) {
  const N = deg === 2 ? nonSquare(2, 60) : pick([2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 15, 20, 30, 40, 50]), v = deg === 2 ? Math.sqrt(N) : Math.cbrt(N), [lo, hi] = pair(v);
  if (!clear(v)) return null;
  const right = both(lo, hi), name = deg === 2 ? sqrt(N) : cbrt(N);
  return { ask: `${name} is between which two tenths?`, answer: choice(right, [both(R(lo - 0.1), lo), both(hi, R(hi + 0.1)), both(R(lo - 0.2), R(lo - 0.1)), both(R(hi + 0.1), R(hi + 0.2))]), hint: deg === 2 ? 'Square some tenths until you find two whose squares have the number between them.' : 'Cube tenths and see which two cubes have the number between them.', _t: { k: 'irr', shape: deg === 2 ? 'between-tenth' : 'cube-between', N, deg },
    ways: [squaresWay(N, lo, hi, deg), way('Start from whole numbers', [`${name} is between ${Math.floor(v)} and ${Math.floor(v) + 1}, because ${Math.floor(v) ** deg} < ${N} < ${(Math.floor(v) + 1) ** deg}.`, `Now split that gap into tenths. ${fmt(lo)} and ${fmt(hi)} are the tenths on either side, so the root is between ${b(both(lo, hi))}.`])] };
}
function dotPicture(v, label = '?') { const n = Math.floor(v); return numberLine(n, n + 1, v, { loL: n, hiL: n + 1, xL: label, midL: R(n + 0.5) }); }
function dotReading() {
  const N = nonSquare(3, 60), v = Math.sqrt(N), n = Math.floor(v), cands = [];
  for (let m = n * n + 1; m < (n + 1) ** 2; m++) if (Math.abs(Math.sqrt(m) - v) >= 0.14) cands.push(m);
  if (cands.length < 3) return null;
  const wrong = shuffle(cands).slice(0, 3).map(m => sqrt(m));
  return { ask: 'The dot marks a square root on the number line. Which number is it?', visual: dotPicture(v), answer: choice(sqrt(N), wrong), hint: 'The dot is between two whole numbers. Square the whole numbers to see which squares the number must sit between.', _t: { k: 'irr', shape: 'dot-reading', N },
    ways: [way('Read the position', [`The dot is between ${n} and ${n + 1}, so its square is between ${n * n} and ${(n + 1) ** 2}.`, `${sqrt(N)} is the choice whose square is ${N}, and ${N} sits where the dot sits in that gap: ${b(sqrt(N))}.`]), way('Check the others', ['Each other choice has a different square, so it would sit further left or right on the line.', `Only ${b(sqrt(N))} matches the dot.`])] };
}
function squareTenth() {
  const x = rnd(11, 39) / 10, sqv = R(x * x);
  if (Number.isInteger(x)) return null;
  return { ask: `Work out ${fmt(x)} × ${fmt(x)}.`, answer: num(sqv), hint: 'Multiply as if there were no decimal points, then put the decimal point back: two places for each number.', _t: { k: 'irr', shape: 'square-tenth', x },
    ways: [way('Ignore the points first', [`${Math.round(x * 10)} × ${Math.round(x * 10)} = ${sq(Math.round(x * 10))}.`, `Each ${fmt(x)} has 1 decimal place, so the answer has 2: ${b(fmt(sqv))}.`]), way('Split the number', [`${fmt(x)} × ${fmt(x)} = ${fmt(x)} × ${Math.floor(x)} + ${fmt(x)} × ${fmt(R(x - Math.floor(x)))}.`, `${fmt(R(x * Math.floor(x)))} + ${fmt(R(x * (x - Math.floor(x))))} = ${b(fmt(sqv))}.`])] };
}
function constBetween() {
  const [name, v] = pick(CONST), [lo, hi] = pair(v);
  return { ask: `${name} is about ${R(v).toFixed(5)}... Which two tenths is it between?`, answer: choice(both(lo, hi), [both(R(lo - 0.1), lo), both(hi, R(hi + 0.1)), both(R(lo - 0.2), R(lo - 0.1))]), hint: 'Look at the digit in the tenths place and the digit after it.', _t: { k: 'irr', shape: 'const-between', name },
    ways: [way('Read the digits', [`${R(v).toFixed(5)}... has ${Math.floor(v)} whole, then a tenths digit of ${Math.floor(v * 10) % 10}, then more digits.`, `It is at least ${t1(lo)} and less than ${t1(hi)}: ${b(both(lo, hi))}.`]), way('Place it on a line', [`Mark ${t1(lo)} and ${t1(hi)} on a number line.`, `${R(v).toFixed(5)}... is past ${t1(lo)} but not yet ${t1(hi)}, so it is between ${b(both(lo, hi))}.`])] };
}
function compareYn() {
  const N = nonSquare(3, 60), v = Math.sqrt(N), x = R(Math.round(v * 10) / 10 + pick([-0.2, -0.1, 0.1, 0.2]) + 0), more = v > x;
  if (Math.abs(v - x) < 0.05) return null;
  return { ask: `Is ${sqrt(N)} greater than ${t1(x)}?`, answer: yesNo(more), hint: 'Square both numbers. For positive numbers, the one with the greater square is the greater number.', _t: { k: 'irr', shape: 'compare-yn', N, x },
    ways: [way('Square both', [`${sqrt(N)} squared is ${N}. ${t1(x)} × ${t1(x)} = ${fmt(R(x * x))}.`, `${N} is ${more ? 'more' : 'less'} than ${fmt(R(x * x))}, so ${sqrt(N)} is ${more ? 'greater' : 'smaller'}: ${b(more ? 'yes' : 'no')}.`]), way('Find the tenths', [`${sqrt(N)} is about ${R(v).toFixed(2)}.`, `${R(v).toFixed(2)} is ${more ? 'more' : 'less'} than ${t1(x)}: ${b(more ? 'yes' : 'no')}.`])] };
}
function orderList() {
  const N = nonSquare(8, 15), a = Math.sqrt(N), x = R(Math.round(a * 10) / 10 + pick([-0.3, -0.2, 0.2, 0.3])), set = [[sqrt(N), a], [t1(x), x], ['π', Math.PI]];
  if (new Set([a, x, Math.PI].map(v => Math.round(v * 100))).size < 3 || set.some(([, p], i) => set.some(([, q], j) => i !== j && Math.abs(p - q) < 0.04))) return null;
  const sorted = set.slice().sort((p, q) => p[1] - q[1]), names = l => l.map(i => i[0]).join(', ');
  const wrong = [[1, 0, 2], [2, 1, 0], [0, 2, 1], [1, 2, 0], [2, 0, 1]].map(ix => ix.map(i => sorted[i])).filter(l => names(l) !== names(sorted));
  return { ask: `Put these in order from least to greatest: ${shuffle(set).map(i => i[0]).join(', ')}`, answer: choice(names(sorted), wrong.slice(0, 3).map(names)), hint: 'Write each one as a decimal to the hundredths first.', _t: { k: 'irr', shape: 'order-three' },
    ways: [way('Use decimals', [`${set.map(i => `${i[0]} is about ${R(i[1]).toFixed(2)}`).join(', ')}.`, `From least to greatest: ${b(names(sorted))}.`]), way('Find the neighbours', [`Compare two at a time: ${sorted.map(i => i[0]).join(' < ')}.`, `So the order is ${b(names(sorted))}.`])] };
}
function nearestTenth() {
  const N = nonSquare(3, 80), v = Math.sqrt(N);
  if (!clear(v)) return null;
  const ans = R(Math.round(v * 10) / 10), [lo, hi] = pair(v), mid = R(lo + 0.05);
  return { ask: `Round ${sqrt(N)} to the nearest tenth.`, answer: num(ans), hint: 'Find the two tenths the root is between. Then see which one it is closer to.', _t: { k: 'irr', shape: 'nearest-tenth', N },
    ways: [way('Square the tenths', [`${t1(lo)} × ${t1(lo)} = ${fmt(R(lo * lo))} and ${t1(hi)} × ${t1(hi)} = ${fmt(R(hi * hi))}, so ${sqrt(N)} is between ${t1(lo)} and ${t1(hi)}.`, `Halfway is ${fmt(mid)}, and ${fmt(mid)} × ${fmt(mid)} = ${fmt(R(mid * mid))}. ${N} is ${N < mid * mid ? 'less' : 'more'} than that, so the nearest tenth is ${b(fmt(ans))}.`]), way('Use the whole numbers', [`${sqrt(N)} is about ${R(v).toFixed(3)}.`, `The digit after the tenths place says to round ${v * 10 % 1 < 0.5 ? 'down' : 'up'}: ${b(fmt(ans))}.`])] };
}
function dotDecimal() {
  const N = nonSquare(3, 60), v = Math.sqrt(N), n = Math.floor(v), ans = R(Math.round(v * 10) / 10);
  if (!clear(v)) return null;
  const wrong = [R(ans - 0.2), R(ans + 0.2), R(ans - 0.4), R(ans + 0.4)].filter(w => w > n - 0.01 && w < n + 1.01 && Math.abs(w - v) > 0.15);
  if (wrong.length < 3) return null;
  return { ask: 'The dot marks a number on the number line. Which of these is closest to it?', visual: dotPicture(v), answer: choice(t1(ans), shuffle(wrong).slice(0, 3).map(t1)), hint: 'Count the small steps from the whole number on the left. Each small step is one tenth.', _t: { k: 'irr', shape: 'dot-decimal' },
    ways: [way('Count the tenths', [`The line goes from ${n} to ${n + 1} in 10 small steps, so each step is 0.1.`, `The dot is about ${Math.round((v - n) * 10)} steps from ${n}, which is ${b(t1(ans))}.`]), way('Use halves', [`The middle mark is ${t1(n + 0.5)}. The dot is ${v < n + 0.5 ? 'left' : 'right'} of it.`, `The closest choice is ${b(t1(ans))}.`])] };
}
function rationalBetween() {
  const a = nonSquare(2, 8), c = nonSquare(a + 3, a + 14), lo = Math.sqrt(a), hi = Math.sqrt(c), mids = [R(Math.round((lo + hi) * 5) / 10), R(Math.round(lo * 10) / 10 - 0.2), R(Math.round(hi * 10) / 10 + 0.2), R(Math.round(hi * 10) / 10 + 0.4)];
  const inside = mids.filter(m => m > lo + 0.03 && m < hi - 0.03);
  if (inside.length !== 1 || new Set(mids).size < 4) return null;
  return { ask: `Which of these numbers is between ${sqrt(a)} and ${sqrt(c)}?`, answer: choice(t1(inside[0]), mids.filter(m => m !== inside[0]).map(t1)), hint: 'Find a decimal for each root first. The number you want is bigger than the first and smaller than the second.', _t: { k: 'irr', shape: 'rational-between', a, c },
    ways: [way('Decimals first', [`${sqrt(a)} is about ${R(lo).toFixed(2)} and ${sqrt(c)} is about ${R(hi).toFixed(2)}.`, `Only ${t1(inside[0])} is more than ${R(lo).toFixed(2)} and less than ${R(hi).toFixed(2)}: ${b(t1(inside[0]))}.`]), way('Square the choices', [`${sqrt(a)} squared is ${a}, and ${sqrt(c)} squared is ${c}.`, `${t1(inside[0])} × ${t1(inside[0])} = ${fmt(R(inside[0] ** 2))}, which is between ${a} and ${c}, so ${b(t1(inside[0]))} fits.`])] };
}
const PI_RIVALS = [['3.14', 3.14], ['3.15', 3.15], ['3.1416', 3.1416], ['3.1415', 3.1415], ['22/7', 22 / 7], ['√10', Math.sqrt(10)], ['√9.8', Math.sqrt(9.8)]];
function piVs() {
  const [name, v] = pick(PI_RIVALS), win = v > Math.PI ? name : 'π';
  return { ask: `Which is greater: π or ${name}?`, answer: fixedChoice(win, ['π', name]), hint: 'Write both as decimals with enough digits to tell them apart. π = 3.14159265...', _t: { k: 'irr', shape: 'pi-vs', name },
    ways: [way('Compare the digits', [`π = 3.14159265... and ${name} = ${R(v).toFixed(6)}${name.includes('/') || name.includes('√') ? '...' : ''}.`, `The first digits that differ settle it: ${b(win)} is greater.`]), way('Compare on a number line', [`Mark π at 3.14159... and ${name} at ${R(v).toFixed(5)}.`, `${win === 'π' ? 'π is further right' : `${name} is further right`}: ${b(win)} is greater.`])] };
}
function countWhole() {
  const a = nonSquare(10, 40), c = nonSquare(a + 15, 130), n = Math.floor(Math.sqrt(c)) - Math.floor(Math.sqrt(a));
  return { ask: `How many whole numbers are between ${sqrt(a)} and ${sqrt(c)}?`, answer: num(n), hint: 'Find which whole numbers each root sits between. Then list the whole numbers in the gap.', _t: { k: 'irr', shape: 'count-ints', a, c },
    ways: [way('List them', [`${sqrt(a)} is between ${Math.floor(Math.sqrt(a))} and ${Math.floor(Math.sqrt(a)) + 1}. ${sqrt(c)} is between ${Math.floor(Math.sqrt(c))} and ${Math.floor(Math.sqrt(c)) + 1}.`, `The whole numbers in between are ${Array.from({ length: n }, (_, i) => Math.floor(Math.sqrt(a)) + 1 + i).join(', ')}: that is ${b(n)}.`]), way('Subtract', [`The largest whole number below ${sqrt(c)} is ${Math.floor(Math.sqrt(c))}. The largest below ${sqrt(a)} is ${Math.floor(Math.sqrt(a))}.`, `${Math.floor(Math.sqrt(c))} − ${Math.floor(Math.sqrt(a))} = ${b(n)}.`])] };
}
function expressionTenth() {
  const N = nonSquare(2, 40), k = rnd(1, 6), minus = chance(0.4), v = Math.sqrt(N), total = minus ? v - k : v + k, ans = R(Math.round(total * 10) / 10);
  if (!clear(total)) return null;
  return { ask: `Find ${minus ? `${sqrt(N)} − ${k}` : `${k} + ${sqrt(N)}`} to the nearest tenth.`, answer: num(ans), hint: 'Find the root to the nearest hundredth first, then add or subtract.', _t: { k: 'irr', shape: 'expression-tenth', N, add: minus ? -k : k },
    ways: [way('Decimal first', [`${sqrt(N)} is about ${R(v).toFixed(2)}.`, `${minus ? `${R(v).toFixed(2)} − ${k}` : `${k} + ${R(v).toFixed(2)}`} = ${R(total).toFixed(2)}, which rounds to ${b(fmt(ans))}.`]), way('Round the root first', [`${sqrt(N)} is between ${t1(pair(v)[0])} and ${t1(pair(v)[1])}.`, `Adding ${minus ? `−${k}` : k} moves both ends: between ${t1(pair(v)[0] + (minus ? -k : k))} and ${t1(pair(v)[1] + (minus ? -k : k))}, and the nearest tenth is ${b(fmt(ans))}.`])] };
}
export function genIrrLine(L) {
  if (L === 1) return pick([() => betweenTenth(2), dotReading, squareTenth, constBetween])();
  if (L === 2) return pick([compareYn, orderList, nearestTenth, dotDecimal])();
  return pick([rationalBetween, piVs, countWhole, expressionTenth, () => betweenTenth(3)])();
}
