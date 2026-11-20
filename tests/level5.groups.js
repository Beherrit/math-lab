// One table per rule, merged from the older kinds and from each group of newer skills (arithmetic and ratios, algebra, data and shapes).
import { REC as REC0, RANGE as RANGE0 } from './level5.recompute.js';
import { SHOWN as SHOWN0, CUSTOM as CUSTOM0 } from './level5.shown.js';
import { REC_NEW, RANGE_NEW } from './level5.new.recompute.js';
import { SHOWN_NEW, CUSTOM_NEW } from './level5.new.shown.js';
import { REC_ALG, SHOWN_ALG, CUSTOM_ALG, RANGE_ALG } from './level5.algebra.js';
import { REC_DATA, SHOWN_DATA, CUSTOM_DATA, RANGE_DATA } from './level5.data.js';

export const REC = { ...REC0, ...REC_NEW, ...REC_ALG, ...REC_DATA };
export const SHOWN = { ...SHOWN0, ...SHOWN_NEW, ...SHOWN_ALG, ...SHOWN_DATA };
export const CUSTOM = { ...CUSTOM0, ...CUSTOM_NEW, ...CUSTOM_ALG, ...CUSTOM_DATA };
export const RANGE = { ...RANGE0, ...RANGE_NEW, ...RANGE_ALG, ...RANGE_DATA };
