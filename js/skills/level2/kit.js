// Small building blocks shared by the newer level 2 skills: rounding, picture-only markers, True or False answers, number choices.
import { fmt, choice, pick } from '../../util.js';

export const near = (n, p) => Math.round(n / p) * p;
// A hidden comment that tells repeats apart when the numbers only appear in the picture.
export const mark = (ask, ...parts) => `${ask}<!--${parts.join(' ')}-->`;
export const TF = { all: ['True', 'False'] };
export const yesNo = ok => choice(ok ? 'True' : 'False', [], TF);
// A choice of numbers: the right one and some slips, written with thousands separators.
export const numChoice = (right, wrongs) => choice(fmt(right), [...new Set(wrongs)].filter(w => w >= 0 && w !== right).map(fmt));
// n written as hundreds, tens and ones: 348 -> [300, 40, 8].
export const hto = n => [Math.floor(n / 100) * 100, (Math.floor(n / 10) % 10) * 10, n % 10];
// Picks an item that is not `not`.
export function pickOther(list, not) { let x; do { x = pick(list); } while (x === not); return x; }
// "3:05": a clock time written the usual way (hours 1 to 12).
export const clockText = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
// Minutes since 12:00 turned into a clock time.
export const atMinutes = x => clockText(((Math.floor(x / 60) + 11) % 12) + 1, x % 60);
