import { R, rnd, pick, chance, fmt, b, k, way, nm, num, areaModel, splitPV } from '../../util.js';
function mulColumn(a, c) {
const digits = String(c).split('').reverse();
const rows = []; digits.forEach((d, i) => { if (+d) rows.push({ v: fmt(a * +d * 10 ** i), note: `${fmt(a)} × ${fmt(+d * 10 ** i)}` }); });
const res = fmt(a * c);
const w = Math.max(fmt(a).length, fmt(c).length, res.length, ...rows.map(r => r.v.length)) + 2;
const rule = `<span class="rule">${'─'.repeat(w)}</span>`;
const L = ['  ' + fmt(a).padStart(w - 2), '× ' + fmt(c).padStart(w - 2), rule];
if (rows.length > 1) {
rows.forEach((r, i) => L.push((i === rows.length - 1 ? '+ ' : '  ') + r.v.padStart(w - 2) + `   <span class="note">${r.note}</span>`));
L.push(rule);
}
L.push('  ' + res.padStart(w - 2));
return `<pre class="col">${L.join('\n')}</pre>`;
}
function mulWays(a, c) {
const ap = splitPV(a), cp = splitPV(c);
const parts = []; for (const y of cp) for (const x of ap) parts.push(x * y);
const ways = [
way('Area model (break it apart)', [
`Break the numbers into place values: ${fmt(a)} = ${ap.map(fmt).join(' + ')}${cp.length > 1 ? ` and ${fmt(c)} = ${cp.map(fmt).join(' + ')}` : ''}.`,
areaModel(ap, cp), `Multiply each box (easy facts with zeros on the end).`,
`Add all the boxes: ${parts.map(fmt).join(' + ')} = ${b(fmt(a * c))}`]),
];
ways.push(way('Standard method', [cp.length > 1
? `Multiply ${fmt(a)} by each digit of ${fmt(c)}, one row at a time, starting with the ones digit. The tens row gets a 0 on the end, because that digit is really tens.`
: `Multiply ${c} by each digit of ${fmt(a)}, starting from the ones. If you get 10 or more, carry the tens digit to the next place.`,
mulColumn(a, c), `Answer: ${b(fmt(a * c))}`]));
const ra = Number(String(a)[0]) * 10 ** (String(a).length - 1), rc = Number(String(c)[0]) * 10 ** (String(c).length - 1);
ways.push(way('Estimate to check', [`Round: ${fmt(a)} is about ${fmt(ra)}${c >= 10 ? `, ${fmt(c)} is about ${fmt(rc)}` : ''}.`, `${fmt(ra)} × ${fmt(c >= 10 ? rc : c)} = ${fmt(ra * (c >= 10 ? rc : c))}. Our answer ${fmt(a * c)} is in the same neighborhood ✓`]));
return ways;
}
const MUL_CTX = [
(a, c, n) => [`A theater has ${k(c + ' rows')} with ${k(a + ' seats in each row')}.`, 'How many seats are there in all?', 'seats in all', [`${c} rows`, `${a} seats in each row`], '“in each row” = equal groups → multiply'],
(a, c, n) => [`${n} reads ${k(a + ' pages')} every day for ${k(c + ' days')}.`, `How many pages does ${n} read?`, 'total pages', [`${a} pages each day`, `${c} days`], '“every day” = the same amount again and again → multiply'],
(a, c, n) => [`A store packs ${k(a + ' crayons')} in each box. It packs ${k(c + ' boxes')}.`, 'How many crayons is that?', 'total crayons', [`${a} crayons per box`, `${c} boxes`], '“in each box” = equal groups → multiply'],
(a, c, n) => [`A farm plants ${k(c + ' rows')} of corn with ${k(a + ' plants')} in every row.`, 'How many corn plants are there?', 'total plants', [`${c} rows`, `${a} plants per row`], '“in every row” = equal groups → multiply'],
];
function mulNums(L) {
if (L === 1) return chance(0.7) ? [rnd(12, 99), rnd(3, 9)] : [rnd(102, 499), rnd(2, 6)];
if (L === 2) return chance(0.7) ? [rnd(13, 99), rnd(12, 49)] : [rnd(112, 999), rnd(3, 9)];
return chance(0.7) ? [rnd(112, 999), rnd(12, 89)] : [rnd(1012, 4999), rnd(12, 39)];
}
export function mulWord(L) {
const [a, c] = mulNums(Math.max(L, 2)); const n = nm();
const [story, ask, find, know, clue] = pick(MUL_CTX)(fmt(a), c, n);
return { ask, story, answer: num(a * c), ways: mulWays(a, c), op: 'mul',
read: { find: `How many ${find}.`, know, clue, plan: `${fmt(a)} × ${c}` }, hint: 'Equal groups → multiply.' };
}
export function genMul(L) {
if (L >= 2 && chance(0.3)) return mulWord(L);
const [a, c] = mulNums(L);
return { ask: 'Multiply.', expr: `${fmt(a)} × ${fmt(c)}`, answer: num(a * c), ways: mulWays(a, c), hint: 'Break the bigger number into hundreds, tens and ones.' };
}
function longDiv(dividend, d) {
const ds = String(dividend).split('').map(Number); const steps = []; let cur = 0, started = false;
for (let i = 0; i < ds.length; i++) {
cur = cur * 10 + ds[i];
if (!started && cur < d && i < ds.length - 1) { if (i === 0) steps.push(`${d} doesn't fit into ${cur}, so use the first two digits${String(dividend).length > 2 && cur * 10 + ds[1] < d ? ' (or three)' : ''}.`); continue; }
started = true;
const q = Math.floor(cur / d), p = q * d, r = cur - p;
steps.push(`How many ${d}s fit in ${b(cur)}? ${b(q)}, because ${q} × ${d} = ${p}. Then ${cur} − ${p} = ${r}.` + (i < ds.length - 1 ? ` Bring down the ${ds[i + 1]}.` : ''));
cur = r;
}
return steps;
}
function friendly(dividend, d) {
const lines = []; let rem = dividend, total = 0;
const M = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
while (rem > 0) { const m = M.find(m2 => m2 * d <= rem); lines.push(`${m} × ${d} = ${fmt(m * d)} → ${fmt(rem)} − ${fmt(m * d)} = ${fmt(rem - m * d)}`); rem -= m * d; total += m; }
return { lines, total };
}
function divWays(dividend, d) {
const q = dividend / d; const f = friendly(dividend, d);
const ways = [
way('Long division', [...longDiv(dividend, d), `Answer: ${b(fmt(q))}`]),
way('Friendly chunks', [`Take away easy groups of ${d} (like 10, 20, 50 or 100 of them) until nothing is left.`, ...f.lines, `Add up how many groups you took: ${b(fmt(q))}`]),
way('Check with multiplication', [`Division and multiplication undo each other.`, `${fmt(q)} × ${d} = ${fmt(dividend)} ✓`]),
];
if (d >= 11) ways[0].s.unshift(`Tip: ${d} is close to ${Math.round(d / 10) * 10}. Use that to guess each digit, then adjust.`);
return ways;
}
function divNums(L) {
if (L === 1) { const d = rnd(2, 9); return [d * rnd(11, 99), d]; }
if (L === 2) { const d = rnd(3, 9); return [d * rnd(112, Math.floor(9999 / d)), d]; }
const d = rnd(11, 39); return [d * rnd(12, Math.floor(9999 / d)), d];
}
const DIV_CTX = [
(t, d, n) => [`${n} has ${k(t + ' stickers')} to share equally among ${k(d + ' friends')}.`, 'How many stickers does each friend get?', 'stickers each friend gets', [`${t} stickers`, `${d} friends`], '“share equally” → divide'],
(t, d, n) => [`A school sets up ${k(t + ' chairs')} in ${k(d + ' equal rows')}.`, 'How many chairs are in each row?', 'chairs in one row', [`${t} chairs`, `${d} equal rows`], '“equal rows” and “in each” → divide'],
(t, d, n) => [`A bakery made ${k(t + ' cookies')}. It puts ${k(d + ' cookies')} in each box.`, 'How many boxes can it fill?', 'how many boxes', [`${t} cookies`, `${d} cookies per box`], '“how many groups of ' + d + '” → divide'],
(t, d, n) => [`A road trip is ${k(t + ' miles')}. The family drives the same distance each day for ${k(d + ' days')}.`, 'How many miles do they drive each day?', 'miles each day', [`${t} miles total`, `${d} days`, 'same distance each day'], '“same distance each day” → split the total equally → divide'],
];
export function divWord(L) {
const [t, d] = divNums(Math.max(L, 2)); const n = nm();
const [story, ask, find, know, clue] = pick(DIV_CTX)(fmt(t), d, n);
return { ask, story, answer: num(t / d), ways: divWays(t, d), op: 'div', read: { find: find + '.', know, clue, plan: `${fmt(t)} ÷ ${d}` }, hint: 'Splitting a total into equal groups → divide.' };
}
export function genDiv(L) {
if (L >= 2 && chance(0.3)) return divWord(L);
const [t, d] = divNums(L);
return { ask: 'Divide.', expr: `${fmt(t)} ÷ ${d}`, answer: num(t / d), ways: divWays(t, d), hint: `How many ${d}s fit into the first digit or two?` };
}
export function remWord() {
const d = rnd(3, 9), q = rnd(4, 15), r = rnd(1, d - 1), t = d * q + r; const n = nm();
const kind = pick(['up', 'down', 'left']);
const base = [`${t} ÷ ${d} = ${q} R${r}`, `That means ${q} full groups of ${d}, with ${r} left over.`];
if (kind === 'up') return { story: `${k(t + ' students')} are going on a field trip. Each van holds ${k(d + ' students')}.`, ask: 'How many vans are needed so everyone can go?', answer: num(q + 1), op: 'div',
ways: [way('Divide, then think', [...base, `The ${r} leftover student${r > 1 ? 's' : ''} still need${r > 1 ? '' : 's'} a ride! So you need one more van: ${q} + 1 = ${b(q + 1)}.`]),
way('Check it', [`${q} vans hold ${q * d} students. That leaves ${r} without a seat ✗`, `${q + 1} vans hold ${(q + 1) * d}. Everyone fits ✓`])],
read: { find: 'The number of vans so NOBODY is left behind.', know: [`${t} students`, `${d} per van`], clue: '“needed so everyone” → if anyone is left over, round UP.', plan: `${t} ÷ ${d}, then decide what to do with the leftover` }, hint: 'Can the leftover students stay home?' };
if (kind === 'down') return { story: `A baker has ${k(t + ' muffins')} and packs them in boxes of ${k(String(d))}.`, ask: 'How many boxes can the baker fill all the way?', answer: num(q), op: 'div',
ways: [way('Divide, then think', [...base, `The question asks for FULL boxes. The ${r} leftover muffin${r > 1 ? 's' : ''} can't fill a box, so the answer is ${b(q)}.`])],
read: { find: 'Only the boxes that are completely full.', know: [`${t} muffins`, `${d} in each box`], clue: '“fill all the way” → leftovers don’t count. Use just the whole part.', plan: `${t} ÷ ${d}, keep only the full groups` }, hint: 'Does a box with only a few muffins count as full?' };
return { story: `${n} has ${k(t + ' beads')} and makes bracelets with ${k(d + ' beads')} each.`, ask: 'How many beads are left over after making as many bracelets as possible?', answer: num(r), op: 'div',
ways: [way('Divide, then think', [...base, `The question asks for the leftovers: ${b(r)}.`]), way('Check it', [`${q} bracelets use ${q} × ${d} = ${q * d} beads.`, `${t} − ${q * d} = ${b(r)} left over.`])],
read: { find: 'The beads that are LEFT, not the number of bracelets.', know: [`${t} beads`, `${d} beads per bracelet`], clue: '“left over” → the answer is the remainder.', plan: `${t} ÷ ${d}, the answer is the remainder` }, hint: 'The question is about the leftovers.' };
}
