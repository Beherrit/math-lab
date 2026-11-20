import { R, rnd, pick, chance, fmt, plain, places, fixed, money, b, k, way, num, choice, pvChart, numberLine, placeName } from '../../util.js';
const P10 = k2 => 10 ** k2;
function moveWays(x, k2, mult, expShown) {
const ans = R(mult ? x * P10(k2) : x / P10(k2));
const dir = mult ? 'left' : 'right';
const pt = mult ? 'right' : 'left';
const ways = [
way('Slide the digits', [`${mult ? 'Multiplying' : 'Dividing'} by ${fmt(P10(k2))} slides every digit ${b(k2 + ' place' + (k2 > 1 ? 's' : ''))} to the ${dir}.`,
pvChart([{ label: 'before', x }, { label: 'after', x: ans }]), `So the answer is ${b(fmt(ans))}.`]),
way('Move the decimal point', [`${fmt(P10(k2))} has ${b(k2 + ' zero' + (k2 > 1 ? 's' : ''))}, so the decimal point hops ${k2} place${k2 > 1 ? 's' : ''} to the ${pt}.`,
`${plain(x)} → ${b(plain(ans))}${places(x) === 0 && mult ? ` (add zeros to fill the empty spots)` : ''}`]),
];
if (expShown) ways.unshift(way('Read the exponent', [`10<sup>${k2}</sup> means ${Array(k2).fill('10').join(' × ')} = ${fmt(P10(k2))}.`, `So this is the same as ${plain(x)} ${mult ? '×' : '÷'} ${fmt(P10(k2))}.`]));
return { ans, ways };
}
export function genPV(L) {
if (L === 1) {
const t = pick(['mul', 'mul', 'div', 'pow']);
if (t === 'pow') {
const e = rnd(2, 5);
return { ask: 'What is the value?', expr: `10<sup>${e}</sup>`, answer: num(P10(e)),
ways: [way('Count the tens', [`The little ${e} means: multiply ${e} tens together.`, `${Array(e).fill('10').join(' × ')} = ${b(fmt(P10(e)))}`]),
way('Count the zeros', [`The exponent tells you how many zeros come after the 1.`, `${e} zeros: ${b(fmt(P10(e)))}`])],
hint: 'The little number tells how many 10s to multiply.' };
}
const k2 = rnd(1, 3);
const x = t === 'mul' ? rnd(2, 99) * pick([1, 1, 10]) : rnd(2, 99) * P10(k2);
const { ans, ways } = moveWays(x, k2, t === 'mul');
return { ask: 'Solve.', expr: `${fmt(x)} ${t === 'mul' ? '×' : '÷'} ${fmt(P10(k2))}`, answer: num(ans), ways, hint: `Count the zeros in ${fmt(P10(k2))}. That's how many places the digits move.` };
}
const k2 = rnd(1, 3);
if (L === 3 && chance(0.4)) {
const d = rnd(2, 9), e1 = rnd(-2, 3); const diff = pick([1, 2, -1, -2]); const e2 = e1 - diff;
if (e2 < -3 || e2 > 3) return genPV(3);
const A = R(d * 10 ** e1), B2 = R(d * 10 ** e2);
const c = diff > 0 ? `${fmt(10 ** diff)} times` : `${diff === -1 ? '1/10' : '1/100'} of`;
return {
ask: `The ${d} in ${fmt(A)} is ____ the ${d} in ${fmt(B2)}.`,
answer: choice(c, ['10 times', '100 times', '1/10 of', '1/100 of'].filter(x => x !== c)),
ways: [way('Name the places', [`In ${fmt(A)}, the ${d} is in the ${b(placeName(e1))} place.`, `In ${fmt(B2)}, the ${d} is in the ${b(placeName(e2))} place.`,
diff > 0 ? `Each place to the left is 10 times bigger. That's ${Math.abs(diff)} place${Math.abs(diff) > 1 ? 's' : ''} left, so ${b(c)}.` : `Each place to the right is 1/10 as big. That's ${Math.abs(diff)} place${Math.abs(diff) > 1 ? 's' : ''} right, so ${b(c)}.`]),
way('Compare the values', [`The ${d} in ${fmt(A)} is worth ${fmt(A)}. The ${d} in ${fmt(B2)} is worth ${fmt(B2)}.`, diff > 0 ? `${fmt(B2)} × ${fmt(10 ** diff)} = ${fmt(A)}` : `${fmt(B2)} ÷ ${fmt(10 ** -diff)} = ${fmt(A)}`])],
hint: 'Which place is each digit in? Left is bigger, right is smaller.',
};
}
const mult = chance(0.5);
const x = mult ? R(rnd(1, 999) / pick([10, 100])) : R(rnd(2, 999) / pick([1, 10]));
const exp = L === 3;
const { ans, ways } = moveWays(x, k2, mult, exp);
if (places(ans) > 5) return genPV(L);
return { ask: 'Solve.', expr: `${fmt(x)} ${mult ? '×' : '÷'} ${exp ? `10<sup>${k2}</sup>` : fmt(P10(k2))}`, answer: num(ans), ways,
hint: mult ? 'Multiplying by 10s makes the number bigger: digits slide left.' : 'Dividing by 10s makes the number smaller: digits slide right.' };
}
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const w999 = n => n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '') : ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + w999(n % 100) : '');
const UNIT = ['', 'tenth', 'hundredth', 'thousandth'];
export function decWords(x) {
const p = places(x); const s = fixed(x, p); const [ip, fp = ''] = s.split('.');
const whole = +ip, f = fp ? +fp : 0;
const fw = f ? `${w999(f)} ${UNIT[p]}${f === 1 ? '' : 's'}` : '';
if (!whole) return fw || 'zero';
return fw ? `${w999(whole)} and ${fw}` : w999(whole);
}
function cmpWays(x, y, sign) {
const p = Math.max(places(x), places(y));
const ways = [way('Make them the same length', [`Add zeros so both have ${p} decimal place${p > 1 ? 's' : ''}: ${fixed(x, p)} and ${fixed(y, p)}.`,
`Now compare like whole numbers: ${fixed(x, p).replace('.', '').replace(/^0+(?=\d)/, '')} ${sign} ${fixed(y, p).replace('.', '').replace(/^0+(?=\d)/, '')}.`, `So ${b(`${plain(x)} ${sign} ${plain(y)}`)}.`])];
ways.push(way('Compare place by place', [pvChart([{ label: 'A', x, dp: p }, { label: 'B', x: y, dp: p }]),
'Start on the left. Find the first place where the digits are different. The bigger digit wins.']));
if (p <= 2 && x < 10 && y < 10) ways.push(way('Think money', [`${plain(x)} is like ${money(x)} and ${plain(y)} is like ${money(y)}.`, `Which would you rather have? ${b(`${money(x)} ${sign} ${money(y)}`)}`]));
return ways;
}
function genCompare(maxP) {
const w = pick([0, 0, rnd(1, 9)]);
let x, y;
if (chance(0.12)) { x = R(w + rnd(1, 9) / 10); y = x; }
else {
const p1 = rnd(1, maxP), p2 = rnd(1, maxP);
x = R(w + rnd(1, 10 ** p1 - 1) / 10 ** p1);
y = R(w + rnd(1, 10 ** p2 - 1) / 10 ** p2);
if (x === y) return genCompare(maxP);
}
const sign = x > y ? '>' : x < y ? '<' : '=';
const p = Math.max(places(x), places(y));
const showX = x === y && chance(0.6) ? fixed(x, p + 1) : plain(x);
return { ask: 'Which sign makes it true?', expr: `${showX} <span class="blank">?</span> ${plain(y)}`, answer: choice(sign, [], { all: ['<', '=', '>'] }),
ways: cmpWays(x, y, sign), hint: 'Line up the decimal points. Add zeros so they have the same number of places.', choiceBig: true };
}
export function genDec(L) {
if (L === 1) {
if (chance(0.6)) return genCompare(2);
const a = rnd(1, 99), t = rnd(0, 9), h = rnd(1, 9); const ans = R(a + t / 10 + h / 100);
return { ask: 'Write as one number.', expr: `${a} + ${t ? `0.${t} + ` : ''}0.0${h}`, exprSmall: true, answer: num(ans),
ways: [way('Put each piece in its place', [pvChart([{ label: '', x: ans, dp: 2 }]), `${a} fills the whole-number places, ${t} goes in tenths, ${h} goes in hundredths.`, `Together: ${b(fixed(ans, 2))}`]),
way('Think money', [`$${a} + ${t} dimes + ${h} pennies = ${b(money(ans))}`])],
hint: 'Each piece belongs in a different place.' };
}
if (L === 2) {
const t = pick(['words', 'words', 'expanded', 'cmp']);
if (t === 'cmp') return genCompare(3);
if (t === 'words') {
const p = rnd(1, 2); const x = R(rnd(0, 99) + rnd(1, 10 ** p - 1) / 10 ** p);
return { ask: 'Write this number with digits.', expr: `“${decWords(x)}”`, exprSmall: true, answer: num(x),
ways: [way('Split at “and”', [`The word “and” is the decimal point.`, `Before “and”: the whole number. After “and”: the decimal part.`, `The last word (${UNIT[p]}s) tells where the decimal part ends: ${p === 1 ? '1 place after the point' : '2 places after the point'}.`, `So: ${b(fixed(x, p))}`]),
way('Use a place value chart', [pvChart([{ label: '', x, dp: p }])])],
hint: '“and” means decimal point. The last word tells you how many places.' };
}
const tens = rnd(1, 9), ones = rnd(0, 9), te = rnd(0, 9), hu = rnd(1, 9), th = chance(0.4) ? rnd(1, 9) : 0;
const parts = [`${tens} × 10`, ones ? `${ones} × 1` : '', te ? `${te} × <span class="fr"><span class="n">1</span><span class="d">10</span></span>` : '', `${hu} × <span class="fr"><span class="n">1</span><span class="d">100</span></span>`, th ? `${th} × <span class="fr"><span class="n">1</span><span class="d">1000</span></span>` : ''].filter(Boolean);
const x = R(tens * 10 + ones + te / 10 + hu / 100 + th / 1000);
return { ask: 'Write as one number.', expr: parts.join(' + '), exprSmall: true, answer: num(x),
ways: [way('Value of each piece', [`${tens} × 10 = ${tens * 10}`, ones ? `${ones} × 1 = ${ones}` : 'No ones, so the ones place gets a 0.', te ? `${te} × 1/10 = ${R(te / 10)}` : 'No tenths, so the tenths place gets a 0.', `${hu} × 1/100 = ${R(hu / 100)}`, th ? `${th} × 1/1000 = ${R(th / 1000)}` : '', `Add them up: ${b(plain(x))}`].filter(Boolean)),
way('Drop digits into the chart', [pvChart([{ label: '', x, dp: th ? 3 : 2 }]), 'Any place that’s missing gets a 0.'])],
hint: '1/10 means tenths, 1/100 means hundredths. Missing places get a 0.' };
}
const t = pick(['cmp', 'most', 'towords', 'words3']);
if (t === 'cmp') return genCompare(3);
if (t === 'words3') {
const x = R(rnd(0, 20) + rnd(1, 999) / 1000);
if (places(x) < 3) return genDec(3);
return { ask: 'Write this number with digits.', expr: `“${decWords(x)}”`, exprSmall: true, answer: num(x),
ways: [way('Split at “and”', [`“and” is the decimal point.`, `“thousandths” means the decimal part fills ${b('3 places')}. Use zeros in front if needed.`, `So: ${b(fixed(x, 3))}`]), way('Use a place value chart', [pvChart([{ label: '', x, dp: 3 }])])],
hint: 'Thousandths need 3 digits after the decimal point.' };
}
if (t === 'towords') {
const x = R(rnd(1, 30) + rnd(1, 999) / 1000); if (places(x) < 3) return genDec(3);
const c = decWords(x);
const wrong = [c.replace('thousandth', 'hundredth'), decWords(R(Math.floor(x) * 10 + (x - Math.floor(x)))), `${w999(Math.round((x % 1) * 1000))} and ${w999(Math.floor(x))} thousandths`];
return { ask: `Which words match ${plain(x)}?`, answer: choice(c, wrong),
ways: [way('Read it in two parts', [`Whole number part: ${Math.floor(x)} → “${w999(Math.floor(x))}”`, `Say “and” for the decimal point.`, `Read the digits after the point as a number, then say the place of the LAST digit (thousandths).`, b(c)]),
way('Use a place value chart', [pvChart([{ label: '', x, dp: 3 }]), 'The last digit sits in the thousandths place, so the name ends in “thousandths.”'])],
hint: 'What place is the last digit in?' };
}
const tenth = rnd(2, 8);
const vals = new Set([R(tenth / 10), R(tenth / 10 + rnd(1, 9) / 100), R(tenth / 10 + rnd(1, 99) / 1000), R((tenth - 1) / 10 + rnd(10, 99) / 1000 * 10 / 10)]);
while (vals.size < 4) vals.add(R(rnd(1, 999) / 1000));
const arr = [...vals]; const most = chance(0.5);
const c = plain(most ? Math.max(...arr) : Math.min(...arr));
const p = Math.max(...arr.map(places));
return { ask: `Which number is the ${most ? 'greatest' : 'least'}?`, answer: choice(c, arr.map(plain)),
ways: [way('Make them the same length', [`Add zeros so all have ${p} places: ${arr.map(v => fixed(v, p)).join(', ')}.`, `Now compare them like whole numbers. The ${most ? 'greatest' : 'least'} is ${b(c)}.`]),
way('Tenths first', ['Look at the tenths digit first. Only if they tie, look at hundredths, then thousandths.', `Don't be fooled by length! A longer number isn't always bigger.`])],
hint: 'More digits does NOT mean bigger. Compare tenths first.' };
}
const PN = ['whole number', 'tenth', 'hundredth'];
export function genRnd(L) {
let P, p, N, whole;
for (let tries = 0; tries < 50; tries++) {
if (L === 1) { P = pick([1, 2]); p = P - 1; }
else if (L === 2) { P = pick([2, 3, 3]); p = rnd(0, P - 1); }
else { P = pick([2, 3]); p = rnd(0, P - 1); }
whole = rnd(0, L === 1 ? 20 : 99);
N = whole * 10 ** P + rnd(1, 10 ** P - 1);
if (L === 3 && chance(0.7)) {
const unitT = 10 ** (P - p);
const s = String(N).padStart(P + 1, '0').split('');
const iT = s.length - 1 - (P - p), iN = iT + 1;
if (p > 0 || chance(0.5)) s[iT] = '9';
s[iN] = String(rnd(5, 9));
N = +s.join('');
void unitT;
}
if (N % 10 !== 0) break;
}
const unit = 10 ** (P - p);
const down = Math.floor(N / unit) * unit, up = down + unit;
const roundedN = N - down >= unit / 2 ? up : down;
const x = R(N / 10 ** P), ans = R(roundedN / 10 ** P), lo = R(down / 10 ** P), hi = R(up / 10 ** P);
const dig = q => Math.floor(N / 10 ** (P - q)) % 10;
const tDig = dig(p), nDig = dig(p + 1);
const goesUp = nDig >= 5;
const ways = [
way('Look next door', [`Find the ${p === 0 ? 'ones' : placeName(-p)} digit: ${b(tDig)}.`, `Look at the digit right after it: ${b(nDig)}.`,
goesUp ? `${nDig} is 5 or more, so round ${b('up')}${tDig === 9 ? ` (the 9 becomes 10, so it carries over)` : ''}.` : `${nDig} is less than 5, so round ${b('down')} (keep the ${tDig}).`,
`Answer: ${b(fixed(ans, p))}${p > 0 && fixed(ans, p) !== plain(ans) ? ` (same as ${plain(ans)})` : ''}`]),
way('Picture a number line', [numberLine(lo, hi, x, { loL: fixed(lo, p), hiL: fixed(hi, p), xL: fixed(x, P), midL: fixed(R((lo + hi) / 2), p + 1) }),
`${fixed(x, P)} sits between ${fixed(lo, p)} and ${fixed(hi, p)}. The halfway point is ${fixed(R((lo + hi) / 2), p + 1)}.`, `It's closer to ${b(fixed(ans, p))}.`]),
];
return { ask: `Round to the nearest ${PN[p]}.`, expr: fixed(x, P), answer: num(ans), ways,
hint: `Find the ${p === 0 ? 'ones' : placeName(-p)} place, then look at the digit to its right.` };
}
