// Two-way tables: joint and marginal counts, relative frequencies by row or column, and association.
import { rnd, pick, chance, b, way, fmt, num, choice, table } from '../../util.js';
import { fixedChoice } from './h.js';

// rows and cols are the two ways to split the group. inf finishes "are more likely to ...".
const CTX = [
  { who: 'students', rel: 'who', rows: ['have a pet', 'do not have a pet'], rowHead: ['Has a pet', 'No pet'], cols: ['play a sport', 'do not play a sport'], colHead: ['Plays a sport', 'No sport'], inf: 'play a sport', assoc: 'having a pet and playing a sport' },
  { who: 'students', rel: 'who', rows: ['play video games', 'do not play video games'], rowHead: ['Plays games', 'No games'], cols: ['read for fun', 'do not read for fun'], colHead: ['Reads for fun', 'Does not read'], inf: 'read for fun', assoc: 'playing video games and reading for fun' },
  { who: 'students', rel: 'who', rows: ['take the bus', 'walk to school'], rowHead: ['Bus', 'Walk'], cols: ['arrive on time', 'arrive late'], colHead: ['On time', 'Late'], inf: 'arrive on time', assoc: 'how you get to school and arriving on time' },
  { who: 'students', rel: 'who', rows: ['keep a phone in the bedroom', 'keep the phone out of the bedroom'], rowHead: ['Phone in room', 'Phone outside'], cols: ['sleep 8 hours or more', 'sleep less than 8 hours'], colHead: ['8 hours or more', 'Under 8 hours'], inf: 'sleep 8 hours or more', assoc: 'a phone in the bedroom and sleep' },
  { who: 'games', rel: 'that', rows: ['were played at home', 'were played away'], rowHead: ['Home', 'Away'], cols: ['were won', 'were lost'], colHead: ['Won', 'Lost'], inf: 'be won', assoc: 'where a game is played and winning it' },
];
const NICE = [20, 25, 50], PCT = [20, 40, 60, 80];
const label = (c, r) => `${c.who} ${c.rows[r]}`;
// A 2 by 2 table of counts. Row totals r0 and r1, with a and c in the first column.
function grid(r0, r1, a, c) { return [[a, r0 - a, r0], [c, r1 - c, r1], [a + c, r0 + r1 - a - c, r0 + r1]]; }
function randomGrid(totals = [rnd(20, 50), rnd(20, 50)]) { const [r0, r1] = totals; return grid(r0, r1, rnd(3, r0 - 3), rnd(3, r1 - 3)); }
function view(c, g, hide = [], full = true) {
  const cell = (i, j) => (hide.some(h => h[0] === i && h[1] === j) ? '?' : fmt(g[i][j])), span = full ? 3 : 2;
  const rows = [0, 1].map(i => [c.rowHead[i], ...Array.from({ length: span }, (_, j) => cell(i, j))]);
  if (full) rows.push(['Total', ...[0, 1, 2].map(j => cell(2, j))]);
  return table(['', c.colHead[0], c.colHead[1], ...(full ? ['Total'] : [])], rows);
}
const core = (shape, g, extra = {}) => ({ k: 'twoway', shape, g, ...extra });
const lead = c => `A survey asked ${c.who} two questions. The table shows the counts.`;
function joint() {
  const c = pick(CTX), g = randomGrid(), i = rnd(0, 1), j = rnd(0, 1);
  return { ask: `${lead(c)} How many ${c.who} ${c.rows[i]} and ${c.cols[j]}?`, visual: view(c, g), answer: num(g[i][j]), hint: 'Find the row for one group and the column for the other. The answer is where they meet.', _t: core('joint', g, { cell: [i, j] }),
    ways: [way('Where the row and column meet', [`Row: ${c.rowHead[i]}. Column: ${c.colHead[j]}.`, `They meet at ${b(g[i][j])}.`]), way('Check with a total', [`The row total is ${g[i][2]}. The two cells in the row are ${g[i][0]} and ${g[i][1]}, and ${g[i][0]} + ${g[i][1]} = ${g[i][2]}.`, `The cell for ${c.colHead[j]} is ${b(g[i][j])}.`])] };
}
function marginal() {
  const c = pick(CTX), g = randomGrid(), byRow = chance(0.5), k = rnd(0, 1), total = byRow ? g[k][2] : g[2][k];
  return { ask: `${lead(c)} How many ${c.who} ${byRow ? c.rows[k] : c.cols[k]} altogether?`, visual: view(c, g), answer: num(total), hint: 'The totals are on the edge of the table. Which total belongs to this group?', _t: core('marginal', g, { byRow, idx: k }),
    ways: [way('Read the total', [`Look at the ${byRow ? 'Total column in the row' : 'Total row in the column'} for ${byRow ? c.rowHead[k] : c.colHead[k]}.`, `It says ${b(total)}.`]), way('Add the two cells', [byRow ? `${g[k][0]} + ${g[k][1]} = ${b(total)}.` : `${g[0][k]} + ${g[1][k]} = ${b(total)}.`])] };
}
function missingCell() {
  const c = pick(CTX), g = randomGrid(), i = rnd(0, 1), j = rnd(0, 1), other = g[i][1 - j];
  return { ask: `${lead(c)} One count is hidden. What is it?`, visual: view(c, g, [[i, j]]), answer: num(g[i][j]), hint: 'The two counts in a row add up to the row total.', _t: core('missing-cell', g, { cell: [i, j] }),
    ways: [way('Use the row total', [`The row total is ${g[i][2]}, and the other cell in the row is ${other}.`, `${g[i][2]} − ${other} = ${b(g[i][j])}.`]), way('Use the column total', [`The column total is ${g[2][j]}, and the other cell in the column is ${g[1 - i][j]}.`, `${g[2][j]} − ${g[1 - i][j]} = ${b(g[i][j])}.`])] };
}
function grandTotal() {
  const c = pick(CTX), g = randomGrid();
  return { ask: `${lead(c)} The grand total is hidden. How many ${c.who} were asked?`, visual: view(c, g, [[2, 2]]), answer: num(g[2][2]), hint: 'Add the two row totals, or the two column totals.', _t: core('grand-total', g),
    ways: [way('Add the row totals', [`${g[0][2]} + ${g[1][2]} = ${b(g[2][2])}.`]), way('Add the column totals', [`${g[2][0]} + ${g[2][1]} = ${b(g[2][2])}.`])] };
}
function sumCells() {
  const c = pick(CTX), g = randomGrid(), byRow = chance(0.5), k = rnd(0, 1), total = byRow ? g[k][2] : g[2][k];
  return { ask: `The table shows how many ${c.who} gave each pair of answers. How many ${c.who} ${byRow ? c.rows[k] : c.cols[k]} altogether?`, visual: view(c, g, [], false), answer: num(total), hint: 'Add the two counts that belong to that group.', _t: core('sum-cells', g, { byRow, idx: k, noTotals: true }),
    ways: [way('Add the cells', [byRow ? `${g[k][0]} + ${g[k][1]} = ${b(total)}.` : `${g[0][k]} + ${g[1][k]} = ${b(total)}.`]), way('Check with the other group', [`The whole group is ${g[2][2]}, and the other group has ${g[2][2] - total}.`, `${g[2][2]} − ${g[2][2] - total} = ${b(total)}.`])] };
}
// A table whose row totals (by "row"), column totals (by "col") or grand total (by "all") are 20, 25, 50 or 100,
// so a part of that whole is a whole-number percent.
function niceGrid(by) {
  if (by === 'all') { const G = pick([20, 25, 50, 100]), r0 = rnd(6, G - 6); return grid(r0, G - r0, rnd(2, r0 - 2), rnd(2, G - r0 - 2)); }
  if (by === 'row') { const r0 = pick(NICE), r1 = pick(NICE); return grid(r0, r1, rnd(3, r0 - 3), rnd(3, r1 - 3)); }
  const k0 = pick(NICE), k1 = pick(NICE), x = rnd(3, k0 - 3), y = rnd(3, k1 - 3);
  return [[x, y, x + y], [k0 - x, k1 - y, k0 + k1 - x - y], [k0, k1, k0 + k1]];
}
const group = (c, text) => `${c.who} ${c.rel} ${text}`;
// Relative frequency: part over whole as a percent, by row, by column, or out of everyone.
function relative(by) {
  const c = pick(CTX), g = niceGrid(by), i = rnd(0, 1), j = rnd(0, 1), whole = by === 'all' ? g[2][2] : by === 'row' ? g[i][2] : g[2][j], part = g[i][j], pct = 100 * part / whole;
  const q = by === 'all' ? `Out of all ${c.who}, what percent ${c.rows[i]} and ${c.cols[j]}?` : by === 'row' ? `Of the ${group(c, c.rows[i])}, what percent ${c.cols[j]}?` : `Of the ${group(c, c.cols[j])}, what percent ${c.rows[i]}?`;
  const what = by === 'all' ? 'all of them' : by === 'row' ? 'that row' : 'that column';
  return { ask: `${lead(c)} ${q}`, visual: view(c, g), answer: num(pct), suffix: 'percent', hint: `Divide the part by the whole group you are asked about (${what}). Then write it as a percent.`, _t: core(`rel-${by}`, g, { cell: [i, j], by }),
    ways: [way('Part over whole', [`The part is ${part}. The whole group is ${whole}.`, `${part} ÷ ${whole} = ${fmt(part / whole)} = ${b(pct)}%.`]), way('Scale to 100', [`${whole} × ${100 / whole} = 100, so multiply the part the same way.`, `${part} × ${100 / whole} = ${b(pct)}%.`])] };
}
// Two row groups whose first-column percents are known multiples of 20.
function percentGrid() {
  const r0 = pick(NICE), r1 = pick(NICE), p0 = pick(PCT), p1 = pick(PCT);
  return { g: grid(r0, r1, r0 * p0 / 100, r1 * p1 / 100), p: [p0, p1] };
}
function comparePct() {
  const c = pick(CTX), g = niceGrid('row'), p = [100 * g[0][0] / g[0][2], 100 * g[1][0] / g[1][2]], names = [group(c, c.rows[0]), group(c, c.rows[1])];
  if (p[0] === p[1]) return null;
  const win = p[0] > p[1] ? 0 : 1;
  return { ask: `${lead(c)} Which group is more likely to ${c.inf}: the ${names[0]}, or the ${names[1]}?`, visual: view(c, g), answer: fixedChoice(names[win], names), hint: 'Counts can mislead when the groups are different sizes. Compare percents, not counts.', _t: core('compare-pct', g, { names }),
    ways: [way('Find both percents', [`${names[0]}: ${g[0][0]} out of ${g[0][2]} is ${p[0]}%.`, `${names[1]}: ${g[1][0]} out of ${g[1][2]} is ${p[1]}%.`, `${Math.max(...p)}% is more than ${Math.min(...p)}%, so the ${b(names[win])}.`]), way('Scale both to 100', [`${g[0][2]} × ${100 / g[0][2]} = 100, so ${g[0][0]} becomes ${p[0]}.`, `${g[1][2]} × ${100 / g[1][2]} = 100, so ${g[1][0]} becomes ${p[1]}. The ${b(names[win])} has the greater percent.`])] };
}
function associationQ() {
  const c = pick(CTX), pg = percentGrid(), none = chance(0.4), p = none ? [pg.p[0], pg.p[0]] : pg.p;
  const g = none ? grid(pg.g[0][2], pg.g[1][2], pg.g[0][2] * p[0] / 100, pg.g[1][2] * p[0] / 100) : pg.g;
  if (!none && Math.abs(p[0] - p[1]) < 40) return null;
  const options = [`Yes: ${group(c, c.rows[0])} are more likely to ${c.inf}`, `Yes: ${group(c, c.rows[1])} are more likely to ${c.inf}`, 'No clear association'], win = none ? 2 : p[0] > p[1] ? 0 : 1;
  return { ask: `${lead(c)} Is there an association between ${c.assoc}?`, visual: view(c, g), answer: fixedChoice(options[win], options), hint: 'Find what percent of each row group gave the same answer. Are the two percents close or far apart?', _t: core('assoc', g),
    ways: [way('Compare the row percents', [`First group: ${g[0][0]} out of ${g[0][2]} is ${p[0]}%. Second group: ${g[1][0]} out of ${g[1][2]} is ${p[1]}%.`, none ? `The two percents are equal, so one answer does not change the chances of the other: ${b('no clear association')}.` : `${Math.max(...p)}% and ${Math.min(...p)}% are far apart, so there is an association: ${b(options[win].toLowerCase())}.`]),
      way('Picture no association', ['With no association, both row groups would have the same percent.', none ? 'Here they do, so there is no association.' : 'Here they do not, so there is an association, and it points toward the group with the greater percent.'])] };
}
function percentGap() {
  const c = pick(CTX), { g, p } = percentGrid();
  if (p[0] === p[1]) return null;
  return { ask: `${lead(c)} Find the percent of each row group that ${c.cols[0]}. By how many percentage points do the two percents differ?`, visual: view(c, g), answer: num(Math.abs(p[0] - p[1])), suffix: 'points', hint: 'Work out the percent for each row first. Then subtract the smaller from the greater.', _t: core('percent-gap', g),
    ways: [way('Two percents, then subtract', [`${g[0][0]} out of ${g[0][2]} is ${p[0]}%, and ${g[1][0]} out of ${g[1][2]} is ${p[1]}%.`, `${Math.max(...p)} − ${Math.min(...p)} = ${b(Math.abs(p[0] - p[1]))} percentage points.`]), way('Scale each to 100', [`${g[0][2]} × ${100 / g[0][2]} = 100, so ${g[0][0]} × ${100 / g[0][2]} = ${p[0]}.`, `${g[1][2]} × ${100 / g[1][2]} = 100, so ${g[1][0]} × ${100 / g[1][2]} = ${p[1]}. The difference is ${b(Math.abs(p[0] - p[1]))}.`])] };
}
function cellFromPct() {
  const c = pick(CTX), T = pick([20, 25, 40, 50]), P = pick(PCT), i = rnd(0, 1), j = rnd(0, 1), n = T * P / 100;
  if (!Number.isInteger(n)) return null;
  return { ask: `In a survey, ${T} ${c.who} are in the group that ${c.rows[i]}. Of them, ${P}% ${c.cols[j]}. How many ${c.who} ${c.rows[i]} and ${c.cols[j]}?`, answer: num(n), hint: 'Find that percent of the group: divide by 100 and multiply by the group size.', _t: { k: 'twoway', shape: 'cell-from-pct', T, P },
    ways: [way('Percent of the group', [`${P}% of ${T} = ${fmt(P / 100)} × ${T}.`, `${fmt(P / 100)} × ${T} = ${b(n)}.`]), way('Use fifths', [`${P}% is ${P / 20} fifths, and one fifth of ${T} is ${fmt(T / 5)}.`, `${P / 20} × ${fmt(T / 5)} = ${b(n)}.`])] };
}
function statement() {
  const c = pick(CTX), { g, p } = percentGrid();
  if (p[0] === p[1]) return null;
  const first = group(c, c.rows[0]), second = group(c, c.rows[1]), say = (a, d) => `${a}% of the ${first} ${c.cols[0]}, and ${d}% of the ${second} ${c.cols[0]}`;
  const right = say(p[0], p[1]), swapped = say(p[1], p[0]), other = say(100 - p[0], 100 - p[1]);
  return { ask: `${lead(c)} Which statement matches the table?`, visual: view(c, g), answer: choice(right, [swapped, other]), hint: 'Work out the percent for each row group, and keep track of which group is which.', _t: core('statement', g, { p }),
    ways: [way('Find both percents', [`First group: ${g[0][0]} out of ${g[0][2]} is ${p[0]}%. Second group: ${g[1][0]} out of ${g[1][2]} is ${p[1]}%.`, `So: ${b(right)}.`]), way('Rule out the others', ['One choice has the two percents the wrong way round, and one uses the percents for the other answer.', `Only this one matches: ${b(right)}.`])] };
}
export function genTwoWay(L) {
  if (L === 1) return pick([joint, marginal, missingCell, grandTotal])();
  if (L === 2) return pick([() => relative('row'), () => relative('col'), () => relative('all'), sumCells, comparePct])();
  return pick([associationQ, percentGap, cellFromPct, statement, () => relative('col')])();
}
