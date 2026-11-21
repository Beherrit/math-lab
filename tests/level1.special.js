// Level 1, the added skills: for choice questions, judge every option with an independent rule and require that
// exactly the marked option passes. Each function gets (problem, where).
import assert from 'node:assert/strict';
import { strip, js, evalMath, only, valueOf, roundTo, sum, evenOdd, numsIn } from './level1.util.js';
import { FLAT_T, SOLID_T, UNIT_T } from './level1.new.js';
import { dotGrid, shareFigs } from './level1.visual.js';

const opts = p => p.answer.options, marked = p => p.answer.options[p.answer.correct];
const sidesOf = s => js(strip(s).replace(/&lt;/g, '<')).split('=').map(evalMath);
const cornersOf = n => (FLAT_T[n] ? FLAT_T[n].sides : SOLID_T[n].corners);
const PICK = { zero: v => v === 0, many: v => v > 5, few: v => v < 4 };

// "X got N more votes than Y", "X got N votes", "X got the most votes", "X and Y got N votes together": true or false from the graph.
function statementTrue(s, names, vals) {
  const v = n => vals[names.indexOf(n)], text = strip(s);
  let m;
  if ((m = text.match(/^(.+) got (\d+) more votes? than (.+)$/))) return v(m[1]) - v(m[3]) === +m[2];
  if ((m = text.match(/^(.+) and (.+) got (\d+) votes? together$/))) return v(m[1]) + v(m[2]) === +m[3];
  if ((m = text.match(/^(.+) got the (most|fewest) votes$/))) return v(m[1]) === (m[2] === 'most' ? Math.max(...vals) : Math.min(...vals));
  if ((m = text.match(/^(.+) got (\d+) votes?$/))) return v(m[1]) === +m[2];
  throw new Error(`cannot read the sentence: ${text}`);
}
const addends = s => strip(s).split('+').map(x => +x.trim());

export const SPECIAL_NEW = {
  which: (p, where) => only(opts(p).filter(o => evenOdd(valueOf(o)) === p._t.want), p.answer, where, `be ${p._t.want}`),
  oddone: (p, where) => only(opts(p).filter(o => (+o - p._t.start) % p._t.step !== 0), p.answer, where, 'be the number that does not belong'),
  eqtrue: (p, where) => only(opts(p).filter(o => { const [l, r] = sidesOf(o); return l === r; }), p.answer, where, 'have two sides that are equal'),
  estsum: (p, where) => {
    const exact = sum(p._t.xs), est = sum(p._t.xs.map(x => roundTo(x, 10)));
    only(opts(p).filter(o => Math.abs(+o - exact) <= 20), p.answer, where, `be within 20 of ${exact}`);
    assert.equal(marked(p), String(est), `${where}: the estimate`);
  },
  whoami: (p, where) => {
    const { kind, clue } = p._t, fits = kind === 'flat' ? n => FLAT_T[n].sides === clue.sides && (clue.equal === undefined || FLAT_T[n].equal === clue.equal)
      : n => SOLID_T[n].faces === clue.faces && SOLID_T[n].corners === clue.corners && (clue.square === undefined || SOLID_T[n].square === clue.square);
    only(opts(p).filter(fits), p.answer, where, 'fit every clue');
  },
  pick: (p, where) => only(opts(p).filter(n => PICK[p._t.kind](cornersOf(n))), p.answer, where, `fit "${p._t.kind}"`),
  unit: (p, where) => assert.equal(marked(p), UNIT_T[`${p._t.system} ${p._t.item}`], `${where}: the unit for ${p._t.item}`),
  gstmt: (p, where) => only(opts(p).filter(o => statementTrue(o, p._t.names, p._t.vals)), p.answer, where, 'be true of the graph'),
  arrsent: (p, where) => {
    const { rows, cols } = dotGrid(p.visual);
    only(opts(p).filter(o => { const a = addends(o); return a.length === rows && a.every(x => x === cols); }), p.answer, where, `add ${rows} rows of ${cols}`);
  },
  equalshares: (p, where) => assert.equal(marked(p) === 'Yes', shareFigs(p.visual)[0].equal, `${where}: equal shares`),
  samesize: (p, where) => {
    const [a, c] = shareFigs(p.visual);
    assert.ok(a.equal && c.equal, `${where}: both squares must be cut into equal shares`);
    assert.equal(marked(p) === 'Yes', a.parts === c.parts, `${where}: same size shares`);
    assert.deepEqual(numsIn(p.ask).length, 0, `${where}: the question gives no numbers, only the picture does`);
  },
};
