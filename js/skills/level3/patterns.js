// Number and shape patterns: follow a rule, find the rule, notice what the rule did not say, and jump far ahead.
import { rnd, pick, chance, shuffle, fmt, b, way, num, choice, table } from '../../util.js';
import { BLANK, oneOf, yesNo } from './helpers.js';
import { tileFigures } from './visuals-measure.js';

const ordinal = n => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10 > 3 ? 0 : n % 10]}`;
const termsOf = (s, d, op, n) => Array.from({ length: n }, (_, i) => (op === '×' ? s * d ** i : s + i * d));
const rule = (s, d, op) => `Start at ${s}, ${op === '×' ? 'multiply by' : 'add'} ${d}`;
const list = xs => xs.map(fmt).join(', ');
const PAR = ['They are all odd', 'They are all even', 'They alternate between odd and even'];

// A rule for this step: start, step and operation. Multiplying only appears once the adding is familiar.
function spec(L) {
  if (L > 1 && chance(0.3)) return { s: rnd(1, 4), d: rnd(2, L === 2 ? 3 : 5), op: '×' };
  return { s: rnd(1, L === 1 ? 10 : L === 2 ? 20 : 30), d: rnd(L === 1 ? 2 : 3, L === 1 ? 5 : L === 2 ? 9 : 12), op: '+' };
}
const jumps = (ts, op) => ts.slice(1).map((x, i) => (op === '×' ? `${fmt(ts[i])} × ${x / ts[i]} = ${fmt(x)}` : `${fmt(ts[i])} + ${x - ts[i]} = ${fmt(x)}`));

function next(L) {
  const { s, d, op } = spec(L), ts = termsOf(s, d, op, (L === 1 ? 4 : 5) + 1), shown = ts.slice(0, -1), ans = ts.at(-1);
  return { ask: 'What number comes next in the pattern?', expr: `${list(shown)}, ${BLANK}`, answer: num(ans), _t: { kind: 'patnext', terms: shown, op }, hint: 'Look at how much the pattern changes from one number to the next.',
    ways: [way('Find the rule', [...jumps(shown.slice(0, 3), op), `The rule is: ${rule(s, d, op).toLowerCase()}.`, `Apply it to the last number: ${fmt(shown.at(-1))} ${op === '×' ? '×' : '+'} ${d} = ${b(fmt(ans))}`]),
      way('Check the rule on every jump', [`${rule(s, d, op)}.`, `${list(shown)} follows it all the way.`, `The next number is ${b(fmt(ans))}.`])] };
}
function missing(L) {
  const { s, d, op } = spec(L), at = rnd(2, 4), ts = termsOf(s, d, op, 6), ans = ts[at];
  return { ask: 'What number is missing from the pattern?', expr: ts.slice(0, 6).map((x, i) => (i === at ? BLANK : fmt(x))).join(', '), answer: num(ans), _t: { kind: 'patmiss', start: s, step: d, op, at }, hint: 'Use two neighbours that are both showing to find the rule.',
    ways: [way('Find the rule, fill the gap', [`Take two numbers that are both showing, just before the gap: ${jumps([ts[at - 2], ts[at - 1]], op)[0]}.`, `So the rule is: ${op === '×' ? `multiply by ${d}` : `add ${d}`}.`, `Apply it to ${fmt(ts[at - 1])}: ${fmt(ts[at - 1])} ${op} ${d} = ${b(fmt(ans))}`]),
      way('Work backwards', [`${fmt(ts[at + 1])} is one step after the gap, so undo one step: ${fmt(ts[at + 1])} ${op === '×' ? '÷' : '−'} ${d} = ${b(fmt(ans))}`])] };
}
// "Start at 4, add 3" as options; wrong ones swap the numbers or the operation.
function findRule(L) {
  const { s, d, op } = spec(L), shown = termsOf(s, d, op, 4), good = rule(s, d, op);
  const bad = shuffle([rule(d, s, op), rule(s, d + 1, op), rule(s, Math.max(2, d - 1), op), rule(s, d, op === '+' ? '×' : '+'), rule(s + 1, d, op)]).filter(r => termsOf(...r.match(/\d+/g).map(Number).slice(0, 2), /multiply/.test(r) ? '×' : '+', 4).join() !== shown.join());
  const answer = choice(good, bad.slice(0, 3));
  return { ask: `Which rule makes this pattern? ${list(shown)}, …`, answer, _t: { kind: 'patrule', terms: shown }, hint: 'Try each rule on the first two numbers. Does it give the second one?',
    ways: [way('Find the jump', [...jumps(shown.slice(0, 3), op), `The first number is ${s}.`, `The rule: ${b(good)}.`]),
      way('Test the choices', [`Start from the first number, ${s}, and apply a rule to get the next number: ${fmt(shown[1])}.`, `Only “${good}” takes ${s} to ${fmt(shown[1])} and keeps going: ${list(shown)}.`, `The rule: ${b(good)}.`])] };
}
// What the rule never said: odd and even behaviour.
function feature(L) {
  const s = rnd(1, 9), d = rnd(2, L === 3 ? 12 : 9), ts = termsOf(s, d, '+', 6), good = d % 2 ? PAR[2] : s % 2 ? PAR[0] : PAR[1];
  const tag = ts.map(x => `${x} (${x % 2 ? 'odd' : 'even'})`).join(', ');
  return { ask: `A pattern follows this rule: ${rule(s, d, '+').toLowerCase()}. Which statement is true about the numbers in it?`, answer: choice(good, [], { all: PAR }), _t: { kind: 'patfeature', start: s, step: d }, hint: 'Write out the first few numbers and mark each one odd or even.',
    ways: [way('Write out the numbers', [`The first numbers: ${tag}.`, `${good}.`]),
      way('Think about the rule', [d % 2 ? `Adding ${d}, an odd number, flips odd to even and even to odd every time.` : `Adding ${d}, an even number, never changes odd or even.`, `The first number, ${s}, is ${s % 2 ? 'odd' : 'even'}, so: ${b(good)}.`])] };
}
function member(L) {
  const s = rnd(2, 12), d = rnd(3, L === 3 ? 12 : 9), k = rnd(4, 14), x = s + k * d + (chance(0.5) ? 0 : rnd(1, d - 1));
  const inside = (x - s) % d === 0, row = termsOf(s, d, '+', k + 1);
  return { ask: `A pattern follows this rule: ${rule(s, d, '+').toLowerCase()}. Will ${fmt(x)} be in the pattern?`, answer: yesNo(inside), _t: { kind: 'patin', start: s, step: d, x }, hint: `Count the jumps from ${s}. Does a whole number of jumps land exactly on ${fmt(x)}?`,
    ways: [way('Count up', [`Count by ${d} from ${s}: ${list(row.slice(0, 7))}${k > 6 ? ', …' : ''}`, inside ? `${fmt(x)} is on the list.` : `${fmt(x)} is not on the list: the jumps of ${d} skip over it.`, `So ${fmt(x)} ${inside ? 'is' : 'is not'} in the pattern: ${b(inside ? 'Yes' : 'No')}.`]),
      way('Use the gap', [`Take away the start: ${fmt(x)} − ${s} = ${fmt(x - s)}.`, `Divide by ${d}: ${fmt(x - s)} ÷ ${d} = ${Math.floor((x - s) / d)} with ${(x - s) % d} left over.`, inside ? 'Nothing is left over, so the jumps land exactly on it.' : 'Something is left over, so the jumps miss it.', `Answer: ${b(inside ? 'Yes' : 'No')}`])] };
}
function nth(L) {
  const s = rnd(1, L === 2 ? 20 : 30), d = rnd(3, L === 2 ? 9 : 12), n = L === 2 ? rnd(6, 12) : pick([20, 20, rnd(15, 30)]), ans = s + (n - 1) * d;
  return { ask: `A pattern follows this rule: ${rule(s, d, '+').toLowerCase()}. What is the ${ordinal(n)} number in the pattern?`, answer: num(ans), _t: { kind: 'patnth', start: s, step: d, n }, hint: 'The first number has had no jumps yet. How many jumps has the later one had?',
    ways: [way('Count the jumps', [`The first number is ${s}. The ${ordinal(n)} number has had ${n - 1} jumps of ${d}.`, `${n - 1} × ${d} = ${(n - 1) * d}`, `${s} + ${(n - 1) * d} = ${b(fmt(ans))}`]),
      way('Spot the pattern in a table', [table(['Place', 'Number'], [[1, s], [2, s + d], [3, s + 2 * d], [4, s + 3 * d]]), `Place 2 has had 1 jump, place 3 has had 2 jumps. Place ${n} has had ${n - 1} jumps.`, `${s} + ${n - 1} × ${d} = ${b(fmt(ans))}`])] };
}
function figures(L) {
  const s = rnd(2, 6), d = rnd(2, L === 1 ? 3 : 5), ts = termsOf(s, d, '+', 3), n = L === 1 ? 4 : L === 2 ? rnd(6, 9) : rnd(10, 20), ans = s + (n - 1) * d;
  return { ask: `Figure 1 has ${ts[0]} tiles, figure 2 has ${ts[1]} and figure 3 has ${ts[2]}. The pattern keeps going the same way. How many tiles are in figure ${n}?`, visual: tileFigures(ts), answer: num(ans), _t: { kind: 'patshape', terms: ts, n },
    hint: 'How many tiles does each new figure add?',
    ways: [way('Find what each figure adds', [tileFigures(ts), `Figure 1 to 2: ${ts[1]} − ${ts[0]} = ${d} more tiles. Figure 2 to 3: ${ts[2]} − ${ts[1]} = ${d} more.`, `Figure ${n} comes after ${n - 1} steps of ${d}: ${s} + ${n - 1} × ${d} = ${b(ans)}`]),
      n === 4 ? way('Draw the next figure', [`Add ${d} tiles to figure 3: ${ts[2]} + ${d} = ${b(ans)}`]) : way('Keep counting', [`Figure by figure: ${list(termsOf(s, d, '+', Math.min(n, 8)))}${n > 8 ? ', …' : ''}`, `It is ${s} + ${n - 1} × ${d} = ${b(ans)}.`])] };
}

const MAKERS = [[next, next, missing, findRule, figures], [next, missing, findRule, feature, member, figures, nth], [nth, nth, feature, member, findRule, figures, missing]];
export const genPattern = L => oneOf(MAKERS[L - 1], L);
