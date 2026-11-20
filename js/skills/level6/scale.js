// Scale drawings and scale factor: lengths multiply by the scale, areas by the scale twice.
import { R, rnd, pick, chance, fmt, b, k, way, nm, num, table } from '../../util.js';
import { tag } from './helpers.js';
import { rectFig } from './visuals-shapes.js';

// ks: whole-number scales for step 1, kt: scales for later steps, kd: scales that give a whole-number drawing, dmax: the longest drawing length.
const PLANS = [
  { thing: 'a map', big: 'km', what: ['two towns', 'a lake and a campsite', 'two train stations'], gap: true, ks: [2, 3, 4, 5, 10, 20], kt: [1.5, 2.5, 4, 12, 15, 25, 50], kd: [2, 4, 5, 10, 20, 25], dmax: 12 },
  { thing: 'a floor plan', big: 'm', what: ['the kitchen wall', 'the hallway', 'the longest wall'], ks: [1, 2], kt: [1.5, 2.5, 4], kd: [1, 2, 4, 5], dmax: 5 },
  { thing: 'a plan of a skate park', big: 'm', what: ['the main ramp', 'the fence', 'the rail'], ks: [1, 2, 3, 4], kt: [1.5, 2.5, 4, 5], kd: [1, 2, 4, 5], dmax: 9 },
  { thing: 'a garden plan', big: 'm', what: ['the vegetable bed', 'the path', 'the pond'], ks: [1, 2, 3], kt: [1.5, 2.5, 4], kd: [1, 2, 4], dmax: 6 },
];
const scaleText = (kk, big) => `1 cm : ${kk} ${big}`;
const ratioTable = (kk, d, big, hideReal) => table(['on the drawing (cm)', `real (${big})`], [[1, kk], [hideReal ? d : '?', hideReal ? '?' : fmt(d * kk)]]);
function toReal(L) {
  const p = pick(PLANS), kk = pick(L === 1 ? p.ks : p.kt), d = L === 1 ? rnd(2, p.dmax) : pick([2, 4, 6, 8, 3.5, 4.5, 6.5].filter(v => v <= p.dmax)), w = pick(p.what);
  return tag({ story: `On ${p.thing} the scale is ${k(scaleText(kk, p.big))}. ${p.gap ? `The distance between ${w}` : `The length of ${w}`} is ${k(fmt(d) + ' cm')} on the drawing.`,
    ask: `What is the real ${p.gap ? 'distance' : 'length'}, in ${p.big}?`, answer: num(d * kk), suffix: p.big, op: 'mul',
    ways: [way('Use the scale as a multiplier', [`${scaleText(kk, p.big)} means every 1 cm on the drawing stands for ${kk} ${p.big} in real life.`, `${fmt(d)} cm stands for ${fmt(d)} × ${kk} = ${b(fmt(d * kk) + ' ' + p.big)}`]),
      way('Ratio table', [ratioTable(kk, d, p.big, true), `To get from 1 to ${fmt(d)} you multiply by ${fmt(d)}. Do the same on the other side: ${kk} × ${fmt(d)} = ${b(fmt(d * kk))}`])],
    read: { find: `The real ${p.gap ? 'distance' : 'length'} in ${p.big}.`, know: [`1 cm stands for ${kk} ${p.big}`, `drawing: ${fmt(d)} cm`], clue: 'Each centimetre stands for the same real amount, so multiply.', plan: `${fmt(d)} × ${kk}` },
    hint: `Each centimetre is worth ${kk} ${p.big}. How many centimetres are there?` }, { kind: 'prod', xs: [d, kk] });
}
function toDrawing() {
  const p = pick(PLANS), kk = pick(p.kd), d = pick([3, 4, 6, 7, 9, 12, 2.5, 4.5].filter(v => v <= p.dmax)), real = R(d * kk), w = pick(p.what);
  return tag({ story: `${p.thing[0].toUpperCase() + p.thing.slice(1)} uses the scale ${k(scaleText(kk, p.big))}. In real life, ${p.gap ? `the distance between ${w}` : `the length of ${w}`} is ${k(fmt(real) + ' ' + p.big)}.`,
    ask: 'How long is it on the drawing, in centimetres?', answer: num(d), suffix: 'cm',
    ways: [way('Divide by the scale', [`Going from real life back to the drawing shrinks things, so divide.`, `Each ${kk} ${p.big} becomes 1 cm: ${fmt(real)} ÷ ${kk} = ${b(fmt(d) + ' cm')}`]),
      way('Ratio table', [ratioTable(kk, d, p.big, false), `${kk} × ? = ${fmt(real)}, so ? = ${b(fmt(d))}.`, `Check: ${fmt(d)} cm × ${kk} = ${fmt(real)} ${p.big}.`])],
    hint: `How many lots of ${kk} ${p.big} fit into ${fmt(real)} ${p.big}?` }, { kind: 'quot', a: real, c: kk });
}
function findScale() {
  const p = pick(PLANS), kk = pick(p.ks), d = rnd(3, Math.max(3, Math.min(9, p.dmax))), real = d * kk;
  return tag({ story: `On ${p.thing}, a length of ${k(d + ' cm')} stands for a real length of ${k(real + ' ' + p.big)}.`, ask: `How many ${p.big} does 1 cm stand for?`, answer: num(kk), suffix: p.big,
    ways: [way('Share the real length between the centimetres', [`${d} cm stand for ${real} ${p.big}, so 1 cm stands for ${real} ÷ ${d} = ${b(kk + ' ' + p.big)}`, `The scale is ${scaleText(kk, p.big)}.`]),
      way('Check by multiplying', [`If 1 cm is ${kk} ${p.big}, then ${d} cm is ${d} × ${kk} = ${real} ${p.big}. That matches.`])],
    hint: `Divide the real length by the number of centimetres.` }, { kind: 'quot', a: real, c: d });
}
function factorOf() {
  const f = rnd(2, 6), w = rnd(3, 12), n = nm();
  return tag({ story: `${n} enlarges a photo. The original is ${k(w + ' cm')} wide and the enlarged copy is ${k(w * f + ' cm')} wide.`, ask: 'What is the scale factor of the enlargement?', answer: num(f),
    ways: [way('New length divided by old length', [`The scale factor is the number every length is multiplied by.`, `${w * f} ÷ ${w} = ${b(f)}`]),
      way('Check it', [`${w} × ${f} = ${w * f}, so every length on the copy is ${f} times as long.`])],
    hint: `What do you multiply ${w} by to get ${w * f}?` }, { kind: 'quot', a: w * f, c: w });
}
function missingSide() {
  const f = pick([1.5, 2, 2.5, 3, 0.5]), w = pick([4, 6, 8, 10, 12]), h = pick([2, 4, 6, 10, 14].filter(v => v !== w)), W = R(w * f), H = R(h * f);
  return tag({ ask: `A rectangle ${w} cm wide and ${h} cm tall is redrawn to scale. The copy, shown here, is ${fmt(W)} cm wide. How tall is the copy, in centimetres?`,
    visual: rectFig(`${fmt(W)} cm`, '? cm', h / w), answer: num(H), suffix: 'cm',
    ways: [way('Find the scale factor', [`Widths: ${fmt(W)} ÷ ${w} = ${b(fmt(f))}. That is the scale factor.`, `A scale copy multiplies EVERY length by the same number: ${h} × ${fmt(f)} = ${b(fmt(H) + ' cm')}`]),
      way('Write a proportion', [`A scale copy keeps the same shape, so height compared with width stays the same: ${h} is to ${w} as ? is to ${fmt(W)}.`, `Cross products: ? × ${w} = ${h} × ${fmt(W)} = ${fmt(R(h * W))}`, `? = ${fmt(R(h * W))} ÷ ${w} = ${b(fmt(H))}`])],
    hint: `What was the width multiplied by to get from ${w} to ${fmt(W)}?` }, { kind: 'prodquot', a: W, c: h, d: w });
}
function realArea() {
  const kk = pick([2, 3, 4, 5]), w = rnd(2, 5), h = rnd(2, 4);
  return tag({ story: `A school playground is drawn as a rectangle ${k(w + ' cm')} by ${k(h + ' cm')} on a plan with the scale ${k(scaleText(kk, 'm'))}.`, ask: 'What is the real area of the playground, in square metres?',
    visual: rectFig(`${w} cm`, `${h} cm`, h / w), answer: num(w * kk * h * kk), suffix: 'm²',
    ways: [way('Scale the lengths first', [`Real width: ${w} × ${kk} = ${w * kk} m. Real height: ${h} × ${kk} = ${h * kk} m.`, `Area = ${w * kk} × ${h * kk} = ${b(fmt(w * kk * h * kk) + ' m²')}`]),
      way('Scale the area', [`On the plan the area is ${w} × ${h} = ${w * h} cm².`, `Each 1 cm by 1 cm square stands for a ${kk} m by ${kk} m square, which is ${kk * kk} m². Both directions grow, so areas multiply by ${kk} × ${kk}.`, `${w * h} × ${kk * kk} = ${b(fmt(w * kk * h * kk) + ' m²')}`]),
      way('Watch out for the trap', [`Multiplying the plan area by ${kk} only once gives ${w * h * kk}, which is too small. Area has two directions, so the scale counts twice.`])],
    hint: 'Turn each side into its real length first, then find the area.' }, { kind: 'scalearea', w, h, k: kk });
}
function rescale() {
  const k2 = pick([2, 4, 5]), k1 = k2 * pick([2, 3, 5]), d = rnd(2, 9);
  return tag({ story: `A road is ${k(d + ' cm')} long on a plan with the scale ${k(scaleText(k1, 'm'))}. A new plan is drawn with the scale ${k(scaleText(k2, 'm'))}.`, ask: 'How long is the path on the new plan, in centimetres?', answer: num(d * k1 / k2), suffix: 'cm',
    ways: [way('Go through the real length', [`Real length: ${d} × ${k1} = ${b(d * k1 + ' m')}.`, `New plan: each centimetre is ${k2} m, so ${d * k1} ÷ ${k2} = ${b(d * k1 / k2 + ' cm')}`]),
      way('Compare the two scales', [`On the new plan 1 cm stands for less (${k2} m, not ${k1} m), so the drawing must get bigger.`, `${k1} ÷ ${k2} = ${k1 / k2}, so every length is ${k1 / k2} times as long: ${d} × ${k1 / k2} = ${b(d * k1 / k2)}`])],
    hint: 'First find how long the path really is.' }, { kind: 'prodquot', a: d, c: k1, d: k2 });
}
// Real lengths in metres and the model scales that keep the model a sensible size.
const MODELS = [
  { name: 'car', real: [4, 5], ns: [20, 25, 50] }, { name: 'bus', real: [10, 12], ns: [50, 100] }, { name: 'boat', real: [6, 8, 10], ns: [50, 100] },
  { name: 'statue', real: [4, 5, 8], ns: [20, 25, 50] }, { name: 'rocket', real: [20, 30, 40], ns: [50, 100] },
];
export function scaleWord() {
  const t = pick(MODELS), thing = t.name, n = pick(t.ns), real = pick(t.real), model = real * 100 / n;
  return tag({ story: `A model ${thing} is built at a scale of ${k('1 : ' + n)}, so every length on the real ${thing} is ${n} times the model's. The model is ${k(fmt(model) + ' cm')} long.`,
    ask: `How long is the real ${thing}, in metres?`, answer: num(real), suffix: 'm', op: 'multi',
    ways: [way('Multiply, then change units', [`Real length: ${fmt(model)} × ${n} = ${b(fmt(model * n) + ' cm')}.`, `100 cm make 1 m: ${fmt(model * n)} ÷ 100 = ${b(real + ' m')}`]),
      way('Change the scale into metres first', [`1 cm on the model is ${n} cm in real life, which is ${fmt(n / 100)} m.`, `${fmt(model)} × ${fmt(n / 100)} = ${b(real + ' m')}`])],
    read: { find: `The real length in METRES.`, know: [`scale 1 : ${n}`, `model: ${fmt(model)} cm`], clue: `"1 : ${n}" means multiply by ${n}. The answer is asked for in metres, so the units change too.`, plan: `${fmt(model)} × ${n}, then ÷ 100` },
    hint: `Multiply by ${n} to get the real length in centimetres. Then turn it into metres.` }, { kind: 'prodquot', a: model, c: n, d: 100 });
}
export function genScale(L) {
  const r = Math.random();
  if (L === 1) return r < 0.7 ? toReal(1) : factorOf();
  if (L === 2) return r < 0.3 ? toDrawing() : r < 0.5 ? findScale() : r < 0.75 ? missingSide() : toReal(2);
  return r < 0.35 ? realArea() : r < 0.6 ? rescale() : r < 0.8 ? scaleWord() : missingSide();
}
