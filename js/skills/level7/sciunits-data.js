// Words and numbers for scientific notation in measurements: unit prefixes, "E" notation and the way a size is written.
import { pow, fmt } from '../../util.js';

export const BYTES = [['bytes', 0], ['kilobytes', 3], ['megabytes', 6], ['gigabytes', 9], ['terabytes', 12]];
export const LENGTH = [['nanometers', -9], ['micrometers', -6], ['millimeters', -3], ['meters', 0], ['kilometers', 3]];
export const PREFIX_WORD = { 3: 'a thousand', 6: 'a million', 9: 'a billion', 12: 'a trillion', '-3': 'a thousandth', '-6': 'a millionth', '-9': 'a billionth' };
// 3.5 × 10^6 and the calculator's 3.5E6 (a calculator writes the minus sign as a plain hyphen).
export const sciTxt = (a, e) => `${fmt(a)} × ${pow(10, fmt(e))}`;
export const eTxt = (a, e) => `${fmt(a)}E${e}`;
// Typical sizes: the exponent and the start of a sentence.
export const SIZES = { bytes: [[4, 'A text file is about'], [6, 'A photo is about'], [8, 'A short video is about'], [9, 'A movie file is about'], [10, 'A big game is about']],
  meters: [[-7, 'A virus is about'], [-5, 'A human hair is about'], [-3, 'An ant is about'], [4, 'A marathon is about'], [5, 'A road trip leg is about']] };
// [start, second sentence, unit, question, exponent range of the big amount, exponent range of the small one]
export const CONTEXTS = [['A phone has about', 'One photo takes about', 'bytes', 'How many photos fit?', [10, 11], [6, 7]], ['A country has about', 'A stadium holds about', 'people', 'How many stadiums would it take to seat everyone?', [7, 9], [4, 5]],
  ['A swimming pool holds about', 'A bucket holds about', 'liters', 'How many buckets fill the pool?', [4, 6], [1, 1]]];
