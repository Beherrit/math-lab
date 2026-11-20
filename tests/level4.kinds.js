// All question kinds of the new Level 4 skills: how to recompute the answer, what the child must see, and ranges per step.
import { NUM_KINDS } from './level4.kinds-num.js';
import { FRAC_KINDS } from './level4.kinds-frac.js';
import { OTHER_KINDS } from './level4.kinds-other.js';

export const KINDS = { ...NUM_KINDS, ...FRAC_KINDS, ...OTHER_KINDS };
