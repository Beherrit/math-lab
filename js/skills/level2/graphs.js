// Scaled picture graphs and bar graphs: reading them, comparing, how many more, and two-step questions.
import { rnd, pick, shuffle, b, way, num, choice } from '../../util.js';
import { makeGraph } from './graphdata.js';
import { hops } from './arith.js';
import { skips, cnt } from './words.js';
import { mark, yesNo } from './kit.js';

const at = (g, c) => g.vals[g.cats.indexOf(c)];
const others = (g, ...not) => g.cats.filter(c => !not.includes(c));
const twoJumps = (a, c) => { const x = c >= 10 && c % 10 ? c - (c % 10) : Math.ceil(c / 2); return `${a} + ${x} = ${a + x}, then ${a + x} + ${c - x} = ${a + c}`; };
// Reading one value: circles times the key, or the top of the bar against the scale.
function readWays(g, c) {
  const v = at(g, c), s = g.scale, whole = Math.floor(v / s), half = v % s !== 0;
  if (g.kind === 'pic') return [way('Count the circles', [g.visual, `Count the circles in the ${c} row${half ? '. The half circle counts as half' : ''}.`, `${whole} × ${s} = ${whole * s}${half ? `, and the half circle is ${s / 2}: ${whole * s} + ${s / 2}` : ''} = ${b(v)}.`]),
    way('Skip count by the key', [`Count by ${s}s, one for each circle: ${skips(whole, s)}${half ? `, and half more is ${s / 2}` : ''}.`, `That reaches ${b(v)}.`])];
  return [way('Follow the bar to the scale', [g.visual, `Look at the top of the ${c} bar and follow it across to the numbers on the left.`, half ? `It is halfway between ${whole * s} and ${whole * s + s}: ${whole * s} + ${s / 2} = ${b(v)}.` : `It lands on the line for ${b(v)}.`]),
    way('Count the lines', [`The scale goes up by ${s} each line.`, `The ${c} bar is ${cnt(whole, 'line')} high${half ? ' and half a line more' : ''}: ${whole} × ${s} = ${whole * s}${half ? `, plus ${s / 2} is ${v}` : ''}. The value is ${b(v)}.`])];
}
function readQ(g) {
  const c = pick(g.cats);
  return { ask: mark(`How many ${g.unit} does the graph show for ${c}?`, c, g.kind), visual: g.visual, answer: num(at(g, c)), _t: { f: 'gread', cat: c, pic: true }, hint: g.kind === 'pic' ? 'Count the circles, then think about what each circle is worth.' : 'Find the top of the bar and follow it across to the scale.', ways: readWays(g, c) };
}
function moreQ(g) {
  const [x, y] = shuffle(g.cats).slice(0, 2).sort((p, q) => at(g, q) - at(g, p)), vx = at(g, x), vy = at(g, y), d = vx - vy;
  return { ask: mark(`How many more ${g.unit} does the graph show for ${x} than for ${y}?`, x, y), visual: g.visual, answer: num(d), _t: { f: 'gmore', cats: [x, y], pic: true }, hint: 'Read both values first. Then find how far apart they are.',
    ways: [way('Read both, then subtract', [g.visual, `${x}: ${vx}. ${y}: ${vy}.`, `${vx} − ${vy} = ${b(d)}.`]), way('Count up from the smaller', [`Count up from ${vy} to ${vx} in jumps: ${hops(vy, vx).join(' + ')}.`, `The jumps add up to ${b(d)}.`])] };
}
function totalQ(g) {
  const [x, y] = shuffle(g.cats).slice(0, 2), vx = at(g, x), vy = at(g, y), t = vx + vy;
  return { ask: mark(`How many ${g.unit} does the graph show for ${x} and ${y} together?`, x, y), visual: g.visual, answer: num(t), _t: { f: 'gtotal', cats: [x, y], pic: true }, hint: 'Read both values first. Then put them together.',
    ways: [way('Read both, then add', [g.visual, `${x}: ${vx}. ${y}: ${vy}.`, `${vx} + ${vy} = ${b(t)}.`]), way('Add in two jumps', [`Start at ${vx} and add ${vy} in two jumps: ${twoJumps(vx, vy)}.`, `The total is ${b(t)}.`])] };
}
function mostQ(g, most) {
  const sorted = g.cats.slice().sort((p, q) => at(g, q) - at(g, p)), right = most ? sorted[0] : sorted[sorted.length - 1], rest = others(g, right);
  return { ask: mark(`Which one has the ${most ? 'most' : 'fewest'} ${g.unit}?`, most ? 'most' : 'fewest', g.kind), visual: g.visual, answer: choice(right, shuffle(rest)), choiceBig: true, _t: { f: 'gmost', most, pic: true }, hint: most ? 'Look for the longest row or the tallest bar.' : 'Look for the shortest row or the shortest bar.',
    ways: [way('Compare the lengths', [g.visual, `${most ? 'The longest' : 'The shortest'} ${g.kind === 'pic' ? 'row of circles' : 'bar'} belongs to ${b(right)}.`]), way('Read every value', [...g.cats.map(c => `${c}: ${at(g, c)}.`), `The ${most ? 'greatest' : 'least'} is ${b(right)}.`])] };
}
// Two steps: how many fewer than the top one, or the two together compared with a third.
function twoQ(g, kind) {
  const sorted = g.cats.slice().sort((p, q) => at(g, q) - at(g, p));
  if (kind === 'fewer') {
    const c = pick(sorted.slice(1)), top = at(g, sorted[0]), v = at(g, c);
    return { ask: mark(`How many fewer ${g.unit} does ${c} have than the one with the most?`, c, g.kind), visual: g.visual, answer: num(top - v), _t: { f: 'gtwo', kind, cats: [c], pic: true }, hint: 'First find which one has the most. Then see how far that is from the one you want.',
      ways: [way('Find the top, then subtract', [g.visual, `The most is ${sorted[0]} with ${top}. ${c} has ${v}.`, `${top} − ${v} = ${b(top - v)}.`]), way('Count up to the top', [`Count up from ${v} to ${top} in jumps: ${hops(v, top).join(' + ')}.`, `The jumps add up to ${b(top - v)}.`])] };
  }
  let x, y, z;
  do { [x, y, z] = shuffle(g.cats).slice(0, 3); } while (at(g, x) + at(g, y) <= at(g, z));
  const s = at(g, x) + at(g, y), d = s - at(g, z);
  return { ask: mark(`How many more ${g.unit} are shown for ${x} and ${y} together than for ${z}?`, x, y, z), visual: g.visual, answer: num(d), _t: { f: 'gtwo', kind, cats: [x, y, z], pic: true }, hint: 'First put the two together. Then compare with the third.',
    ways: [way('Add, then subtract', [g.visual, `${x} and ${y} together: ${at(g, x)} + ${at(g, y)} = ${s}.`, `${s} − ${at(g, z)} = ${b(d)}.`]), way('Take the third from one, then add the other', [`${x}: ${at(g, x)}, and ${z}: ${at(g, z)}.`, `Take ${z} from the total: ${s} − ${at(g, z)} = ${b(d)}.`])] };
}
// "The graph shows 15 more votes for Soccer than for Tennis." True or false?
function claimQ(g) {
  const [x, y] = shuffle(g.cats).slice(0, 2).sort((p, q) => at(g, q) - at(g, p)), real = at(g, x) - at(g, y), ok = Math.random() < 0.5, said = ok ? real : real + pick([-1, 1, -2, 2]) * g.scale;
  if (said <= 0) return claimQ(g);
  return { ask: mark(`The graph shows ${said} more ${g.unit} for ${x} than for ${y}. True or false?`, x, y, said), visual: g.visual, answer: yesNo(said === real), choiceBig: true, _t: { f: 'gclaim', cats: [x, y], said, pic: true }, hint: 'Read both values, then find how far apart they are.',
    ways: [way('Work out the real difference', [g.visual, `${x}: ${at(g, x)}. ${y}: ${at(g, y)}. The difference is ${at(g, x)} − ${at(g, y)} = ${real}.`, said === real ? `${real} matches ${said}, so it is ${b('True')}.` : `${real} is not ${said}, so it is ${b('False')}.`]),
      way('Test the claim', [`If ${x} is ${said} more than ${y}, then ${at(g, y)} + ${said} = ${at(g, y) + said} should be ${at(g, x)}.`, said === real ? `It is, so it is ${b('True')}.` : `It is not, so it is ${b('False')}.`])] };
}
// Number to picture: how many circles does a value need?
function keyQ(L) {
  const key = pick(L === 1 ? [2, 5] : [5, 10]), n = rnd(3, L === 1 ? 8 : 10), v = n * key, back = Math.random() < 0.5;
  if (back) return { ask: `In a picture graph, each circle stands for ${key}. A row has ${n} circles. How many does the row show?`, answer: num(v), _t: { f: 'mul', a: n, b: key }, hint: 'Each circle is worth the same amount.',
    ways: [way('Multiply', [`${n} circles × ${key} each = ${b(v)}.`]), way('Skip count', [`Count by ${key}s, ${n} times: ${skips(n, key)}.`, `That reaches ${b(v)}.`])] };
  return { ask: `A row of a picture graph shows ${v}. Each circle stands for ${key}. How many circles does the row need?`, answer: num(n), _t: { f: 'div', a: v, b: key }, hint: `How many groups of ${key} fit in ${v}?`,
    ways: [way('Divide', [`${v} ÷ ${key} = ${b(n)} circles.`]), way('Skip count', [`Count by ${key}s until you reach ${v}: ${skips(n, key)}.`, `You counted ${b(n)} times.`])] };
}
// Which scale? The biggest number you can count by so that every value lands on a grid line.
function scaleQ() {
  const s = pick([2, 5, 10]), vals = Array.from({ length: 4 }, () => rnd(1, 9) * s), opts = shuffle([2, 3, 4, 5, 10].filter(x => x !== s)).slice(0, 3), all = [s, ...opts], fits = x => vals.every(v => v % x === 0);
  if (Math.max(...all.filter(fits)) !== s) return scaleQ();
  return { ask: `The numbers for a bar graph are ${vals.join(', ')}. Which is the biggest scale (counting by) so that every number lands on a grid line?`, answer: choice(String(s), opts.map(String)), choiceBig: true, _t: { f: 'gscale', vals },
    hint: 'Each number must be reachable by counting by the scale. Try the biggest choices first.',
    ways: [way('Test each scale', [...all.map(x => `${x}: ${fits(x) ? 'every number fits' : `${vals.find(v => v % x)} does not fit`}.`), `The biggest that fits is ${b(s)}.`]), way('Look at the numbers', [`Every number is a multiple of ${s}, and no bigger choice divides all of them.`, `So the scale is ${b(s)}.`])] };
}
export function genGraphs(L) {
  const g = makeGraph(L);
  const pool = L === 1 ? [() => readQ(g), () => readQ(g), () => mostQ(g, true), () => mostQ(g, false), () => moreQ(g), () => keyQ(1)]
    : L === 2 ? [() => readQ(g), () => moreQ(g), () => totalQ(g), () => mostQ(g, Math.random() < 0.5), () => claimQ(g), () => keyQ(2), () => scaleQ(), () => twoQ(g, 'fewer')]
      : [() => readQ(g), () => twoQ(g, 'fewer'), () => twoQ(g, 'both'), () => claimQ(g), () => moreQ(g), () => totalQ(g), () => scaleQ()];
  return pick(pool)();
}
