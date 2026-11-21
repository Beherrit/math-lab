// Singapore bar models: part-part-whole, a missing part, and a comparison.
import { rnd } from '../../util.js';
import { ask, problem, attempt } from '../methods/pack.js';
import { barPic, widths, bondPic, areaPic } from '../methods/pics.js';

const SLIP = 'The gap or the missing bar is the amount the question asks for.';
const WHOLE = [
  'The two bars are the parts. How long is the whole bar?',
  'Join the parts. What is {x} + {y}?',
  'Both parts are drawn. What do they make together?',
  'The bars show {x} and {y}. Find the whole.',
];
const PART = [
  'The long bar is the whole. What is the missing part?',
  '{w} is the whole and {p} is one part. What is left?',
  'Cover one part of {w}. The other part is {p}. Find the missing part.',
  'The whole bar is {w}. One part is {p}. How long is the rest?',
];
const MORE = [
  'How many more is the longer bar?',
  'The bars show {big} and {small}. What is the difference?',
  'Compare the two bars. How much longer is the first?',
  '{big} and {small} are the two bars. Find the gap.',
];

function whole() {
  const x = rnd(2, 6), y = rnd(2, 6);
  const [wx, wy] = widths([x, y, x + y]);
  return { x, y, value: x + y, frames: WHOLE, vars: { x, y }, expr: `${x} + ${y}`, t: { f: 'add', xs: [x, y] },
    pic: barPic([{ text: x, w: wx }, { text: y, w: wy }, { text: '?', w: Math.min(180, wx + wy) }]),
    other: areaPic([x, y]) };
}
function part(L) {
  const w = L === 2 ? rnd(11, 20) : rnd(12, 30);
  const p = rnd(2, w - 2);
  const [full, known] = widths([w, p]);
  return { value: w - p, frames: PART, vars: { w, p }, expr: `${w} − ${p}`, t: { f: 'sub', a: w, b: p },
    pic: barPic([{ text: w, w: full }, { text: p, w: known }, { text: '?', w: Math.max(24, full - known) }]),
    other: bondPic(w, p) };
}
function more() {
  const big = rnd(8, 24), small = rnd(2, big - 2);
  const [wb, ws] = widths([big, small]);
  return { value: big - small, frames: MORE, vars: { big, small }, expr: `${big} − ${small}`, t: { f: 'sub', a: big, b: small },
    pic: barPic([{ text: big, w: wb }, { text: small, w: ws }]),
    other: barPic([{ text: big, w: wb, tone: 'box2' }, { text: '?', w: Math.max(24, wb - ws) }]) };
}

export function genBars(L) {
  return attempt(() => {
    const row = L === 1 ? whole() : L === 2 ? part(2) : (rnd(0, 1) ? part(3) : more());
    return problem({
      ask: ask(row.frames, row.vars), expr: row.expr, visual: row.pic, value: row.value,
      hint: 'The bar you cannot read is the amount the question asks for.', slip: SLIP, t: row.t,
      methods: [
        { title: 'Bar model', steps: [row.pic, 'Match the labels you can read, then find the bar or the gap that is marked with a question mark.'] },
        { title: 'Number bond', steps: [row.other, 'The same amounts can sit in a bond or on a second bar. The missing amount is still the one not labeled.'] },
        { title: 'Why the length matches', steps: [row.pic, 'A bar is the amount drawn as a length, so joining bars adds and the gap between two bars subtracts.'] },
      ],
    });
  });
}

export const l1bar = {
  id: 'l1bar', level: 1, strand: 'Stories', std: '1.OA.1', title: 'Bar models',
  sub: 'Parts, wholes and how many more', gen: genBars, school: true,
  learn: {
    big: 'A bar model draws each amount as a length. Joined bars are the whole. The gap between two bars is the difference.',
    tips: ['Label the numbers the story gives. Leave a question mark on the one you must find.', 'Two short bars under a long one are the parts of that whole.', 'How many more is the extra length, not the sum of the two bars.', 'The drawing uses the same add or subtract you would write in a number sentence.'],
    words: [['bar model', 'amounts drawn as lengths so you can see the parts and the whole'], ['gap', 'the extra length of the longer bar']],
    card: { title: 'Why the bars work', why: 'The bars are the amounts as lengths, so a joined bar is the whole and the gap between two bars is the difference. The gap is not a new amount to invent.' },
  },
};
