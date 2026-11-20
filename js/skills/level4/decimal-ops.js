import { R, rnd, pick, chance, fmt, plain, places, fixed, money, b, k, way, nm, num, column, alignDec } from '../../util.js';
function dasWays(a, c, op, ans) {
const { p, s } = alignDec([a, c, ans]);
const ways = [way('Line up the decimal points', [
(places(a) !== places(c) ? `Fill empty places with zeros so they line up: ${plain(a)} → ${s[0]}, ${plain(c)} → ${s[1]}.` : 'Write one number on top of the other with the decimal points lined up.'),
column([s[0], s[1]], op, s[2]), `${op === '+' ? 'Add' : 'Subtract'} like whole numbers, and drop the decimal point straight down: ${b(plain(ans))}`])];
if (op === '+') {
const wa = Math.floor(a), wc = Math.floor(c), fa = R(a - wa), fc = R(c - wc);
ways.push(way('Wholes and parts', [`Add the whole numbers: ${wa} + ${wc} = ${wa + wc}`, `Add the decimal parts: ${fixed(fa, p)} + ${fixed(fc, p)} = ${plain(R(fa + fc))}`, `Put them together: ${wa + wc} + ${plain(R(fa + fc))} = ${b(plain(ans))}`]));
} else {
const up = Math.ceil(c) === c ? c + 1 : Math.ceil(c);
if (up <= a) ways.push(way('Count up', [`Start at ${plain(c)} and count up to ${plain(a)}.`, `${plain(c)} → ${up} is ${plain(R(up - c))}`, `${up} → ${plain(a)} is ${plain(R(a - up))}`, `Total jump: ${plain(R(up - c))} + ${plain(R(a - up))} = ${b(plain(ans))}`]));
}
if (p <= 2 && a < 100) ways.push(way('Think money', [`${money(a)} ${op === '+' ? '+' : '−'} ${money(c)} = ${b(money(ans))}`]));
return ways;
}
export function dasWord(L) {
const n = nm(); const t = pick([0, 1, 2]);
if (t === 0) { const a = R(rnd(150, 999) / 100), c = R(rnd(150, 999) / 100), tot = R(a + c);
return { story: `${n} bought a book for ${k(money(a))} and a snack for ${k(money(c))}.`, ask: 'How much did both cost together?', answer: num(tot), ways: dasWays(a, c, '+', tot), op: 'add',
read: { find: 'The total cost of both things.', know: [`book ${money(a)}`, `snack ${money(c)}`], clue: '“together” → add', plan: `${money(a)} + ${money(c)}` }, hint: 'Line up the decimal points and add.' }; }
if (t === 1) { const a = R(rnd(30, 99) / 10), c = R(rnd(11, Math.round(a * 10) - 5) / 100 * 10); const diff = R(a - c);
return { story: `${n} jumped ${k(plain(a) + ' meters')}. ${n}'s friend jumped ${k(plain(c) + ' meters')}.`, ask: `How much farther did ${n} jump?`, answer: num(diff), ways: dasWays(a, c, '−', diff), op: 'sub',
read: { find: 'The difference between the two jumps.', know: [`${n}: ${plain(a)} m`, `friend: ${plain(c)} m`], clue: '“how much farther” → compare → subtract', plan: `${plain(a)} − ${plain(c)}` }, hint: 'How much farther = bigger minus smaller.' }; }
const start = pick([20, 20, 25, 50]), a = R(rnd(150, 900) / 100), c = R(rnd(100, 500) / 100), spent = R(a + c), left = R(start - spent);
return { story: `${n} has ${k('$' + start + '.00')}. ${n} buys a toy for ${k(money(a))} and a drink for ${k(money(c))}.`, ask: 'How much money is left?', answer: num(left), op: 'multi',
ways: [way('Two steps', [`Step 1, total spent: ${money(a)} + ${money(c)} = ${money(spent)}`, `Step 2, money left: $${start}.00 − ${money(spent)} = ${b(money(left))}`]), ...dasWays(start, spent, '−', left).slice(0, 1)],
read: { find: 'The money left after buying both things.', know: [`starts with $${start}.00`, `toy ${money(a)}`, `drink ${money(c)}`], clue: '“buys” → spending, “left” → subtract. Two steps: add what was spent, then subtract.', plan: `$${start}.00 − (${money(a)} + ${money(c)})` }, hint: 'First find how much was spent in all.' };
}
export function genDas(L) {
if (L === 3 && chance(0.6)) return dasWord(L);
let a, c;
if (L === 1) { a = R(rnd(11, 99) / 10); c = R(rnd(11, 99) / 10); }
else { a = R(rnd(101, 1999) / 100); c = chance(0.5) ? R(rnd(11, 99) / 10) : chance(0.5) ? rnd(2, 15) : R(rnd(101, 999) / 100); }
let op = chance(0.5) ? '+' : '−';
if (L >= 2 && chance(0.2)) { a = pick([5, 10, 20]); c = R(rnd(101, a * 100 - 50) / 100); op = '−'; }
if (op === '−' && c > a) [a, c] = [c, a];
if (op === '−' && a === c) return genDas(L);
const ans = R(op === '+' ? a + c : a - c);
return { ask: op === '+' ? 'Add.' : 'Subtract.', expr: `${plain(a)} ${op} ${plain(c)}`, answer: num(ans), ways: dasWays(a, c, op, ans), hint: 'Line up the decimal points. Fill empty places with zeros.' };
}
const intOf = x => Math.round(x * 10 ** places(x));
function dmulWays(a, c) {
const ans = R(a * c), pa = places(a), pc = places(c), ia = intOf(a), ic = intOf(c);
const ways = [way('Ignore the point, then put it back', [
`Pretend there are no decimal points: ${fmt(ia)} × ${fmt(ic)} = ${fmt(ia * ic)}`,
`Count the decimal places in the problem: ${plain(a)} has ${pa}${pc ? `, ${plain(c)} has ${pc}` : ''}. Total: ${b(pa + pc)}.`,
`Give the answer ${pa + pc} decimal place${pa + pc > 1 ? 's' : ''}: ${fmt(ia * ic)} → ${b(fixed(ans, pa + pc))}${fixed(ans, pa + pc) !== plain(ans) ? ` = ${plain(ans)}` : ''}`])];
if (pa && pc && pa + pc <= 3) {
const da = 10 ** pa, dc = 10 ** pc;
ways.push(way('Use fractions', [`${plain(a)} = ${ia}/${da} and ${plain(c)} = ${ic}/${dc}`, `Multiply tops and bottoms: (${ia} × ${ic}) / (${da} × ${dc}) = ${ia * ic}/${da * dc}`, `${ia * ic}/${da * dc} = ${b(plain(ans))}`]));
} else if (Number.isInteger(c) && c <= 9) {
ways.push(way('Repeated adding', [`${plain(a)} × ${c} means ${c} groups of ${plain(a)}:`, Array(c).fill(plain(a)).join(' + ') + ` = ${b(plain(ans))}`]));
}
const ea = Math.max(1, Math.round(a)), ec = Math.max(1, Math.round(c));
ways.push(way('Estimate to check', [`${plain(a)} is about ${ea}${Number.isInteger(c) ? '' : `, ${plain(c)} is about ${ec}`}. So the answer should be about ${ea * ec}.`, `${plain(ans)} is close${a < 1 && c < 1 ? '. (Small times small makes something even smaller!)' : ''} ✓`]));
return ways;
}
export function dmulWord(L) {
const n = nm(); const price = R(rnd(105, 899) / 100), q = rnd(3, 9);
if (chance(0.5)) return { story: `Each notebook costs ${k(money(price))}. ${n} buys ${k(q + ' notebooks')}.`, ask: 'How much does that cost?', answer: num(R(price * q)), ways: dmulWays(price, q), op: 'mul',
read: { find: 'The total cost.', know: [`${money(price)} each`, `${q} notebooks`], clue: '“each” + how many → multiply', plan: `${money(price)} × ${q}` }, hint: 'Same price, many times → multiply.' };
const lb = R(rnd(12, 49) / 10), per = R(rnd(12, 39) / 10);
return { story: `Apples cost ${k(money(per) + ' per pound')}. ${n} buys ${k(plain(lb) + ' pounds')}.`, ask: 'How much does that cost?', answer: num(R(lb * per)), ways: dmulWays(lb, per), op: 'mul',
read: { find: 'The cost of all the apples.', know: [`${money(per)} for each pound`, `${plain(lb)} pounds`], clue: '“per pound” → each pound costs the same → multiply', plan: `${plain(lb)} × ${money(per)}` }, hint: 'Price per pound × number of pounds.' };
}
export function genDmul(L) {
if (L === 3 && chance(0.4)) return dmulWord(L);
let a, c;
if (L === 1) { a = pick([R(rnd(1, 9) / 10), R(rnd(11, 99) / 10), R(rnd(1, 99) / 100)]); c = rnd(2, 9); }
else if (L === 2) { a = R(rnd(1, 9) / 10); c = chance(0.5) ? R(rnd(1, 9) / 10) : R(rnd(11, 49) / 10); }
else { a = chance(0.5) ? R(rnd(101, 999) / 100) : R(rnd(11, 99) / 10); c = chance(0.5) ? rnd(2, 9) : R(rnd(11, 49) / 10); if (places(a) + places(c) > 3) c = rnd(2, 9); }
if (chance(0.5) && !Number.isInteger(c)) [a, c] = [c, a];
return { ask: 'Multiply.', expr: `${plain(a)} × ${plain(c)}`, answer: num(R(a * c)), ways: dmulWays(a, c), hint: 'Multiply like whole numbers. Then count decimal places.' };
}
function ddivWays(dividend, d) {
const q = R(dividend / d);
const ways = [];
if (Number.isInteger(d)) {
const pd = Math.max(places(dividend), places(q)), id = Math.round(dividend * 10 ** pd);
ways.push(way('Divide like whole numbers', [
...(places(dividend) < pd ? [`Write ${plain(dividend)} as ${fixed(dividend, pd)} so there's room for the answer.`] : []),
`Ignore the decimal point: ${fmt(id)} ÷ ${d} = ${fmt(id / d)}`, `Put the point back: ${fixed(dividend, pd)} has ${pd} decimal place${pd > 1 ? 's' : ''}, so the answer does too.`, `Answer: ${b(fixed(q, pd))}${fixed(q, pd) !== plain(q) ? ` = ${plain(q)}` : ''}`]));
if (dividend < 100) ways.push(way('Think money', [`Share ${money(dividend)} equally among ${d} people.`, `Each gets ${b(money(q))}.`]));
} else {
const pd = places(d), m = 10 ** pd, D = R(dividend * m), dd = R(d * m);
ways.push(way('Make the divisor whole', [`It's hard to divide by a decimal, so multiply BOTH numbers by ${m}. (This doesn't change the answer.)`, `${plain(dividend)} × ${m} = ${plain(D)} and ${plain(d)} × ${m} = ${plain(dd)}`, `Now solve ${plain(D)} ÷ ${plain(dd)} = ${b(plain(q))}`]));
if (Number.isInteger(dividend) || q <= 40) ways.push(way('How many fit?', [`Ask: how many ${plain(d)}s fit into ${plain(dividend)}?`, Number.isInteger(1 / d) && Number.isInteger(dividend) ? `There are ${1 / d} groups of ${plain(d)} in each 1, so in ${dividend} there are ${dividend} × ${1 / d} = ${b(plain(q))}.` : `Count by ${plain(d)}s: ${Array.from({ length: Math.min(Math.ceil(q), 6) }, (_, i) => plain(R(d * (i + 1)))).join(', ')}${q > 6 ? ', …' : ''} → it takes ${b(plain(q))} of them.`]));
}
ways.push(way('Check with multiplication', [`${plain(q)} × ${plain(d)} = ${plain(dividend)} ✓`]));
return ways;
}
export function ddivWord(L) {
const n = nm();
if (chance(0.5)) { const piece = pick([0.5, 0.25, 0.2]), cnt = rnd(3, 12), tot = R(piece * cnt);
return { story: `${n} has a ribbon ${k(plain(tot) + ' meters')} long. ${n} cuts it into pieces that are each ${k(plain(piece) + ' meter')} long.`, ask: `How many pieces does ${n} get?`, answer: num(cnt), ways: ddivWays(tot, piece), op: 'div',
read: { find: 'How many pieces.', know: [`${plain(tot)} m of ribbon`, `each piece is ${plain(piece)} m`], clue: '“how many pieces of ___ fit” → divide', plan: `${plain(tot)} ÷ ${plain(piece)}` }, hint: 'How many small pieces fit into the whole ribbon?' }; }
const ppl = rnd(2, 6), each = R(rnd(105, 899) / 100), tot = R(each * ppl);
return { story: `${k(ppl + ' friends')} split a ${k(money(tot))} pizza bill equally.`, ask: 'How much does each friend pay?', answer: num(each), ways: ddivWays(tot, ppl), op: 'div',
read: { find: 'What ONE friend pays.', know: [`bill is ${money(tot)}`, `${ppl} friends`], clue: '“split equally” → divide', plan: `${money(tot)} ÷ ${ppl}` }, hint: 'Split a total equally → divide.' };
}
export function genDdiv(L) {
if (L === 3 && chance(0.35)) return ddivWord(L);
let q, d;
if (L === 1) { d = rnd(2, 9); q = R(rnd(11, 99) / 10); if (chance(0.3)) q = R(rnd(1, 9) / 10); }
else if (L === 2) {
if (chance(0.5)) { d = pick([0.1, 0.2, 0.25, 0.5]); const w = rnd(1, 9); return { ask: 'Divide.', expr: `${w} ÷ ${plain(d)}`, answer: num(R(w / d)), ways: ddivWays(w, d), hint: `How many ${plain(d)}s fit into ${w}?` }; }
d = rnd(2, 9); q = R(rnd(101, 999) / 100);
} else {
if (chance(0.3)) { d = R(rnd(2, 9) / 100); q = rnd(2, 9); }
else { d = R(rnd(2, 9) / 10); q = chance(0.5) ? rnd(2, 12) : R(rnd(11, 49) / 10); }
}
const dividend = R(q * d);
if (places(dividend) > 2) return genDdiv(L);
return { ask: 'Divide.', expr: `${plain(dividend)} ÷ ${plain(d)}`, answer: num(q), ways: ddivWays(dividend, d), hint: Number.isInteger(d) ? 'Divide like whole numbers. The decimal point goes straight up.' : 'Multiply both numbers by 10 (or 100) to make the divisor a whole number.' };
}
