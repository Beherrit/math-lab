// Level 1, the ten added skills: independent fact tables, the way each answer is recomputed from the raw operands in p._t,
// the largest number a learner should meet at each step, and which operands must be printed when there is no picture.
import assert from 'node:assert/strict';
import { sum, evenOdd } from './level1.util.js';

export const STRANDS = ['Numbers', 'Adding and subtracting', 'Multiplying and dividing', 'Fractions and decimals', 'Ratios and percents', 'Algebra', 'Measurement', 'Shapes and space', 'Data and chance', 'Stories'];
export const FLAT_T = { triangle: { sides: 3 }, square: { sides: 4, equal: true }, rectangle: { sides: 4, equal: false }, pentagon: { sides: 5 }, hexagon: { sides: 6 }, octagon: { sides: 8 }, circle: { sides: 0 } };
export const SOLID_T = { cube: { faces: 6, corners: 8, square: true }, 'rectangular prism': { faces: 6, corners: 8, square: false }, cylinder: { faces: 2, corners: 0 }, cone: { faces: 1, corners: 1 }, sphere: { faces: 0, corners: 0 }, pyramid: { faces: 5, corners: 5 } };
export const OBJECT_T = { 'a basketball': 'sphere', 'a globe': 'sphere', 'a soup can': 'cylinder', 'a drum': 'cylinder', 'a dice': 'cube', 'a sugar cube': 'cube', 'a party hat': 'cone', 'an ice cream cone': 'cone', 'a shoebox': 'rectangular prism', 'a cereal box': 'rectangular prism' };
export const UNIT_T = { 'metric the length of a pencil': 'centimeters', 'metric the width of a phone': 'centimeters', 'metric the length of a paper clip': 'centimeters', 'metric the length of a swimming pool': 'meters', 'metric the height of a classroom door': 'meters',
  'metric a football field': 'meters', 'metric a bus trip to another city': 'kilometers', 'metric a bike ride to a friend in another town': 'kilometers', 'customary the length of a pencil': 'inches', 'customary the width of a phone': 'inches',
  'customary the length of a bedroom': 'feet', 'customary the height of a basketball hoop': 'feet', 'customary a road trip to another state': 'miles', 'customary a hike across a national park': 'miles' };
const SHARES = { halves: 2, thirds: 3, quarters: 4 };
const SHADED = { '1/2': 'one half', '1/3': 'one third', '1/4': 'one quarter', '2/3': 'two thirds', '3/4': 'three quarters' };
const uniqueExtreme = (t, which) => {
  const v = which === 'most' ? Math.max(...t.vals) : Math.min(...t.vals);
  assert.equal(t.vals.filter(x => x === v).length, 1, `the ${which} must be one choice only: ${t.vals}`);
  return t.names[t.vals.indexOf(v)];
};

export const CALC_NEW = {
  parity: t => evenOdd(sum(t.xs)), rule: t => evenOdd(t.p.filter(x => x === 'odd').length), rem: t => t.a % t.b,
  tensum: t => sum(t.xs.map(x => x - x % 10)), bal: t => t.total - t.known, subgap: t => t.from - (t.c + t.d), addmiss: t => t.total - sum(t.others), len: t => t.to - t.from,
  parts: t => t.parts, arrcount: t => (t.what === 'rows' ? t.r : t.c), sharename: t => Object.keys(SHARES).find(k => SHARES[k] === t.parts),
  shaded: t => SHADED[`${t.k}/${t.parts}`], leftover: t => t.parts - t.eaten, wholes: t => t.parts * t.wholes,
  gval: t => t.vals[t.i], gsum: t => sum(t.idx.map(i => t.vals[i])), gdiff: t => t.vals[t.i] - t.vals[t.j], grange: t => Math.max(...t.vals) - Math.min(...t.vals), gext: t => uniqueExtreme(t, t.which),
  shapefact: t => FLAT_T[t.shape].sides, solidfact: t => SOLID_T[t.shape][t.prop], shapesum: t => sum(t.shapes.map(s => FLAT_T[s].sides)), shapediff: t => SOLID_T[t.a][t.prop] - SOLID_T[t.b][t.prop],
  name: t => t.shape, object: t => OBJECT_T[t.item], bigger: t => (SHARES[t.a] < SHARES[t.c] ? t.a : t.c),
};
export const LIMIT_NEW = { l1count: [100, 300, 1000], l1evenodd: [20, 100, 1000], l1mental: [100, 1000, 1000], l1equal: [20, 20, 100], l1addmany: [99, 200, 400],
  l1array: [25, 25, 25], l1shapes: [8, 8, 30], l1shares: [4, 4, 8], l1length: [20, 100, 100], l1graph: [30, 50, 200] };
// With no picture, these operands are what the child reads, so they must appear in the question (1 and 2 may be words such as "next" or "two").
export const PRINTED = { add: t => t.xs, sub: t => [t.a, t.b], mul: t => [t.a, t.b], div: t => [t.a], bal: t => [t.known], subgap: t => [t.from, t.c, t.d], addmiss: t => [t.total, ...t.others], tensum: t => t.xs, rem: t => [t.a], len: t => [t.from, t.to], leftover: t => [t.eaten] };
