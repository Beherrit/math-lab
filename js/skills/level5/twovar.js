// Two variables that change together: independent and dependent variables, equations like d = 65t, tables and graphs.
import { rnd, pick, chance, b, k, way, num, choice, table } from '../../util.js';
import { T } from './helpers.js';
import { ratioPlane } from './draw.js';

// iv is the letter you choose freely, dv the letter that depends on it; ind and dep say what they count.
const CTX = [
  { iv: 't', dv: 'd', ind: 'number of hours', dep: 'distance in km', unit: 'km', per: 'hour', rate: [10, 25], s: r => `A cyclist rides at a steady ${k(r + ' km')} each hour.` },
  { iv: 't', dv: 'd', ind: 'number of hours', dep: 'distance in miles', unit: 'miles', per: 'hour', rate: [40, 70], s: r => `A car drives at a steady ${k(r + ' miles')} each hour.` },
  { iv: 'h', dv: 'e', ind: 'number of hours worked', dep: 'earnings in dollars', unit: 'dollars', per: 'hour', rate: [8, 20], s: r => `A job pays ${k('$' + r)} for each hour worked.` },
  { iv: 'm', dv: 'p', ind: 'number of minutes', dep: 'number of pages printed', unit: 'pages', per: 'minute', rate: [6, 40], s: r => `A printer prints ${k(r + ' pages')} every minute.` },
  { iv: 'm', dv: 'w', ind: 'number of minutes', dep: 'liters of water in the tank', unit: 'liters', per: 'minute', rate: [5, 30], s: r => `A tank fills at ${k(r + ' liters')} every minute.` },
  { iv: 'w', dv: 's', ind: 'number of weeks', dep: 'dollars saved', unit: 'dollars', per: 'week', rate: [5, 25], s: r => `A saver puts away ${k('$' + r)} every week.` },
];
// A fixed charge plus a rate: the table starts above zero.
const FEE = [
  { iv: 'k', dv: 'f', ind: 'number of km', dep: 'fare in dollars', unit: 'dollars', per: 'km', rate: [1, 3], fee: [3, 8], s: (r, c) => `A taxi charges ${k('$' + c)} to start and ${k('$' + r)} for every km.` },
  { iv: 'm', dv: 'c', ind: 'number of months', dep: 'total cost in dollars', unit: 'dollars', per: 'month', rate: [15, 40], fee: [20, 60], s: (r, c) => `A gym charges a ${k('$' + c)} joining fee and ${k('$' + r)} each month.` },
  { iv: 'g', dv: 'b', ind: 'number of GB', dep: 'bill in dollars', unit: 'dollars', per: 'GB', rate: [2, 8], fee: [10, 30], s: (r, c) => `A phone plan costs ${k('$' + c)} a month plus ${k('$' + r)} for every GB.` },
];
const lets = c => `Let ${c.iv} be the ${c.ind} and ${c.dv} the ${c.dep}.`;
const eq = (c, r, fee = 0) => `${c.dv} = ${r}${c.iv}${fee ? ` + ${fee}` : ''}`;
const makeTs = L => { const step = pick(L === 1 ? [1, 2] : [1, 2, 5]), start = L === 1 ? step : pick([1, 2, 3, 5, 10]); return Array.from({ length: 4 }, (_, i) => start + step * i); };
const tbl = (c, ts, ds) => table([`${c.iv} (${c.ind})`, `${c.dv} (${c.dep})`], ts.map((x, i) => [x, ds[i]]));

function role() {
  const c = pick(CTX), r = rnd(...c.rate), ind = chance(0.5), want = ind ? 'independent' : 'dependent', pickWord = x => `the ${x}`;
  return T({ story: `${c.s(r)} ${lets(c)}`, ask: `Which is the ${b(want + ' variable')}?`, answer: choice(pickWord(ind ? c.ind : c.dep), [pickWord(ind ? c.dep : c.ind)]), choiceBig: true,
    ways: [way('Which one do you choose?', [`The independent variable is the one you can choose freely. The dependent variable is the one that depends on that choice.`, `You choose the ${c.ind}, and then the ${c.dep} follows from it. So the ${want} variable is ${b(pickWord(ind ? c.ind : c.dep))}.`]),
      way('Ask “depends on what?”', [`Say it as a sentence: the ${c.dep} depends on the ${c.ind}. It does not work the other way round.`, `So the independent one is the ${c.ind} and the dependent one is the ${c.dep}. The answer is ${b(pickWord(ind ? c.ind : c.dep))}.`])],
    hint: 'Which quantity can you pick on its own? The other one then follows from it.' }, 'tvRole', { want, ind: c.ind, dep: c.dep });
}
function rateFromTable(L) {
  const c = pick(CTX), r = rnd(...c.rate), ts = makeTs(L), ds = ts.map(x => r * x);
  return T({ story: lets(c), ask: `How many ${c.unit} is that for each 1 ${c.per}?`, visual: tbl(c, ts, ds), answer: num(r), suffix: `${c.unit} per ${c.per}`,
    ways: [way('Divide a row', [`Each row is ${c.dv} for ${c.iv}. Take any row, like ${ts[0]} and ${ds[0]}.`, `${ds[0]} ÷ ${ts[0]} = ${b(r)} for each 1`, `Check another row: ${ds[1]} ÷ ${ts[1]} = ${r}. Every row gives the same answer, so the rate is steady.`]),
      way('Look at the change', [`When ${c.iv} goes up by ${ts[1] - ts[0]}, ${c.dv} goes up by ${ds[1] - ds[0]}.`, `${ds[1] - ds[0]} ÷ ${ts[1] - ts[0]} = ${b(r)} for each 1`])],
    hint: 'Pick a row. How much of the second number goes with 1 of the first?' }, 'tvRate', { ts, ds });
}
function useTable(L) {
  const c = pick(CTX), r = rnd(...c.rate), ts = makeTs(L), ds = ts.map(x => r * x), j = pick([1, 2, 3, 5]), t = ts[3] + j * (ts[1] - ts[0]);
  return T({ story: lets(c), ask: `Using the pattern in the table, what is ${b(c.dv)} when ${b(c.iv)} is ${b(t)}?`, visual: tbl(c, ts, ds), answer: num(r * t), suffix: c.unit,
    ways: [way('Find the rate first', [`${ds[0]} ÷ ${ts[0]} = ${r} for each 1, so ${c.dv} is always ${r} times ${c.iv}.`, `${r} × ${t} = ${b(r * t)}`]),
      way('Keep the pattern going', [`Each row adds ${ts[1] - ts[0]} to ${c.iv} and ${r * (ts[1] - ts[0])} to ${c.dv}.`, `From ${ts[3]} to ${t} is ${j} more row${j > 1 ? 's' : ''}: ${ds[3]} + ${j} × ${r * (ts[1] - ts[0])} = ${b(r * t)}`])],
    hint: 'Work out how much of the second number goes with 1 of the first. Then use it for the new number.' }, 'tvTable', { ts, ds, t });
}
const wrongEq = (c, r) => [`${c.iv} = ${r}${c.dv}`, `${c.dv} = ${c.iv} + ${r}`, `${c.dv} = ${c.iv} ÷ ${r}`];
function equationFromTable(L) {
  const c = pick(CTX), r = rnd(...c.rate), ts = makeTs(L), ds = ts.map(x => r * x);
  return T({ story: lets(c), ask: 'Which equation matches the table?', visual: tbl(c, ts, ds), answer: choice(eq(c, r), wrongEq(c, r)), choiceBig: true,
    ways: [way('Find the rate', [`${ds[0]} ÷ ${ts[0]} = ${r}, so ${c.dv} is ${r} times as big as ${c.iv}.`, `Written as an equation: ${b(eq(c, r))}.`]),
      way('Test the choices', [`Try the first row, ${c.iv} = ${ts[0]}: ${r} × ${ts[0]} = ${ds[0]}, which matches the table.`, `${b(eq(c, r))} gives the right ${c.dv} every time. The others put the letters the wrong way or add instead of multiplying.`])],
    hint: 'The dependent letter goes on its own on the left. How do you get from the first number in a row to the second?' }, 'tvEq', { dv: c.dv, iv: c.iv, ts, ds });
}
function equationFromStory() {
  const c = pick(CTX), r = rnd(...c.rate);
  return T({ story: `${c.s(r)} ${lets(c)}`, ask: 'Which equation shows how the two variables are related?', answer: choice(eq(c, r), wrongEq(c, r)), choiceBig: true,
    ways: [way('Say it in words', [`Every 1 ${c.per} adds ${r} ${c.unit}, so the ${c.dep} is ${r} times the ${c.ind}.`, `That is ${b(eq(c, r))}.`]),
      way('Try a small number', [`After 2 ${c.per}s the story gives ${r} × 2 = ${r * 2} ${c.unit}.`, `Put ${c.iv} = 2 in ${b(eq(c, r))}: ${r} × 2 = ${r * 2}. It matches. The other choices do not.`])],
    hint: 'The dependent letter goes on its own on the left. What do you do to the independent one to get it?' }, 'tvEqStory', { dv: c.dv, iv: c.iv, r });
}
function useEquation(fee) {
  const c = fee ? pick(FEE) : pick(CTX), r = rnd(...c.rate), f = fee ? rnd(...c.fee) : 0, t = rnd(3, 12), ans = r * t + f;
  return T({ story: `${lets(c)} The equation is ${b(eq(c, r, f))}.`, ask: `What is ${b(c.dv)} when ${b(c.iv)} is ${b(t)}?`, answer: num(ans), suffix: c.unit,
    ways: [way('Put the number in', [`Swap ${c.iv} for ${t}: ${c.dv} = ${r} × ${t}${f ? ` + ${f}` : ''}.`, `${r} × ${t} = ${r * t}${f ? `, and ${r * t} + ${f} = ${r * t + f}` : ''}. So ${c.dv} is ${b(ans)}.`]),
      way('Say it with the story', [`${r} for each ${c.per}, and there are ${t} of them: ${r} × ${t} = ${r * t}.`, f ? `Then add the fixed ${f}: ${r * t} + ${f} = ${b(ans)}.` : `So ${c.dv} is ${b(ans)} ${c.unit}.`])],
    hint: `Replace ${c.iv} with its number and work it out. Multiply before you add.` }, 'tvUse', { r, f, t });
}
function solveFor() {
  const c = pick(CTX), r = rnd(c.rate[0], Math.min(c.rate[1], 30)), t = rnd(3, 12), d = r * t;
  return T({ story: `${lets(c)} The equation is ${b(eq(c, r))}.`, ask: `${b(c.dv)} is ${b(d)}. What is ${b(c.iv)}?`, answer: num(t),
    ways: [way('Undo the multiplying', [`${c.dv} = ${r}${c.iv} means ${r} × ${c.iv} = ${d}.`, `${d} ÷ ${r} = ${b(t)}`]), way('Check by trying', [`Try ${c.iv} = ${t}: ${r} × ${t} = ${d}. That gives the ${c.dv} we were told.`, `So ${c.iv} is ${b(t)}. Check: ${r} × ${t} = ${d}.`])],
    hint: 'You know the answer side of the equation. What undoes multiplying by the rate?' }, 'tvSolve', { r, d });
}
function equationWithFee() {
  const c = pick(FEE), r = rnd(...c.rate), f = rnd(...c.fee), ts = [0, 1, 2, 3], ds = ts.map(x => r * x + f);
  return T({ story: `${c.s(r, f)} ${lets(c)}`, ask: 'Which equation matches the table?', visual: tbl(c, ts, ds), answer: choice(eq(c, r, f), [`${c.dv} = ${f}${c.iv} + ${r}`, `${c.dv} = ${r + f}${c.iv}`, `${c.dv} = ${r}${c.iv} − ${f}`]), choiceBig: true,
    ways: [way('Read the first row', [`When ${c.iv} is 0, ${c.dv} is already ${f}. That is the fixed part.`, `Each step up adds ${ds[1] - ds[0]}. That is the rate: ${ds[1]} − ${ds[0]} = ${r}.`, `Rate times ${c.iv}, plus the fixed part: ${b(eq(c, r, f))}.`]),
      way('Test the choices', [`Put ${c.iv} = 2 in ${eq(c, r, f)}: ${r} × 2 + ${f} = ${r * 2 + f}. The table says ${ds[2]}.`, `${b(eq(c, r, f))} matches every row. The others give a different ${c.dv} for ${c.iv} = 2.`])],
    hint: 'Look at the row where the first number is 0. That is the fixed part. Then see how much each step adds.' }, 'tvEqFee', { dv: c.dv, iv: c.iv, r, f });
}
function graph() {
  const c = pick(CTX), r = pick([2, 3, 4, 5]), m = Math.floor(10 / r), pts = Array.from({ length: m }, (_, i) => ({ x: i + 1, y: r * (i + 1) }));
  return T({ story: `${lets(c)} On the grid, x is ${c.iv} and y is ${c.dv}.`, ask: 'Which equation matches the graph?', visual: ratioPlane({ lines: [{ x: m, y: r * m }], pts }), answer: choice(eq(c, r), wrongEq(c, r)), choiceBig: true,
    ways: [way('Read a point', [`The dot at ${c.iv} = 1 is at ${c.dv} = ${r}, so each 1 of ${c.iv} adds ${r} to ${c.dv}.`, `The line goes through (0, 0), so there is no fixed part: ${b(eq(c, r))}.`]),
      way('Test a point', [`Take the dot at ${c.iv} = 2. Its ${c.dv} is ${r * 2}.`, `${r} × 2 = ${r * 2}, so ${b(eq(c, r))} fits the dot. The others do not.`])],
    hint: 'Read the height of the first dot. How much does the second letter go up for each 1 of the first?' }, 'tvGraph', { dv: c.dv, iv: c.iv, r });
}
function doubling(fee) {
  const c = fee ? pick(FEE) : pick(CTX), r = rnd(...c.rate), f = fee ? rnd(...c.fee) : 0, t = pick([2, 3, 4, 5]), d1 = r * t + f, d2 = r * 2 * t + f, yes = d2 === 2 * d1;
  return T({ story: `${lets(c)} The equation is ${b(eq(c, r, f))}.`, ask: `${b(c.iv)} doubles, from ${b(t)} to ${b(2 * t)}. Does ${b(c.dv)} double too?`, answer: choice(yes ? 'Yes, it doubles' : 'No, it does not double', [], { all: ['Yes, it doubles', 'No, it does not double'] }), choiceBig: true,
    ways: [way('Work out both', [`${c.iv} = ${t}: ${c.dv} = ${r} × ${t}${f ? ` + ${f}` : ''} = ${d1}.`, `${c.iv} = ${2 * t}: ${c.dv} = ${r} × ${2 * t}${f ? ` + ${f}` : ''} = ${d2}.`, `Double ${d1} is ${2 * d1}. ${d2} ${yes ? 'equals' : 'is not equal to'} ${2 * d1}, so the answer is ${b(yes ? 'Yes, it doubles' : 'No, it does not double')}.`]),
      way('Think about the fixed part', [yes ? 'There is no fixed part, so everything is multiplied by the rate. Double the letter and the whole answer doubles.' : `The fixed ${f} is only added once. Doubling ${c.iv} doubles the changing part, but not the fixed part.`, `So the answer is ${b(yes ? 'Yes, it doubles' : 'No, it does not double')}.`])],
    hint: 'Work out both values of the dependent letter. Is the second twice the first?' }, 'tvDouble', { r, f, t });
}
const SHAPES = { 1: [role, () => rateFromTable(1), () => useTable(1), () => equationFromTable(1), () => doubling(false)], 2: [role, () => equationFromTable(2), equationFromStory, () => useEquation(false), graph, () => useTable(2)], 3: [equationWithFee, () => useEquation(true), solveFor, () => doubling(true), graph, () => useEquation(false)] };
export const genTwoVar = L => pick(SHAPES[L])();
export const twoVarWord = () => pick([() => useEquation(true), solveFor, () => useEquation(false)])();
