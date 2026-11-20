// Volume of cylinders, cones and spheres. Answers are either "a number times π" or use 3.14 for π, as the question says.
import { R, rnd, pick, chance, b, way, pow, F, fr, fmt, num, frac } from '../../util.js';
import { blank } from './h.js';
import { solid } from './shapes.js';

const UNITS = ['cm', 'm', 'in', 'ft'];
// The number in front of π, as a fraction [n, d].
export const COEF = { cyl: (r, h) => [r * r * h, 1], cone: (r, h) => [r * r * h, 3], sphere: r => [4 * r ** 3, 3] };
const NAME = { cyl: 'cylinder', cone: 'cone', sphere: 'sphere' };
const FORMULA = { cyl: `V = π${pow('r', 2)}h`, cone: `V = ${F(1, 3)}π${pow('r', 2)}h`, sphere: `V = ${F(4, 3)}π${pow('r', 3)}` };
const coefText = ([n, d]) => (n % d === 0 ? fmt(n / d) : fr(n, d));
function formulaWay(shape, r, h, co) {
  const plug = shape === 'cyl' ? `π × ${pow(r, 2)} × ${h} = π × ${r * r} × ${h}` : shape === 'cone' ? `${F(1, 3)} × π × ${pow(r, 2)} × ${h} = ${F(1, 3)} × π × ${r * r * h}` : `${F(4, 3)} × π × ${pow(r, 3)} = ${F(4, 3)} × π × ${r ** 3}`;
  return way('Use the formula', [FORMULA[shape], `${plug} = ${b(coefText(co) + 'π')}`]);
}
function ideaWay(shape, r, h, co) {
  if (shape === 'cyl') return way('Stack the base', [`The base is a circle with area π × ${r} × ${r} = ${r * r}π.`, `A cylinder is that same circle stacked up ${h} units high, like a pile of coins: ${r * r}π × ${h} = ${b(coefText(co) + 'π')}`]);
  if (shape === 'cone') return way('One third of a cylinder', [`A cylinder with the same base and height holds π × ${pow(r, 2)} × ${h} = ${r * r * h}π.`, 'It takes exactly three cones of sand to fill that cylinder.', `So the cone holds ${r * r * h}π ÷ 3 = ${b(coefText(co) + 'π')}`]);
  return way('Two thirds of the can around it', [`The smallest cylinder that fits around the sphere has radius ${r} and height ${2 * r}. It holds π × ${pow(r, 2)} × ${2 * r} = ${2 * r ** 3}π.`, 'A sphere fills exactly two thirds of that cylinder.', `${F(2, 3)} × ${2 * r ** 3}π = ${b(coefText(co) + 'π')}`]);
}
const labels = (shape, r, h, u, useD) => [useD ? '' : `${r} ${u}`, shape === 'sphere' ? '' : `${h} ${u}`];
function volume(shape, r, h, mode, useD = false) {
  const co = COEF[shape](r, h), u = pick(UNITS), [lr, lh] = labels(shape, r, h, u, useD), whole = co[0] % co[1] === 0;
  if (mode === '3.14' && !whole) return null;
  const ways = [formulaWay(shape, r, h, co), ideaWay(shape, r, h, co)], pre = useD ? [`The radius is half the diameter: ${2 * r} ÷ 2 = ${r}.`] : [];
  if (pre.length) ways.forEach(w => w.s.unshift(pre[0]));
  const _t = { k: 'vol', shape, r, h, pi: mode }, across = ` It has ${useD ? `diameter ${2 * r}` : `radius ${r}`} ${u}${shape === 'sphere' ? '' : ` and height ${h} ${u}`}.`, visual = solid(shape, lr, lh), hint = useD ? 'The formula needs the radius. Halve the diameter first.' : shape === 'cyl' ? 'Find the area of the circle at the bottom, then multiply by the height.' : shape === 'cone' ? 'Find the cylinder with the same base and height, then take one third.' : 'Cube the radius first, then multiply by four thirds.';
  if (mode === '3.14') {
    const v = R(3.14 * co[0] / co[1]);
    ways[0].s.push(`Now use 3.14 for π: ${coefText(co)} × 3.14 = ${b(fmt(v))}`);
    return { ask: `Find the volume of this ${NAME[shape]}.${across} Use 3.14 for π.`, visual, answer: num(v), suffix: `cubic ${u}`, ways, hint, _t };
  }
  return { ask: `Find the volume of this ${NAME[shape]}.${across} Leave π in the answer: what number goes in front of π?${whole ? '' : ' (Write it as a fraction.)'}`, expr: `V = ${blank} × π cubic ${u}`, exprSmall: true, visual, answer: whole ? num(co[0] / co[1]) : frac(co[0], co[1]), ways, hint, _t };
}
// Height of a cylinder or cone, given its volume as a multiple of π and its radius.
function findHeight() {
  const shape = pick(['cyl', 'cone']), r = rnd(2, 6), h = shape === 'cone' ? 3 * rnd(1, 4) : rnd(2, 12), co = COEF[shape](r, h), k = co[0] / co[1], u = pick(UNITS);
  return { ask: `A ${NAME[shape]} has volume ${fmt(k)}π cubic ${u} and radius ${r} ${u}. What is its height?`, visual: solid(shape, `${r} ${u}`, '?'), answer: num(h), suffix: u, hint: 'Write the formula with the numbers you know. The π on each side cancels.', _t: { k: 'volh', shape, r, vol: k },
    ways: [way('Work backwards through the formula', [FORMULA[shape], shape === 'cyl' ? `${fmt(k)}π = π × ${r * r} × h. Divide both sides by π: ${fmt(k)} = ${r * r} × h` : `${fmt(k)}π = ${F(1, 3)} × π × ${r * r} × h. Divide both sides by π and multiply by 3: ${fmt(k * 3)} = ${r * r} × h`, `h = ${fmt(shape === 'cyl' ? k : k * 3)} ÷ ${r * r} = ${b(h)}`]),
      way('Check it', [shape === 'cyl' ? `π × ${pow(r, 2)} × ${h} = ${fmt(k)}π` : `${F(1, 3)} × π × ${pow(r, 2)} × ${h} = ${F(1, 3)} × ${r * r * h}π = ${fmt(k)}π`, 'That matches the volume given.'])] };
}
function coneFromCylinder() {
  const r = rnd(2, 6), h = 3 * rnd(1, 4), big = r * r * h, toCone = chance(0.5), u = pick(UNITS);
  return { ask: toCone ? `A cylinder holds ${fmt(big)}π cubic ${u}. A cone has the same base and the same height. The cone holds ${blank}π cubic ${u}. What number is missing?` : `A cone holds ${fmt(big / 3)}π cubic ${u}. A cylinder has the same base and the same height. The cylinder holds ${blank}π cubic ${u}. What number is missing?`,
    answer: num(toCone ? big / 3 : big), hint: 'Three cones fill one cylinder with the same base and height.', _t: { k: 'volcc', big, toCone },
    ways: [way('Three cones fill the cylinder', ['A cone holds exactly one third of the cylinder with the same base and height.', toCone ? `${fmt(big)}π ÷ 3 = ${b(fmt(big / 3) + 'π')}` : `${fmt(big / 3)}π × 3 = ${b(fmt(big) + 'π')}`]),
      way('Compare the formulas', [`Cylinder: ${FORMULA.cyl}. Cone: ${FORMULA.cone}.`, `The only difference is the ${F(1, 3)}, so the cone is one third of the cylinder: ${b(fmt(toCone ? big / 3 : big) + 'π')}.`])] };
}
// A cylinder with half a sphere on top (a silo or a capsule end).
function silo() {
  const r = pick([3, 3, 6]), h = rnd(2, 10), cyl = r * r * h, dome = 2 * r ** 3 / 3, u = pick(['m', 'ft']);
  return { ask: `A grain silo is a cylinder with half a sphere on top. The radius is ${r} ${u} and the cylinder part is ${h} ${u} tall. The total volume is ${blank}π cubic ${u}. What number is missing?`, answer: num(cyl + dome), hint: 'Find the cylinder and the half sphere separately, then add.', _t: { k: 'volsilo', r, h },
    ways: [way('Two parts, then add', [`Cylinder: π × ${pow(r, 2)} × ${h} = ${cyl}π.`, `Whole sphere: ${F(4, 3)} × π × ${pow(r, 3)} = ${2 * dome}π. Half of it: ${dome}π.`, `${cyl}π + ${dome}π = ${b(fmt(cyl + dome) + 'π')}`]),
      way('Half sphere formula', [`Half of ${F(4, 3)}π${pow('r', 3)} is ${F(2, 3)}π${pow('r', 3)} = ${F(2, 3)} × π × ${r ** 3} = ${dome}π.`, `Add the cylinder, ${cyl}π: ${b(fmt(cyl + dome) + 'π')}`])] };
}
const coneDims = () => { const r = rnd(2, 6); return [r, r % 3 === 0 ? rnd(2, 9) : 3 * rnd(1, 4)]; };
export function genVol(L) {
  if (L === 1) return volume('cyl', rnd(1, 5), rnd(2, 10), 'pi');
  if (L === 2) {
    const t = rnd(0, 3);
    if (t === 0) return volume('cone', ...coneDims(), 'pi');
    if (t === 1) return volume('sphere', pick([1, 2, 3, 3, 4, 5, 6]), 0, 'pi');
    if (t === 2) return volume('cyl', rnd(2, 6), rnd(2, 12), 'pi', true);
    return volume('cyl', rnd(1, 4), rnd(2, 9), '3.14');
  }
  return pick([() => volume('cone', ...coneDims(), '3.14'), () => volume('sphere', pick([3, 6]), 0, '3.14'), () => volume('cyl', rnd(2, 6), rnd(2, 10), '3.14', true), findHeight, findHeight, coneFromCylinder, silo])();
}
