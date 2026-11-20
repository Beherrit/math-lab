// Multiplying by 10, 100 and multiples of 10 and 100: place value, tens times tens, and missing factors.
import { rnd, pick, chance, fmt, b, way, num, choice, pvChart } from '../../util.js';
import { BLANK, cnt, rep } from './words.js';
import { tfQ } from './forms.js';

// n × m where m is k tens or k hundreds (k from 1 to 9), or n itself a multiple of 10.
export function tensWays(n, m) {
  const z = m >= 100 ? 100 : 10, k = m / z, unit = z === 10 ? 'tens' : 'hundreds', p = n * m;
  const first = way(`Think in ${unit}`, [k === 1 ? `${n} × ${z} means ${n} ${unit}.` : `${fmt(m)} is ${k} ${unit}. ${n} × ${k} ${unit} = ${n * k} ${unit}.`,
    pvChart([{ x: n * k, label: `${n * k} ones` }, { x: p, label: `${n * k} ${unit}` }]),
    `Every digit sits ${z === 10 ? 'one place' : 'two places'} further left, and ${z === 10 ? 'a zero fills the empty ones place' : 'zeros fill the empty tens and ones places'}.`, `${n * k} ${unit} is ${b(fmt(p))}.`]);
  const T = Math.floor(n / 10), O = n % 10;
  const second = n <= (m === 10 ? 9 : 6) ? way('Add it up', [`${n} × ${fmt(m)} is ${n} groups of ${fmt(m)}: ${rep(n, fmt(m))}.`, `Count by ${fmt(m)}s: ${Array.from({ length: n }, (_, i) => fmt(m * (i + 1))).join(', ')}.`, `That makes ${b(fmt(p))}.`])
    : m === 10 ? way('Make each part ten times bigger', [`${n} is ${cnt(T, 'ten')}${O ? ` and ${cnt(O, 'one')}` : ''}.`, `Ten times ${cnt(T, 'ten')} is ${cnt(T, 'hundred')} (${T * 100}).${O ? ` Ten times ${cnt(O, 'one')} is ${cnt(O, 'ten')} (${O * 10}).` : ''}`, `Together: ${b(fmt(p))}.`])
    : m === 100 ? way('Times 10, twice', ['100 is 10 × 10, so multiply by 10 two times.', `${n} × 10 = ${n * 10}.`, `${n * 10} × 10 = ${b(fmt(p))}.`])
    : way('Multiply in an easier order', [`${fmt(m)} = ${k} × ${z}, so ${n} × ${fmt(m)} = ${n} × ${k} × ${z}.`, `${n} × ${k} = ${n * k}, and ${n * k} × ${z} = ${b(fmt(p))}.`]);
  return [first, second];
}
function tensQ(n, m, swap) {
  return { ask: 'Multiply.', expr: swap ? `${fmt(m)} × ${n}` : `${n} × ${fmt(m)}`, answer: num(n * m), ways: tensWays(n, m), _t: { f: 'mul', a: n, b: m },
    hint: m === 10 || m === 100 ? `${n} × ${m} means ${n} ${m === 10 ? 'tens' : 'hundreds'}.` : `${fmt(m)} is ${m >= 100 ? m / 100 + ' hundreds' : m / 10 + ' tens'}. Multiply the ${m >= 100 ? 'hundreds' : 'tens'} first.` };
}
function unitsQ(n, z) {
  const unit = z === 10 ? 'tens' : 'hundreds';
  return { ask: 'What number is this?', expr: `${n} ${unit}`, answer: num(n * z), hint: `One ${unit.slice(0, -1)} is ${z}. What are ${n} of them worth?`, ways: tensWays(n, z), _t: { f: 'mul', a: n, b: z } };
}
// Tens times tens: 30 × 40 is 3 tens × 4 tens, which is 12 hundreds.
function ttQ() {
  const a = rnd(2, 9), c = rnd(2, 9), x = a * 10, y = c * 10, p = x * y;
  return { ask: 'Multiply.', expr: `${x} × ${y}`, answer: num(p), hint: `${x} is ${a} tens and ${y} is ${c} tens. Start with ${a} × ${c}.`, _t: { f: 'mul', a: x, b: y },
    ways: [way('Tens times tens', [`${x} is ${a} tens and ${y} is ${c} tens.`, `${a} × ${c} = ${a * c}.`, `Tens times tens is hundreds, so ${a * c} hundreds is ${b(fmt(p))}.`]),
      way('Multiply by ten twice', [`${x} × ${c} = ${x * c}.`, `${fmt(x * c)} × 10 = ${b(fmt(p))}.`])] };
}
// Which of these is n × m? The wrong ones are out by a factor of 10 or are the wrong operation.
function pickTensQ(n, m) {
  const p = n * m;
  return { ask: `Which is ${b(`${n} × ${fmt(m)}`)}?`, answer: choice(fmt(p), [fmt(p / 10), fmt(p * 10), fmt(n + m)]), choiceBig: true, hint: 'Work out the small multiplication first, then decide how many zeros to put on.', _t: { f: 'mul', a: n, b: m, evalOptions: true },
    ways: [way('Small fact first', [`${n} × ${m / (m >= 100 ? 100 : 10)} = ${p / (m >= 100 ? 100 : 10)}.`, `Then the zeros: ${b(fmt(p))}.`]), way('Estimate the size', [`${fmt(m)} is about ${m >= 100 ? 'hundreds' : 'tens'}, so the answer is far bigger than ${n}.`, `Only ${b(fmt(p))} has the right number of zeros.`])] };
}
function tfTensQ(n, m) {
  const p = n * m, ok = chance(0.5), shown = ok ? p : pick([p / 10, p * 10, n + m]);
  return tfQ({ expr: `${n} × ${fmt(m)} = ${fmt(shown)}`, ok, hint: `Work out ${n} × ${m / (m >= 100 ? 100 : 10)} first. How many zeros come after it?`, why: [`${n} × ${fmt(m)} = ${fmt(p)}.`, ok ? `${fmt(p)} matches, so it is ${b('true')}.` : `${fmt(shown)} is not ${fmt(p)}, so it is ${b('false')}.`] });
}
function missingQ(z, lo, hi) {
  const n = rnd(lo, hi);
  return { ask: 'What number is missing?', expr: `${BLANK} × ${z} = ${fmt(n * z)}`, answer: num(n), hint: `How many ${z === 10 ? 'tens' : 'hundreds'} are in ${fmt(n * z)}?`, _t: { f: 'div', a: n * z, b: z },
    ways: [way(`Count the ${z === 10 ? 'tens' : 'hundreds'}`, [pvChart([{ x: n * z }]), `${fmt(n * z)} is ${n} ${z === 10 ? 'tens' : 'hundreds'}.`, `So ${b(n)} × ${z} = ${fmt(n * z)}, and the missing number is ${b(n)}.`]),
      way('Undo the multiplying', [`Multiplying by ${z} moves every digit ${z === 10 ? 'one place' : 'two places'} left. Move them back.`, `${fmt(n * z)} ÷ ${z} = ${b(n)}.`])] };
}
function missingTensQ() {
  const n = rnd(2, 9), k = rnd(2, 9), m = k * 10;
  if (chance(0.5)) return { ask: 'What number is missing?', expr: `${n} × ${BLANK} = ${n * m}`, answer: num(m), hint: `${n * m} is ${n * k} tens. ${n} times how many tens is that?`, _t: { f: 'div', a: n * m, b: n },
    ways: [way('Think in tens', [`${n * m} is ${n * k} tens.`, `${n} × ${k} = ${n * k}, so ${n} × ${k} tens = ${n * k} tens.`, `${k} tens is ${b(m)}.`]), way('Check it', [`${n} × ${m} = ${n} × ${k} × 10 = ${n * k} × 10 = ${n * m}. It fits.`, `The missing number is ${b(m)}.`])] };
  return { ask: 'What number is missing?', expr: `${BLANK} × ${m} = ${n * m}`, answer: num(n), hint: 'Both numbers are in tens. Divide the tens in the total by the tens in the number you know.', _t: { f: 'div', a: n * m, b: m },
    ways: [way('Think in tens', [`${m} is ${k} tens, and ${n * m} is ${n * k} tens.`, `? × ${k} = ${n * k}, so the missing number is ${b(n)}.`]), way('Divide', [`${n * m} ÷ ${m} = ${b(n)}.`])] };
}
export function genTens(L) {
  if (L === 1) {
    const t = pick(['mul', 'mul', 'units', 'tf', 'miss', 'pick']), n = chance(0.6) ? rnd(2, 9) : rnd(11, 40);
    if (t === 'units') return unitsQ(rnd(2, 40), 10);
    if (t === 'tf') return tfTensQ(n, 10);
    if (t === 'miss') return missingQ(10, 2, 40);
    return t === 'pick' ? pickTensQ(n, 10) : tensQ(n, 10, chance(0.4));
  }
  if (L === 2) {
    const t = pick(['mul', 'mul', 'hundred', 'units', 'tf', 'pick']), k = rnd(2, 9) * 10;
    if (t === 'hundred') return tensQ(rnd(2, 12), 100, chance(0.3));
    if (t === 'units') return unitsQ(rnd(2, 12), 100);
    if (t === 'tf') return tfTensQ(rnd(2, 9), k);
    return t === 'pick' ? pickTensQ(rnd(2, 9), k) : tensQ(rnd(2, 9), k, chance(0.3));
  }
  const t = pick(['tt', 'tt', 'x100', 'miss', 'missTens', 'missTens', 'hundreds', 'tf', 'units', 'pick']);
  if (t === 'tt') return ttQ();
  if (t === 'units') return unitsQ(rnd(11, 60), 100);
  if (t === 'pick') return pickTensQ(rnd(2, 9) * 10, rnd(2, 9) * 10);
  if (t === 'x100') return tensQ(rnd(41, 99), 100, chance(0.4));
  if (t === 'miss') return missingQ(100, 12, 99);
  if (t === 'missTens') return missingTensQ();
  if (t === 'tf') return tfTensQ(rnd(11, 99), 100);
  return tensQ(rnd(2, 9), rnd(2, 9) * 100, chance(0.3));
}
