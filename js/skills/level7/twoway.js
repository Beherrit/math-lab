// Two-way tables: joint and marginal counts, relative frequencies by row or column, and association.
import { rnd, pick, chance, shuffle, b, way, fmt, num, choice, table } from '../../util.js';
import { fixedChoice, yesNo } from './h.js';

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
  return { ask: `${lead(c)} How many ${c.who} ${c.rel === 'that' ? 'that ' : ''}${c.rows[i]} and ${c.cols[j]}?`, visual: view(c, g), answer: num(g[i][j]), hint: 'Find the row for one group and the column for the other. The answer is where they meet.', _t: core('joint', g, { cell: [i, j] }),
    ways: [way('Where the row and column meet', [`Row: ${c.rowHead[i]}. Column: ${c.colHead[j]}.`, `They meet at ${b(g[i][j])}.`]), way('Check with a total', [`The row total is ${g[i][2]}. The two cells in the row are ${g[i][0]} and ${g[i][1]}, and ${g[i][0]} + ${g[i][1]} = ${g[i][2]}.`, `The cell for ${c.colHead[j]} is ${b(g[i][j])}.`])] };
}
function marginal() {
  const c = pick(CTX), g = randomGrid(), byRow = chance(0.5), k = rnd(0, 1), total = byRow ? g[k][2] : g[2][k];
  return { ask: `${lead(c)} How many ${c.who} ${byRow ? c.rows[k] : c.cols[k]} altogether?`, visual: view(c, g), answer: num(total), hint: 'The totals are on the edge of the table. Which total belongs to this group?', _t: core('marginal', g, { byRow, k }),
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
  return { ask: `The table shows how many ${c.who} gave each pair of answers. How many ${c.who} ${byRow ? c.rows[k] : c.cols[k]} altogether?`, visual: view(c, g, [], false), answer: num(total), hint: 'Add the two counts that belong to that group.', _t: core('sum-cells', g, { byRow, k, noTotals: true }),
    ways: [way('Add the cells', [byRow ? `${g[k][0]} + ${g[k][1]} = ${b(total)}.` : `${g[0][k]} + ${g[1][k]} = ${b(total)}.`]), way('Check with the other group', [`The whole group is ${g[2][2]}, and the other group has ${g[2][2] - total}.`, `${g[2][2]} − ${g[2][2] - total} = ${b(total)}.`])] };
}
// Relative frequency: part over whole as a percent, by row, by column, or out of everyone.
function relative(by) {
  const c = pick(CTX), i = rnd(0, 1), j = rnd(0, 1);
  const g = by === 'all' ? (() => { const G = pick([20, 25, 50, 100]), a = rnd(2, G - 6), r0 = rnd(a + 3, G - 3), cc = rnd(2, G - r0 - 2); return grid(r0, G - r0, a, cc); })() : by === 'row' ? randomGrid(i ? [pick(NICE), pick(NICE)] : [pick(NICE), pick(NICE)]) : (() => { const t = grid(pick(NICE), pick(NICE), 0, 0), w = pick(NICE); return t && null; })();
  return g && by !== 'col' ? percentProblem(c, g, i, j, by) : colProblem(c, i, j);
}
function percentProblem(c, g, i, j, by) {
  const whole = by === 'all' ? g[2][2] : g[i][2], part = g[i][j], pct = 100 * part / whole;
  if (!Number.isInteger(pct) || part === 0) return null;
  const q = by === 'all' ? `What percent of all the ${c.who} ${c.rows[i]} and ${c.cols[j]}?` : `Of the ${c.who} ${c.rel === 'that' ? 'that ' : ''}${c.rows[i]}, what percent ${c.cols[j]}?`;
  return { ask: `${lead(c)} ${q}`, visual: view(c, g), answer: num(pct), suffix: 'percent', hint: 'Divide the part by the whole group you are asked about. Then write it as a percent.', _t: core(`rel-${by}`, g, { cell: [i, j], by }),
    ways: [way('Part over whole', [`The part is ${part}. The whole group is ${whole}.`, `${part} ÷ ${whole} = ${fmt(part / whole)} = ${b(pct)}%.`]), way('Scale to 100', [`${whole} × ${100 / whole} = 100, so multiply the part the same way.`, `${part} × ${100 / whole} = ${b(pct)}%.`])] };
}
function colProblem(c, i, j) {
  const k = pick(NICE), l = pick(NICE), a = rnd(2, k - 2), cc = rnd(2, l - 2), g = [[a, 0, 0], [cc, 0, 0], [k, l, 0]];
  const top = a + 0; void top;
  // Column totals are the nice numbers: build the table from them.
  const col0 = k, col1 = l, r0 = rnd(3, col0 - 2) + rnd(3, col1 - 2), cells = [[rnd(2, col0 - 2), 0], [0, 0]];
  void cells; void r0; void g;
  const x = rnd(2, col0 - 2), y = rnd(2, col1 - 2), t = [[x, y, x + y], [col0 - x, col1 - y, col0 + col1 - x - y], [col0, col1, col0 + col1]];
  const part = t[i][j], whole = t[2][j], pct = 100 * part / whole;
  if (!Number.isInteger(pct)) return null;
  return { ask: `${lead(c)} Of the ${c.who} ${c.rel === 'that' ? 'that ' : ''}${c.cols[j]}, what percent ${c.rows[i]}?`, visual: view(c, t), answer: num(pct), suffix: 'percent', hint: 'This time the whole group is a column, not a row. Divide the part by that column total.', _t: core('rel-col', t, { cell: [i, j], by: 'col' }),
    ways: [way('Part over whole', [`The part is ${part}. The whole group (the column total) is ${whole}.`, `${part} ÷ ${whole} = ${fmt(part / whole)} = ${b(pct)}%.`]), way('Scale to 100', [`${whole} × ${100 / whole} = 100, so multiply the part the same way.`, `${part} × ${100 / whole} = ${b(pct)}%.`])] };
}
export function genTwoWay(L) {
  if (L === 1) return pick([joint, marginal, missingCell, grandTotal])();
  if (L === 2) return pick([() => relative('row'), () => relative('col'), () => relative('all'), sumCells, comparePct])();
  return pick([associationQ, percentGap, cellFromPct, statement, () => relative('col')])();
}
