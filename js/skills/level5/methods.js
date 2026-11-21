// Cross multiplication on a ratio table, and the percent swap (a% of b equals b% of a).
import { rnd, way, num, gcd } from '../../util.js';
import { svg, box, label } from '../methods/pics.js';

function tablePic(a, b, left) {
  const cell = (x, y, t, tone) => `${box(x, y, 64, 40, tone)}${label(x + 32, y + 26, t)}`;
  return svg(180, 130, 'a ratio table', [
    cell(16, 28, a), cell(96, 28, b, 'box2'),
    cell(16, 78, left), cell(96, 78, '?', 'box2'),
  ].join(''));
}
function swapPic(p, n) {
  return svg(320, 90, 'two percent phrases for the same amount', [
    box(12, 22, 140, 48), label(82, 52, `${p}% of ${n}`),
    box(168, 22, 140, 48, 'box2'), label(238, 52, `${n}% of ${p}`),
  ].join(''));
}

function crossRow(L) {
  const a = rnd(2, L === 1 ? 6 : 9);
  let b = rnd(2, L === 1 ? 6 : 9);
  if (b === a) b = a === 9 ? 2 : a + 1;
  const m = rnd(2, L === 1 ? 4 : L === 2 ? 6 : 8);
  const left = a * m, value = b * m;
  if ([a, b, left].includes(value) || value > (L === 1 ? 40 : 120)) return null;
  return { a, b, m, left, value };
}
function swapRow(L) {
  const p = rnd(2, L === 1 ? 20 : 40);
  const step = 100 / gcd(p, 100);
  const n = step * rnd(1, L === 1 ? 6 : 10);
  const value = (p * n) / 100;
  if (!Number.isInteger(value) || value === p || value === n || value > 200 || n > 400) return null;
  return { p, n, value };
}

export function genCross(L) {
  for (let i = 0; i < 40; i++) {
    const r = crossRow(L);
    if (!r) continue;
    const pic = tablePic(r.a, r.b, r.left);
    const end = `The missing cell is ${r.value}.`;
    return {
      ask: `The ratio table shows ${r.a} to ${r.b}, then ${r.left} to what?`,
      expr: `${r.a} : ${r.b} = ${r.left} : ?`, visual: pic, answer: num(r.value),
      hint: 'Both rows use the same multiplier. Find it from the first column.',
      why: 'Adding across the row changes the mix. The rows scale, so the diagonal products match.',
      ways: [
        way('Scale the row', [pic, `${r.a} × ${r.m} = ${r.left}.`, `${r.b} × ${r.m} = ${r.value}.`, end]),
        way('Cross multiply', [pic, `${r.a} × ${r.value} = ${r.a * r.value} and ${r.b} × ${r.left} = ${r.b * r.left}.`, end]),
      ],
      _t: { k: 'xtable', a: r.a, b: r.b, m: r.m },
    };
  }
  throw new Error('cross');
}

export function genSwap(L) {
  for (let i = 0; i < 40; i++) {
    const r = swapRow(L);
    if (!r) continue;
    const pic = swapPic(r.p, r.n);
    const prod = r.p * r.n;
    const end = `The amount is ${r.value}.`;
    return {
      ask: `What is ${r.p}% of ${r.n}?`, expr: `${r.p}% of ${r.n}`, visual: pic, answer: num(r.value),
      hint: 'A percent of a number is the same as the other percent of the first number.',
      why: 'A percent of a number is their product divided by 100, so the percent and the number can swap.',
      ways: [
        way('Swap the percent', [pic, `${r.p}% of ${r.n} is the same amount as ${r.n}% of ${r.p}.`, `${r.n} × ${r.p} = ${prod}.`, `${prod} ÷ 100 = ${r.value}.`, end]),
        way('Multiply, then divide', [pic, `${r.p} × ${r.n} = ${prod}.`, `${prod} ÷ 100 = ${r.value}.`, end]),
      ],
      _t: { k: 'pctswap', p: r.p, n: r.n },
    };
  }
  throw new Error('swap');
}
