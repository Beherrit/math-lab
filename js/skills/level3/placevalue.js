// Place value to the millions: digit values, expanded form, word form, comparing and ordering.
import { rnd, pick, chance, shuffle, fmt, b, way, num, choice, pvChart, placeName, splitPV } from '../../util.js';
import { BLANK, digit, signChoice, signOf, signWord, sg, sum, oneOf } from './helpers.js';
import { words, groups, under1000 } from './words.js';

const RANGE = [[1000, 99999], [10000, 999999], [1000000, 9999999]];
function bigNum(L) {
  let n = rnd(...RANGE[L - 1]);
  if (L > 1 && chance(0.5)) { const p = rnd(1, String(n).length - 2); n -= digit(n, p) * 10 ** p; }
  return n;
}
const chart = (n, hl) => pvChart([{ x: n, label: '', hl }]);
const expanded = n => splitPV(n).map(fmt).join(' + ');

function digitValue(L) {
  const n = bigNum(L), s = String(n);
  const ok = [...s].map((d, i) => s.length - 1 - i).filter(p => digit(n, p) && s.split(String(digit(n, p))).length === 2);
  if (!ok.length) return null;
  const p = pick(ok), d = digit(n, p), v = d * 10 ** p;
  return { ask: `What is the value of the digit ${d} in this number?`, expr: fmt(n), answer: num(v), _t: { kind: 'digit', n, p },
    hint: 'Name the place the digit sits in. Start at the ones on the right and count the places.',
    ways: [way('Place value chart', [chart(n, p), `The ${d} sits in the ${b(placeName(p))} place.`, `${d} ${d === 1 ? placeName(p).slice(0, -1) : placeName(p)} is ${b(fmt(v))}.`]),
      way('Break the number apart', [`${fmt(n)} = ${expanded(n)}`, `The part that comes from the digit ${d} is ${b(fmt(v))}.`])] };
}

function expandMissing(L) {
  const n = bigNum(L), parts = splitPV(n);
  if (parts.length < 3) return null;
  const i = rnd(0, parts.length - 1), shown = parts.filter((_, j) => j !== i);
  return { ask: 'Find the missing part of the expanded form.', expr: `${fmt(n)} = ${parts.map((v, j) => (j === i ? BLANK : fmt(v))).join(' + ')}`, exprSmall: true,
    answer: num(parts[i]), _t: { kind: 'expand', n, shown }, hint: 'Each part is one digit with zeros after it. Which digit has no part yet?',
    ways: [way('Place value chart', [chart(n), `Every digit that is not 0 gets its own part: ${expanded(n)}.`, `The part that is missing is ${b(fmt(parts[i]))}.`]),
      way('Subtract what you can see', [`Add the parts that are shown: ${shown.map(fmt).join(' + ')} = ${fmt(sum(shown))}.`, `${fmt(n)} − ${fmt(sum(shown))} = ${b(fmt(parts[i]))}`])] };
}

const groupSay = ([v, w]) => `“${under1000(v)}${w ? ' ' + w : ''}”`;
function toStandard(L) {
  const n = bigNum(L), asWords = L > 1 || chance(0.4), parts = L === 3 ? shuffle(splitPV(n)) : splitPV(n);
  const hint = asWords ? 'Work one group at a time: millions, then thousands, then the last three digits.' : 'Put each part in its place. A place with no part gets a 0.';
  if (asWords) return { ask: 'Write this number in digits.', expr: `“${words(n)}”`, exprSmall: true, answer: num(n), hint, _t: { kind: 'word', text: words(n) },
    ways: [way('One group at a time', [...groups(n).map(g => `${groupSay(g)} is ${b(g[0])}${g[1] ? ` in the ${g[1]}s group` : ' in the last group'}.`),
      'Every group after the first needs three digits, so fill the empty places with zeros.', `The number is ${b(fmt(n))}.`]),
    way('Place value chart', [chart(n), `Reading the chart from the left gives ${b(fmt(n))}.`])] };
  return { ask: 'Write this as one number.', expr: parts.map(fmt).join(' + '), exprSmall: true, answer: num(n), hint, _t: { kind: 'std', parts },
    ways: [way('Place value chart', ['Drop each part into its place.', chart(n), `A place with no part gets a 0. The number is ${b(fmt(n))}.`]),
      way('Add from the biggest part', ['Start with the biggest part and add the others one by one.', `${expanded(n)} = ${b(fmt(n))}`])] };
}

// Numbers that look like n: two digits swapped, one place changed, or one digit shorter.
function nearby(n) {
  const len = String(n).length, p = rnd(1, len - 2), q = rnd(0, len - 2), hi = digit(n, p), lo = digit(n, p - 1);
  const swap = n + (lo - hi) * 10 ** p + (hi - lo) * 10 ** (p - 1);
  return shuffle([swap, n + 10 ** q, n - 10 ** q, Math.floor(n / 10), n + 9 * 10 ** p]).filter(x => x !== n && x > 999 && x < 10000000);
}
function sayIt(L) {
  const n = bigNum(L), wrong = [...new Set(nearby(n))].slice(0, 3);
  if (wrong.length < 3) return null;
  return { ask: 'Which is the right way to say this number?', expr: fmt(n), answer: choice(words(n), wrong.map(words)), _t: { kind: 'say', n },
    hint: 'Read one group of three digits at a time, and say the group name at each comma.',
    ways: [way('One group at a time', [`Split at the commas: ${fmt(n)}.`, ...groups(n).map(g => `${b(g[0])} is ${groupSay(g)}.`), `Together: ${b(words(n))}.`]),
      way('Place value chart', [chart(n), 'The column names tell you what each digit is worth, so you can check each word against the chart.'])] };
}

function cmpWays(a, c) {
  const s = signOf(a - c), la = String(a).length, lc = String(c).length;
  let p = Math.max(la, lc) - 1; while (p > 0 && digit(a, p) === digit(c, p)) p--;
  const steps = la !== lc ? [`${fmt(a)} has ${la} digits and ${fmt(c)} has ${lc} digits.`, 'With whole numbers, the one with more digits reaches a bigger place, so it is greater.']
    : a === c ? ['Every place has the same digit in both numbers.'] : ['Both numbers have the same number of digits, so read from the left until the digits are different.',
      `They first differ in the ${b(placeName(p))} place: ${digit(a, p)} and ${digit(c, p)}.`, 'That place decides it. The digits to its right are worth less and cannot change the result.'];
  return [way('Line up the places', [pvChart([{ x: a, label: 'left', hl: p }, { x: c, label: 'right', hl: p }]), ...steps, `${fmt(a)} ${b(sg(s))} ${fmt(c)}`]),
    way('Compare the biggest parts', [`${fmt(a)} = ${expanded(a)}`, `${fmt(c)} = ${expanded(c)}`, `Compare the parts from the left. ${fmt(a)} ${signWord(s)} ${fmt(c)}, so the sign is ${b(sg(s))}.`])];
}
function compare(L) {
  const a = bigNum(L), same = L > 1 && chance(0.12);
  const c = same ? a : pick(nearby(a));
  if (!c) return null;
  const right = same || (L > 1 && chance(0.2)) ? expanded(c) : fmt(c);
  return { ask: 'Which sign makes it true?', expr: `${fmt(a)} ${BLANK} ${right}`, exprSmall: right.length > 12, answer: signChoice(a - c), choiceBig: true,
    _t: { kind: 'cmp', a, c }, hint: 'Count the digits first. If both have the same number of digits, compare from the left.', ways: cmpWays(a, c) };
}

function shiftLeft(L) {
  const p = rnd(1, L + 2), d = rnd(2, 9), v = d * 10 ** p;
  return { ask: `A ${d} in the ${placeName(p)} place is worth ${fmt(v)}. Move it one place to the left. What is it worth now?`, answer: num(v * 10), _t: { kind: 'shift', v },
    hint: 'Each place is worth 10 times the place on its right.',
    ways: [way('Place value chart', [pvChart([{ x: v, label: 'before', hl: p }, { x: v * 10, label: 'after', hl: p + 1 }]), `One place to the left is the ${b(placeName(p + 1))} place.`, `${d} ${placeName(p + 1)} is ${b(fmt(v * 10))}.`]),
      way('Multiply by 10', ['Moving one place to the left makes a digit worth 10 times as much.', `${fmt(v)} × 10 = ${b(fmt(v * 10))}`])] };
}
function timesAsMuch(L) {
  const j = L === 3 ? rnd(1, 3) : 1, p = rnd(1, 6 - j), d = rnd(2, 9), top = d * 10 ** (p + j), low = d * 10 ** p;
  const hi = top + rnd(1, 9) * 10 ** (p + j - 1), lo = low + rnd(1, 9) * 10 ** (p - 1), t = 10 ** j;
  if ([lo, hi].some(x => String(x).split(String(d)).length !== 2)) return null;
  return { ask: `The ${d} in ${fmt(hi)} is worth how many times as much as the ${d} in ${fmt(lo)}?`, answer: choice(fmt(t), [], { all: ['10', '100', '1,000'] }), choiceBig: true,
    _t: { kind: 'times', hi: top, lo: low }, hint: 'Find what each digit is worth, then count how many places apart they are.',
    ways: [way('Find each value', [pvChart([{ x: hi, label: '', hl: p + j }, { x: lo, label: '', hl: p }]), `In ${fmt(hi)} the ${d} is worth ${fmt(top)}. In ${fmt(lo)} it is worth ${fmt(low)}.`, `${fmt(top)} ÷ ${fmt(low)} = ${b(fmt(t))}`]),
      way('Count the places', [`The two digits are ${j} place${j > 1 ? 's' : ''} apart.`, j > 1 ? `Each place to the left is 10 times as much: ${Array(j).fill('10').join(' × ')} = ${b(fmt(t))}.` : `One place to the left is ${b(10)} times as much.`])] };
}

function extreme(L) {
  const n = bigNum(L), list = [...new Set([n, ...nearby(n)])].slice(0, 4), which = pick(['greatest', 'least']);
  if (list.length < 4) return null;
  const sorted = list.slice().sort((x, y) => y - x), best = which === 'greatest' ? sorted[0] : sorted[3];
  const answer = choice(fmt(best), list.filter(x => x !== best).map(fmt));
  return { ask: `Which number is the ${which}?`, expr: answer.options.join('<br>'), exprSmall: true, answer, _t: { kind: 'extreme', which },
    hint: 'Check how many digits each number has, then compare from the left.',
    ways: [way('Line up the places', [pvChart(list.map(x => ({ x, label: '' }))), 'Fewer digits means a smaller whole number. For numbers with the same number of digits, compare from the left, one place at a time.',
      `In order from greatest to least: ${sorted.map(fmt).join(', ')}.`, `The ${which} is ${b(fmt(best))}.`]),
    way('Knock them out two at a time', [`Compare any two and keep the ${which === 'greatest' ? 'greater' : 'smaller'} one. Then compare the one you kept with the next number.`, `The last one standing is ${b(fmt(best))}.`])] };
}

const MAKERS = [[digitValue, digitValue, expandMissing, toStandard, compare, shiftLeft], [digitValue, expandMissing, toStandard, sayIt, compare, compare, shiftLeft, timesAsMuch],
  [toStandard, sayIt, compare, compare, extreme, extreme, timesAsMuch, expandMissing, digitValue]];
export const genPV = L => oneOf(MAKERS[L - 1], L);
