// Shared bits for the proportional-relationship skills: shop contexts, cost tables, ratio lines.
import { R, shuffle, fmt, table } from '../../util.js';

export const SHOPS = ['tickets', 'kilograms of apples', 'photo prints', 'songs', 'T-shirts', 'notebooks'];
export const xsFrom = (pool, n = 4) => shuffle(pool).slice(0, n).sort((p, q) => p - q);
export const costTable = (x, xs, ys) => table([x, ...xs.map(fmt)], [['cost ($)', ...ys.map(fmt)]]);
// y ÷ x for each column; a repeating answer is rounded to 2 places and marked with ≈.
export const ratioLines = (xs, ys) => xs.map((x, i) => `${fmt(ys[i])} ÷ ${fmt(x)} ${Number.isInteger(R(ys[i] / x * 100)) ? '=' : '≈'} ${fmt(+(ys[i] / x).toFixed(2))}`).join('<br>');
