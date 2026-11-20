// Fact families: the four facts that two numbers and their product make, and finding the one that is missing.
import { rnd, pick, chance, b, way, num, choice } from '../../util.js';
import { dots } from './pics.js';
import { BLANK } from './words.js';
import { tfQ } from './forms.js';

const family = (a, c) => [`${a} × ${c} = ${a * c}`, `${c} × ${a} = ${a * c}`, `${a * c} ÷ ${a} = ${c}`, `${a * c} ÷ ${c} = ${a}`];
const familyWay = (a, c) => way('The fact family', [`${a}, ${c} and ${a * c} belong together. They make four facts:`, ...family(a, c), 'Know one of them and you know all four.']);
const pair = (lo, hi, lo2, hi2) => { const a = rnd(lo, hi); let c = rnd(lo2, hi2); while (c === a) c = rnd(lo2, hi2); return [a, c]; };

function knownQ(a, c, picture) {
  const p = a * c, byRows = chance(0.5), d = byRows ? a : c, q = p / d, fact = b(`${a} × ${c} = ${p}`);
  return { ask: picture ? `The array shows ${fact}. Use it to find:` : `You know that ${fact}. Use it to find:`, expr: `${p} ÷ ${d}`, visual: picture ? dots(a, c) : undefined, answer: num(q), hint: `Which number goes with ${d} to make ${p}?`, _t: { f: 'div', a: p, b: d },
    ways: [way('Same array, different question', [dots(a, c), `The array has ${a} rows of ${c}: ${p} dots.`,
      byRows ? `${p} ÷ ${a} asks: ${p} dots in ${a} equal rows, how many in each row? ${b(c)}.` : `${p} ÷ ${c} asks: ${p} dots in rows of ${c}, how many rows? ${b(a)}.`]), familyWay(a, c)] };
}
function missingQ(a, c) {
  const p = a * c, form = rnd(0, 3);
  const [expr, ans, think] = [[`${BLANK} × ${c} = ${p}`, a, `How many ${c}s make ${p}? That is ${p} ÷ ${c}.`], [`${a} × ${BLANK} = ${p}`, c, `${a} times what makes ${p}? That is ${p} ÷ ${a}.`],
    [`${p} ÷ ${BLANK} = ${c}`, a, `${p} split into groups that hold ${c} each. ${c} times what makes ${p}?`], [`${BLANK} ÷ ${a} = ${c}`, p, `The missing number is the total: ${a} groups of ${c}. That is ${a} × ${c}.`]][form];
  return { ask: 'What number is missing?', expr, answer: num(ans), hint: form === 3 ? 'The missing number is the whole total. Multiply to build it.' : 'Use the fact family: think of the multiplication with these numbers.', _t: { f: form === 3 ? 'mul' : 'div', a: form === 3 ? a : p, b: form === 1 ? a : c },
    ways: [way('Ask it as a question', [think, `Check: ${expr.replace(BLANK, ans)}.`, `The missing number is ${b(ans)}.`]), familyWay(a, c)] };
}
function sameFamilyQ(a, c) {
  const p = a * c, right = `${p} ÷ ${a} = ${c}`;
  return { ask: `Which fact is in the same family as ${b(`${a} × ${c} = ${p}`)}?`, answer: choice(right, [`${p} − ${a} = ${p - a}`, `${a} + ${c} = ${a + c}`, `${c} ÷ ${a} = ${p}`]), hint: `A fact family uses the same three numbers. The total, ${p}, is the number that gets divided.`, _t: { f: 'fam', a, c },
    ways: [familyWay(a, c), way('Rule out the others', [`${p} − ${a} = ${p - a} brings in a new number, ${p - a}.`, `${a} + ${c} = ${a + c} brings in ${a + c}.`, `${c} ÷ ${a} = ${p} has the numbers in the wrong places: the total must come first.`, `That leaves ${b(right)}.`])] };
}
function tfFamilyQ(a, c) {
  const p = a * c, ok = chance(0.5), shown = ok ? `${p} ÷ ${a} = ${c}` : pick([`${a} ÷ ${p} = ${c}`, `${p} ÷ ${a} = ${a + c}`]);
  const q = tfQ({ expr: shown, ok, hint: 'In a division fact the total comes first. Does the sentence use the same three numbers and keep the total first?',
    why: [`The multiplication is ${a} × ${c} = ${p}, so the total is ${p}.`, ok ? `${p} ÷ ${a} = ${c}. The sentence is ${b('true')}.` : `${shown} does not work: the total ${p} must come first, and the answer must fit. It is ${b('false')}.`] });
  return { ...q, ask: `You know that ${b(`${a} × ${c} = ${p}`)}. True or false?` };
}
// "3 × 4 makes a fact family. In its division facts, which number comes first?"
function totalQ(a, c) {
  const p = a * c;
  return { ask: `${b(`${a} × ${c}`)} makes a fact family. In its two division facts, which number is divided (the one that comes first)?`, answer: num(p), hint: 'The number that gets divided is the total of the groups. How do you find a total from the two numbers?', _t: { f: 'mul', a, b: c },
    ways: [way('Find the total', [`The division facts start with the total, so work out ${a} × ${c}.`, `${a} × ${c} = ${b(p)}.`]), way('Write the family', [`${a} × ${c} = ${p}, so the divisions are ${p} ÷ ${a} = ${c} and ${p} ÷ ${c} = ${a}.`, `The number that comes first in both is ${b(p)}.`])] };
}
export function genFamily(L) {
  if (L === 1) {
    const [a, c] = pair(2, 5, 3, 9), t = pick(['pic', 'plain', 'same', 'tf', 'total']);
    return t === 'pic' ? knownQ(a, c, true) : t === 'plain' ? knownQ(a, c, false) : t === 'same' ? sameFamilyQ(a, c) : t === 'tf' ? tfFamilyQ(a, c) : totalQ(a, c);
  }
  if (L === 2) {
    const [a, c] = pair(3, 9, 3, 9), t = pick(['miss', 'miss', 'same', 'tf', 'plain']);
    return t === 'miss' ? missingQ(a, c) : t === 'same' ? sameFamilyQ(a, c) : t === 'tf' ? tfFamilyQ(a, c) : knownQ(a, c, false);
  }
  const t = pick(['miss', 'miss', 'same', 'tf', 'total']);
  if (t === 'same') return sameFamilyQ(...pair(3, 9, 4, 9));
  const [a, c] = pair(6, 12, 6, 9);
  return t === 'tf' ? tfFamilyQ(a, c) : t === 'total' ? totalQ(a, c) : missingQ(a, c);
}
