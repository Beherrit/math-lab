import { rnd, pick, chance, gcd, lcm, simp, F, M, fr, b, k, way, nm, num, frac, choice, fracBar, fracArea } from './util.js';
const cn = d => { let n; do { n = rnd(1, d - 1); } while (gcd(n, d) !== 1); return n; };
const improperOf = (w, n, d) => w * d + n;
const mixedHTML = (w, n, d) => M(w, n, d);
function simplifyLines(n, d) {
const out = []; const g = gcd(n, d);
if (g > 1) out.push(`Simplify: divide the top and bottom by ${g}. ${F(n, d)} = ${F(n / g, d / g)}`);
const [sn, sd] = simp(n, d);
if (sn > sd && sd !== 1) out.push(`${F(sn, sd)} is more than 1 whole. ${sd} goes into ${sn} ${Math.floor(sn / sd)} time${Math.floor(sn / sd) > 1 ? 's' : ''} with ${sn % sd} left over: ${b(fr(sn, sd))}`);
else if (sd === 1) out.push(`${F(sn, sd)} is ${b(sn)} wholes.`);
return out;
}
function denPair(L) {
for (let t = 0; t < 100; t++) {
let d1, d2;
if (L === 1) { d1 = rnd(2, 6); d2 = d1 * rnd(2, 3); if (d2 > 12) continue; }
else { d1 = rnd(2, 10); d2 = rnd(2, 12); if (d1 === d2 || d2 % d1 === 0 || d1 % d2 === 0 || lcm(d1, d2) > 40) continue; }
if (chance(0.5)) [d1, d2] = [d2, d1];
return [d1, d2];
}
return [3, 4];
}
function fasWays(w1, n1, d1, w2, n2, d2, op) {
const L = lcm(d1, d2), m1 = L / d1, m2 = L / d2;
const N1 = improperOf(w1, n1, d1) * m1, N2 = improperOf(w2, n2, d2) * m2;
const R = op === '+' ? N1 + N2 : N1 - N2;
const mixed = w1 || w2;
const steps = [];
if (mixed) steps.push(`Turn mixed numbers into fractions: ${mixedHTML(w1, n1, d1)} = ${F(improperOf(w1, n1, d1), d1)}${w2 ? ` and ${mixedHTML(w2, n2, d2)} = ${F(improperOf(w2, n2, d2), d2)}` : ''}`);
steps.push(`The bottoms (${d1} and ${d2}) are different, so the pieces are different sizes. Find a number both go into: ${b(L)}.`);
steps.push(`Rewrite each fraction with ${L} on the bottom. Whatever you do to the bottom, do to the top:<div class="line">${F(improperOf(w1, n1, d1), d1)} = ${F(improperOf(w1, n1, d1) + ' × ' + m1, d1 + ' × ' + m1)} = ${F(N1, L)}</div><div class="line">${F(improperOf(w2, n2, d2), d2)} = ${F(improperOf(w2, n2, d2) + ' × ' + m2, d2 + ' × ' + m2)} = ${F(N2, L)}</div>`);
steps.push(`Now the pieces match. ${op === '+' ? 'Add' : 'Subtract'} the tops, and keep the bottom: ${F(N1, L)} ${op} ${F(N2, L)} = ${F(R, L)}`);
steps.push(...simplifyLines(R, L));
if (gcd(R, L) === 1 && R < L) steps.push(`Answer: ${b(fr(R, L))}`);
const ways = [way('Common denominator', steps)];
if (!mixed && L <= 24) ways.push(way('Picture it', [`Each bar is split into ${L} equal pieces, so you can count them.`, fracBar(N1, L, { label: `${N1}/${L}` }), fracBar(N2, L, { label: `${N2}/${L}` }), `${op === '+' ? 'Put them together' : 'Take away'}: ${fracBar(R, L, { label: `${R}/${L}` })}`]));
if (mixed && op === '+') ways.push(way('Wholes and parts', [`Add the wholes: ${w1} + ${w2} = ${w1 + w2}`, `Add the fractions: ${F(n1 * m1, L)} + ${F(n2 * m2, L)} = ${F(n1 * m1 + n2 * m2, L)}${n1 * m1 + n2 * m2 >= L ? ` = ${fr(n1 * m1 + n2 * m2, L)} (an extra whole!)` : ''}`, `Together: ${b(fr(R, L))}`]));
if (mixed && op === '−' && n1 * m1 < n2 * m2) ways.push(way('Borrow a whole', [`You can't take ${F(n2 * m2, L)} from ${F(n1 * m1, L)}, so borrow 1 whole from ${w1}.`, `1 whole = ${F(L, L)}, so ${mixedHTML(w1, n1 * m1, L)} becomes ${mixedHTML(w1 - 1, n1 * m1 + L, L)}.`, `Now subtract wholes and parts: (${w1 - 1} − ${w2}) and (${F(n1 * m1 + L, L)} − ${F(n2 * m2, L)}) → ${b(fr(R, L))}`]));
if (op === '−') ways.push(way('Check by adding back', [`If the answer is right, adding it back gives the number you started with:`, `${fr(R, L)} + ${mixedHTML(w2, n2, d2)} = ${mixedHTML(w1, n1, d1)} ✓`]));
const near = (n, d) => n / d < 0.25 ? '0' : n / d < 0.75 ? '1/2' : '1';
if (!mixed) ways.push(way('Estimate first', [`${F(n1, d1)} is close to ${near(n1, d1)}, and ${F(n2, d2)} is close to ${near(n2, d2)}.`, `So the answer should be close to ${op === '+' ? 'their sum' : 'their difference'}. ${fr(R, L)} makes sense ✓`]));
return { R, L, ways };
}
const FAS_CTX = [
(A, B2, n) => ({ op: '+', story: `${n} walked ${k(A + ' mile')} to the park and then ${k(B2 + ' mile')} to the store.`, ask: `How far did ${n} walk in all?`, find: 'The total distance walked.', know: [`to the park: ${A} mile`, `to the store: ${B2} mile`], clue: '“in all” → add', unit: 'mile' }),
(A, B2, n) => ({ op: '−', story: `A pitcher had ${k(A + ' liter')} of juice. ${n} poured out ${k(B2 + ' liter')}.`, ask: 'How much juice is left in the pitcher?', find: 'The juice that is still in the pitcher.', know: [`started with ${A} liter`, `poured out ${B2} liter`], clue: '“poured out” and “left” → subtract', unit: 'liter' }),
(A, B2, n) => ({ op: '+', story: `${n} painted ${k(A)} of a fence on Saturday and ${k(B2)} of it on Sunday.`, ask: 'How much of the fence is painted now?', find: 'How much of the fence is painted in total.', know: [`Saturday: ${A} of the fence`, `Sunday: ${B2} of the fence`], clue: '“and” both days → add', unit: '' }),
(A, B2, n) => ({ op: '−', story: `A board is ${k(A + ' yard')} long. ${n} cuts off ${k(B2 + ' yard')}.`, ask: 'How long is the board now?', find: 'The length that is left.', know: [`board: ${A} yard`, `cut off: ${B2} yard`], clue: '“cuts off” → take away → subtract', unit: 'yard' }),
];
export function fasWord(L) {
const [d1, d2] = denPair(Math.min(L, 2));
const n1 = cn(d1), n2 = cn(d2);
const ctx = pick(FAS_CTX)(F(n1, d1), F(n2, d2), nm());
if (ctx.op === '−' && n1 / d1 <= n2 / d2) return fasWord(L);
if (ctx.unit === '' && n1 / d1 + n2 / d2 > 1) return fasWord(L);
const { R, L: LL, ways } = fasWays(0, n1, d1, 0, n2, d2, ctx.op);
return { story: ctx.story, ask: ctx.ask, answer: frac(R, LL), ways, op: ctx.op === '+' ? 'add' : 'sub', fracInput: true,
read: { find: ctx.find, know: ctx.know, clue: ctx.clue, plan: `${F(n1, d1)} ${ctx.op} ${F(n2, d2)}` }, hint: 'Different bottoms? Find a common denominator first.' };
}
function fasEstimate() {
const [d1, d2] = denPair(2); const n1 = cn(d1), n2 = cn(d2);
const v = n1 / d1 + n2 / d2; if (Math.abs(v - 1) < 0.001) return fasEstimate();
const c = v > 1 ? 'More than 1' : 'Less than 1';
const half = (n, d) => n / d > 0.5 ? 'more than' : n / d < 0.5 ? 'less than' : 'exactly';
return { ask: 'Without solving, is the sum more or less than 1?', expr: `${F(n1, d1)} + ${F(n2, d2)}`, answer: choice(c, [], { all: ['Less than 1', 'More than 1'] }), choiceBig: true,
ways: [way('Compare to one half', [`${F(n1, d1)} is ${half(n1, d1)} ${F(1, 2)}. ${F(n2, d2)} is ${half(n2, d2)} ${F(1, 2)}.`, `Two halves make exactly 1. Use that to decide: ${b(c.toLowerCase())}.`]),
way('Solve to check', [`Common denominator ${lcm(d1, d2)}: ${F(n1 * lcm(d1, d2) / d1, lcm(d1, d2))} + ${F(n2 * lcm(d1, d2) / d2, lcm(d1, d2))} = ${F(n1 * lcm(d1, d2) / d1 + n2 * lcm(d1, d2) / d2, lcm(d1, d2))}`, `${v > 1 ? 'The top is bigger than the bottom, so it is more than 1.' : 'The top is smaller than the bottom, so it is less than 1.'}`])],
hint: 'Is each fraction bigger or smaller than one half?' };
}
export function genFas(L) {
if (L >= 2 && chance(0.3)) return fasWord(L);
if (L >= 2 && chance(0.15)) return fasEstimate();
let [d1, d2] = denPair(Math.min(L, 2));
let w1 = 0, w2 = 0, n1 = cn(d1), n2 = cn(d2);
if (L === 3) { w1 = rnd(2, 6); w2 = rnd(1, w1 - 1); }
const op = chance(0.5) ? '+' : '−';
if (op === '−' && (w1 + n1 / d1) < (w2 + n2 / d2)) [w1, n1, d1, w2, n2, d2] = [w2, n2, d2, w1, n1, d1];
if (op === '−' && (w1 + n1 / d1) === (w2 + n2 / d2)) return genFas(L);
const { R, L: LL, ways } = fasWays(w1, n1, d1, w2, n2, d2, op);
return { ask: op === '+' ? 'Add.' : 'Subtract.', expr: `${mixedHTML(w1, n1, d1)} ${op} ${mixedHTML(w2, n2, d2)}`, answer: frac(R, LL), ways, fracInput: true,
hint: 'The bottoms must match before you add or subtract. What number do both bottoms go into?' };
}
function fmulWays(w1, n1, d1, w2, n2, d2) {
const A = improperOf(w1, n1, d1), C = improperOf(w2, n2, d2);
const top = A * C, bot = d1 * d2;
const steps = [];
if (w1 && n1) steps.push(`Turn ${mixedHTML(w1, n1, d1)} into a fraction: ${F(A, d1)}`);
if (w2 && n2) steps.push(`Turn ${mixedHTML(w2, n2, d2)} into a fraction: ${F(C, d2)}`);
if (d1 === 1 && !n1) steps.push(`A whole number is a fraction over 1: ${w1} = ${F(w1, 1)}`);
steps.push(`Multiply the tops: ${A} × ${C} = ${top}`, `Multiply the bottoms: ${d1} × ${d2} = ${bot}`, `So you get ${F(top, bot)}`);
steps.push(...simplifyLines(top, bot));
if (gcd(top, bot) === 1 && top < bot) steps.push(`Answer: ${b(fr(top, bot))}`);
const ways = [way('Tops × tops, bottoms × bottoms', steps)];
if (!w1 && !w2 && d1 > 1 && d2 > 1 && d1 <= 8 && d2 <= 8) ways.push(way('Picture it', [`Split a square into ${d2} columns and ${d1} rows. Shade ${n2} column${n2 > 1 ? 's' : ''} and ${n1} row${n1 > 1 ? 's' : ''}.`, fracArea(n1, d1, n2, d2), `The darkest part is where they overlap: ${top} out of ${bot} squares → ${b(fr(top, bot))}`]));
if (!w1 && !w2 && d1 > 1 && d2 > 1) ways.push(way('Does it make sense?', [`Both fractions are less than 1.`, `Taking part of a part always gives something smaller than both: ${fr(top, bot)} is less than ${F(n1, d1)} and less than ${F(n2, d2)} ✓`]));
return { top, bot, ways };
}
export function fmulWord(L) {
const n = nm();
if (chance(0.5)) {
const d = pick([2, 3, 4]), dd = pick([2, 3, 4, 8]), nn = cn(dd);
const { top, bot, ways } = fmulWays(0, 1, d, 0, nn, dd);
return { story: `A recipe uses ${k(F(nn, dd) + ' cup')} of sugar. ${n} makes only ${k(F(1, d))} of the recipe.`, ask: 'How much sugar does that need?', answer: frac(top, bot), ways, op: 'mul', fracInput: true,
read: { find: 'The sugar for the smaller batch.', know: [`full recipe: ${F(nn, dd)} cup`, `making ${F(1, d)} of it`], clue: '“of” a fraction → multiply', plan: `${F(1, d)} × ${F(nn, dd)}` }, hint: '“of” means multiply.' };
}
const d1 = rnd(2, 6), d2 = rnd(2, 6), n1 = cn(d1), n2 = cn(d2);
const { top, bot, ways } = fmulWays(0, n1, d1, 0, n2, d2);
return { story: `A garden is ${k(F(n1, d1) + ' yard')} long and ${k(F(n2, d2) + ' yard')} wide.`, ask: 'What is the area of the garden in square yards?', answer: frac(top, bot), ways, op: 'mul', fracInput: true,
read: { find: 'The area (space inside) of the garden.', know: [`length ${F(n1, d1)} yd`, `width ${F(n2, d2)} yd`], clue: '“area” of a rectangle → length × width', plan: `${F(n1, d1)} × ${F(n2, d2)}` }, hint: 'Area = length × width.' };
}
function fracOfSet() {
const d = rnd(2, 8), n = cn(d), W = d * rnd(2, 9);
const ans = W / d * n;
return { ask: 'Solve.', expr: `${F(n, d)} of ${W}`, answer: num(ans),
ways: [way('Split into groups', [`The bottom number ${d} says: split ${W} into ${d} equal groups.`, `${W} ÷ ${d} = ${W / d} in each group.`, `The top number ${n} says: take ${n} of those groups. ${n} × ${W / d} = ${b(ans)}`]),
way('Multiply', [`“of” means ×: ${F(n, d)} × ${W} = ${F(n * W, d)}`, `${n * W} ÷ ${d} = ${b(ans)}`])],
hint: `First find ${F(1, d)} of ${W} by dividing.` };
}
export function genFmul(L) {
if (L >= 2 && chance(0.3)) return fmulWord(L);
if (L === 1) {
if (chance(0.4)) return fracOfSet();
const w = rnd(2, 9), d = rnd(2, 10), n = cn(d);
const { top, bot, ways } = fmulWays(w, 0, 1, 0, n, d);
ways.push(way('Repeated adding', [`${w} × ${F(n, d)} means ${w} groups of ${F(n, d)}:`, `${Array(w).fill(F(n, d)).join(' + ')} = ${F(w * n, d)}`, `= ${b(fr(w * n, d))}`]));
return { ask: 'Multiply.', expr: `${w} × ${F(n, d)}`, answer: frac(top, bot), ways, fracInput: true, hint: 'Multiply the whole number by the top. Keep the bottom.' };
}
if (L === 2) {
const d1 = rnd(2, 9), d2 = rnd(2, 9), n1 = cn(d1), n2 = cn(d2);
const { top, bot, ways } = fmulWays(0, n1, d1, 0, n2, d2);
return { ask: 'Multiply.', expr: `${F(n1, d1)} × ${F(n2, d2)}`, answer: frac(top, bot), ways, fracInput: true, hint: 'Top × top, bottom × bottom.' };
}
const d1 = rnd(2, 5), n1 = cn(d1), w1 = rnd(1, 4);
const second = chance(0.5) ? [0, rnd(1, 3), pick([2, 3, 4, 5])] : [rnd(2, 6), 0, 1];
if (second[1] >= second[2]) second[1] = 1;
const [w2, n2, d2] = second;
const { top, bot, ways } = fmulWays(w1, n1, d1, w2, n2, d2);
if (n2) ways.push(way('Does it make sense?', [`${F(n2, d2)} is less than 1, so the answer should be SMALLER than ${mixedHTML(w1, n1, d1)}.`, `${fr(top, bot)} is smaller ✓`]));
if (!n2) ways.push(way('Wholes and parts', [`${mixedHTML(w1, n1, d1)} × ${w2} = (${w1} × ${w2}) + (${F(n1, d1)} × ${w2})`, `= ${w1 * w2} + ${fr(n1 * w2, d1)} = ${b(fr(top, bot))}`]));
return { ask: 'Multiply.', expr: `${mixedHTML(w1, n1, d1)} × ${n2 ? F(n2, d2) : w2}`, answer: frac(top, bot), ways, fracInput: true, hint: 'Turn the mixed number into a fraction first.' };
}
export function genScale(L) {
const N = rnd(4, 40);
const kind = pick(['less', 'more', 'one']);
let n, d, w = 0;
if (kind === 'less') { d = rnd(2, 9); n = cn(d); }
else if (kind === 'more') { d = rnd(2, 6); if (chance(0.5)) { w = rnd(1, 3); n = cn(d); } else { n = d + cn(d); } }
else { d = rnd(2, 9); n = d; }
const factor = w ? mixedHTML(w, n, d) : F(n, d);
const val = (w * d + n) / d;
const rel = val < 1 ? 'less than' : val > 1 ? 'greater than' : 'equal to';
const ruleWays = [way('The scaling rule', [
'Multiplying by a number LESS than 1 shrinks it.', 'Multiplying by a number GREATER than 1 grows it.', 'Multiplying by exactly 1 keeps it the same.',
`${factor} is ${val < 1 ? 'less than 1 (the top is smaller than the bottom)' : val > 1 ? 'greater than 1' : 'equal to 1 (the top and bottom match)'}. So ${N} × ${factor} is ${b(rel)} ${N}.`]),
way('Prove it', [`${N} × ${factor} = ${fr(N * (w * d + n), d)}`, `Compare that to ${N}: it is ${rel} ${N} ✓`])];
if (L === 1) return { ask: `Without multiplying: is the product greater than, less than, or equal to ${N}?`, expr: `${N} × ${factor}`, answer: choice(`${cap(rel)} ${N}`, [], { all: [`Less than ${N}`, `Equal to ${N}`, `Greater than ${N}`] }), ways: ruleWays, hint: `Is ${factor} more or less than 1 whole?` };
if (L === 2) {
const d2 = rnd(2, 8), n2a = cn(d2), n2b = d2 + rnd(1, d2);
const [x, y] = chance(0.5) ? [n2a, n2b] : [n2b, n2a];
const c = `${N} × ${frText2(x, d2)}`, o = `${N} × ${frText2(y, d2)}`;
const bigger = x > y ? c : o;
return { ask: 'Without multiplying, which product is greater?', answer: choice(bigger, [x > y ? o : c, 'They are equal'], { keepOrder: false }),
ways: [way('Compare the multipliers', [`Both start with ${N}. Look at what it's multiplied by: ${F(x, d2)} and ${F(y, d2)}.`, `${F(Math.max(x, y), d2)} is greater than 1, so it grows ${N}. ${F(Math.min(x, y), d2)} is less than 1, so it shrinks ${N}.`, `So ${b(bigger)} is greater.`]),
way('Prove it', [`${N} × ${F(x, d2)} = ${fr(N * x, d2)}`, `${N} × ${F(y, d2)} = ${fr(N * y, d2)}`, `The bigger one is ${b(bigger)} ✓`])],
hint: 'Which fraction is bigger than 1?' };
}
const n3 = rnd(1, 8), d3 = n3 + rnd(1, 6);
const nm2 = nm();
return { story: `${nm2} has a photo that is ${k(N + ' cm')} wide. A copy machine resizes it by ${k(F(n3, d3))}.`, ask: 'Will the new photo be wider or narrower than the original?', answer: choice('Narrower', [], { all: ['Narrower', 'The same', 'Wider'] }),
ways: [way('The scaling rule', [`Resizing by ${F(n3, d3)} means multiplying the width by ${F(n3, d3)}.`, `${F(n3, d3)} is less than 1 (the top is smaller than the bottom), so the width shrinks. ${b('Narrower')}.`]),
way('Prove it', [`${N} × ${F(n3, d3)} = ${fr(N * n3, d3)} cm, which is less than ${N} cm ✓`])],
read: { find: 'Whether the photo gets bigger or smaller (no exact number needed).', know: [`${N} cm wide`, `scaled by ${F(n3, d3)}`], clue: '“resizes by” a fraction → multiply. Less than 1 shrinks.', plan: `Is ${F(n3, d3)} more or less than 1?` }, hint: 'Is the fraction more or less than 1?' };
}
const cap = s => s[0].toUpperCase() + s.slice(1);
const frText2 = (n, d) => `${n}/${d}`;
function fracAsDiv(L) {
const d = rnd(2, 9); let a = rnd(1, 3 * d); if (a % d === 0) a++;
const n = nm();
const ways = [way('A fraction IS a division', [`The fraction bar means “divided by.”`, `${a} ÷ ${d} = ${F(a, d)}${a > d ? ` = ${b(fr(a, d))}` : ''}`]),
way('Picture sharing', [`Cut each of the ${a} things into ${d} equal pieces. That's ${a * d} pieces.`, `Share them among ${d}: each gets ${a * d} ÷ ${d} = ${a} pieces, and each piece is ${F(1, d)}.`, `${a} pieces of ${F(1, d)} = ${b(fr(a, d))}`])];
if (L >= 2 || chance(0.5)) {
const thing = pick([['pizzas', 'pizza'], ['pans of brownies', 'pan of brownies'], ['sandwiches', 'sandwich']]);
return { story: `${k(d + ' friends')} share ${k(a + ' ' + thing[0])} equally.`, ask: `How much does each friend get?`, answer: frac(a, d), ways, op: 'div', fracInput: true,
read: { find: `How much ONE friend gets.`, know: [`${a} ${thing[0]}`, `${d} friends`], clue: '“share equally” → divide. The answer can be a fraction!', plan: `${a} ÷ ${d} = ${a}/${d}` }, hint: 'The thing being shared goes on top. The number of people goes on the bottom.' };
}
return { ask: 'Write the answer as a fraction or mixed number.', expr: `${a} ÷ ${d}`, answer: frac(a, d), ways, fracInput: true, hint: 'A ÷ B can be written as the fraction A/B.' };
}
function unitDivWhole() {
const d = rnd(2, 8), w = rnd(2, 6);
return { ask: 'Divide.', expr: `${F(1, d)} ÷ ${w}`, answer: frac(1, d * w), fracInput: true,
ways: [way('Split it into parts', [`Dividing by ${w} means cutting ${F(1, d)} into ${w} equal parts.`, `Each part is ${F(1, d + ' × ' + w)} = ${b(F(1, d * w))}`]),
way('Picture it', [fracBar(1, d, { label: `1/${d}` }), `Now cut every piece into ${w}. The whole has ${d * w} tiny pieces, and you have 1 of them:`, fracBar(1, d * w), b(F(1, d * w))]),
way('Check with multiplication', [`${F(1, d * w)} × ${w} = ${F(w, d * w)} = ${F(1, d)} ✓`])],
hint: `Cut ${F(1, d)} into ${w} pieces. Are the pieces bigger or smaller?` };
}
function wholeDivUnit() {
const d = rnd(2, 8), w = rnd(2, 9);
return { ask: 'Divide.', expr: `${w} ÷ ${F(1, d)}`, answer: num(w * d),
ways: [way('How many fit?', [`Ask: how many ${F(1, d)}s fit into ${w}?`, `Each whole has ${d} pieces of size ${F(1, d)}.`, `${w} wholes have ${w} × ${d} = ${b(w * d)} pieces.`]),
way('Picture it', [fracBar(Math.min(w, 4) * d, d), w > 4 ? `(That's ${4} of the ${w} wholes. Each has ${d} pieces.)` : `Count the pieces: ${w} × ${d} = ${b(w * d)}`]),
way('Check with multiplication', [`${w * d} × ${F(1, d)} = ${F(w * d, d)} = ${w} ✓`])],
hint: `How many ${F(1, d)}s make 1 whole?` };
}
export function fdivWord(L) {
const n = nm();
if (chance(0.5)) { const d = rnd(2, 4), w = rnd(2, 6);
return { story: `${n} has ${k(w + ' cups')} of trail mix. Each snack bag holds ${k(F(1, d) + ' cup')}.`, ask: 'How many snack bags can be filled?', answer: num(w * d), op: 'div',
ways: [way('How many fit?', [`Each cup fills ${d} bags, because ${d} × ${F(1, d)} = 1.`, `${w} cups fill ${w} × ${d} = ${b(w * d)} bags.`]), way('Check with multiplication', [`${w * d} bags × ${F(1, d)} cup = ${F(w * d, d)} = ${w} cups ✓`])],
read: { find: 'The number of bags.', know: [`${w} cups`, `${F(1, d)} cup per bag`], clue: '“how many ___ fit” → divide by the size of each bag', plan: `${w} ÷ ${F(1, d)}` }, hint: 'How many bags does ONE cup fill?' }; }
const d = rnd(2, 4), p = rnd(2, 5);
return { story: `${k(p + ' friends')} share ${k(F(1, d) + ' pound')} of fudge equally.`, ask: 'How much fudge does each friend get?', answer: frac(1, d * p), op: 'div', fracInput: true,
ways: [way('Split it into parts', [`Share ${F(1, d)} among ${p} → divide by ${p}.`, `${F(1, d)} ÷ ${p} = ${F(1, d + ' × ' + p)} = ${b(F(1, d * p))} pound`]),
way('Picture it', [fracBar(1, d, { label: `1/${d} pound` }), `Cut that piece into ${p} equal parts. Now the whole pound has ${d * p} tiny pieces, and each friend gets 1 of them:`, fracBar(1, d * p, { label: `1/${d * p} pound` })]),
way('Check with multiplication', [`${p} friends × ${F(1, d * p)} = ${F(p, d * p)} = ${F(1, d)} pound ✓`])],
read: { find: 'How much ONE friend gets.', know: [`${F(1, d)} pound`, `${p} friends`], clue: '“share equally” → divide. Each share is smaller than what you started with.', plan: `${F(1, d)} ÷ ${p}` }, hint: 'Sharing makes smaller pieces.' };
}
export function genFdiv(L) {
if (L === 1) return fracAsDiv(1);
if (L === 2) return pick([unitDivWhole, wholeDivUnit, () => fracAsDiv(2)])();
return pick([unitDivWhole, wholeDivUnit, fdivWord, fdivWord, () => fracAsDiv(3)])();
}
export { fracAsDiv };
