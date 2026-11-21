// More level 7 story problems: comparing rates, shadows and similar triangles, the longest rod in a box, and sizes in scientific notation.
import { R, rnd, pick, b, k, way, pow, F, fmt, num } from '../../util.js';
import { sqrt, count } from './h.js';
import { sciTxt } from './sciunits-data.js';

const RATES = [['A printer in the school office', 'pages', 'minute', 'The library printer'], ['A runner on the track team', 'meters', 'second', 'A runner on the soccer team'], ['A tap in the kitchen', 'liters', 'minute', 'A tap in the garden']];
export function rateCompareStory(L = 2) {
  const [one, unit, time, two] = pick(RATES), mA = rnd(3, 8), dm = rnd(1, L === 1 ? 2 : 4), mB = mA + dm, t = rnd(2, 6) + (L > 1 ? 2 : 0);
  return { story: `${one} makes ${k(`${mA * t} ${unit} in ${count(t, time)}`)}. ${two} makes ${k(`${mB} ${unit} every ${time}`)}.`, ask: `How many more ${unit} per ${time} does ${two.toLowerCase()} make?`, answer: num(dm), op: 'multi', hint: 'Find the unit rate of the first one by dividing. Then compare it with the second.', _t: { k: 'propcmp', shape: 'cmp-diff', forms: [{ f: 'words', amt: mA * t, per: t, c: 0 }, { f: 'words', m: mB, c: 0 }], ask: 'diff' },
    ways: [way('Unit rates, then subtract', [`First: ${mA * t} ÷ ${t} = ${mA} ${unit} per ${time}. Second: ${mB} ${unit} per ${time}.`, `${mB} − ${mA} = ${b(dm)}.`]), way(`Compare for one ${time}`, [`In 1 ${time} the first makes ${mA} and the second makes ${mB}.`, `The gap is ${mB} − ${mA} = ${b(dm)}.`])],
    read: { find: `How much faster the second one is, per ${time}.`, know: [`first: ${mA * t} ${unit} in ${t} ${time}s`, `second: ${mB} ${unit} per ${time}`], clue: '“Per” means one unit. The first rate has to be found by dividing before the two can be compared.', plan: `${mB} − (${mA * t} ÷ ${t})` } };
}
export function shadowStory(L = 2) {
  const p = rnd(2, 5), s = rnd(2, 4), m = rnd(2, L === 3 ? 12 : 8), tall = p * m, S = s * m, thing = pick(['tree', 'flagpole', 'lamp post', 'apartment building']);
  return { story: `A ${k(`${p} meter`)} pole casts a shadow ${k(`${s} meters`)} long. At the same moment a ${thing} casts a shadow ${k(`${S} meters`)} long.`, ask: `How tall is the ${thing}, in meters?`, answer: num(tall), op: 'multi', hint: 'The sun makes two similar triangles. Matching sides are in the same ratio.', _t: { k: 'sim', shape: 'shadow', p, s, S },
    ways: [way('Scale factor', [`The shadows are ${s} m and ${S} m, so the scale factor is ${S} ÷ ${s} = ${m}.`, `The ${thing} is ${m} times as tall as the pole: ${p} × ${m} = ${b(tall)}.`]), way('Equal ratios', [`height ÷ shadow matches: ${F(p, s)} = ${F('?', S)}.`, `? = ${p} × ${S} ÷ ${s} = ${b(tall)}.`])],
    read: { find: `The height of the ${thing}.`, know: [`pole ${p} m, shadow ${s} m`, `${thing} shadow ${S} m`], clue: 'Objects and shadows at the same time make similar triangles, so their sides are in the same ratio.', plan: `${p} × ${S} ÷ ${s}` } };
}
const BOX = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13]];
export function rodStory() {
  const [x, y, z, D] = pick(BOX), thing = pick(['a straw', 'a rod', 'a pencil']);
  return { story: `A box is ${k(`${x} ${x === 1 ? 'inch' : 'inches'}`)} long, ${k(`${y} inches`)} wide and ${k(`${z} inches`)} tall inside. ${thing[0].toUpperCase()}${thing.slice(1)} is pushed in so that it touches opposite corners.`, ask: 'What is the longest that it can be, in inches?', answer: num(D), op: 'multi', hint: 'The longest straight line goes from a bottom corner to the opposite top corner. Use two right triangles, or add three squares.', _t: { k: 'pythreal', shape: 'box-rod', dims: [x, y, z] },
    ways: [way('Three squares', [`${pow(x, 2)} + ${pow(y, 2)} + ${pow(z, 2)} = ${x * x} + ${y * y} + ${z * z} = ${D * D}.`, `${sqrt(D * D)} = ${b(D)} inches.`]), way('Two right triangles', [`Floor diagonal squared: ${x * x} + ${y * y} = ${x * x + y * y}.`, `Then ${x * x + y * y} + ${z * z} = ${D * D}, and ${sqrt(D * D)} = ${b(D)} inches.`])],
    read: { find: 'The longest straight line inside the box.', know: [`length ${x}`, `width ${y}`, `height ${z}`], clue: 'The longest line goes corner to corner through the middle of the box: a diagonal in three directions.', plan: `√(${x}² + ${y}² + ${z}²)` } };
}
export function sizeStory() {
  const n = rnd(3, 7), c = pick([2, 4, 5]), q = pick([2, 3, 4]), a = c * q, v = q * 100;
  if (a >= 10) return null;
  const [one, two, unit] = pick([['A phone holds about', 'One song takes about', 'bytes'], ['A stadium seats about', 'One row seats about', 'people'], ['A tank holds about', 'One bucket holds about', 'liters']]);
  return { story: `${one} ${k(`${sciTxt(a, n + 2)} ${unit}`)}. ${two} ${k(`${sciTxt(c, n)} ${unit}`)}.`, ask: 'How many of the smaller amount fit in the bigger one?', answer: num(v), op: 'multi', hint: 'To find how many times as many, divide. Divide the front numbers and subtract the exponents.', _t: { k: 'sciu', shape: 'times-as', a, m: n + 2, c, n },
    ways: [way('Front numbers, then powers of 10', [`${a} ÷ ${c} = ${q}, and ${pow(10, n + 2)} ÷ ${pow(10, n)} = ${pow(10, 2)}.`, `${q} × 100 = ${b(fmt(v))}.`]), way('Write them out', [`${fmt(R(a * 10 ** (n + 2)))} ÷ ${fmt(c * 10 ** n)}.`, `Cancel the same zeros: ${a} ÷ ${c} × 100 = ${b(fmt(v))}.`])],
    read: { find: 'How many times the small amount fits in the big one.', know: [`big: ${sciTxt(a, n + 2)}`, `small: ${sciTxt(c, n)}`], clue: '“How many fit” means divide the big amount by the small one.', plan: `(${a} × 10^${n + 2}) ÷ (${c} × 10^${n})` } };
}
