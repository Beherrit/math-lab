// Recomputations for the questions whose answer is a fixed fact, not a sum: the test works the fact out again
// from the numbers on screen and from its own table. Nothing here imports the level 7 generators.
import assert from 'node:assert/strict';
import { text, ans } from './level7.text.js';

export const UNDEF = 'Undefined: you cannot divide by 0';
export const COVER = { upright: 0, flat: 0 };
const MEANS = [['taxi ride', 'The cost of each extra kilometer', 'The fee before the taxi has moved'], ['phone plan', 'The cost of each gigabyte', 'The monthly fee with no data used'],
  ['savings jar', 'The dollars added each week', 'The dollars in the jar at the start'], ['plant', 'The centimeters it grows each day', 'Its height on day 0']];
const FIT = { 'hours studied': ['hour studied', 'points'], 'weeks of training': ['week of training', 'push-ups'], 'age of a car in years': ['year older', 'thousand dollars'],
  'temperature in degrees': ['degree warmer', 'drinks'], 'games played': ['game played', 'points'] };

export const FACTS = {
  // An upright line has run 0 (undefined), a flat line has rise 0 (slope 0). Wrong numbers are the slips, never the answer.
  slopespec(t, p) {
    const dx = t.q[0] - t.p[0], dy = t.q[1] - t.p[1], opts = p.answer.options.map(text), say = text(p.ask);
    assert.ok((dx === 0) !== (dy === 0), 'exactly one of the run and the rise is 0');
    assert.equal(ans(p), dx === 0 ? UNDEF : '0');
    COVER[dx === 0 ? 'upright' : 'flat']++;
    assert.ok(opts.includes('0') && opts.includes(UNDEF), `both special answers are offered: ${opts.join(' | ')}`);
    for (const o of opts.filter(v => v !== '0' && v !== UNDEF)) assert.ok([dx || dy, -(dx || dy)].includes(Number(o)), `distractor ${o} is not a slip of the real difference`);
    assert.ok(say.includes(`(${t.p[0]}, ${t.p[1]})`) && say.includes(`(${t.q[0]}, ${t.q[1]})`), `the points are in the question: ${say}`);
  },
  // y = mx + b in a story: the number asked about is either the slope or the starting amount.
  linemean(t, p) {
    const say = text(p.ask), [, m, c] = /y = (\d+)x \+ (\d+)/.exec(say), n = /does the (\d+) stand for/.exec(say)[1], row = MEANS.find(r => say.includes(r[0]));
    assert.ok(row && m !== c);
    assert.equal(ans(p), n === m ? row[1] : row[2]);
    assert.ok(n === m || n === c);
  },
  // Linear when the outputs change by the same amount for every step in x; evaluated here, not read from the generator.
  flineq(t, p) {
    const rule = text(p.expr).replace(/^y = /, '').replace(/\^/g, '**').replace(/(\d)x/g, '$1*x').replace(/(\d)\/x/g, '$1/x');
    const f = x => Function('x', `return ${rule}`)(x), ys = [1, 2, 3, 4, 5].map(f), steps = ys.slice(1).map((y, i) => Math.round((y - ys[i]) * 1e9) / 1e9);
    assert.equal(ans(p), steps.every(d => d === steps[0]) ? 'Linear' : 'Not linear', `rule ${rule}`);
  },
  // The slope of a line of best fit in words: "each unit more of x goes with about |m| more or less".
  scmean(t, p) {
    const say = text(p.ask), [, sign, digits] = /y = (-?)(\d*)x(?: \+ \d+)?/.exec(say), m = `${sign}${digits || 1}`, key = Object.keys(FIT).find(k => say.includes(`compares ${k} (x)`)), [one, unit] = FIT[key];
    assert.equal(ans(p), `Each ${one} goes with about ${Math.abs(m)} ${unit} ${Number(m) > 0 ? 'more' : 'less'}`);
    assert.ok(say.includes(`What does the slope ${m} tell you`), 'the slope asked about is the one in the equation');
  },
};
