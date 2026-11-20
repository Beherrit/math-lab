// Mass and liquid volume: choosing a unit, estimating, reading a scale, and one-step problems in the same unit.
import { rnd, pick, shuffle, b, way, nm, num, choice, fmt as f } from '../../util.js';
import { yesNo, mark } from './kit.js';
import { tell } from './words.js';
import { jug, pointerScale } from './gauges.js';
import { MASS, VOLUME, UNIT_NAME, OTHER, ANCHOR, typical } from './massitems.js';
import { hops } from './arith.js';

const sortOf = () => pick([MASS, VOLUME]);
const text = (n, u) => `${f(n)} ${u}`;
const what = item => (VOLUME.includes(item) ? 'liquid volume' : 'mass');
// "A cat has a mass of about 4 ___": which unit makes sense?
function unitQ(item = pick(pick([MASS, VOLUME])), n = typical(item)) {
  const [name, u] = item, o = OTHER[u], vol = VOLUME.includes(item);
  return { ask: vol ? `${name[0].toUpperCase() + name.slice(1)} holds about ${b(n)} ___. Which unit fits?` : `${name[0].toUpperCase() + name.slice(1)} has a mass of about ${b(n)} ___. Which unit fits?`, answer: choice(UNIT_NAME[u], [UNIT_NAME[o]]), choiceBig: true,
    _t: { f: 'unit', item: name, n }, hint: vol ? 'A milliliter is a tiny amount, about a drop or two. A liter is a big bottle.' : 'A gram is tiny, about a paperclip. A kilogram is about a bag of sugar.',
    ways: [way('Picture it', [vol ? 'A liter is about a big bottle. A milliliter is about a drop.' : 'A kilogram is about a bag of sugar. A gram is about a paperclip.', `${n} ${UNIT_NAME[o]} would be ${u === 'kg' || u === 'L' ? 'far too small' : 'far too big'} for ${name}, so it is ${b(UNIT_NAME[u])}.`]),
      way('Compare with something you know', [ANCHOR[u], `${n} ${u} fits ${name}, so the unit is ${b(UNIT_NAME[u])}.`])] };
}
// Which is the best estimate? One choice has the right unit and size, the others are a unit out or ten times out.
function estimateQ(item = pick(sortOf())) {
  const [name, u] = item, n = typical(item), o = OTHER[u], right = text(n, u), wrong = [text(n, o), text(n * 10, u), n % 10 === 0 ? text(n / 10, u) : text(n * 100, u)].filter(x => x !== right);
  return { ask: `Which is the best estimate for the ${what(item)} of ${name}?`, answer: choice(right, shuffle(wrong)), choiceBig: true, _t: { f: 'bestest', item: name }, hint: 'Think of something you know well, like a paperclip, a bag of sugar or a big bottle of water.',
    ways: [way('Compare with something you know', [ANCHOR[u], `So ${b(right)} is the sensible estimate for ${name}.`]), way('Rule out the others', [`${text(n, o)}, ${text(n * 10, u)} and the other choices are not close to the real amount for ${name}.`, `That leaves ${b(right)}.`])] };
}
// True or false: "A cat has a mass of about 4 kg" (or 4 g, which is far too small).
function senseQ(item = pick(sortOf()), ok = Math.random() < 0.5) {
  const [name, u] = item, n = typical(item), shown = ok ? u : OTHER[u], un = n === 1 ? UNIT_NAME[shown].replace(/s$/, '') : UNIT_NAME[shown], cap = name[0].toUpperCase() + name.slice(1);
  return { ask: 'True or false?', expr: `${cap} ${VOLUME.includes(item) ? 'holds' : 'has a mass of'} about ${n} ${un}.`, answer: yesNo(ok), choiceBig: true, _t: { f: 'unitsense', item: name, n, unit: shown }, hint: 'Picture it. Is that a sensible amount for a thing like that?',
    ways: [way('Picture it', [`${n} ${un} is ${ok ? 'about right' : shown === 'g' || shown === 'mL' ? 'far too small' : 'far too big'} for ${name}.`, ok ? `The sentence is ${b('True')}.` : `The sentence is ${b('False')}.`]),
      way('Try the other unit', [`${n} ${UNIT_NAME[OTHER[shown]]} would be ${ok ? 'far too big or small' : 'a sensible amount'} for ${name}.`, ok ? `So the unit in the sentence is right: ${b('True')}.` : `So the unit in the sentence is wrong: ${b('False')}.`])] };
}
// Reading a jug or a pointer scale. Step 1 marks every 100, step 2 marks every 100 with halfway readings, step 3 marks every 20.
function readQ(L, vol) {
  const [max, step, every, mult] = L === 1 ? [500, 100, 100, 100] : L === 2 ? [1000, 100, 200, 50] : [500, 20, 100, 20];
  const v = mult * rnd(1, max / mult - 1), picture = vol ? jug(v, max, step, every) : pointerScale(v, max, step, every), u = vol ? 'mL' : 'g';
  return { ask: mark(vol ? 'How much liquid is in the jug?' : 'How many grams does the scale show?', vol ? 'jug' : 'scale', v, max), visual: picture, answer: num(v), suffix: u, _t: { f: 'gauge', pic: true },
    hint: `Find the two marks the ${vol ? 'liquid level' : 'pointer'} is between. How much is each small mark worth?`,
    ways: [way('Count the small marks', [picture, `The marks go up by ${step} ${u}, and the biggest numbers are every ${every}.`, `The ${vol ? 'level' : 'pointer'} is at ${b(v)} ${u}.`]), way('Use the marks', [`The marks are ${step} ${u} apart.`, v % step === 0 ? `The ${vol ? 'level' : 'pointer'} is exactly on the mark for ${v}.` : `The ${vol ? 'level' : 'pointer'} is halfway between ${v - step / 2} and ${v + step / 2}: ${v - step / 2} + ${step / 2} = ${v}.`, `The reading is ${b(v)} ${u}.`])] };
}
// How much more fits? The jug is filled to a level and the top mark is the full amount.
function roomQ(L) {
  const [max, step, every, mult] = L === 3 ? [500, 20, 100, 20] : [1000, 100, 200, 50], v = mult * rnd(2, max / mult - 2), pic = jug(v, max, step, every);
  return { ask: mark('The jug is filled to the top mark when it holds the largest number. How many more milliliters fit in?', 'room', v, max), visual: pic, answer: num(max - v), suffix: 'mL', _t: { f: 'gaugeroom', pic: true },
    hint: 'Read the level first. Then count up to the top mark.', ways: [way('Take the level from the top mark', [pic, `The top mark is ${max} mL and the jug holds ${v} mL.`, `${max} − ${v} = ${b(max - v)} mL.`]), way('Count up to the top', [`Count up from ${v} to ${max} in jumps: ${hops(v, max).join(' + ')}.`, `The jumps add up to ${b(max - v)} mL.`])] };
}
// One-step problems in one unit: [story, ask, unit] for each operation.
const ADD = [(a, c) => [`A suitcase has ${a} kg of clothes and ${c} kg of shoes.`, 'What is the total mass in kilograms?', 'kg', 'big'], (a, c, m) => [`${m} pours ${a} mL of juice and ${c} mL of soda into a jug.`, 'How many milliliters are in the jug?', 'mL', 'small'],
  (a, c) => [`A package of rice has a mass of ${a} g and a package of beans has a mass of ${c} g.`, 'What is the total mass in grams?', 'g', 'small']];
const SUB = [(a, c) => [`A bucket holds ${a} liters. ${c} liters are poured out.`, 'How many liters are left?', 'L', 'big'], (a, c) => [`A bag of flour has a mass of ${a} g. ${c} g are used for a cake.`, 'How many grams are left?', 'g', 'small'],
  (a, c, m) => [`${m}'s water bottle holds ${a} mL. ${m} drinks ${c} mL.`, 'How many milliliters are left in the bottle?', 'mL', 'small']];
const MUL = [(g, s, m) => [`A can of soda holds ${s} mL. ${m} buys ${g} cans.`, 'How many milliliters is that altogether?', 'mL'], (g, s) => [`One bag of apples has a mass of ${s} g. A shop sells ${g} bags.`, 'What is the total mass in grams?', 'g'],
  (g, s) => [`A bottle holds ${s} mL of water. A team drinks ${g} bottles.`, 'How many milliliters of water is that?', 'mL']];
const DIV = [(t, d) => [`A ${t} mL carton of juice is shared equally into ${d} glasses.`, 'How many milliliters go in each glass?', 'mL'], (t, d) => [`${t} g of dough is split equally into ${d} rolls.`, 'What is the mass of each roll in grams?', 'g'],
  (t, d) => [`A ${t} mL bottle of water is poured equally into ${d} cups.`, 'How many milliliters are in each cup?', 'mL']];
function oneStepQ(op, L) {
  const m = nm();
  if (op === 'mul' || op === 'div') {
    const g = L === 2 ? rnd(2, 6) : rnd(4, 9), s = pick(L === 2 ? [150, 200, 250, 300, 500] : [120, 250, 330, 450, 500]), [story, ask, suffix] = op === 'mul' ? pick(MUL)(g, s, m) : pick(DIV)(g * s, g);
    return { story, ask, answer: num(op === 'mul' ? g * s : s), suffix, _t: op === 'mul' ? { f: 'mul', a: g, b: s } : { f: 'div', a: g * s, b: g }, hint: op === 'mul' ? 'Equal amounts, many times: which operation?' : 'Shared equally: which operation?',
      ways: op === 'mul' ? [way('Multiply', [`${g} groups of ${s}: ${g} × ${s} = ${b(f(g * s))} ${suffix}.`]), way('Add the amounts', [`${Array(g).fill(s).join(' + ')} = ${b(f(g * s))} ${suffix}.`])]
        : [way('Divide', [`${f(g * s)} ÷ ${g} = ${b(s)} ${suffix}.`]), way('Think multiplication', [`${g} × ? = ${f(g * s)}.`, `${g} × ${s} = ${f(g * s)}, so each gets ${b(s)} ${suffix}.`])] };
  }
  const row = pick(op === 'add' ? ADD : SUB), big = row(1, 1, m)[3] === 'big', a = big ? (op === 'add' ? rnd(4, 14) : rnd(8, 15)) : rnd(L === 1 ? 10 : 20, L === 1 ? 40 : 80) * 10, c = big ? rnd(2, op === 'add' ? 9 : a - 2) : rnd(5, a / 10 - 3) * 10;
  const [story, ask, suffix] = row(a, c, m), ans = op === 'add' ? a + c : a - c;
  return { story, ask, answer: num(ans), suffix, _t: op === 'add' ? { f: 'add', xs: [a, c] } : { f: 'sub', a, b: c }, hint: op === 'add' ? 'Two amounts are put together. Which operation?' : 'Some is taken away. Which operation?',
    ways: [way(op === 'add' ? 'Add' : 'Subtract', [`${f(a)} ${op === 'add' ? '+' : '−'} ${f(c)} = ${b(f(ans))} ${suffix}.`]), way(op === 'add' ? 'Count on' : 'Count up from the smaller', [op === 'add' ? `Start at ${f(a)} and count on ${f(c)}: ${f(a)} + ${f(c)}.` : `Count up from ${f(c)} to ${f(a)}.`, `You get ${b(f(ans))} ${suffix}.`])] };
}
const CONV = [['kilogram', 'kilograms', 'grams'], ['liter', 'liters', 'milliliters']];
// 1 kilogram is 1,000 grams and 1 liter is 1,000 milliliters: the one fact that links the two units.
function convertQ(toSmall) {
  const [one, many, small] = pick(CONV), k = rnd(2, 6), total = k * 1000, fact = `1 ${one} is 1,000 ${small}.`;
  if (toSmall) return { ask: `${fact} How many ${small} are in ${k} ${many}?`, answer: num(total), suffix: small, _t: { f: 'mul', a: k, b: 1000 }, hint: `Each ${one} is the same amount. How many ${small} in one?`,
    ways: [way('Multiply', [`${k} × 1,000 = ${b(f(total))} ${small}.`]), way('Add one at a time', [`${Array(k).fill('1,000').join(' + ')} = ${b(f(total))} ${small}.`])] };
  return { ask: `${fact} How many ${many} are in ${f(total)} ${small}?`, answer: num(k), suffix: many, _t: { f: 'div', a: total, b: 1000 }, hint: `How many groups of 1,000 ${small} are there?`,
    ways: [way('Divide', [`${f(total)} ÷ 1,000 = ${b(k)} ${many}.`]), way('Count by thousands', [`Count by 1,000s to reach ${f(total)}: ${Array.from({ length: k }, (_, i) => f((i + 1) * 1000)).join(', ')}.`, `That took ${b(k)} counts, so ${b(k)} ${many}.`])] };
}
// A story for the level's story skill: equal amounts of mass or liquid, multiplied or shared. Steps 2 and 3 only.
export function measureWord(L) {
  if (L === 1) return null;
  const m = nm(), g = L === 2 ? rnd(2, 5) : rnd(4, 9), s = pick(L === 2 ? [50, 100, 150, 200] : [120, 250, 330, 450, 500]), mul = Math.random() < 0.5;
  const [story, ask, unit] = mul ? pick(MUL)(g, s, m) : pick(DIV)(g * s, g);
  const know = mul ? [`${g} of them`, `${f(s)} ${unit} each`] : [`${f(g * s)} ${unit} in all`, `${g} equal parts`];
  const row = [story, ask, mul ? `The total in ${unit}.` : `The amount in one part, in ${unit}.`, know, mul ? 'Equal amounts again and again means multiply.' : '"Equally" means divide.'];
  return tell(row, mul ? 'mul' : 'div', num(mul ? g * s : s), mul ? [way('Multiply', [`${g} × ${f(s)} = ${b(f(g * s))} ${unit}.`]), way('Add the amounts', [`${Array(g).fill(f(s)).join(' + ')} = ${b(f(g * s))} ${unit}.`])] : [way('Divide', [`${f(g * s)} ÷ ${g} = ${b(f(s))} ${unit}.`]), way('Think multiplication', [`${g} × ? = ${f(g * s)}.`, `${g} × ${f(s)} = ${f(g * s)}, so each part is ${b(f(s))} ${unit}.`])],
    mul ? `${g} × ${f(s)}` : `${f(g * s)} ÷ ${g}`, mul ? { f: 'mul', a: g, b: s } : { f: 'div', a: g * s, b: g }, { suffix: unit, hint: mul ? 'Equal amounts, many times: which operation?' : 'Shared equally: which operation?' });
}
const OPS = { 1: ['add', 'sub'], 2: ['mul', 'div', 'add', 'sub'], 3: ['mul', 'div', 'add', 'sub'] };
export function genMassVol(L) {
  if (L === 1) return pick([() => unitQ(), () => unitQ(), () => readQ(1, true), () => readQ(1, false), () => oneStepQ(pick(OPS[1]), 1), () => senseQ()])();
  if (L === 2) return pick([() => estimateQ(), () => senseQ(), () => readQ(2, true), () => readQ(2, false), () => oneStepQ(pick(OPS[2]), 2), () => unitQ()])();
  return pick([() => estimateQ(), () => readQ(3, true), () => roomQ(3), () => roomQ(2), () => oneStepQ(pick(OPS[3]), 3), () => senseQ(), () => convertQ(Math.random() < 0.5)])();
}
