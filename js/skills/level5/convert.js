// Converting between fractions, decimals and percents.
import { R, rnd, pick, chance, shuffle, gcd, plain, places, fmt, F, b, way, num, frac, choice, table } from '../../util.js';
import { T } from './helpers.js';

const POOL1 = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10]];
const POOL3 = [[1, 8], [3, 8], [5, 8], [7, 8], [5, 4], [3, 2], [7, 4], [6, 5], [9, 5], [11, 10], [9, 8], [1, 200], [3, 200], [1, 40], [3, 40]];
function pickVal(L) {
  if (L !== 2) return pick(L === 1 ? POOL1 : POOL3);
  const d = pick([20, 25, 50, 100, 20, 25]); let n; do n = rnd(1, d - 1); while (gcd(n, d) !== 1);
  return [n, d];
}
const dv = (n, d) => R(n / d), pc = (n, d) => R(100 * n / d);
const SHOW = { frac: (n, d) => F(n, d), dec: (n, d) => plain(dv(n, d)), pct: (n, d) => fmt(pc(n, d)) + '%' };
const NAME = { frac: 'a fraction', dec: 'a decimal', pct: 'a percent' };
const tenPow = d => [10, 100, 1000].find(t => t % d === 0);
const three = (n, d) => table(['fraction', 'decimal', 'percent'], [[SHOW.frac(n, d), SHOW.dec(n, d), SHOW.pct(n, d)]]);
// One lot of 1/d as a percent, then n lots.
const unitWay = (n, d, back) => way('Use a piece you know', back
  ? [`${fmt(R(100 / d))}% fits into 100% exactly ${d} times, so ${fmt(R(100 / d))}% = ${F(1, d)}.`, `${fmt(pc(n, d))}% is ${n} lot${n > 1 ? 's' : ''} of that: ${b(F(n, d))}`]
  : [`The whole is 100%. ${F(1, d)} of it is 100 ÷ ${d} = ${fmt(R(100 / d))}%.`, `${F(n, d)} is ${n} lot${n > 1 ? 's' : ''} of that: ${n} × ${fmt(R(100 / d))} = ${b(fmt(pc(n, d)) + '%')}`]);
const ROUTES = {
  'frac>dec': (n, d) => [way('Make the bottom 10, 100 or 1,000', [tenPow(d) === d ? `The bottom is already ${fmt(d)}.` : `Multiply top and bottom by ${tenPow(d) / d}: ${F(n, d)} = ${F(n * tenPow(d) / d, fmt(tenPow(d)))}`, `Read it with place value: ${b(plain(dv(n, d)))}`]),
    way('Divide the top by the bottom', ['A fraction is a division.', `${n} ÷ ${d} = ${b(plain(dv(n, d)))}`])],
  'frac>pct': (n, d) => [100 % d === 0 ? way('Make the bottom 100', [`Percent means “out of 100”. Multiply top and bottom by ${100 / d}: ${F(n, d)} = ${F(n * 100 / d, 100)}`, `${n * 100 / d} out of 100 is ${b(n * 100 / d + '%')}`])
    : way('Decimal first', [`${n} ÷ ${d} = ${plain(dv(n, d))}`, `Multiply by 100 to count per hundred: ${plain(dv(n, d))} × 100 = ${b(fmt(pc(n, d)) + '%')}`]), unitWay(n, d, false)],
  'dec>pct': (n, d) => [way('Multiply by 100', ['Percent means “per hundred”, so count how many hundredths there are.', `${plain(dv(n, d))} × 100 = ${b(fmt(pc(n, d)) + '%')} (the digits slide two places to the left)`]),
    way('Read the hundredths', [`The second place after the point is hundredths. ${plain(dv(n, d))} is ${fmt(pc(n, d))} hundredths.`, `${fmt(pc(n, d))} hundredths = ${fmt(pc(n, d))} out of 100 = ${b(fmt(pc(n, d)) + '%')}`])],
  'dec>frac': (n, d) => { const t = 10 ** places(dv(n, d)), top = R(dv(n, d) * t), g = gcd(top, t);
    return [way('Read the place value', [`${plain(dv(n, d))} has ${places(dv(n, d))} decimal place${t > 10 ? 's' : ''}, so it is ${F(fmt(top), fmt(t))}.`, g > 1 ? `Simplify: divide top and bottom by ${g}. ${b(F(n, d))}` : `It cannot be simplified: ${b(F(n, d))}`]),
      way('Check by dividing', [`A fraction is a division: ${n} ÷ ${d} = ${plain(dv(n, d))}`, three(n, d)])]; },
  'pct>dec': (n, d) => [way('Divide by 100', ['Percent means “per hundred”.', `${fmt(pc(n, d))} ÷ 100 = ${b(plain(dv(n, d)))} (the digits slide two places to the right)`]),
    way('Write it over 100 first', [`${fmt(pc(n, d))}% = ${F(fmt(pc(n, d)), 100)}, which is ${fmt(pc(n, d))} hundredths.`, `As a decimal: ${b(plain(dv(n, d)))}`])],
  'pct>frac': (n, d) => { const p = pc(n, d), m = 10 ** places(p), g = gcd(R(p * m), 100 * m);
    return [way('Write it over 100, then simplify', [`${fmt(p)}% = ${F(fmt(p), 100)}${m > 1 ? ` = ${F(fmt(R(p * m)), fmt(100 * m))} (no decimals inside a fraction)` : ''}`, g > 1 ? `Divide top and bottom by ${g}: ${b(F(n, d))}` : `It cannot be simplified: ${b(F(n, d))}`]), unitWay(n, d, true)]; },
};
const HINT = { 'frac>dec': 'A fraction is the top divided by the bottom.', 'frac>pct': 'Percent means out of 100. Can the bottom become 100?', 'dec>pct': 'How many hundredths is it?', 'dec>frac': 'Which place does the last digit sit in: tenths, hundredths or thousandths? Tip: the tidiest fraction is in simplest form.', 'pct>dec': 'Percent means per hundred, so divide by 100.', 'pct>frac': 'Percent means out of 100. Write it over 100 first. Tip: the tidiest fraction is in simplest form.' };
function convertOne(L) {
  const [n, d] = pickVal(L), from = pick(['frac', 'dec', 'pct']), to = pick(['frac', 'dec', 'pct'].filter(x => x !== from)), key = `${from}>${to}`;
  const answer = to === 'frac' ? frac(n, d) : num(to === 'dec' ? dv(n, d) : pc(n, d));
  return T({ ask: `Write this as ${b(NAME[to])}.`, expr: SHOW[from](n, d), answer, suffix: to === 'pct' ? '%' : '', ways: ROUTES[key](n, d), hint: HINT[key] }, 'fdp', { n, d, from, to });
}
const CMP = [...POOL1, [1, 8], [3, 8], [5, 8], [7, 8], [3, 20], [7, 20], [9, 20], [11, 20], [13, 20], [17, 20], [9, 25], [16, 25], [13, 50], [33, 50]];
function compareForms() {
  let vals; do vals = shuffle(CMP).slice(0, 3).sort((x, y) => x[0] / x[1] - y[0] / y[1]); while (vals[2][0] / vals[2][1] - vals[0][0] / vals[0][1] > 0.3);
  const forms = shuffle(['frac', 'dec', 'pct']), opts = vals.map(([n, d], i) => ({ s: SHOW[forms[i]](n, d), v: dv(n, d), n, d })), want = chance(0.5) ? 'max' : 'min';
  const win = want === 'max' ? opts[2] : opts[0], mix = shuffle(opts);
  return T({ ask: `Which is the ${b(want === 'max' ? 'greatest' : 'least')}?`, answer: choice(win.s, mix.filter(o => o !== win).map(o => o.s)), choiceBig: true,
    ways: [way('Turn them all into percents', [table(['number', 'as a percent'], mix.map(o => [o.s, fmt(pc(o.n, o.d)) + '%'])), `Now they are all “out of 100”, so just compare: ${b(win.s)} is the ${want === 'max' ? 'greatest' : 'least'}.`]),
      way('Turn them all into decimals', [table(['number', 'as a decimal'], mix.map(o => [o.s, plain(o.v)])), `Line up the decimal places and compare: ${b(win.s)}.`])],
    hint: 'You can only compare them fairly in the same form. Pick one form and change all three.' }, 'fdpCmp', { opts: opts.map(o => ({ s: o.s, v: o.v })), want });
}
export function genFdp(L) {
  return L === 3 && chance(0.35) ? compareForms() : convertOne(L);
}
