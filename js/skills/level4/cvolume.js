// Skill l4vol2: volume of solids made of two boxes, and finding a missing edge from a volume (5.MD.5c).
import { rnd, pick, fmt, b, k, way, num, prism } from '../../util.js';
import { T, rd, pl } from './helpers.js';

const UNITS = [['cm', 'cubic centimeters'], ['in', 'cubic inches'], ['ft', 'cubic feet'], ['m', 'cubic meters']];
const pair = (p, q) => `<div class="pair">${p}<span class="plus">+</span>${q}</div>`;
const hi = L => (L === 1 ? 5 : L === 2 ? 9 : 12);
function cvStack(L) {
  const [u, uu] = pick(UNITS), l = rnd(2, hi(L) - 1), w = rnd(2, hi(L) - 1), h1 = rnd(2, hi(L) - 2), h2 = rnd(2, hi(L) - 2), V1 = l * w * h1, V2 = l * w * h2, V = V1 + V2;
  return T({ ask: 'Two boxes with the same base are stacked on top of each other. What is the volume of the whole solid?', visual: pair(prism(l, w, h1, { unit: u }), prism(l, w, h2, { unit: u })), answer: num(V), suffix: uu,
    ways: [way('Find each box, then add', [`Bottom box: ${l} × ${w} × ${h1} = ${fmt(V1)}`, `Top box: ${l} × ${w} × ${h2} = ${fmt(V2)}`, `${fmt(V1)} + ${fmt(V2)} = ${b(fmt(V))}`]),
      way('Add the heights first', [`The base is the same, so stacked heights just add: ${h1} + ${h2} = ${h1 + h2}.`, `${l} × ${w} × ${h1 + h2} = ${b(fmt(V))}`])],
    hint: 'The two boxes share a base. Find each volume, or add the heights.' }, 'cvStack', { l, w, h1, h2 });
}
function cvSide(L) {
  const [u, uu] = pick(UNITS), w = rnd(2, hi(L) - 1), h = rnd(2, hi(L) - 1), l1 = rnd(2, hi(L)), l2 = rnd(2, hi(L)), V1 = l1 * w * h, V2 = l2 * w * h, V = V1 + V2;
  return T({ ask: 'Two boxes with the same width and height are pushed together side by side. What is the volume of the whole solid?', visual: pair(prism(l1, w, h, { unit: u }), prism(l2, w, h, { unit: u })), answer: num(V), suffix: uu,
    ways: [way('Find each box, then add', [`First box: ${l1} × ${w} × ${h} = ${fmt(V1)}`, `Second box: ${l2} × ${w} × ${h} = ${fmt(V2)}`, `${fmt(V1)} + ${fmt(V2)} = ${b(fmt(V))}`]),
      way('Add the lengths first', [`Side by side, the lengths add: ${l1} + ${l2} = ${l1 + l2}.`, `${l1 + l2} × ${w} × ${h} = ${b(fmt(V))}`])],
    hint: 'The boxes share a width and a height. Find each volume, or add the lengths.' }, 'cvSide', { l1, l2, w, h });
}
function cvEdge(L) {
  const [u, uu] = pick(UNITS), e = [rnd(2, hi(L)), rnd(2, hi(L)), rnd(2, hi(L))], miss = rnd(0, 2), V = e[0] * e[1] * e[2], names = ['length', 'width', 'height'];
  const known = e.filter((_, i) => i !== miss), prod = known[0] * known[1];
  return T({ ask: `This box has a volume of ${fmt(V)} ${uu}. What is the missing ${names[miss]}?`, visual: prism(e[0], e[1], e[2], { labels: e.map((v, i) => (i === miss ? '?' : `${v} ${u}`)) }), answer: num(e[miss]), suffix: u,
    ways: [way('Divide by the known edges', [`The two known edges: ${known[0]} × ${known[1]} = ${prod}.`, `${fmt(V)} ÷ ${prod} = ${b(e[miss])}`]),
      way('Check by multiplying', [`If the missing ${names[miss]} is ${e[miss]}: ${e[0]} × ${e[1]} × ${e[2]} = ${fmt(V)}.`, `That matches the volume, so the missing ${names[miss]} is ${b(e[miss])}.`])],
    hint: 'Multiply the two edges you know, then ask what that must be multiplied by to reach the volume.' }, 'cvEdge', { V, known, miss });
}
function cvL(L) {
  const [u, uu] = pick(UNITS), w = rnd(2, hi(L) - 2), l1 = rnd(4, hi(L)), l2 = rnd(2, l1 - 1), h1 = rnd(2, hi(L) - 2), h2 = rnd(2, hi(L) - 2), V1 = l1 * w * h1, V2 = l2 * w * h2, V = V1 + V2, side = l1 * h1 + l2 * h2;
  return T({ ask: `A step-shaped block is built from a long box with a shorter box sitting on top of it. Both boxes are ${w} ${u} wide. What is the volume of the block?`, visual: pair(prism(l1, w, h1, { unit: u }), prism(l2, w, h2, { unit: u })), answer: num(V), suffix: uu,
    ways: [way('Find each box, then add', [`Long box: ${l1} × ${w} × ${h1} = ${fmt(V1)}`, `Short box: ${l2} × ${w} × ${h2} = ${fmt(V2)}`, `${fmt(V1)} + ${fmt(V2)} = ${b(fmt(V))}`]),
      way('Look at the side', [`From the side, the block is two rectangles: ${l1} × ${h1} = ${l1 * h1} and ${l2} × ${h2} = ${l2 * h2}, which is ${side} in all.`, `The block is ${w} wide all the way along: ${side} × ${w} = ${b(fmt(V))}`])],
    hint: 'Find the volume of each box separately, then add them.' }, 'cvL', { l1, l2, w, h1, h2 });
}
function cvDiff(L) {
  const [u, uu] = pick(UNITS), a = [rnd(2, hi(L)), rnd(2, hi(L)), rnd(2, hi(L))], c = [rnd(2, hi(L)), rnd(2, hi(L)), rnd(2, hi(L))], VA = a[0] * a[1] * a[2], VB = c[0] * c[1] * c[2];
  if (VA === VB) return cvDiff(L);
  const big = VA > VB ? 'A' : 'B', d = Math.abs(VA - VB), mx = Math.max(VA, VB), mn = Math.min(VA, VB);
  return T({ ask: `Box A is ${a.join(' by ')} ${u}. Box B is ${c.join(' by ')} ${u}. How much more volume does the bigger box have?`, answer: num(d), suffix: uu,
    ways: [way('Find each volume', [`Box A: ${a[0]} × ${a[1]} × ${a[2]} = ${fmt(VA)}`, `Box B: ${c[0]} × ${c[1]} × ${c[2]} = ${fmt(VB)}`, `Box ${big} is bigger: ${fmt(mx)} − ${fmt(mn)} = ${b(fmt(d))}`]),
      way('Layers', [`Box A: one layer is ${a[0]} × ${a[1]} = ${a[0] * a[1]}, and there are ${a[2]} layers: ${fmt(VA)}.`, `Box B: one layer is ${c[0]} × ${c[1]} = ${c[0] * c[1]}, and there are ${c[2]} layers: ${fmt(VB)}.`, `The difference is ${b(fmt(d))}.`])],
    hint: 'Find the volume of each box first, then subtract.' }, 'cvDiff', { a, c });
}
function cvMiss() {
  const [u, uu] = pick(UNITS), l = rnd(3, 9), w = rnd(2, 8), h1 = rnd(2, 8), h2 = rnd(2, 8), V1 = l * w * h1, V = l * w * (h1 + h2);
  return T({ story: `A solid is made of two boxes stacked on the same ${k(l + ' by ' + w + ' ' + u)} base. The first box is ${k(h1 + ' ' + u)} tall. The whole solid has a volume of ${k(fmt(V) + ' ' + uu)}.`, ask: 'How tall is the second box?', answer: num(h2), suffix: u, op: 'multi',
    ways: [way('Subtract the first box', [`First box: ${l} × ${w} × ${h1} = ${fmt(V1)}`, `Second box: ${fmt(V)} − ${fmt(V1)} = ${fmt(V - V1)}`, `${fmt(V - V1)} ÷ ${l * w} = ${b(h2)}`]),
      way('Use the total height', [`The whole solid is ${fmt(V)} ÷ ${l * w} = ${h1 + h2} tall.`, `${h1 + h2} − ${h1} = ${b(h2)}`])],
    read: rd('The height of the second box.', [`base ${l} by ${w}`, `first box ${h1} tall`, `total volume ${fmt(V)}`], 'Take the first box away from the whole volume, then divide by the base area.', `(${fmt(V)} − ${l} × ${w} × ${h1}) ÷ (${l} × ${w})`), hint: 'Find the volume of the first box, and take it away from the total.' }, 'cvMiss', { l, w, h1, V });
}
function cvLiters() {
  const l = pick([40, 50, 60, 80, 100]), w = pick([20, 30, 40, 50]), h = pick([20, 30, 40, 50]), V = l * w * h, lit = V / 1000;
  return T({ story: `A fish tank is ${k(l + ' cm')} long, ${k(w + ' cm')} wide and ${k(h + ' cm')} tall. One liter takes up ${k('1,000 cubic centimeters')}.`, ask: 'How many liters of water can the tank hold?', answer: num(lit), suffix: 'liters', op: 'multi',
    ways: [way('Volume first', [`${l} × ${w} × ${h} = ${fmt(V)} cubic centimeters`, `${fmt(V)} ÷ 1,000 = ${b(fmt(lit))} liters`]),
      way('Use decimeters', [`10 cm make 1 decimeter, and 1 cubic decimeter is exactly 1 liter.`, `${l / 10} × ${w / 10} × ${h / 10} = ${b(fmt(lit))} cubic decimeters, which is ${fmt(lit)} liters.`])],
    read: rd('How many liters fit in the tank.', [`${l} by ${w} by ${h} cm`, '1 liter is 1,000 cubic centimeters'], 'Find the volume, then see how many 1,000s fit into it.', `${l} × ${w} × ${h} ÷ 1,000`), hint: 'Find the volume in cubic centimeters, then see how many liters that makes.' }, 'cvLiters', { l, w, h });
}
function cvRate() {
  for (;;) {
    const l = pick([4, 5, 6, 8]), w = pick([3, 4, 5]), h = pick([1, 2]), V = l * w * h, rs = [4, 5, 6, 8, 10, 12, 15, 20, 24, 30].filter(r => V % r === 0);
    if (!rs.length) continue;
    const r = pick(rs), hours = V / r;
    return T({ story: `A small pool is ${k(l + ' meters')} long, ${k(w + ' meters')} wide and ${k(h + (h === 1 ? ' meter' : ' meters'))} deep when full. A hose adds ${k(r + ' cubic meters')} of water each hour.`, ask: 'How many hours does the hose need to fill the pool?', answer: num(hours), suffix: hours === 1 ? 'hour' : 'hours', op: 'multi',
      ways: [way('Volume, then divide', [`${l} × ${w} × ${h} = ${V} cubic meters`, `${V} ÷ ${r} = ${b(pl(hours, 'hour'))}`]),
        way('Check by multiplying', [`If it takes ${hours}: ${r} × ${hours} = ${V}.`, `That fills all ${V} cubic meters, so the answer is ${b(hours)}.`])],
      read: rd('How many hours to fill the pool.', [`pool ${l} by ${w} by ${h}`, `${r} cubic meters each hour`], 'Find how much the pool holds, then see how many hours of water that is.', `${l} × ${w} × ${h} ÷ ${r}`), hint: 'Find how much water the pool holds, then divide by what the hose adds each hour.' }, 'cvRate', { l, w, h, r });
  }
}
export function genVolume2(L) {
  if (L === 1) return pick([() => cvStack(1), () => cvSide(1), () => cvEdge(1), () => cvDiff(1)])();
  if (L === 2) return pick([() => cvStack(2), () => cvSide(2), () => cvEdge(2), () => cvL(2), () => cvDiff(2)])();
  return pick([cvMiss, cvLiters, cvRate, () => cvL(3), () => cvEdge(3)])();
}
