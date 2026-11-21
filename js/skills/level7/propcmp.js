// Comparing proportional relationships shown as a rule, a table, a graph or in words: the unit rate is the slope.
import { rnd, pick, chance, b, way, fmt, num } from '../../util.js';
import { count, fixedChoice, pt } from './h.js';
import { FORMS, render, rawSpec, makeSpec, graphOf, together } from './forms.js';
import { grid } from './draw.js';

// names: the two things compared. hiWins: a greater unit rate is the better one. xs, ys: what x and y count.
const CTX = [
  { names: ['Printer A', 'Printer B'], hiWins: true, good: 'faster', q: 'Which printer prints faster?', xs: 'minutes', ys: 'pages', time: 'minute', unit: 'pages per minute', xh: 'Minutes', yh: 'Pages', lo: 3, hi: 9,
    one: 'A printer prints at a steady rate.', lead: 'Two printers are compared.', say: (n, m) => `${n} prints ${m} pages every minute.`, sayIn: (n, a, t) => `${n} prints ${a} pages in ${count(t, 'minute')}.` },
  { names: ['Runner A', 'Runner B'], hiWins: true, good: 'faster', q: 'Who is running faster?', xs: 'seconds', ys: 'meters', time: 'second', unit: 'meters per second', xh: 'Seconds', yh: 'Meters', lo: 3, hi: 9,
    one: 'A runner keeps a steady pace.', lead: 'Two runners are compared.', say: (n, m) => `${n} runs ${m} meters every second.`, sayIn: (n, a, t) => `${n} runs ${a} meters in ${count(t, 'second')}.` },
  { names: ['Tap A', 'Tap B'], hiWins: true, good: 'faster', q: 'Which tap fills a bucket faster?', xs: 'minutes', ys: 'liters', time: 'minute', unit: 'liters per minute', xh: 'Minutes', yh: 'Liters', lo: 2, hi: 9,
    one: 'A tap runs at a steady rate.', lead: 'Two taps are compared.', say: (n, m) => `${n} gives ${m} liters every minute.`, sayIn: (n, a, t) => `${n} gives ${a} liters in ${count(t, 'minute')}.` },
  { names: ['Download A', 'Download B'], hiWins: true, good: 'faster', q: 'Which download is faster?', xs: 'seconds', ys: 'megabytes', time: 'second', unit: 'megabytes per second', xh: 'Seconds', yh: 'Megabytes', lo: 2, hi: 9,
    one: 'A game download runs at a steady speed.', lead: 'Two downloads are compared.', say: (n, m) => `${n} moves ${m} megabytes every second.`, sayIn: (n, a, t) => `${n} moves ${a} megabytes in ${count(t, 'second')}.` },
  { names: ['Shop A', 'Shop B'], hiWins: false, good: 'cheaper', q: 'Which shop has the lower price per kilogram?', xs: 'kilograms', ys: 'dollars', time: 'kilogram', unit: 'dollars per kilogram', xh: 'Kilograms', yh: 'Cost ($)', lo: 2, hi: 9,
    one: 'A shop sells apples at one price per kilogram.', lead: 'Two shops sell apples.', say: (n, m) => `${n} sells apples for $${m} for every kilogram.`, sayIn: (n, a, t) => `${n} sells ${count(t, 'kilogram')} of apples for $${a}.` },
  { names: ['Walker A', 'Walker B'], hiWins: true, good: 'better paid', q: 'Who earns more per hour?', xs: 'hours', ys: 'dollars', time: 'hour', unit: 'dollars per hour', xh: 'Hours', yh: 'Earned ($)', lo: 5, hi: 9,
    one: 'A dog walker is paid the same amount every hour.', lead: 'Two dog walkers are compared.', say: (n, m) => `${n} earns $${m} for every hour of walking dogs.`, sayIn: (n, a, t) => `${n} earns $${a} for ${count(t, 'hour')} of walking dogs.` },
  { names: ['Plan A', 'Plan B'], hiWins: false, good: 'cheaper', q: 'Which plan is cheaper per gigabyte?', xs: 'gigabytes', ys: 'dollars', time: 'gigabyte', unit: 'dollars per gigabyte', xh: 'Gigabytes', yh: 'Cost ($)', lo: 2, hi: 9,
    one: 'A phone plan charges the same price for each gigabyte.', lead: 'Two phone plans are compared.', say: (n, m) => `${n} charges $${m} for every gigabyte.`, sayIn: (n, a, t) => `${n} charges $${a} for ${count(t, 'gigabyte')}.` },
];
// "1 meter per second", not "1 meters per second".
const per = (v, unit) => (v === 1 ? unit.replace('s per', ' per') : unit);
const axes = c => `Across (x): ${c.xs}. Up (y): ${c.ys}.`;
// Ways of reading the unit rate off one form, ending on the rate in bold.
function rateSteps(s, c, who) {
  const m = s.m, r = s.rows;
  if (s.f === 'eq') return [`${who}: in y = mx the number multiplying x is the unit rate, ${b(fmt(m))} ${c.unit}.`];
  if (s.f === 'table') return [`${who}: divide y by x in any row, ${fmt(r[0][1])} ÷ ${fmt(r[0][0])} = ${b(fmt(m))} ${c.unit}.`];
  if (s.f === 'graph') return [`${who}: the line goes through ${pt(1, m)}, so at 1 ${c.time} it is at ${fmt(m)}. The unit rate is ${b(fmt(m))} ${c.unit}.`];
  return [s.amt ? `${who}: ${fmt(s.amt)} ÷ ${fmt(s.per)} = ${b(fmt(m))} ${c.unit}.` : `${who}: it says ${fmt(m)} for every ${c.time}, so the unit rate is ${b(fmt(m))} ${c.unit}.`];
}
const rates = (L, c, kind) => {
  const half = L === 3 && kind === 'which', a = rnd(c.lo, c.hi) + (half ? pick([0, 0.5]) : 0);
  let d = rnd(c.lo, c.hi) + (half ? pick([0, 0.5]) : 0);
  if (d === a && !(L > 1 && chance(0.15))) d = a === c.hi ? a - 1 : a + 1;
  return [a, d];
};
function compare(L, kind, f1, f2) {
  const c = pick(CTX), [mA, mB] = rates(L, c, kind), stepOf = m => (m % 1 ? pick([2, 4]) : rnd(2, 5)), stepA = stepOf(mA), stepB = stepOf(mB);
  const sA = makeSpec(f1, mA, 0, { step: stepA, x0: stepA, amt: L > 1 }), sB = makeSpec(f2, mB, 0, { step: stepB, x0: stepB, amt: L > 1 });
  const ra = render(sA, c, c.names[0]), rb = render(sB, c, c.names[1]), tie = mA === mB, winA = (mA > mB) === c.hiWins;
  const win = tie ? 'They are the same' : winA ? c.names[0] : c.names[1];
  const need = [f1, f2].some(f => f !== 'words');
  return { ask: `${c.lead} ${ra.line} ${rb.line}${need ? ` ${axes(c)}` : ''} ${c.q}`, visual: together(ra.visual, rb.visual), answer: fixedChoice(win, [...c.names, 'They are the same']),
    hint: 'Work out the unit rate of each one: the amount for exactly one step of x. Then compare them.', _t: { k: 'propcmp', shape: `cmp-${f1}-${f2}`, forms: [rawSpec(sA), rawSpec(sB)], hiWins: c.hiWins, names: c.names, ask: 'which' },
    ways: [way('Find each unit rate', [...rateSteps(sA, c, c.names[0]), ...rateSteps(sB, c, c.names[1]), tie ? `Both are ${fmt(mA)}: ${b('they are the same')}.` : `${fmt(mA)} and ${fmt(mB)}. ${c.hiWins ? 'A greater' : 'A smaller'} number of ${c.unit} is ${c.good}, so ${b(win)}.`]),
      way('Compare at the same amount', [`Take 10 ${c.xs} for both. ${c.names[0]}: ${fmt(mA)} × 10 = ${fmt(mA * 10)} ${c.ys}. ${c.names[1]}: ${fmt(mB)} × 10 = ${fmt(mB * 10)} ${c.ys}.`, tie ? `They match, so ${b('they are the same')}.` : `${c.hiWins ? 'More' : 'Fewer'} ${c.ys} for the same ${c.xs} is ${c.good}: ${b(win)}.`])] };
}
const pairForms = () => { const [x, y] = [pick(FORMS), pick(FORMS)]; return x === y ? pairForms() : [x, y]; };
function oneRate(kind) {
  const c = pick(CTX), m = rnd(c.lo, c.hi), per = rnd(2, 5), name = c.names[0], ask = `What is the unit rate, in ${c.unit}?`;
  const hint = 'The unit rate is the amount for exactly one step of x.', _t = { k: 'propcmp', shape: `rate-${kind}`, ask: 'rate' };
  if (kind === 'graph') return { ask: `${c.one} The graph shows ${c.ys} against ${c.xs}. ${ask}`, visual: graphOf(m, 0), answer: num(m), hint, _t: { ..._t, forms: [{ f: 'graph', m }] },
    ways: [way('Read the dot at 1', [`Find x = 1 on the bottom. The line is at height ${fmt(m)} there.`, `The unit rate is ${b(fmt(m))} ${c.unit}.`]), way('Divide at another dot', [`Take any dot on the line, for example ${pt(2, 2 * m)} or the next one.`, `y ÷ x = ${fmt(m)}, so the unit rate is ${b(fmt(m))}.`])] };
  if (kind === 'table') { const s = makeSpec('table', m, 0, { step: per, x0: per }), r = s.rows;
    return { ask: `${c.one} The table shows it. ${ask}`, visual: render(s, c, name).visual, answer: num(m), hint, _t: { ..._t, forms: [rawSpec(s)] },
      ways: [way('Divide y by x', [`Take the first row: ${fmt(r[0][1])} ${c.ys} in ${fmt(r[0][0])} ${c.xs}.`, `${fmt(r[0][1])} ÷ ${fmt(r[0][0])} = ${b(fmt(m))} ${c.unit}.`]), way('Check another row', [`Take the last row: ${fmt(r[3][1])} ÷ ${fmt(r[3][0])} = ${fmt(m)}.`, `Every row gives the same rate, ${b(fmt(m))}. That is what makes it proportional.`])] }; }
  const s = makeSpec('words', m, 0, { step: per, amt: true });
  return { ask: `${c.one} ${c.sayIn(name, s.amt, per)} ${ask}`, answer: num(m), hint, _t: { ..._t, forms: [rawSpec(s)] },
    ways: [way('Share it out equally', [`${fmt(s.amt)} ${c.ys} are made in ${count(per, c.time)}.`, `${fmt(s.amt)} ÷ ${per} = ${b(fmt(m))} ${c.unit}.`]), way('Check by multiplying', [`${per} × ${fmt(m)} = ${fmt(s.amt)}, which matches.`, `So ${b(fmt(m))} ${c.unit} is right.`])] };
}
// Both lines on one graph: which is steeper? The labelled dots say which line is which.
function twoLines() {
  const c = pick(CTX), [mA, mB] = rates(2, c, 'lines');
  if (mA === mB) return null;
  const x = 10 / Math.max(mA, mB) >= 2 ? 2 : 1, win = (mA > mB) === c.hiWins ? c.names[0] : c.names[1];
  const pic = grid({ lines: [{ m: mA, c: 0 }, { m: mB, c: 0 }], pts: [{ x, y: x * mA, label: 'A', r: 5 }, { x, y: x * mB, label: 'B', r: 5 }] });
  return { ask: `${c.lead} ${c.names[0]} is line A and ${c.names[1]} is line B. ${axes(c)} ${c.q}`, visual: pic, answer: fixedChoice(win, [...c.names, 'They are the same']), hint: 'The unit rate is the height of each line at x = 1. Which line is higher there?',
    _t: { k: 'propcmp', shape: 'cmp-lines', forms: [{ f: 'graph', m: mA }, { f: 'graph', m: mB }], hiWins: c.hiWins, names: c.names, ask: 'which' },
    ways: [way('Read each line at 1', [`${c.names[0]}: its line is at height ${fmt(mA)} when x = 1.`, `${c.names[1]}: its line is at height ${fmt(mB)} when x = 1.`, `${c.hiWins ? 'Higher' : 'Lower'} is ${c.good}, so ${b(win)}.`]),
      way('Use the steepness', ['The slope of a line through the origin is its unit rate.', `The steeper line is A or B? A rises ${fmt(mA)} for each step right, B rises ${fmt(mB)}.`, `${c.hiWins ? 'Steeper' : 'Flatter'} means ${c.good}: ${b(win)}.`])] };
}
// How far apart the two amounts are, or how different the unit rates are: numbers, not a choice.
function gap(kind) {
  const c = pick(CTX), [mA, mB] = rates(2, c, kind);
  if (mA === mB) return null;
  const [f1, f2] = pairForms(), d = Math.abs(mA - mB), x = rnd(4, 12), sA = makeSpec(f1, mA, 0, { step: rnd(2, 5), x0: 2, amt: true }), sB = makeSpec(f2, mB, 0, { step: rnd(2, 5), x0: 2, amt: true });
  const ra = render(sA, c, c.names[0]), rb = render(sB, c, c.names[1]), total = kind === 'total', ans = total ? d * x : d;
  const q = total ? `After ${count(x, c.time)}, how many ${c.ys} apart are the two amounts?` : `What is the difference between their unit rates, in ${c.unit}?`;
  const high = Math.max(mA, mB), low = Math.min(mA, mB);
  return { ask: `${c.lead} ${ra.line} ${rb.line} ${axes(c)} ${q}`, visual: together(ra.visual, rb.visual), answer: num(ans), hint: total ? 'Find both unit rates first. Then think about how much apart they grow in one step.' : 'Find the unit rate of each one first. Then subtract.',
    _t: { k: 'propcmp', shape: `cmp-${kind}`, forms: [rawSpec(sA), rawSpec(sB)], ask: kind, x: total ? x : undefined },
    ways: [way('Unit rates first', [...rateSteps(sA, c, c.names[0]), ...rateSteps(sB, c, c.names[1]), `${fmt(high)} − ${fmt(low)} = ${fmt(d)} ${per(d, c.unit)}.`, total ? `${fmt(d)} × ${x} = ${b(fmt(ans))} ${c.ys}.` : `The difference is ${b(fmt(ans))} ${per(ans, c.unit)}.`]),
      way(total ? 'Work out each amount' : 'Look at one step', total ? [`${c.names[0]}: ${fmt(mA)} × ${x} = ${fmt(mA * x)}. ${c.names[1]}: ${fmt(mB)} × ${x} = ${fmt(mB * x)}.`, `${fmt(Math.max(mA, mB) * x)} − ${fmt(Math.min(mA, mB) * x)} = ${b(fmt(ans))}.`] : [`In one ${c.time}: ${c.names[0]} gives ${fmt(mA)} and ${c.names[1]} gives ${fmt(mB)}.`, `The gap is ${fmt(high)} − ${fmt(low)} = ${b(fmt(ans))}.`])] };
}
export function genPropCmp(L) {
  if (L === 1) return pick([() => oneRate('graph'), () => oneRate('table'), () => oneRate('words'), () => compare(1, 'which', 'eq', 'words')])();
  if (L === 2) { const [x, y] = pairForms(); return compare(2, 'which', x, y); }
  return pick([() => gap('diff'), () => gap('total'), twoLines, () => { const [x, y] = pairForms().map(f => (f === 'graph' ? 'table' : f)); return compare(3, 'which', x, y === x ? 'words' : y); }])();
}
