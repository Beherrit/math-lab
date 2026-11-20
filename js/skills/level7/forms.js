// One linear function shown four ways: as a rule, in a table, on a graph, or in words. Used by the comparing skills.
import { fmt, table } from '../../util.js';
import { eqn } from './h.js';
import { grid } from './draw.js';

export const FORMS = ['eq', 'table', 'graph', 'words'];
export const FORM_NAME = { eq: 'rule', table: 'table', graph: 'graph', words: 'words' };
// Whole-number points of y = mx + c that sit on the 0..10 grid: the dots a child can read.
export function dots(m, c) {
  const out = [];
  for (let x = 0; x <= 10 && out.length < 3; x++) { const y = m * x + c; if (y >= 0 && y <= 10 && (x > 0 || c > 0)) out.push({ x, y, r: 5 }); }
  return out;
}
export const graphOf = (m, c, extra = {}) => grid({ lines: [{ m, c }], pts: dots(m, c), ...extra });
// Rows of a table for y = mx + c: x = x0, x0 + step, ...
export const rowsOf = (m, c, x0, step, n = 4) => Array.from({ length: n }, (_, i) => [x0 + i * step, m * (x0 + i * step) + c]);
export const tableOf = (ctx, rows) => table([ctx.xh, ctx.yh], rows.map(r => r.map(fmt)));
// Two pictures one after the other in one visual.
export const together = (...parts) => parts.filter(Boolean).join('');
// spec { f, m, c, x0, step, amt, per }. Returns the text line that names the function, and its picture if it has one.
export function render(spec, ctx, label) {
  if (spec.f === 'eq') return { line: `${label}: ${eqn(spec.m, spec.c)}.`, visual: '' };
  if (spec.f === 'words') return { line: spec.amt ? ctx.sayIn(label, spec.amt, spec.per, spec) : ctx.say(label, spec.m, spec.c), visual: '' };
  if (spec.f === 'table') return { line: `${label} is shown in the table.`, visual: tableOf(ctx, spec.rows) };
  return { line: `${label} is shown in the graph.`, visual: graphOf(spec.m, spec.c) };
}
// What the checker sees: the raw operands of a form, with the table rows or the amount-in-time spelled out.
export function rawSpec(spec) {
  if (spec.f === 'table') return { f: 'table', rows: spec.rows };
  if (spec.f === 'words') return spec.amt ? { f: 'words', amt: spec.amt, per: spec.per, c: spec.c ?? 0 } : { f: 'words', m: spec.m, c: spec.c };
  return { f: spec.f, m: spec.m, c: spec.c };
}
// A complete spec of the given kind for y = mx + c.
export function makeSpec(f, m, c, { step = 1, x0 = 0, amt = false } = {}) {
  if (f === 'table') return { f, m, c, rows: rowsOf(m, c, x0, step) };
  if (f === 'words' && amt) return { f, m, c, amt: m * step, per: step };
  return { f, m, c };
}
