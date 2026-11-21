// Reading an equation of a line back from the text a child sees: "y = -1/2x + 3" gives slope -0.5 and intercept 3.
import assert from 'node:assert/strict';

export const EQ = /^y = (-?)(\d+(?:\.\d+)?)?(?:\/(\d+))?x(?: ([+-]) (\d+(?:\.\d+)?))?$/;
export function eqText(s) {
  const m = EQ.exec(s); assert.ok(m, `not y = mx + b: ${s}`);
  return [(m[1] ? -1 : 1) * Number(m[2] ?? 1) / Number(m[3] ?? 1), m[4] ? (m[4] === '-' ? -1 : 1) * Number(m[5]) : 0];
}
export const isEq = s => EQ.test(s);
// The slope and intercept of every option, all different, and exactly one equal to the line that is asked about.
export function onlyLine(options, m, c, msg = '') {
  const lines = options.map(eqText), same = lines.map(([a, b]) => Math.abs(a - m) < 1e-9 && Math.abs(b - c) < 1e-9);
  assert.equal(new Set(lines.map(l => l.join(','))).size, lines.length, `two options are the same line: ${options.join(' | ')} ${msg}`);
  assert.equal(same.filter(Boolean).length, 1, `${same.filter(Boolean).length} options describe y = ${m}x + ${c}: ${options.join(' | ')} ${msg}`);
  return same.indexOf(true);
}
