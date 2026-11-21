// Comparing two functions given in different forms (rule, table, graph, words): rate of change and starting value.
import { rnd, pick, chance, b, way, fmt, num } from '../../util.js';
import { eqn, pt, par, plus, count, fixedChoice } from './h.js';
import { FORMS, render, rawSpec, makeSpec, dots, together } from './forms.js';

// up: the function goes up. small: the numbers are small enough to draw on the 0 to 10 grid.
const CTX = [
  { names: ['Plant A', 'Plant B'], up: true, small: true, xs: 'days', ys: 'centimeters', one: 'centimeter', xh: 'Days', yh: 'Height (cm)', say: (n, m, c) => `${n} is ${c} cm tall at the start and grows ${m} cm every day.`, lead: 'Two plants are measured.' },
  { names: ['Jar A', 'Jar B'], up: true, small: true, xs: 'weeks', ys: 'dollars', one: 'dollar', xh: 'Weeks', yh: 'Dollars', say: (n, m, c) => `${n} starts with $${c} and gets $${m} more every week.`, lead: 'Two savings jars are compared.' },
  { names: ['Tank A', 'Tank B'], up: true, small: false, xs: 'minutes', ys: 'liters', one: 'liter', xh: 'Minutes', yh: 'Liters', say: (n, m, c) => `${n} holds ${c} liters at first and gains ${m} liters every minute.`, lead: 'Two tanks are filling.' },
  { names: ['Candle A', 'Candle B'], up: false, small: true, xs: 'hours', ys: 'centimeters', one: 'centimeter', xh: 'Hours', yh: 'Height (cm)', say: (n, m, c) => `${n} is ${c} cm tall at the start and burns down ${-m} cm every hour.`, lead: 'Two candles are burning.' },
  { names: ['Phone A', 'Phone B'], up: false, small: false, xs: 'hours', ys: 'percent', one: 'percent', xh: 'Hours', yh: 'Battery (%)', say: (n, m, c) => `${n} starts at ${c} percent and loses ${-m} percent every hour.`, lead: 'Two phone batteries are compared.' },
];
const sizes = (ctx, drawn) => {
  if (ctx.up) return [rnd(1, drawn ? 3 : 6), rnd(1, drawn ? 6 : 12)];
  return ctx.small ? [-rnd(1, 2), rnd(8, 10)] : [-rnd(3, 8), rnd(7, 10) * 10];
};
const word = (m, ctx) => `${m < 0 ? 'falls' : 'rises'} ${count(Math.abs(m), ctx.one, ctx.ys)}`;
// How to read the rate of change and the starting value off one form.
function readSteps(s, ctx, who) {
  const { m, c } = s;
  if (s.f === 'eq') return [`${who}: in ${eqn(m, c)} the rate of change is ${fmt(m)} and the starting value is ${fmt(c)}.`];
  if (s.f === 'words') return [`${who}: the rate of change is ${fmt(m)} (it ${word(m, ctx)} each step) and the starting value is ${fmt(c)}.`];
  if (s.f === 'table') { const [r0, r1] = s.rows; return [`${who}: from ${pt(...r0)} to ${pt(...r1)}, x goes up ${fmt(r1[0] - r0[0])} and y changes by ${fmt(r1[1] - r0[1])}, so the rate of change is ${fmt(m)}. Back at x = 0 the value is ${fmt(c)}.`]; }
  const [p, q] = dots(m, c);
  return [`${who}: the line crosses the y-axis at ${pt(0, c)}, so the starting value is ${fmt(c)}. The dots ${pt(p.x, p.y)} and ${pt(q.x, q.y)} give a rate of change of ${fmt(m)}.`];
}
const winnerOf = (a, c, ctx) => (a === c ? 'They are the same' : a > c ? ctx.names[0] : ctx.names[1]);
const verdict = win => (win === 'They are the same' ? 'they are the same' : `${win} is greater`);
// Two functions of one kind (both going up or both going down) with the numbers the question needs.
function numbers(ctx, drawn, ask, x, L) {
  for (let t = 0; t < 40; t++) {
    const [mA, cA] = sizes(ctx, drawn); let [mB, cB] = sizes(ctx, drawn);
    const tie = L > 1 && chance(0.15);
    if (tie && ask === 'rate') mB = mA;
    if (tie && ask === 'start') cB = cA;
    const same = { rate: mA === mB, start: cA === cB, at: mA * x + cA === mB * x + cB, diff: mA * x + cA === mB * x + cB }[ask];
    if (ask === 'diff' ? !same : !same || tie) return { mA, cA, mB, cB };
  }
  return null;
}
function numericWays(n, ctx, x, reads) {
  const { mA, cA, mB, cB } = n, yA = mA * x + cA, yB = mB * x + cB, d = fmt(Math.abs(yA - yB));
  return [way('Work out each value', [...reads, `${ctx.names[0]}: ${par(mA)} × ${x} ${plus(cA)} = ${fmt(yA)}. ${ctx.names[1]}: ${par(mB)} × ${x} ${plus(cB)} = ${fmt(yB)}.`, `${fmt(Math.max(yA, yB))} − ${par(Math.min(yA, yB))} = ${b(d)}.`]),
    way('Start, then change', [`Starting values: ${fmt(cA)} and ${fmt(cB)}. After ${count(x, 'step')} the changes are ${par(mA)} × ${x} = ${fmt(mA * x)} and ${par(mB)} × ${x} = ${fmt(mB * x)}.`, `${fmt(cA)} ${plus(mA * x)} = ${fmt(yA)} and ${fmt(cB)} ${plus(mB * x)} = ${fmt(yB)}. The gap is ${b(d)}.`])];
}
function choiceWays(n, ctx, ask, x, reads, win) {
  const { mA, cA, mB, cB } = n, yA = mA * x + cA, yB = mB * x + cB, N = ctx.names;
  if (ask === 'at') return [way('Work out each value', [...reads, `${N[0]}: ${par(mA)} × ${x} ${plus(cA)} = ${fmt(yA)}. ${N[1]}: ${par(mB)} × ${x} ${plus(cB)} = ${fmt(yB)}.`, `${fmt(yA)} and ${fmt(yB)}: ${verdict(win)}.`]),
    way('Start, then change', [`Starting values: ${fmt(cA)} and ${fmt(cB)}. The changes after ${count(x, 'step')} are ${fmt(mA * x)} and ${fmt(mB * x)}.`, `${fmt(cA)} ${plus(mA * x)} = ${fmt(yA)} and ${fmt(cB)} ${plus(mB * x)} = ${fmt(yB)}: ${verdict(win)}.`])];
  const pair = ask === 'rate' ? [mA, mB] : [cA, cB];
  return [way('Read each function', [...reads, `${fmt(pair[0])} and ${fmt(pair[1])}: ${verdict(win)}.`]),
    way('Look at two inputs', [`At x = 0: ${N[0]} is ${fmt(cA)} and ${N[1]} is ${fmt(cB)}. At x = 1: ${fmt(mA + cA)} and ${fmt(mB + cB)}.`, ask === 'rate' ? `From x = 0 to x = 1, ${N[0]} changes by ${fmt(mA)} and ${N[1]} by ${fmt(mB)}. ${verdict(win)}.` : `At x = 0 the values are ${fmt(cA)} and ${fmt(cB)}. ${verdict(win)}.`])];
}
const QUESTION = x => ({ rate: 'Which has the greater rate of change?', start: 'Which has the greater starting value (its value when x is 0)?', at: `When x = ${x}, which has the greater value of y?`, diff: `When x = ${x}, how much greater is the larger value of y than the smaller?` });
const HINT = { rate: 'The rate of change is how much y changes for each 1 step of x. Find it for each function.', start: 'The starting value is y when x is 0. Find it for each function.', at: 'Find the rule for each function first. Then put in the value of x.', diff: 'Find the value of y for each function first. Then subtract the smaller from the larger.' };
function compare(f1, f2, ask, L) {
  const drawn = [f1, f2].includes('graph'), down = L === 3 && chance(0.5), ctx = pick(CTX.filter(c => (!drawn || c.small) && c.up !== down));
  const x = rnd(2, ctx.up || !ctx.small ? 8 : 3), n = numbers(ctx, drawn, ask, x, L);
  if (!n) return null;
  const { mA, cA, mB, cB } = n, specs = [[f1, mA, cA], [f2, mB, cB]].map(([f, m, c]) => makeSpec(f, m, c, ctx.up ? { step: pick([2, 3]), x0: pick([1, 2]) } : ctx.small ? { step: 1, x0: 1 } : { step: pick([1, 2]), x0: pick([1, 2]) }));
  const r = specs.map((s, i) => render(s, ctx, ctx.names[i])), reads = specs.flatMap((s, i) => readSteps(s, ctx, ctx.names[i]));
  const axes = [f1, f2].some(f => f !== 'words') ? ` Here x is ${ctx.xs} and y is ${ctx.ys}.` : '', note = down && ask === 'rate' ? ' A function that goes down has a negative rate of change.' : '';
  const pair = { rate: [mA, mB], start: [cA, cB], at: [mA * x + cA, mB * x + cB], diff: [0, 1] }[ask], win = winnerOf(...pair, ctx);
  const core = { ask: `${ctx.lead} ${r[0].line} ${r[1].line}${axes}${note} ${QUESTION(x)[ask]}`, visual: together(r[0].visual, r[1].visual), hint: HINT[ask], _t: { k: 'funccmp', shape: `${ask}-${f1}-${f2}`, forms: specs.map(rawSpec), ask, x: ask === 'at' || ask === 'diff' ? x : undefined, names: ctx.names } };
  if (ask === 'diff') return { ...core, answer: num(Math.abs((mA - mB) * x + cA - cB)), ways: numericWays(n, ctx, x, reads) };
  return { ...core, answer: fixedChoice(win, [...ctx.names, 'They are the same']), ways: choiceWays(n, ctx, ask, x, reads, win) };
}
const mixed = () => { const f = pick(FORMS), g = pick(FORMS.filter(h => h !== f)); return [f, g]; };
export function genFuncCmp(L) {
  if (L === 1) return compare('eq', pick(['eq', 'words']), pick(['rate', 'start']), 1);
  if (L === 2) return compare(...mixed(), pick(['rate', 'start']), 2);
  return compare(...mixed(), pick(['rate', 'start', 'at', 'diff']), 3);
}
