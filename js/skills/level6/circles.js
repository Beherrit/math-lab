// Circles: radius and diameter, circumference and area, with 3.14 or left in terms of π.
import { R, rnd, pick, chance, fmt, b, k, way, num, choice } from '../../util.js';
import { tag, plural } from './helpers.js';
import { circleFig } from './visuals-shapes.js';

const PI = 3.14;
const UNITS = ['cm', 'm', 'mm'];
const IN_PI = 'Leave your answer in terms of π: type the number that goes in front of π.';
const USE_314 = 'Use 3.14 for π.';
const WHY_C = 'Wrap the diameter around any circle and it fits a little more than 3 times. That number is π (about 3.14), so circumference = π × diameter.';
const WHY_A = 'Cut a circle into thin slices and line them up head to tail. They make a shape close to a rectangle: half the circumference (π × r) long and r tall. So area = π × r × r.';
// A circle described by its radius or its diameter, with the matching picture.
function given(r, u, byR) {
  return { text: byR ? `radius of ${k(r + ' ' + u)}` : `diameter of ${k(2 * r + ' ' + u)}`, visual: circleFig(byR ? `${r} ${u}` : `${2 * r} ${u}`, byR ? 'r' : 'd'),
    toD: byR ? `The diameter is twice the radius: 2 × ${r} = ${2 * r} ${u}.` : `The diameter is ${2 * r} ${u}.`, toR: byR ? `The radius is ${r} ${u}.` : `The radius is half the diameter: ${2 * r} ÷ 2 = ${r} ${u}.` };
}
const CONCEPTS = [
  { q: 'About how many times does the diameter of a circle fit around its edge?', c: 'A little more than 3 times', d: ['Exactly 2 times', 'Exactly 4 times', 'A little less than 3 times'], why: WHY_C, h: 'Think of a piece of string as long as the distance across a circle. See how many of those pieces it takes to go right round the edge.' },
  { q: 'What do we call the distance all the way around a circle?', c: 'circumference', d: ['diameter', 'radius', 'area'], why: 'Circumference is the perimeter of a circle: the length of its edge.', h: 'Picture a bike wheel. Which word names the length of the whole tyre, measured once all the way round?' },
  { q: 'Which is longer: the radius or the diameter of the same circle?', c: 'The diameter (it is 2 radii)', d: ['The radius', 'They are equal', 'It depends on the circle'], why: 'The diameter goes all the way across through the centre. The radius only goes from the centre to the edge, so it is half as long.', h: 'Picture a line from the middle to the edge, and a line from edge to edge through the middle. Lay the short one along the long one.' },
  { q: 'A circle gets a bigger diameter. What happens to circumference ÷ diameter?', c: 'It stays the same (it is π)', d: ['It gets bigger', 'It gets smaller', 'It doubles'], why: WHY_C, h: 'Try a small circle and a big one. Divide the way round by the way across for each, and compare the two answers.' },
];
function concept() {
  const c = pick(CONCEPTS);
  return tag({ ask: c.q, answer: choice(c.c, c.d), ways: [way('Think about it', [c.why]), way('The words', ['Radius: centre to edge. Diameter: edge to edge through the centre (2 radii).', 'Circumference: the distance around. Area: the space inside.'])],
    hint: c.h }, { kind: 'fixed' });
}
function radDiam() {
  const r = rnd(2, 25), u = pick(UNITS), wantD = chance(0.5), g = given(r, u, wantD);
  return tag({ ask: `A circle has a ${g.text}. What is its ${wantD ? 'diameter' : 'radius'}?`, visual: g.visual, answer: num(wantD ? 2 * r : r), suffix: u,
    ways: [way('Radius and diameter', ['The radius goes from the centre to the edge. The diameter goes right across, through the centre.', wantD ? g.toD : g.toR]),
      way('Check with the other one', [wantD ? `Half of ${2 * r} is ${r}, which is the radius you started with.` : `Two radii of ${r} make ${2 * r}, which is the diameter you started with.`])],
    hint: 'The diameter is two radii laid end to end.' }, { kind: 'circRD', r, wantD });
}
function circumference(mode, rs) {
  const r = pick(rs), u = pick(UNITS), g = given(r, u, chance(0.5)), d = 2 * r, val = mode === 'pi' ? d : R(d * PI);
  return tag({ ask: `A circle has a ${g.text}. What is its circumference? ${mode === 'pi' ? IN_PI : USE_314}`, visual: g.visual, answer: num(val), suffix: mode === 'pi' ? `π ${u}` : u,
    ways: [way('Circumference = π × diameter', [WHY_C, g.toD, mode === 'pi' ? `C = π × ${d} = ${b(d + 'π ' + u)}. The number in front of π is ${b(d)}.` : `C = 3.14 × ${d} = ${b(fmt(val) + ' ' + u)}`]),
      way('Estimate to check', [`π is a bit more than 3, so the circumference is a bit more than 3 × ${d} = ${3 * d} ${u}.`, mode === 'pi' ? `${d}π is about ${fmt(R(d * PI))}, which fits.` : `${fmt(val)} fits.`])],
    hint: 'Find the diameter first. The circumference is π times the diameter.' }, { kind: 'circC', r, mode });
}
function area(mode, rs, part = 1) {
  const r = pick(rs), u = pick(UNITS), g = given(r, u, part === 1 ? chance(0.6) : true), coef = r * r * part, val = mode === 'pi' ? coef : R(coef * PI);
  const shape = part === 1 ? 'circle' : part === 0.5 ? 'semicircle (half a circle)' : 'quarter circle', cut = part === 1 ? [] : [`It is only ${part === 0.5 ? 'half' : 'a quarter'} of the circle: ${r * r}π ÷ ${1 / part} = ${coef}π.`];
  return tag({ ask: `A ${shape} has a ${g.text}. What is its area? ${mode === 'pi' ? IN_PI : USE_314}`, visual: part === 1 ? g.visual : undefined, answer: num(val), suffix: mode === 'pi' ? `π ${u}²` : `${u}²`,
    ways: [way('Area = π × r × r', [WHY_A, g.toR, `r × r = ${r} × ${r} = ${r * r}, so the full circle is ${r * r}π ${u}².`, ...cut, mode === 'pi' ? `The number in front of π is ${b(coef)}.` : `3.14 × ${coef} = ${b(fmt(val) + ' ' + u + '²')}`]),
      way('Estimate to check', [`A square with side ${r} has area ${r * r}. A full circle is a bit more than 3 of those: about ${3 * r * r}${part === 1 ? '' : `, and this shape is ${part === 0.5 ? 'half' : 'a quarter'} of that`}.`, mode === 'pi' ? `${coef}π is about ${fmt(R(coef * PI))}, which fits.` : `${fmt(val)} fits.`]),
      ...(r <= 2 ? [] : [way('Watch out for the trap', [`Square the RADIUS, not the diameter, and do not double it: ${r} × ${r} = ${r * r}, not ${r} × 2 = ${2 * r}.`])])],
    hint: 'You need the radius. Multiply it by itself, then by π.' }, { kind: 'circA', r, mode, part });
}
function fromCircumference() {
  const r = rnd(2, 15), u = pick(UNITS), wantR = chance(0.5), C = R(2 * r * PI);
  return tag({ ask: `The circumference of a circle is ${fmt(C)} ${u}. What is its ${wantR ? 'radius' : 'diameter'}? ${USE_314}`, answer: num(wantR ? r : 2 * r), suffix: u,
    ways: [way('Undo the multiplying', [`Circumference = 3.14 × diameter, so diameter = circumference ÷ 3.14.`, `${fmt(C)} ÷ 3.14 = ${b(2 * r)} ${u}`, ...(wantR ? [`The radius is half of that: ${b(r + ' ' + u)}`] : [])]),
      way('Check it', [`3.14 × ${2 * r} = ${fmt(C)}, which is the circumference you were given.`])],
    hint: 'The circumference is 3.14 times the diameter. Work backwards.' }, { kind: 'circFromC', C, wantR });
}
function fromArea() {
  const r = rnd(2, 12), u = pick(UNITS), wantC = chance(0.5);
  return tag({ ask: `The area of a circle is ${r * r}π ${u}². ${wantC ? `What is its circumference? ${IN_PI}` : 'What is its radius?'}`, answer: num(wantC ? 2 * r : r), suffix: wantC ? `π ${u}` : u,
    ways: [way('Work back to the radius', [`Area = π × r × r, so r × r = ${r * r}.`, `Which number times itself makes ${r * r}? ${r} × ${r} = ${r * r}, so r = ${b(r + ' ' + u)}.`,
      ...(wantC ? [`Diameter = 2 × ${r} = ${2 * r}. Circumference = π × ${2 * r} = ${b(2 * r + 'π ' + u)}`] : [])]),
      way('Check it', [`π × ${r} × ${r} = ${r * r}π, which is the area you were given.`])],
    hint: `Area is π × r × r. What number times itself gives ${r * r}?` }, { kind: 'circFromA', A: r * r, wantC });
}
export function circleWord() {
  const wheel = chance(0.5), d = pick(wheel ? [40, 50, 60, 70] : [80, 100, 120, 150]), n = wheel ? pick([5, 10, 20]) : pick([2, 3, 5]), total = R(PI * d * n);
  return tag({ story: wheel ? `A bike wheel has a diameter of ${k(d + ' cm')}. It rolls ${k(plural(n, 'full turn'))}.` : `A round table has a diameter of ${k(d + ' cm')}. Trim is glued around the edge of ${k(plural(n, 'table'))} like it.`,
    ask: `${wheel ? 'How far does the bike travel' : 'How much trim is needed in all'}, in centimetres? ${USE_314}`, answer: num(total), suffix: 'cm', op: 'multi',
    ways: [way(wheel ? 'One turn, then all the turns' : 'One table, then all the tables', [`${wheel ? 'One full turn rolls the wheel forward by its circumference' : 'The trim around one table is its circumference'}: 3.14 × ${d} = ${b(fmt(R(PI * d)) + ' cm')}.`, `${n} × ${fmt(R(PI * d))} = ${b(fmt(total) + ' cm')}`]),
      way('Estimate to check', [`About 3 × ${d} = ${3 * d} cm each, so about ${fmt(3 * d * n)} cm in all. ${fmt(total)} is a little more, as it should be.`])],
    read: { find: wheel ? 'The distance for all the turns.' : 'The trim for all the tables.', know: [`diameter: ${d} cm`, wheel ? plural(n, 'turn') : plural(n, 'table')], clue: wheel ? 'One turn of a wheel covers one circumference.' : '"Around the edge" means circumference.', plan: `3.14 × ${d}, then × ${n}` },
    hint: 'How long is the distance around one circle?' }, { kind: 'prod', xs: [PI, d, n] });
}
export function genCircle(L) {
  const r = Math.random();
  if (L === 1) return r < 0.3 ? radDiam() : r < 0.65 ? circumference('pi', [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15]) : r < 0.8 ? concept() : circumference('3.14', [5, 10, 50]);
  if (L === 2) return r < 0.35 ? circumference('3.14', [2, 3, 4, 6, 7, 8, 9, 12, 15, 20, 25]) : r < 0.7 ? area('pi', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) : area('3.14', [1, 2, 3, 4, 5, 10, 20]);
  return r < 0.25 ? fromCircumference() : r < 0.5 ? fromArea() : r < 0.75 ? area('pi', [2, 4, 6, 8, 10, 12], pick([0.5, 0.25])) : r < 0.87 ? area('3.14', [6, 7, 8, 9, 11, 12]) : circleWord();
}
