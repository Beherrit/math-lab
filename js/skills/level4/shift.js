// Decimal place-value shifts: the digits stay in order and each one moves to a new place.
import { rnd, way, num } from '../../util.js';
import { T } from './helpers.js';
import { svg, box, label } from '../methods/pics.js';

const SPECS = [
  { k: 'dmul', mult: true, pows: [10, 100, 1000] },
  { k: 'ddiv', mult: false, pows: [10, 100, 10] },
  { k: 'dten', mult: true, pows: [10, 10, 10] },
  { k: 'dhund', mult: true, pows: [100, 100, 1000] },
];

function shiftPic(shown, pow, mult) {
  const word = mult ? `times ${pow}` : `divided by ${pow}`;
  const marks = [...String(shown)].map((ch, i) => `${box(16 + i * 34, 28, 30, 40)}${label(31 + i * 34, 54, ch)}`).join('');
  const w = 28 + String(shown).length * 34;
  return svg(w + 150, 96, 'digits ready to shift place', `${marks}${label(w + 70, 54, word, 'lab')}`);
}

function row(L, spec) {
  const pow = spec.pows[L - 1];
  if (spec.mult) {
    let n = rnd(11, 99);
    if (n % 10 === 0) n += 1;
    const ans = (n * pow) / 10;
    return { n, den: 10, pow, mult: true, shown: (n / 10).toFixed(1), ans };
  }
  let ans = rnd(2, L === 1 ? 30 : 60);
  if (ans === pow) ans += 1;
  return { n: ans * pow, den: 1, pow, mult: false, shown: String(ans * pow), ans };
}

export function genShift(L) {
  const spec = SPECS[rnd(0, 3)];
  const r = row(L, spec);
  const pic = shiftPic(r.shown, r.pow, r.mult);
  const sign = r.mult ? '×' : '÷';
  const places = String(r.pow).length - 1;
  const eq = `${r.shown} ${sign} ${r.pow} = ${r.ans}`;
  const built = {
    ask: `What is ${r.shown} ${sign} ${r.pow}?`, expr: `${r.shown} ${sign} ${r.pow}`, visual: pic,
    answer: num(r.ans), hint: 'The digits stay in order. Only their place changes.',
    why: 'Each place is worth ten times the place on its right, so the digits slide and the decimal point looks like it moved.',
    ways: [
      way('Slide the digits', [pic, `Every digit moves ${places} place${places === 1 ? '' : 's'} ${r.mult ? 'larger' : 'smaller'}.`, eq]),
      way('Use the places', [pic, eq, `The answer is ${r.ans}.`]),
    ],
  };
  return T(built, spec.k, { n: r.n, den: r.den, pow: r.pow, mult: r.mult ? 1 : 0 });
}
