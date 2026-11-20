import { R, rnd, pick, chance, fmt, plain, places, fixed, money, b, k, way, nm, num, choice, pvChart, numberLine, placeName, table } from './util.js';
const OPEN = '([{', CLOSE = ')]}';
const tok = e => e.match(/\d+(\.\d+)?|[+−×÷()\[\]{}]/g).map(t => /\d/.test(t) ? +t : t);
const applyOp = (a, op, c) => op === '+' ? a + c : op === '−' ? a - c : op === '×' ? a * c : a / c;
function show(tk) {
let s = '';
for (const t of tk) s += typeof t === 'number' ? fmt(t) : OPEN.includes(t) || CLOSE.includes(t) ? t : ` ${t} `;
return s.replace(/\s+/g, ' ').trim();
}
function cleanup(tk) {
let changed = true;
while (changed) {
changed = false;
for (let i = 0; i + 2 < tk.length; i++)
if (OPEN.includes(tk[i]) && typeof tk[i + 1] === 'number' && CLOSE.includes(tk[i + 2])) { tk = [...tk.slice(0, i), tk[i + 1], ...tk.slice(i + 3)]; changed = true; break; }
}
return tk;
}
const GROUP = { '(': 'parentheses', '[': 'brackets', '{': 'braces' };
function solveSteps(expr) {
let tk = tok(expr); const steps = []; let ok = true, guard = 0;
while (tk.length > 1 && guard++ < 40) {
let i0 = 0, i1 = tk.length, where = '';
const j = tk.findIndex(t => CLOSE.includes(t));
if (j >= 0) { let i = j; while (!OPEN.includes(tk[i])) i--; i0 = i + 1; i1 = j; where = GROUP[tk[i]]; }
const inner = tk.slice(i0, i1);
let q = inner.findIndex(t => t === '×' || t === '÷'); if (q < 0) q = inner.findIndex(t => t === '+' || t === '−');
const a = inner[q - 1], op = inner[q], c = inner[q + 1], v = applyOp(a, op, c);
if (v < 0 || !Number.isInteger(v)) ok = false;
const verb = { '+': 'Add', '−': 'Subtract', '×': 'Multiply', '÷': 'Divide' }[op];
tk = cleanup([...tk.slice(0, i0), ...inner.slice(0, q - 1), v, ...inner.slice(q + 2), ...tk.slice(i1)]);
steps.push({ desc: (where ? `Inside the ${where}, ` : '') + `${verb.toLowerCase()}: ${fmt(a)} ${op} ${fmt(c)} = ${b(fmt(v))}`, expr: show(tk) });
}
return { value: tk[0], steps, ok };
}
const naive = e => { const tk = tok(e).filter(t => !(OPEN + CLOSE).includes(t)); let v = tk[0]; for (let i = 1; i < tk.length; i += 2) v = applyOp(v, tk[i], tk[i + 1]); return v; };
const cap = s => s[0].toUpperCase() + s.slice(1);
const OA1 = [
() => `${rnd(2, 20)} + ${rnd(2, 9)} × ${rnd(2, 9)}`,
() => `(${rnd(2, 12)} + ${rnd(2, 9)}) × ${rnd(2, 9)}`,
() => `${rnd(2, 9)} × ${rnd(2, 9)} − ${rnd(1, 15)}`,
() => `(${rnd(8, 20)} − ${rnd(1, 7)}) × ${rnd(2, 6)}`,
() => { const c = rnd(2, 9); return `${rnd(2, 20)} + ${c * rnd(2, 9)} ÷ ${c}`; },
() => `${rnd(2, 9)} × (${rnd(2, 9)} + ${rnd(2, 9)})`,
() => `${rnd(30, 60)} − ${rnd(2, 6)} × ${rnd(2, 5)}`,
];
const OA2 = [
() => `[(${rnd(2, 9)} + ${rnd(2, 9)}) × ${rnd(2, 5)}] − ${rnd(1, 12)}`,
() => `${rnd(2, 6)} × [${rnd(2, 9)} + (${rnd(8, 15)} − ${rnd(1, 7)})]`,
() => `(${rnd(2, 9)} + ${rnd(2, 9)}) × (${rnd(8, 15)} − ${rnd(2, 7)})`,
() => `{${rnd(2, 20)} + [${rnd(2, 6)} × (${rnd(6, 12)} − ${rnd(1, 5)})]} ÷ ${rnd(2, 5)}`,
() => `${rnd(2, 20)} + ${rnd(2, 9)} × ${rnd(2, 9)} − ${rnd(1, 9)}`,
() => `[${rnd(2, 9)} × (${rnd(2, 9)} + ${rnd(2, 9)})] ÷ ${rnd(2, 6)}`,
() => { const c = rnd(2, 6); return `${rnd(2, 9)} × ${c * rnd(2, 6)} ÷ ${c} + ${rnd(1, 9)}`; },
];
function oaEval(L) {
for (let t = 0; t < 400; t++) {
const e = pick(L === 1 ? OA1 : OA2)();
const r = solveSteps(e); if (!r.ok) continue;
const nv = naive(e);
const ways = [
way('Step by step', r.steps.map(st => `${cap(st.desc)}.<div class="line">${st.expr}</div>`)),
way('The order to remember', [
'First, anything inside ( ), [ ] or { }. Start with the innermost one.',
'Next, multiply and divide, going left to right.',
'Last, add and subtract, going left to right.',
`So in this problem, the very first move is to ${r.steps[0].desc.replace(/<\/?b>/g, '')}.`]),
];
if (Number.isFinite(nv) && R(nv) !== r.value) ways.push(way('Watch out for the trap', [
`If you just go straight left to right, you get ${b(fmt(R(nv)))}.`,
`That skips the order rules, so it isn't right. Following the order gives ${b(fmt(r.value))}.`]));
return {
ask: 'Find the value.', expr: e, answer: num(r.value), ways,
hint: /[(\[{]/.test(e) ? 'Start with the innermost parentheses or brackets.' : 'Multiply or divide before you add or subtract.',
};
}
}
function oaWrite(story) {
const A = rnd(3, 15), B = rnd(2, 9), C = rnd(2, 9), K = rnd(2, 9);
const n = nm();
const T = story ? pick([
() => ({ w: `${n} buys ${k(A + ' packs')} of stickers with ${k(B + ' stickers in each pack')}. Then a friend gives ${n} ${k(C + ' more')} stickers.`, ask: `Which expression shows how many stickers ${n} has?`, c: `${A} × ${B} + ${C}`, d: [`${A} × (${B} + ${C})`, `${A} + ${B} + ${C}`, `${A} + ${B} × ${C}`],
p: [`${A} packs with ${B} in each → ${A} × ${B}`, `${C} more are added at the end → + ${C}`, `Multiplying already happens first, so you don't need parentheses: ${b(`${A} × ${B} + ${C}`)}`],
read: { find: 'An expression for the total stickers (you don’t have to solve it).', know: [`${A} packs`, `${B} stickers in each pack`, `${C} extra stickers`], clue: '“in each” means equal groups → multiply. “more” means add.', plan: `${A} × ${B} + ${C}` } }),
() => ({ w: `There are ${k(C + ' tables')}. At each table there are ${k(A + ' kids')} and ${k(B + ' grown-ups')}.`, ask: 'Which expression shows how many people there are in all?', c: `${C} × (${A} + ${B})`, d: [`${C} × ${A} + ${B}`, `${C} + ${A} + ${B}`, `${A} + ${B} × ${C}`],
p: [`People at one table: ${A} + ${B}`, `There are ${C} tables just like it, so the whole group gets multiplied: ${b(`${C} × (${A} + ${B})`)}`, `The parentheses make sure you add first.`],
read: { find: 'An expression for everyone at all the tables.', know: [`${C} tables`, `${A} kids at each`, `${B} grown-ups at each`], clue: '“at each table” → every table has the same group → multiply the whole group.', plan: `${C} × (${A} + ${B})` } }),
() => { const X = B + C * K; return { w: `${n} had ${k('$' + X)}. ${n} spent ${k('$' + B)}, then split the rest equally into ${k(C + ' envelopes')}.`, ask: 'Which expression shows how much money goes in each envelope?', c: `(${X} − ${B}) ÷ ${C}`, d: [`${X} − ${B} ÷ ${C}`, `${X} ÷ ${C} − ${B}`, `(${X} + ${B}) ÷ ${C}`],
p: [`First take away what was spent: ${X} − ${B}`, `“The rest” is split equally, so divide that whole amount: ${b(`(${X} − ${B}) ÷ ${C}`)}`],
read: { find: 'An expression for the money in one envelope.', know: [`started with $${X}`, `spent $${B}`, `${C} envelopes`], clue: '“spent” → subtract. “split equally” → divide. “the rest” means divide AFTER subtracting.', plan: `(${X} − ${B}) ÷ ${C}` } }; },
]) : pick([
() => ({ w: `Add ${A} and ${B}, then multiply by ${C}.`, c: `${C} × (${A} + ${B})`, d: [`${C} × ${A} + ${B}`, `${A} + ${B} × ${C}`, `(${C} + ${A}) × ${B}`],
p: [`“Add ${A} and ${B}” → ${A} + ${B}`, `“then multiply by ${C}” → the whole sum gets multiplied, so the sum goes in parentheses: ${b(`${C} × (${A} + ${B})`)}`] }),
() => ({ w: `Multiply ${A} by ${B}, then add ${C}.`, c: `${A} × ${B} + ${C}`, d: [`${A} × (${B} + ${C})`, `${A} + ${B} × ${C}`, `(${A} + ${C}) × ${B}`],
p: [`“Multiply ${A} by ${B}” → ${A} × ${B}`, `“then add ${C}” → ${b(`${A} × ${B} + ${C}`)}. Multiplying happens first anyway, so no parentheses needed.`] }),
() => { const X = B + C * K; return { w: `Subtract ${B} from ${X}, then divide by ${C}.`, c: `(${X} − ${B}) ÷ ${C}`, d: [`${X} − ${B} ÷ ${C}`, `(${B} − ${X}) ÷ ${C}`, `${C} ÷ (${X} − ${B})`],
p: [`“Subtract ${B} from ${X}” means start with ${X} and take away ${B}: ${X} − ${B}`, `“then divide by ${C}” → the difference gets divided, so it goes in parentheses: ${b(`(${X} − ${B}) ÷ ${C}`)}`] }; },
() => ({ w: `Double the sum of ${A} and ${B}.`, c: `2 × (${A} + ${B})`, d: [`2 × ${A} + ${B}`, `2 + ${A} + ${B}`, `(2 + ${A}) × ${B}`],
p: [`“The sum of ${A} and ${B}” → ${A} + ${B}`, `“Double” means × 2, and it doubles the whole sum: ${b(`2 × (${A} + ${B})`)}`] }),
() => { const X = A + B; return { w: `Triple the difference of ${X} and ${B}.`, c: `3 × (${X} − ${B})`, d: [`3 × ${X} − ${B}`, `3 − (${X} − ${B})`, `(3 + ${X}) − ${B}`],
p: [`“The difference of ${X} and ${B}” → ${X} − ${B}`, `“Triple” means × 3, and it triples the whole difference: ${b(`3 × (${X} − ${B})`)}`] }; },
() => { const X = C * (B + K); return { w: `Divide ${X} by ${C}, then subtract ${B}.`, c: `${X} ÷ ${C} − ${B}`, d: [`${X} ÷ (${C} − ${B})`, `${B} − ${X} ÷ ${C}`, `(${X} − ${B}) ÷ ${C}`],
p: [`“Divide ${X} by ${C}” → ${X} ÷ ${C}`, `“then subtract ${B}” → ${b(`${X} ÷ ${C} − ${B}`)}. Dividing already comes first.`] }; },
]);
const t = T();
const right = solveSteps(t.c).value;
const tested = t.d.map(d => ({ d, v: solveSteps(d) })).filter(o => o.v.ok && o.v.value !== right);
const ways = [way('Read it in pieces', t.p)];
ways.push(way('Test the choices', [`The right one: ${t.c} = ${b(fmt(right))}`,
...(tested.length ? tested.slice(0, 2).map(o => `${o.d} = ${fmt(o.v.value)}. A different answer, so it can’t mean the same thing.`) : ['The other choices do the steps in a different order, so they give different answers.']),
'Changing the order changes the answer. That’s why the parentheses matter!']));
return {
ask: story ? t.ask : 'Which expression matches the words?', story: story ? t.w : null, expr: story ? null : `“${t.w}”`, exprSmall: !story,
answer: choice(t.c, t.d), ways, read: t.read, op: 'multi',
hint: 'Which part happens first? If it has to happen first, it often needs parentheses.',
};
}
function oaInterp() {
const X = rnd(100, 999), Y = rnd(20, 500), K = rnd(3, 9);
const t = pick([0, 1, 2]);
if (t === 0) return {
ask: `Without solving, how does the first expression compare to the second?`, expr: `${K} × (${fmt(X)} + ${Y}) &nbsp;and&nbsp; ${fmt(X)} + ${Y}`, exprSmall: true,
answer: choice(`It is ${K} times as large`, [`It is ${K} more`, `It is ${K} less`, `They are equal`]),
ways: [way('No math needed', [`Both have the same group: (${fmt(X)} + ${Y}).`, `The first one takes that group ${K} times, so it's ${b(`${K} times as large`)}.`]),
way('Prove it', [`${fmt(X)} + ${Y} = ${fmt(X + Y)}`, `${K} × ${fmt(X + Y)} = ${fmt(K * (X + Y))}`, `${fmt(K * (X + Y))} is ${K} groups of ${fmt(X + Y)}, which is ${K} times as large.`])],
hint: `Look for the part that's the same in both. What happens to it?`,
};
if (t === 1) return {
ask: `Which expression is ${K} times as large as ${fmt(X)} + ${Y}?`,
answer: choice(`${K} × (${fmt(X)} + ${Y})`, [`${K} + ${fmt(X)} + ${Y}`, `${fmt(X)} + ${Y} × ${K}`, `(${fmt(X)} + ${Y}) ÷ ${K}`]),
ways: [way('Think “groups of”', [`“${K} times as large” means ${K} groups of the whole amount.`, `The whole amount is (${fmt(X)} + ${Y}), so: ${b(`${K} × (${fmt(X)} + ${Y})`)}`]),
way('Spot the traps', [`${fmt(X)} + ${Y} × ${K} only multiplies the ${Y}, not the whole sum.`, `÷ ${K} makes it smaller, not bigger.`, `+ ${K} only adds ${K} more.`])],
hint: 'The whole sum needs to be multiplied. What keeps a sum together?',
};
return {
ask: 'Without solving, how does the second expression compare to the first?', expr: `${fmt(X)} × ${Y} &nbsp;and&nbsp; ${fmt(X)} × ${Y} × 2`, exprSmall: true,
answer: choice('It is twice as large', ['It is 2 more', 'It is half as large', 'They are equal']),
ways: [way('No math needed', [`Both start with ${fmt(X)} × ${Y}.`, `The second one multiplies that by 2 more, so it's ${b('twice as large')}.`]),
way('Prove it', [`${fmt(X)} × ${Y} = ${fmt(X * Y)}`, `${fmt(X * Y)} × 2 = ${fmt(X * Y * 2)}, which is double.`])],
hint: 'What extra thing happens in the second one?',
};
}
export function genOA(L) {
if (L === 1) return chance(0.8) ? oaEval(1) : oaWrite(false);
if (L === 2) return pick([() => oaEval(2), () => oaEval(2), () => oaWrite(false), () => oaWrite(true)])();
return pick([() => oaEval(2), () => oaWrite(false), () => oaWrite(true), oaInterp, oaInterp])();
}
function seqRow(start, add, n) { const a = []; for (let i = 0; i < n; i++) a.push(start + add * i); return a; }
export function genPat(L) {
if (L === 1) {
const add = rnd(2, 12), start = pick([0, 0, rnd(1, 20)]), seq = seqRow(start, add, 6);
const miss = pick([5, 5, 3, 4]); const ans = seq[miss];
const shown = seq.map((v, i) => i === miss ? '<span class="blank">?</span>' : fmt(v)).join(', ');
return {
ask: 'What number is missing?', expr: shown, exprSmall: true, answer: num(ans),
ways: [way('Find the rule', [`Look at the jumps: ${seq[0]} → ${seq[1]} → ${seq[2]}. Each jump is ${b('+' + add)}.`, `So the missing number is ${seq[miss - 1]} + ${add} = ${b(ans)}.`]),
way('Skip count', [`Start at ${start} and count by ${add}s: ${seq.slice(0, miss + 1).map((v, i) => i === miss ? b(v) : v).join(', ')}.`])],
hint: 'How much bigger is each number than the one before it?',
};
}
const a = rnd(1, 6), m = pick([2, 3, 4, 5]), bb = a * m;
const A = seqRow(0, a, 6), B = seqRow(0, bb, 6);
const tbl = (hideB) => table(['', 'Start', '', '', '', '', ''], [[`Rule A: add ${a}`, ...A.map(fmt)], [`Rule B: add ${bb}`, ...B.map((v, i) => i === hideB ? '<b>?</b>' : fmt(v))]], { cls: 'pat' });
const why = [`Rule A adds ${a} each time. Rule B adds ${bb} each time.`, `${bb} is ${m} × ${a}, so every number in B is ${b(m + ' times')} the matching number in A.`];
if (L === 2) {
if (chance(0.5)) {
const hide = rnd(3, 5);
return {
ask: 'Both patterns start at 0. What number goes where the ? is?', visual: tbl(hide), answer: num(B[hide]),
ways: [way('Keep adding', [`Rule B adds ${bb}: ${B.slice(0, hide).join(', ')}, then ${B[hide - 1]} + ${bb} = ${b(B[hide])}.`]),
way('Use Pattern A', [`The number above it in Pattern A is ${A[hide]}.`, `Pattern B is always ${m} times Pattern A: ${A[hide]} × ${m} = ${b(B[hide])}.`])],
hint: `What does Rule B add each time?`,
};
}
return {
ask: 'Each number in Pattern B is how many times the matching number in Pattern A?', visual: tbl(-1), answer: num(m),
ways: [way('Compare the rules', why), way('Check a pair', [`Look at the 3rd numbers: ${A[2]} and ${B[2]}.`, `${A[2]} × ${m} = ${B[2]} ✓. Try another pair, it works every time.`])],
hint: 'Pick a pair stacked on top of each other. What do you multiply the top one by?',
};
}
const t = pick([0, 1, 2]);
if (t === 0) {
const i = rnd(2, 5);
const c = `(${A[i]}, ${B[i]})`;
return {
ask: 'Make ordered pairs (Pattern A, Pattern B). Which pair belongs?', visual: tbl(-1),
answer: choice(c, [`(${B[i]}, ${A[i]})`, `(${A[i]}, ${B[i] + a})`, `(${A[i] + a}, ${B[i]})`]),
ways: [way('Read straight down', [`An ordered pair takes the A number first, then the B number right under it.`, `${A[i]} is in Pattern A, and right under it is ${B[i]}. So ${b(c)}.`]),
way('Use the rule', [`B is always ${m} × A. In ${c}, ${A[i]} × ${m} = ${B[i]} ✓`, `In (${B[i]}, ${A[i]}) the order is flipped, which is a common trap.`])],
hint: 'The first number comes from Pattern A, the second from Pattern B, in the same column.',
};
}
if (t === 1) {
const mm = rnd(7, 12), x = a * mm;
return {
ask: `If you keep going, when Pattern A reaches ${x}, what will Pattern B be?`, visual: tbl(-1), answer: num(x * m),
ways: [way('Use the relationship', [...why, `So when A is ${x}, B is ${x} × ${m} = ${b(x * m)}.`]),
way('Count the steps', [`To reach ${x}, Pattern A takes ${mm} jumps of ${a}.`, `Pattern B also takes ${mm} jumps, but of ${bb}: ${mm} × ${bb} = ${b(mm * bb)}.`])],
hint: `How many times as big is B compared to A?`,
};
}
const mm = rnd(7, 12), y = bb * mm;
return {
ask: `If you keep going, when Pattern B reaches ${y}, what will Pattern A be?`, visual: tbl(-1), answer: num(y / m),
ways: [way('Undo the relationship', [...why, `Going backward, divide by ${m}: ${y} ÷ ${m} = ${b(y / m)}.`]),
way('Count the steps', [`Pattern B reaches ${y} after ${y} ÷ ${bb} = ${mm} jumps.`, `Pattern A after ${mm} jumps: ${mm} × ${a} = ${b(mm * a)}.`])],
hint: 'B is bigger than A. To go from B back to A, do the opposite.',
};
}
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
