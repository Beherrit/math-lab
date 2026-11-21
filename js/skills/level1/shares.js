// Halves, thirds and quarters of shapes: equal shares, naming a share, and the same whole cut in different ways.
import { rnd, pick, chance, shuffle, b, way, nm, num, choice } from '../../util.js';
import { cnt, mark, countList } from './words.js';
import { shareFig, figPair, evenBounds, unevenBounds } from './sharepics.js';

const NAME = { 2: 'halves', 3: 'thirds', 4: 'quarters' }, ONE = { 2: 'half', 3: 'third', 4: 'quarter' }, TOTAL = ['', 'one', 'two', 'three'];
const KINDS = { 2: ['cols', 'rows', 'diag'], 3: ['cols', 'rows'], 4: ['cols', 'rows', 'grid'] };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const WORD = { '1/2': 'one half', '1/3': 'one third', '1/4': 'one quarter', '2/3': 'two thirds', '3/4': 'three quarters' };

// A picture and a short description of it (for the hidden marker).
function figure(parts, { uneven = false, shade = [], shape = pick(['rect', 'rect', 'circle']), kind } = {}) {
  let k = kind || pick(KINDS[parts]);
  if (uneven && (k === 'diag' || k === 'grid')) k = 'cols';
  const bounds = uneven ? unevenBounds(parts) : evenBounds(parts), spec = { shape, kind: k, parts, bounds, shade };
  return { html: shareFig(spec), spec, tag: mark(shape, k, parts, shade.join(''), uneven ? 'u' : 'e', bounds.map(x => x.toFixed(2)).join('-')) };
}
function partsQ(parts) {
  const f = figure(parts), linear = ['cols', 'rows', 'diag'].includes(f.spec.kind);
  return { ask: `How many equal parts is this shape cut into?${f.tag}`, visual: f.html, answer: num(parts), hint: 'Touch each part once as you count, so you do not count one twice.', _t: { f: 'parts', parts },
    ways: [way('Count the parts', ['Start at one part and touch each part once.', `There are ${b(parts)} equal parts.`]),
      way(linear ? 'Count the cut lines' : 'Count around the middle', linear ? [`Count the cut lines inside the shape: ${parts - 1}. You always get one more part than there are cut lines.`, `${parts - 1} + 1 = ${b(parts)}.`] : ['Go once around the middle, counting each part.', `You count ${b(parts)} parts.`])] };
}
function nameQ(parts) {
  const f = figure(parts);
  return { ask: `These parts are all equal. What are they called?${f.tag}`, visual: f.html, answer: choice(NAME[parts], shuffle(Object.values(NAME).filter(n => n !== NAME[parts]))), choiceBig: true, hint: 'Count the equal parts first, then match that number to a name.', _t: { f: 'sharename', parts },
    ways: [way('Count, then name', [`There are ${parts} equal parts.`, `A whole cut into ${parts} equal parts makes ${b(NAME[parts])}.`]),
      way('Say one part', [`One of these parts is ${b('a ' + ONE[parts])} of the whole.`, `All of them together are ${b(NAME[parts])}.`])] };
}
function equalQ(parts, uneven) {
  const f = figure(parts, { uneven });
  return { ask: `Are the parts of this shape equal shares?${f.tag}`, visual: f.html, answer: choice(uneven ? 'No' : 'Yes', [], { all: ['Yes', 'No'] }), choiceBig: true, hint: 'Equal shares are exactly the same size. Is any part bigger than another?', _t: { f: 'equalshares' },
    ways: [way('Compare the parts', [`The shape is cut into ${parts} parts.`, uneven ? `One part is clearly bigger than another, so they are not equal shares: ${b('No')}.` : `Every part is the same size, so they are equal shares: ${b('Yes')}.`]),
      way('Picture cutting it out', [`Cut out the ${parts} parts and put one on top of another.`, uneven ? `They do not fit exactly on top of each other: ${b('No')}.` : `They fit exactly on top of each other: ${b('Yes')}.`])] };
}
// What part is shaded? The choices are all different amounts, so only one is right.
function shadedQ(parts, k) {
  const f = figure(parts, { shade: Array.from({ length: k }, (_, i) => i) }), key = `${k}/${parts}`, word = WORD[key];
  return { ask: `What part of the shape is shaded?${f.tag}`, visual: f.html, answer: choice(word, shuffle(Object.values(WORD).filter(w => w !== word))), choiceBig: true, hint: 'Count all the equal parts, then count the shaded ones.', _t: { f: 'shaded', parts, k },
    ways: [way('Shaded parts out of all parts', [`${cnt(parts, 'equal part')} in all. ${cnt(k, 'part')} shaded.`, `${k} out of ${parts} parts is ${b(word)}.`]), way('Name each part', [`Each part is ${b('a ' + ONE[parts])}.`, `So the shaded part is ${TOTAL[k]} of them: ${b(word)}.`])] };
}
function wholeQ(parts, wholes) {
  const t = parts * wholes;
  return { ask: wholes === 1 ? `How many ${NAME[parts]} make one whole?` : `A pizza is cut into ${NAME[parts]}. How many slices are there in ${wholes} pizzas?`, answer: num(t), hint: wholes === 1 ? 'Cut one whole into equal parts and count the parts.' : 'How many slices are there in one pizza? Then think about the other pizza.', _t: { f: 'wholes', parts, wholes },
    ways: wholes === 1 ? [way('Use what the name means', [`${cap(NAME[parts])} come from cutting a whole into ${parts} equal parts.`, `So it takes ${b(parts)} ${NAME[parts]} to make one whole.`]), way('Add the parts back up', [`${Array(parts).fill(`one ${ONE[parts]}`).join(' + ')} makes one whole.`, `That is ${b(parts)} ${NAME[parts]}.`])]
      : [way('One pizza at a time', [`One pizza is ${parts} ${NAME[parts]}.`, `${Array(wholes).fill(parts).join(' + ')} = ${b(t)}.`]), way('Count all the slices', [`Count by ${parts}s, once for each pizza: ${countList(0, wholes, 1, parts)}.`, `There are ${b(t)} slices.`])] };
}
// The same whole cut into the same number of equal parts in two ways, or into a different number of parts.
function sameSizeQ(sameCount) {
  const p = pick([2, 4]), q = sameCount ? p : (p === 2 ? 4 : 2), mk = n => ({ shape: 'rect', kind: pick(KINDS[n]), parts: n, w: 90, h: 90 });
  const a = mk(p), c = mk(q);
  if (sameCount && a.kind === c.kind) c.kind = KINDS[q].find(k => k !== a.kind);
  const ok = sameCount;
  return { ask: `Both squares are the same size, and each is cut into equal shares. Is one share of the first square the same size as one share of the second?${mark(a.kind, c.kind, p, q)}`, visual: figPair(a, c), answer: choice(ok ? 'Yes' : 'No', [], { all: ['Yes', 'No'] }), choiceBig: true,
    hint: 'Count the shares in each square. The same whole cut into the same number of equal shares gives shares of the same size.', _t: { f: 'samesize' },
    ways: [way('Count the shares', [`The first square has ${p} equal shares and the second has ${q}.`, ok ? `The same number of equal shares from the same size whole is the same size, even if the shapes look different: ${b('Yes')}.` : `More shares from the same whole means smaller shares, so they are not the same size: ${b('No')}.`]),
      way('Name them', [`The first square is cut into ${NAME[p]} and the second into ${NAME[q]}.`, ok ? `Both are ${NAME[p]}, so one share of each is ${b('the same size')}: ${b('Yes')}.` : `${cap(NAME[p])} and ${NAME[q]} are different sizes: ${b('No')}.`])] };
}
function biggerQ(p, q) {
  const a = { shape: 'rect', kind: pick(KINDS[p]), parts: p, w: 90, h: 90 }, c = { shape: 'rect', kind: pick(KINDS[q]), parts: q, w: 90, h: 90 }, win = p < q ? NAME[p] : NAME[q], lose = p < q ? NAME[q] : NAME[p];
  return { ask: `Two squares are the same size. One is cut into ${NAME[p]} and the other into ${NAME[q]}. Which shares are bigger?${mark(p, q)}`, visual: figPair(a, c), answer: choice(win, [lose], { keepOrder: false }), choiceBig: true,
    hint: 'Think about sharing one pizza. Do you get a bigger slice when it is shared between more people or fewer?', _t: { f: 'bigger', a: NAME[p], c: NAME[q] },
    ways: [way('Compare the number of shares', [`${cap(NAME[p])} make ${p} shares and ${NAME[q]} make ${q}.`, `The same whole cut into fewer shares gives bigger shares, so ${b(win)} are bigger.`]), way('Picture a pizza', [`Share a pizza between ${Math.min(p, q)} people or between ${Math.max(p, q)} people.`, `With fewer people each slice is bigger, so ${b(win)} are bigger.`])] };
}
function leftQ(parts, eaten) {
  const [item, who] = [pick(['pizza', 'sandwich', 'pie', 'chocolate bar']), nm()], left = parts - eaten;
  return { ask: `A ${item} is cut into ${NAME[parts]}. ${who} eats ${cnt(eaten, ONE[parts])}. How many ${NAME[parts]} are left?`, answer: num(left), hint: 'How many equal parts did the whole have to begin with?', _t: { f: 'leftover', parts, eaten },
    ways: [way('Take away', [`The ${item} starts with ${parts} ${NAME[parts]}. ${who} eats ${eaten}.`, `${parts} − ${eaten} = ${b(left)}.`]), way('Count what is left', [`Count the ${NAME[parts]} that are still there, one at a time: ${countList(0, left)}.`, `${b(left)} ${NAME[parts]} are left.`])] };
}

export function genShares(L) {
  const parts = rnd(2, 4);
  if (L === 1) {
    const t = pick(['parts', 'parts', 'name', 'equal', 'shaded', 'whole']);
    if (t === 'parts') return partsQ(parts);
    if (t === 'name') return nameQ(parts);
    if (t === 'equal') return equalQ(parts, chance(0.5));
    if (t === 'shaded') return shadedQ(parts, 1);
    return wholeQ(parts, 1);
  }
  if (L === 2) {
    const t = pick(['name', 'equal', 'shaded', 'shaded', 'whole', 'same', 'same']);
    if (t === 'name') return nameQ(parts);
    if (t === 'equal') return equalQ(parts, chance(0.5));
    if (t === 'shaded') return shadedQ(parts, parts === 2 ? 1 : pick([1, parts - 1]));
    if (t === 'whole') return wholeQ(parts, 1);
    return sameSizeQ(chance(0.65));
  }
  const t = pick(['bigger', 'same', 'shaded', 'whole2', 'left', 'left', 'equal']);
  if (t === 'bigger') return biggerQ(...pick([[2, 3], [2, 4], [3, 4], [4, 2], [4, 3], [3, 2]]));
  if (t === 'same') return sameSizeQ(chance(0.5));
  if (t === 'shaded') return shadedQ(parts, parts === 2 ? 1 : parts - 1);
  if (t === 'whole2') return wholeQ(parts, 2);
  if (t === 'equal') return equalQ(parts, chance(0.5));
  return leftQ(parts, rnd(1, parts - 1));
}
