// Skill l4thou: decimals to thousandths, expanded form and close comparisons (5.NBT.3).
import { R, rnd, pick, chance, shuffle, fmt, plain, places, fixed, F, b, way, num, choice, pvChart } from '../../util.js';
import { T, pl, sg, distinctDigits, rndNot } from './helpers.js';

const ONE = ['one', 'tenth', 'hundredth', 'thousandth'], PLACE = ONE.map(u => u + 's');
// Place text for the expanded form: exponent 2 is 100, 0 is 1, -2 is 1/100.
const placeText = e => (e >= 0 ? String(10 ** e) : F(1, 10 ** -e));
const termsOf = (ds, hi) => ds.map((d, i) => ({ d, e: hi - i })).filter(t => t.d);
const expanded = ts => ts.map(t => `${t.d} × ${placeText(t.e)}`).join(' + ');
const valueOf = ts => R(ts.reduce((s, t) => s + t.d * 10 ** t.e, 0));

function tdig(L) {
  const dp = L === 1 ? 2 : 3, ds = distinctDigits(dp + 1), pos = rnd(0, dp), x = R(ds.reduce((s, d, i) => s + d / 10 ** i, 0));
  return T({ ask: `Which digit is in the ${PLACE[pos]} place?`, expr: fixed(x, dp), answer: num(ds[pos]),
    ways: [way('Count the places', [pvChart([{ label: '', x, dp }]), pos === 0 ? 'The ones place is the digit just before the decimal point.' : `Count ${pl(pos, 'digit')} after the point: tenths, then hundredths, then thousandths.`, `The digit in the ${PLACE[pos]} place is ${b(ds[pos])}.`]),
      way('Read it place by place', [ds.slice(0, dp + 1).map((d, i) => pl(d, ONE[i])).join(', '), `The ${PLACE[pos]} place holds ${b(ds[pos])}.`])],
    hint: 'Tenths come first after the point, then hundredths, then thousandths.' }, 'tdig', { x, dp, pos });
}
function tval() {
  const ds = distinctDigits(4), pos = pick([0, 1, 2, 3].filter(i => ds[i])), x = R(ds.reduce((s, d, i) => s + d / 10 ** i, 0)), v = R(ds[pos] / 10 ** pos);
  return T({ ask: `What is the value of the ${ds[pos]} in ${fixed(x, 3)}?`, answer: num(v),
    ways: [way('Name its place', [`The ${ds[pos]} is in the ${PLACE[pos]} place.`, `${ds[pos]} × ${placeText(-pos)} = ${b(fmt(v))}`]),
      way('Say it in words', [`${pl(ds[pos], ONE[pos])} is written as a decimal like this: ${b(fmt(v))}`])],
    hint: 'First say which place the digit is in. Then say how many of that place it is.' }, 'tval', { x, d: ds[pos], pos });
}
// Which decimal is written in expanded form? Distractors put the same digits in the wrong places.
function texp(L) {
  const hi = L === 1 ? 0 : L === 2 ? 1 : 2, lo = L === 1 ? -2 : -3, ds = distinctDigits(hi - lo + 1), ts = termsOf(ds, hi), x = valueOf(ts);
  const wrong = [];
  while (wrong.length < 3) {
    const p = shuffle(ds), s = expanded(termsOf(p, hi));
    if (valueOf(termsOf(p, hi)) !== x && s !== expanded(ts) && !wrong.includes(s)) wrong.push(s);
  }
  const good = expanded(ts);
  return T({ ask: `Which one is ${fixed(x, -lo)} in expanded form?`, answer: choice(good, wrong),
    ways: [way('Give each digit its place', [`Read ${fixed(x, -lo)} from the left: ${ts.map(t => `${t.d} in the ${t.e >= 2 ? 'hundreds' : t.e === 1 ? 'tens' : PLACE[-t.e < 0 ? 0 : -t.e]} place`).join(', ')}.`, `Each digit is multiplied by its place value: ${b(good)}`]),
      way('Add the parts back up', [`${ts.map(t => fmt(R(t.d * 10 ** t.e))).join(' + ')} = ${fmt(x)}`, `So ${fixed(x, -lo)} matches ${b(good)}`])],
    hint: 'Check which place each digit sits in. The digit and its place value must go together.' }, 'texp', { x, lo });
}
function twrite() {
  const es = shuffle([0, -1, -2, -3]).slice(0, rnd(2, 3)).sort((p, q) => q - p), ds = es.map(() => rnd(1, 9)), x = R(es.reduce((s, e, i) => s + ds[i] * 10 ** e, 0)), dp = Math.max(1, -Math.min(...es));
  const words = es.map((e, i) => pl(ds[i], ONE[-e])).join(' + ');
  return T({ ask: 'Write as a decimal.', expr: words, answer: num(x),
    ways: [way('Put each in its place', [pvChart([{ label: '', x, dp }]), 'Every place with nothing in it gets a 0 as a placeholder.', `So it is ${b(fixed(x, dp))}`]),
      way('Add the pieces', [`${es.map((e, i) => fmt(R(ds[i] * 10 ** e))).join(' + ')} = ${b(fixed(x, dp))}`])],
    hint: 'Which place does each piece belong in? Fill the gaps with zeros.' }, 'twrite', { ds, es });
}
function tread() {
  const u = pick([1, 2, 3]), x = R(rnd(11, 999) / 10 ** u), count = R(x * 10 ** u);
  return T({ ask: `How many ${PLACE[u]} are in ${fmt(x)}?`, answer: num(count),
    ways: [way('Count in one whole', [`One whole has ${fmt(10 ** u)} ${PLACE[u]}.`, `${fmt(x)} × ${fmt(10 ** u)} = ${b(fmt(count))}`]),
      way('Slide the point', [`Each ${ONE[u]} is ${F(1, 10 ** u)} of a whole, so the count is the number with its point moved ${pl(u, 'place')} to the right.`, `${fmt(x)} becomes ${b(fmt(count))}`])],
    hint: `How many ${PLACE[u]} fit into one whole?` }, 'tread', { x, u });
}
function cmpPair() {
  const t = pick(['third', 'third', 'zero', 'long']);
  if (t === 'third') { const base = R(rnd(10, 990) / 100), a = rnd(1, 9), c = rndNot(1, 9, [a]), x = R(base + a / 1000), y = R(base + c / 1000); return { x, y, sx: fixed(x, 3), sy: fixed(y, 3) }; }
  if (t === 'zero') { const x = R(rnd(10, 99) / 100); return { x, y: x, sx: fixed(x, 2), sy: fixed(x, 3) }; }
  const x = R(rnd(1, 9) / 10), y = R(x + pick([-1, 1]) * rnd(1, 99) / 1000);
  return y > 0 && y !== x ? { x, y, sx: fixed(x, 1), sy: fixed(y, 3) } : cmpPair();
}
function tcmp() {
  const { x, y, sx, sy } = cmpPair(), sign = x > y ? '>' : x < y ? '<' : '=';
  return T({ ask: 'Which sign makes it true?', expr: `${sx} <span class="blank">?</span> ${sy}`, answer: choice(sg(sign), [], { all: ['&lt;', '=', '&gt;'] }), choiceBig: true,
    ways: [way('Same number of places', [`Add zeros so both have 3 places: ${fixed(x, 3)} and ${fixed(y, 3)}.`, `Now compare them like whole numbers: ${Math.round(x * 1000)} and ${Math.round(y * 1000)}.`, `So ${b(`${sx} ${sg(sign)} ${sy}`)}`]),
      way('Place by place', [pvChart([{ label: 'A', x, dp: 3 }, { label: 'B', x: y, dp: 3 }]), 'Start at the left. The first place where the digits differ decides it. If none differ, they are equal.', `So ${b(`${sx} ${sg(sign)} ${sy}`)}`])],
    hint: 'Add zeros so both numbers have the same number of places, then compare.' }, 'tcmp', { x, y });
}
function tbetween() {
  const lo = R(rnd(100, 899) / 1000), gap = rnd(3, 12), hi = R(lo + gap / 1000), mid = R(lo + rnd(1, gap - 1) / 1000);
  const bad = [R(lo - rnd(1, 3) / 1000), R(hi + rnd(1, 3) / 1000), R(hi + rnd(5, 30) / 1000)];
  if (new Set([mid, ...bad]).size < 4) return tbetween();
  return T({ ask: `Which number is between ${plain(lo)} and ${plain(hi)}?`, answer: choice(plain(mid), bad.map(plain)),
    ways: [way('Same number of places', [`Write them with 3 places: ${fixed(lo, 3)} and ${fixed(hi, 3)}.`, `We need a number bigger than ${fixed(lo, 3)} and smaller than ${fixed(hi, 3)}: ${b(plain(mid))}`]),
      way('Test each choice', [[mid, ...bad].map(o => `${plain(o)} is ${o <= lo ? 'too small' : o >= hi ? 'too big' : 'in between'}`).join('; '), `Only ${b(plain(mid))} fits.`])],
    hint: 'Give every number 3 decimal places, then see which one sits between the other two.' }, 'tbetween', { lo, hi });
}
function texpr(L) {
  const pool = L === 2 ? [[2, 0, -1, -3], [1, 0, -2], [2, 1, -1, -2], [2, -1, -2, -3], [1, -1, -3]] : [[2, 0, -2, -3], [1, -2, -3], [2, -3], [2, 1, -2], [1, 0, -3]];
  const es = pick(pool), ds = es.map(() => rnd(1, 9)), ts = es.map((e, i) => ({ d: ds[i], e })), x = valueOf(ts), dp = Math.max(0, -Math.min(...es));
  return T({ ask: 'Write as one number.', expr: expanded(ts), exprSmall: true, answer: num(x),
    ways: [way('Value of each piece', [...ts.map(t => `${t.d} × ${placeText(t.e)} = ${fmt(R(t.d * 10 ** t.e))}`), `Add them: ${ts.map(t => fmt(R(t.d * 10 ** t.e))).join(' + ')} = ${b(fmt(x))}`]),
      way('Place value chart', [pvChart([{ label: '', x, dp }]), 'A place with no piece gets a 0.', `The number is ${b(fmt(x))}`])],
    hint: 'Work out each piece, and remember a place with no piece holds a 0.' }, 'texpr', { ds, es });
}
function tstep() {
  const u = pick([0.1, 0.01, 0.001]), pos = Math.round(-Math.log10(u)), more = chance(0.5);
  let x = rnd(1000, 9999);
  if (chance(0.5)) { const s = String(x).split(''); s[s.length - 4 + pos] = more ? '9' : '0'; x = Number(s.join('')); }
  x = R(x / 1000);
  if (!more && x < u) return tstep();
  const ans = R(more ? x + u : x - u), d = Number(fixed(x, 3).replace('.', '')[pos]);
  return T({ ask: `What is ${fmt(u)} ${more ? 'more' : 'less'} than ${fixed(x, 3)}?`, answer: num(ans),
    ways: [way('Line up the places', [`${fixed(x, 3)} ${more ? '+' : '−'} ${fixed(u, 3)} = ${b(fixed(ans, 3))}`]),
      way('Look at one place', [`Only the ${PLACE[pos]} place changes, unless it has to ${more ? 'carry' : 'borrow'}.`, `That digit is ${d}${(more && d === 9) || (!more && d === 0) ? `, so it ${more ? 'carries' : 'borrows'} into the next place` : ''}.`, `${fixed(x, 3)} becomes ${b(fixed(ans, 3))}`])],
    hint: `Which place is ${fmt(u)}? Only that place goes ${more ? 'up' : 'down'} by one, with carrying or borrowing if needed.` }, 'tstep', { x, u, more });
}
function tratio() {
  const d = rnd(2, 9), i = rnd(-1, 1), j = rnd(-3, i - 1), A = R(d * 10 ** i), B = R(d * 10 ** j), ans = 10 ** (i - j);
  return T({ ask: `The ${d} in ${fmt(A)} is worth how many times the ${d} in ${fmt(B)}?`, answer: num(ans),
    ways: [way('Count the places', [`Going from ${fmt(B)} to ${fmt(A)}, the ${d} moves ${pl(i - j, 'place')} to the left.`, `Each place left is 10 times bigger: ${Array(i - j).fill('10').join(' × ')} = ${b(fmt(ans))}`]),
      way('Divide the values', [`${fmt(A)} ÷ ${fmt(B)} = ${b(fmt(ans))}`])],
    hint: 'How many places apart are the two digits? Each place left is 10 times bigger.' }, 'tratio', { d, A, B });
}
function torder() {
  let ds; do ds = distinctDigits(3); while (ds.includes(0));
  const [p, q, r] = ds, pool = [`0.${p}`, `0.${p}${q}`, `0.${p}${q}${r}`, `0.${q}`, `0.${q}${p}`, `0.0${p}${q}`, `0.${q}${r}${p}`, `0.${p}0${q}`];
  const vals = shuffle([...new Set(pool.map(Number))]).slice(0, 4), up = chance(0.5), good = vals.slice().sort((m, n) => (up ? m - n : n - m)), txt = xs => xs.map(v => plain(v)).join(', ');
  const wrongs = new Set();
  for (let t = 0; t < 60 && wrongs.size < 3; t++) { const s = txt(shuffle(vals)); if (s !== txt(good)) wrongs.add(s); }
  return T({ ask: `Which list is in order from ${up ? 'least to greatest' : 'greatest to least'}?`, answer: choice(txt(good), [...wrongs]),
    ways: [way('Same number of places', [`Give every number 3 places: ${good.map(v => fixed(v, 3)).join(', ')}.`, `Compare them as whole numbers: ${good.map(v => Math.round(v * 1000)).join(', ')}.`, `The order from ${up ? 'least to greatest' : 'greatest to least'} is ${b(txt(good))}`]),
      way('Tenths first', ['Compare the tenths. If they tie, compare the hundredths, then the thousandths.', 'A number with more digits is not always bigger.', `So the order is ${b(txt(good))}`])],
    hint: 'Give every number the same number of places, then compare them like whole numbers.' }, 'torder', { vals, up });
}
function tdig2() {
  for (let t = 0; t < 200; t++) {
    const gt = chance(0.5), pos = rnd(0, 2), B = [rnd(0, 9), rnd(0, 9), rnd(0, 9)], X = B.map(d => (chance(0.6) ? d : rnd(0, 9))), whole = rnd(1, 9);
    const val = d => { const c = X.slice(); c[pos] = d; return R(whole + c[0] / 10 + c[1] / 100 + c[2] / 1000); };
    const bound = R(whole + B[0] / 10 + B[1] / 100 + B[2] / 1000), ok = d => (gt ? val(d) > bound : val(d) < bound);
    const good = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(ok), d = gt ? good[0] : good[good.length - 1];
    if (!good.length || d < 1 || d > 8 || (gt ? good.length !== 10 - d : good.length !== d + 1)) continue;
    const shown = X.map((v, i) => (i === pos ? '<span class="blank">?</span>' : v)), prev = gt ? d - 1 : d + 1;
    return T({ ask: `What is the ${gt ? 'smallest' : 'largest'} digit that makes this true?`, expr: `${whole}.${shown.join('')} ${sg(gt ? '>' : '<')} ${fixed(bound, 3)}`, answer: num(d),
      ways: [way('Try the digits', [`With ${prev} in the box the number is ${fixed(val(prev), 3)}, which is not ${gt ? 'greater' : 'less'} than ${fixed(bound, 3)}.`, `With ${d} it is ${fixed(val(d), 3)}, which is ${gt ? 'greater' : 'less'}, so ${b(d)} is the ${gt ? 'smallest' : 'largest'} digit that works.`]),
        way('Compare place by place', [`Compare ${fixed(bound, 3)} with the number one place at a time from the left.`, `The box is the ${PLACE[pos + 1]} place. ${gt ? 'Each bigger digit makes the number bigger' : 'Each smaller digit makes the number smaller'}, and ${d} is the edge where it first works: ${b(d)}.`])],
      hint: 'Try the digits one at a time. Is the number bigger or smaller than the other one?' }, 'tdig2', { whole, X, pos, B, gt });
  }
  return tdig2();
}
function tnear() {
  const t = R(rnd(1, 9) / 10), offs = shuffle(Array.from({ length: 30 }, (_, i) => i + 1)).slice(0, 4).map(o => o * pick([-1, 1]));
  const vals = offs.map(o => R(t + o / 1000)), best = vals[offs.map(Math.abs).indexOf(Math.min(...offs.map(Math.abs)))];
  return T({ ask: `Which number is closest to ${fmt(t)}?`, answer: choice(plain(best), vals.filter(v => v !== best).map(plain)),
    ways: [way('Find each gap', [...vals.map(v => `${plain(v)} is ${fmt(R(Math.abs(v - t)))} away from ${fmt(t)}`), `The smallest gap belongs to ${b(plain(best))}`]),
      way('Same places', [`Write every number with 3 places: ${vals.map(v => fixed(v, 3)).join(', ')} and ${fixed(t, 3)}.`, `${b(plain(best))} is nearest to ${fixed(t, 3)}.`])],
    hint: 'How far is each number from the target? The smallest gap wins.' }, 'tnear', { t, vals });
}
export function genThousandths(L) {
  if (L === 1) return pick([() => tdig(1), tval, () => texp(1), twrite, tread])();
  if (L === 2) return pick([tcmp, tbetween, () => texpr(2), tstep, () => texp(2)])();
  return pick([tratio, torder, tdig2, () => texpr(3), tnear, () => texp(3)])();
}
