// Systems in stories: write the two equations, decide how many times two amounts meet, and say what the crossing means.
import { rnd, pick, shuffle, chance, b, way, fmt, num, choice, table, nm } from '../../util.js';
import { eqn, lin, term, fixedChoice, plus, count } from './h.js';
import { PLANS, SAME_THING } from './sys-stories.js';

// Plan 0 and plan 1 meet after x steps at amount y. The plan that starts lower has the greater rate.
function setup(L) {
  const ctx = pick(PLANS), x = L === 3 ? rnd(3, 12) : rnd(2, 6), mB = rnd(2, 6), d = rnd(1, L === 3 ? 6 : 4), mA = mB + d, cA = rnd(2, 20);
  const P = [{ c: cA, m: mA }, { c: cA + d * x, m: mB }];
  if (chance(0.5)) P.reverse();
  return { ctx, P, x, y: mA * x + cA, d, names: ctx.names, e: P.map(p => [p.m, p.c]) };
}
const tell = s => s.P.map((p, i) => s.ctx.say(s.names[i], p.c, p.m)).join(' ');
const core = (s, shape, extra = {}) => ({ k: 'sysstory', shape, e1: s.e[0], e2: s.e[1], names: s.names, ...extra });
const eqLines = s => s.P.map((p, i) => `${s.names[i]}: ${eqn(p.m, p.c)}.`).join(' ');
const at = (p, x) => `${fmt(p.m)} × ${x} ${plus(p.c)} = ${fmt(p.m * x + p.c)}`;
// Set the right sides equal and solve, with the numbers of this pair.
function setEqual(s) {
  const [u, v] = s.P, hi = u.m > v.m ? u : v, lo = u.m > v.m ? v : u;
  return [`Same amount: ${lin(u.m, u.c)} = ${lin(v.m, v.c)}.`, `Take ${term(lo.m)} from both sides: ${lin(hi.m - lo.m, hi.c)} = ${fmt(lo.c)}. Take ${fmt(hi.c)} from both sides: ${term(hi.m - lo.m)} = ${fmt(lo.c - hi.c)}.`, `x = ${fmt(lo.c - hi.c)} ÷ ${fmt(hi.m - lo.m)} = ${b(s.x)}.`];
}
function writeEq(s) {
  const i = rnd(0, 1), p = s.P[i], o = s.P[1 - i], right = eqn(p.m, p.c);
  return { ask: `${tell(s)} (${s.ctx.vars}.) Which equation shows the ${s.ctx.qty} y of ${s.names[i]}?`, answer: choice(right, [eqn(p.c, p.m), eqn(o.m, p.c), eqn(p.m, o.c)]), hint: 'The amount at the start is b. The amount added for each step is m, and it multiplies x.', _t: core(s, 'write-eq', { ask: 'eq', i }),
    ways: [way('Match it to y = mx + b', [`At the start there is ${fmt(p.c)}, so b = ${fmt(p.c)}. Each ${s.ctx.one} adds ${fmt(p.m)}, so m = ${fmt(p.m)}.`, `y = mx + b gives ${b(right)}.`]),
      way('Test two values of x', [`At x = 0 the equation must give the start, ${fmt(p.c)}. At x = 1 it must give ${fmt(p.c + p.m)}.`, `${right} does both, and the others do not.`])] };
}
function meaning(s) {
  const right = s.ctx.same(s.x, s.y), wrong = [s.ctx.same(s.y, s.x), `The two start with the same amount, ${s.y}.`, `${s.names[0]} is always ahead of ${s.names[1]}.`];
  return { ask: `${tell(s)} The lines for the two cross at the point (${s.x}, ${s.y}). What does that point tell you?`, answer: choice(right, wrong), hint: 'A point on a line is a pair: the first number is x and the second is y. Both lines pass through it.', _t: core(s, 'meaning', { ask: 'meaning' }),
    ways: [way('Read the pair', [`The point is (x, y) = (${s.x}, ${s.y}): x is the number of ${s.ctx.xs} and y is the amount.`, `It is on both lines, so both amounts are ${s.y} when x is ${s.x}: ${b(right)}`]), way('Check it in the story', [`${s.names[0]}: ${at(s.P[0], s.x)}.`, `${s.names[1]}: ${at(s.P[1], s.x)}.`, 'They match, so the crossing point is where the two amounts are equal.'])] };
}
function readTable(s) {
  const rows = Array.from({ length: s.x + 2 }, (_, k) => [k, ...s.P.map(p => p.m * k + p.c)]);
  return { ask: `${tell(s)} The table shows both amounts. After how many ${s.ctx.xs} are they the same?`, visual: table(['x', ...s.names], rows.map(r => r.map(fmt))), answer: num(s.x), hint: 'Look down the table for the row where the two amounts match.', _t: core(s, 'read-table', { ask: 'x' }),
    ways: [way('Find the matching row', [`Compare the two amounts in each row.`, `They are both ${fmt(s.y)} in the row where x = ${b(s.x)}.`]), way('Watch the gap', [`At x = 0 the amounts are ${fmt(s.P[0].c)} and ${fmt(s.P[1].c)}, so the gap is ${fmt(Math.abs(s.P[0].c - s.P[1].c))}.`, `Each ${s.ctx.one} the gap closes by ${fmt(s.d)}. ${fmt(Math.abs(s.P[0].c - s.P[1].c))} ÷ ${fmt(s.d)} = ${b(s.x)}.`])] };
}
const better = (s, z) => { const v = s.P.map(p => p.m * z + p.c); return (v[0] < v[1]) === (s.ctx.better === 'less') ? 0 : 1; };
function whichAt(s, beyond) {
  const z = beyond ? s.x + rnd(2, 5) : pick([1, 2, 3, 4, 5, 6, 7, 8].filter(v => v !== s.x)), win = s.names[better(s, z)], v = s.P.map(p => p.m * z + p.c);
  return { ask: `${tell(s)} ${s.ctx.ask(z)}`, answer: fixedChoice(win, s.names), hint: 'Work out each amount at that time, then compare them.', _t: core(s, beyond ? 'plan-choice' : 'which-at', { ask: 'better', z, better: s.ctx.better }),
    ways: [way('Work out both', [`${s.names[0]}: ${at(s.P[0], z)}. ${s.names[1]}: ${at(s.P[1], z)}.`, `${fmt(v[0])} and ${fmt(v[1])}: ${s.ctx.better === 'less' ? 'the smaller is cheaper' : 'the larger is more'}, so ${b(win)}.`]),
      way('Use the crossing point', [`The two amounts are equal at x = ${s.x}.`, z < s.x ? `${z} is before that, so the one that starts higher has the bigger amount.` : `${z} is after that, so the one that grows faster has the bigger amount.`, `${s.ctx.better === 'less' ? 'The smaller amount is cheaper' : 'The bigger amount is more'}, so ${b(win)}.`])] };
}
function writePair(s) {
  const [u, v] = s.P, right = `${eqn(u.m, u.c)}<br>${eqn(v.m, v.c)}`;
  return { ask: `${tell(s)} (${s.ctx.vars}.) Which pair of equations matches the story?`, answer: choice(right, [`${eqn(u.m, u.c)}<br>${eqn(v.c, v.m)}`, `${eqn(v.m, u.c)}<br>${eqn(u.m, v.c)}`, `${eqn(u.c, u.m)}<br>${eqn(v.c, v.m)}`]), hint: 'Write each plan as y = mx + b: the start is b and the amount for each step is m.', _t: core(s, 'write-pair', { ask: 'pair' }),
    ways: [way('Write each one', [`${s.names[0]}: start ${fmt(u.c)}, ${fmt(u.m)} each ${s.ctx.one}: ${eqn(u.m, u.c)}.`, `${s.names[1]}: start ${fmt(v.c)}, ${fmt(v.m)} each ${s.ctx.one}: ${eqn(v.m, v.c)}.`]), way('Test at x = 0', [`At x = 0 the amounts must be the starts: ${fmt(u.c)} and ${fmt(v.c)}.`, `Only the pair ${right.replace('<br>', ' and ')} has those starts and adds the right amount each ${s.ctx.one}.`])] };
}
const ONCE = ['Exactly once', 'Never', 'Always'];
function inspect() {
  const s = setup(2), kind = pick(['once', 'never', 'always']), [u, v] = s.P;
  const [e1, e2] = kind === 'once' ? [u, v] : kind === 'never' ? [u, { m: u.m, c: u.c + rnd(1, 9) }] : [u, { m: u.m, c: u.c }], pairS = { ...s, P: [e1, e2], e: [[e1.m, e1.c], [e2.m, e2.c]] };
  const win = kind === 'once' ? ONCE[0] : kind === 'never' ? ONCE[1] : ONCE[2];
  return { ask: `${eqLines(pairS)} (${s.ctx.vars}.) How many times are the two amounts equal?`, answer: fixedChoice(win, ONCE), hint: 'Compare the rates first. Then compare the starting values.', _t: core(pairS, 'inspect', { ask: 'count' }),
    ways: [way('Compare the rates and the starts', [kind === 'once' ? `The rates are different (${fmt(e1.m)} and ${fmt(e2.m)}), so the lines cross exactly once.` : kind === 'never' ? `The rates are the same (${fmt(e1.m)}) but the starts are different (${fmt(e1.c)} and ${fmt(e2.c)}): the lines are parallel and never meet.` : `The rates are the same (${fmt(e1.m)}) and the starts are the same (${fmt(e1.c)}): it is one line written twice, so they are always equal.`, `So the answer is ${b(win.toLowerCase())}.`]),
      way('Try to solve it', [`Same amount: ${lin(e1.m, e1.c)} = ${lin(e2.m, e2.c)}.`, kind === 'once' ? `The x terms are different, so there is exactly one x that works.` : kind === 'never' ? `Take ${term(e1.m)} from both sides: ${fmt(e1.c)} = ${fmt(e2.c)}. That is never true.` : `Take ${term(e1.m)} from both sides: ${fmt(e1.c)} = ${fmt(e2.c)}. That is always true.`, `So the answer is ${b(win.toLowerCase())}.`])] };
}
function solve(s, want, withEquations) {
  const text = withEquations ? `${eqLines(s)} (${s.ctx.vars}.)` : tell(s), asX = want === 'x';
  const ask = asX ? `After how many ${s.ctx.xs} are the two amounts the same?` : `When the two amounts are the same, what is that amount?`;
  const around = [s.x - 1, s.x, s.x + 1].map(k => [k, ...s.P.map(p => p.m * k + p.c)]);
  return { ask: `${text} ${ask}`, answer: num(asX ? s.x : s.y), hint: 'The two amounts are equal when the two expressions for y are equal. Solve for x first.', _t: core(s, withEquations ? `solve-${want}` : 'story-solve', { ask: want }),
    ways: [way('Set them equal', [...setEqual(s), ...(asX ? [] : [`Put x = ${s.x} in the first one: ${at(s.P[0], s.x)}, so the amount is ${b(fmt(s.y))}.`])]),
      asX ? way('Close the gap', [`At the start the gap is ${fmt(Math.abs(s.P[0].c - s.P[1].c))}. Each ${s.ctx.one} it closes by ${fmt(s.d)}.`, `${fmt(Math.abs(s.P[0].c - s.P[1].c))} ÷ ${fmt(s.d)} = ${b(s.x)}.`]) : way('Make a table', [table(['x', ...s.names], around.map(r => r.map(fmt))), `The two columns match at x = ${s.x}, where both are ${b(fmt(s.y))}.`])] };
}
function gapAfter(s) {
  const z = s.x + rnd(2, 6), v = s.P.map(p => p.m * z + p.c), diff = Math.abs(v[0] - v[1]);
  return { ask: `${tell(s)} After ${z} ${s.ctx.xs}, what is the difference between the two amounts (the larger minus the smaller)?`, answer: num(diff), hint: 'Find each amount after that time. Then subtract.', _t: core(s, 'gap-after', { ask: 'gap', z }),
    ways: [way('Work out both', [`${s.names[0]}: ${at(s.P[0], z)}. ${s.names[1]}: ${at(s.P[1], z)}.`, `${fmt(Math.max(...v))} − ${fmt(Math.min(...v))} = ${b(fmt(diff))}.`]), way('Count from the crossing', [`The amounts are equal at x = ${s.x}, and then they spread apart by ${fmt(s.d)} every ${s.ctx.one}.`, `${z} − ${s.x} = ${z - s.x} ${s.ctx.xs} later, ${z - s.x} × ${s.d} = ${b(fmt(diff))}.`])] };
}
function sumDiff() {
  const small = rnd(6, 30), D = rnd(2, 14), S = 2 * small + D, [p, q] = shuffle([nm(), nm()]), large = small + D;
  if (p === q) return null;
  return { ask: `${p} and ${q} have $${S} together. ${p} has $${D} more than ${q}. How many dollars does ${p} have?`, answer: num(large), hint: 'Write one equation for the total and one for the difference. Adding them removes one letter.', _t: { k: 'sysstory', shape: 'sum-diff', S, D },
    ways: [way('Two equations', [`Let x be ${p}'s money and y be ${q}'s. Then x + y = ${S} and x − y = ${D}.`, `Add the equations: 2x = ${S + D}, so x = ${b(large)}.`]), way('Take away the extra', [`If ${p}'s extra $${D} is put aside, the two have equal amounts: ${S} − ${D} = ${S - D}.`, `Each then has ${S - D} ÷ 2 = ${small}, so ${p} has ${small} + ${D} = ${b(large)}.`])] };
}
const MEET = ['Yes, at one time', 'Yes, at every time', 'No, never'];
function inspectWords() {
  const s = setup(2), kind = pick(['once', 'never', 'late', 'always']), [u, v] = s.P, thing = SAME_THING[s.names[0]];
  const [p1, p2] = kind === 'once' ? [u, v] : kind === 'never' ? [u, { m: u.m, c: u.c + rnd(1, 9) }] : kind === 'late' ? [u, { m: u.m + rnd(1, 2), c: u.c + rnd(1, 9) }] : [u, { ...u }];
  const win = kind === 'once' ? MEET[0] : kind === 'always' ? MEET[1] : MEET[2], ps = { ...s, P: [p1, p2], e: [[p1.m, p1.c], [p2.m, p2.c]] };
  const ahead = p2.c > p1.c ? 1 : 0;
  return { ask: `${tell(ps)} Will they ever have the same ${thing}?`, answer: fixedChoice(win, MEET), hint: 'Compare who starts higher with who grows faster. Do they ever catch up?', _t: core(ps, 'inspect-words', { ask: 'meet' }),
    ways: [way('Starts and rates', [kind === 'always' ? 'They have the same start and the same rate, so they are always equal.' : kind === 'never' ? `They grow at the same rate, so the gap of ${fmt(Math.abs(p1.c - p2.c))} never changes.` : kind === 'late' ? `${s.names[ahead]} starts higher and also grows faster, so it only pulls further ahead.` : `${s.names[1 - ahead]} starts lower but grows faster, so it catches up.`, `So: ${b(win.toLowerCase())}.`]),
      way('Picture the lines', [kind === 'always' ? 'The two lines lie on top of each other.' : kind === 'never' ? 'The two lines are parallel.' : kind === 'late' ? 'The lines only cross to the left of the start, where x would be negative: that is before the story begins.' : 'The line that starts lower rises more steeply, so the two lines cross.', `So: ${b(win.toLowerCase())}.`])] };
}
export function genSysStory(L) {
  if (L === 1) { const s = setup(1); return pick([writeEq, meaning, readTable, t => whichAt(t, false)])(s); }
  if (L === 2) { const s = setup(2); return pick([writePair, inspect, t => solve(t, 'x', true), t => solve(t, 'y', true), t => whichAt(t, true)])(s); }
  return pick([sumDiff, inspectWords, gapAfter, s => solve(s, 'x', false), s => solve(s, 'y', true)])(setup(3));
}
