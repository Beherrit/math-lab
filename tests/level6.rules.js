// Level 6: the ten strands, the new skill ids, their size limits and the recompute rules for their problems.
// Each rule turns the raw operands a problem exposes in `_t` into the answer the problem must state.
// A rule returns { num }, { frac: [n, d] }, { label } or { ok }, as in level6.test.js.
import { RULES_A } from './level6.rules-a.js';
import { RULES_B } from './level6.rules-b.js';

export const STRANDS = ['Numbers', 'Adding and subtracting', 'Multiplying and dividing', 'Fractions and decimals', 'Ratios and percents', 'Algebra', 'Measurement', 'Shapes and space', 'Data and chance', 'Stories'];
export const NEW_IDS = new Set(['l6unitrate', 'l6isprop', 'l6pctmore', 'l6ratdiv', 'l6order', 'l6rewrite', 'l6realworld', 'l6writeeq', 'l6triangles', 'l6slices', 'l6circback', 'l6sampling', 'l6expprob', 'l6groups']);
export const LIMITS = { l6unitrate: [24, 30, 60], l6isprop: [60, 120, 200], l6pctmore: [1500, 2500, 3000], l6ratdiv: [60, 100, 200], l6order: [30, 60, 120], l6rewrite: [150, 200, 400],
  l6realworld: [200, 500, 1200], l6writeeq: [100, 200, 300], l6triangles: [180, 180, 180], l6slices: [60, 200, 400], l6circback: [200, 600, 1500], l6sampling: [600, 2500, 6000], l6expprob: [60, 1200, 1500], l6groups: [60, 60, 60] };
export const RULES = { ...RULES_A, ...RULES_B };
