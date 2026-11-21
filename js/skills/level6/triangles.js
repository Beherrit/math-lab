// Triangles from conditions: can three lengths or three angles make one, how long can a side be, and is the triangle unique?
import { R, rnd, pick, chance, shuffle, fmt, b, way, nm, num, choice } from '../../util.js';
import { tag, yesNo } from './helpers.js';
import { sticksFig } from './visuals-tri.js';

const sorted3 = ts => ts.slice().sort((p, q) => p - q), works = ts => { const [x, y, z] = sorted3(ts); return x + y > z; };
// Three lengths in cm. Valid ones fit the rule; invalid ones lie flat or fall short. Halves of a centimetre at step 2.
function lengths(yes, half) {
  const u = half ? 0.5 : 1, x = rnd(3, 11) * u, y = rnd(3, 11) * u;
  const z = yes ? R(rnd(R(Math.abs(x - y) / u) + 1, R((x + y) / u) - 1) * u) : chance(0.6) ? R(x + y + rnd(0, 3) * u) : R(Math.abs(x - y) - rnd(0, 1) * u);
  return shuffle([x, y, z]).map(R);
}
function sides(L) {
  const yes = chance(0.5), [a, c, d] = lengths(yes, L === 2);
  if (a <= 0 || c <= 0 || d <= 0 || works([a, c, d]) !== yes) return sides(L);
  const [x, y, z] = sorted3([a, c, d]), sum = R(x + y), who = nm();
  return tag({ story: `${who} has three sticks. They are ${fmt(a)} cm, ${fmt(c)} cm and ${fmt(d)} cm long.`, ask: `Can ${who} join the sticks end to end to make a triangle?`, answer: yesNo(yes), choiceBig: true,
    ways: [way('Do the two short sticks reach?', [sticksFig(a, c, d), `Lay the two shorter sticks end to end: ${fmt(x)} + ${fmt(y)} = ${fmt(sum)}.`, sum > z ? `That is longer than ${fmt(z)}, so they reach past the end of the long stick and can lean together: ${b('yes')}.` : `That is ${sum === z ? 'exactly' : 'less than'} ${fmt(z)}, so they ${sum === z ? 'only just reach and lie flat' : 'fall short'}: ${b('no')}.`]),
      way('Check every pair', [`${fmt(a)} + ${fmt(c)} = ${fmt(R(a + c))} against ${fmt(d)}. ${fmt(a)} + ${fmt(d)} = ${fmt(R(a + d))} against ${fmt(c)}. ${fmt(c)} + ${fmt(d)} = ${fmt(R(c + d))} against ${fmt(a)}.`, yes ? `Every pair is longer than the third stick: ${b('yes')}.` : `One pair is not longer than the third stick: ${b('no')}.`])],
    hint: 'Take the two shorter sticks and lay them end to end. Do they stretch past the longest stick?' }, { kind: 'tri', shape: 'sides', s: [a, c, d] });
}
function angles() {
  const A = rnd(30, 100), B = rnd(25, 150 - A), yes = chance(0.5), off = pick([-30, -20, -10, 10, 20, 30]), C = 180 - A - B + (yes ? 0 : off), sum = A + B + C;
  if (C <= 0) return angles();
  return tag({ story: `${nm()} draws a shape with three straight sides and measures its angles: ${A}°, ${B}° and ${C}°.`, ask: 'Can the shape be a triangle?', answer: yesNo(yes), choiceBig: true,
    ways: [way('Add the angles', [`${A} + ${B} + ${C} = ${sum}.`, yes ? `The angles in a triangle add to 180, and these do: ${b('yes')}.` : `The angles in a triangle add to 180, and these make ${sum}: ${b('no')}.`]),
      way('Corners on a straight line', [`Tear the three corners off a triangle and put them side by side. They make a straight line, which is 180°.`, `Here the corners make ${sum}°, which is ${sum === 180 ? 'exactly a straight line' : sum > 180 ? 'more than a straight line' : 'less than a straight line'}: ${b(yes ? 'yes' : 'no')}.`])],
    hint: 'What do the three angles of any triangle add up to? Add these three.' }, { kind: 'triangles', shape: 'angles', g: [A, B, C] });
}
function twoAngles() {
  const A = rnd(50, 120), B = rnd(40, 110), yes = A + B < 180, third = 180 - A - B;
  return tag({ story: `A triangle has two angles: ${A}° and ${B}°.`, ask: 'Is that possible?', answer: yesNo(yes), choiceBig: true,
    ways: [way('Find the third angle', [`The three angles add to 180, so the third is 180 − ${A} − ${B} = ${third}.`, yes ? `${third} is more than 0, so there is room for a third corner: ${b('yes')}.` : `${third} is not more than 0, so there is no room for a third corner: ${b('no')}.`]),
      way('Two angles together', [`${A} + ${B} = ${A + B}.`, yes ? `That is less than 180, so some of the 180 is left for the third angle: ${b('yes')}.` : `That is 180 or more, so nothing is left for the third angle: ${b('no')}.`])],
    hint: 'The third angle gets whatever is left of 180. Is anything left?' }, { kind: 'twoangles', shape: 'twoangles', g: [A, B] });
}
function whichThird() {
  for (;;) {
    const a = rnd(3, 12), c = rnd(3, 12), lo = Math.abs(a - c), hi = a + c, good = rnd(lo + 1, hi - 1);
    if (hi - lo < 4 || good <= 0) continue;
    const wrong = [hi, hi + rnd(2, 4), lo === 0 ? hi + 6 : lo].map(v => `${v} cm`);
    if (new Set([`${good} cm`, ...wrong]).size < 4) continue;
    return tag({ story: `Two sticks are ${a} cm and ${c} cm long.`, ask: 'Which length could the third stick be to make a triangle?', answer: choice(`${good} cm`, wrong),
      ways: [way('Shorter than both together, longer than the gap', [`Together the two sticks are ${a} + ${c} = ${hi}. The third must be shorter than that.`, `Their difference is ${lo === 0 ? 'zero' : `${Math.max(a, c)} − ${Math.min(a, c)} = ${lo}`}. The third must be longer than that.`, `So it must be between ${lo} and ${hi}: ${b(`${good} cm`)}.`]),
        way('Test each choice', wrong.map(w => `${w}: ${parseInt(w) >= hi ? `${a} + ${c} = ${hi} is not more than ${parseInt(w)}` : `${parseInt(w)} + ${Math.min(a, c)} is not more than ${Math.max(a, c)}`}, so no triangle.`).concat([`${good} cm works: it is between ${lo} and ${hi}.`]))],
      hint: 'The third stick must be shorter than the other two end to end, but long enough to reach across the gap between them.' }, { kind: 'trithird', shape: 'whichthird', a, c });
  }
}
function range(want) {
  const a = rnd(3, 15), c = rnd(3, 15), lo = Math.abs(a - c) + 1, hi = a + c - 1, ans = want === 'longest' ? hi : lo;
  return tag({ story: `Two sides of a triangle are ${a} cm and ${c} cm. The third side is a whole number of centimetres.`, ask: `What is the ${want} the third side can be, in centimetres?`, answer: num(ans), suffix: 'cm',
    ways: [way('Sum and difference', [`The third side must be shorter than ${a} + ${c} = ${a + c}, and longer than ${Math.max(a, c)} − ${Math.min(a, c)} = ${Math.abs(a - c)}.`, `The whole numbers allowed run from ${lo} to ${hi}, so the ${want} is ${b(ans)}.`]),
      way('Test the ends', [want === 'longest' ? `Try ${a + c}: ${a} + ${c} = ${a + c} only just reaches, so it lies flat. No.` : `Try ${Math.abs(a - c)}: it only just reaches across the gap, so it lies flat. No.`, `Try ${ans}: it just fits as a real triangle. So the ${want} is ${b(ans)}.`])],
    hint: 'The third side must be shorter than the other two end to end, and longer than the gap between them. Which end is asked for?' }, { kind: 'trirange', shape: 'range', a, c, want });
}
function perimeter() {
  const a = rnd(3, 14), c = rnd(3, 14), most = chance(0.5), third = most ? a + c - 1 : Math.abs(a - c) + 1, ans = a + c + third;
  return tag({ story: `Two sides of a triangle are ${a} cm and ${c} cm. The third side is a whole number of centimetres.`, ask: `What is the ${most ? 'greatest' : 'least'} possible perimeter, in centimetres?`, answer: num(ans), suffix: 'cm', op: 'multi',
    ways: [way('Pick the extreme third side', [`${most ? `The third side must be shorter than ${a} + ${c} = ${a + c}, so the longest it can be is ${third}.` : `The third side must be longer than the gap ${Math.abs(a - c)}, so the shortest it can be is ${third}.`}`, `Perimeter: ${a} + ${c} + ${third} = ${b(ans)}`]), way('Use the range', [`The third side can be any whole number from ${Math.abs(a - c) + 1} to ${a + c - 1}.`, `${most ? 'Greatest' : 'Least'} perimeter uses the ${most ? 'largest' : 'smallest'} one: ${a + c} + ${third} = ${b(ans)}`])],
    hint: 'Find the longest and shortest the third side can be. Which one gives the perimeter that is asked for?' }, { kind: 'triperim', shape: 'perimeter', a, c, most });
}
function howMany() {
  const a = rnd(3, 14), c = rnd(3, 14), n = 2 * Math.min(a, c) - 1, lo = Math.abs(a - c) + 1, hi = a + c - 1;
  return tag({ story: `Two sides of a triangle are ${a} cm and ${c} cm.`, ask: 'How many different whole-number lengths could the third side have?', answer: num(n),
    ways: [way('List the range', [`Shorter than ${a + c}, longer than ${Math.abs(a - c)}: the third side is a whole number from ${lo} to ${hi}.`, `Counting ${lo} to ${hi}: ${hi} − ${lo} + 1 = ${b(n)} lengths.`]), way('Shortcut', [`The count is the same as 2 × (the shorter side) − 1.`, `2 × ${Math.min(a, c)} − 1 = ${b(n)}`])],
    hint: 'Find the smallest and the largest whole number the third side can be, then count every length from one to the other.' }, { kind: 'trihow', shape: 'howmany', a, c });
}
function whichSet() {
  for (;;) {
    const x = rnd(3, 9), y = rnd(x, 12), good = shuffle([x, y, rnd(y - x + 1, x + y - 1)]), fmtSet = s => s.map(v => `${v} cm`).join(', ');
    const bad = [[x, y, x + y], [x, y, x + y + rnd(2, 4)], [rnd(2, 4), y + 2, rnd(2, 4) + y + 6]].map(s => shuffle(s));
    if (works(bad[2]) || good.some(v => v <= 0) || new Set([fmtSet(good), ...bad.map(fmtSet)]).size < 4) continue;
    return tag({ ask: 'Which set of three sticks can make a triangle?', answer: choice(fmtSet(good), bad.map(fmtSet)),
      ways: [way('Check the two short sticks', [`For each set, add the two shorter sticks and compare with the longest.`, `Only ${b(fmtSet(good))} has two short sticks that add to MORE than the longest one. The others add to exactly the long one or to less.`]), way('Look for the flat ones', ['A set where two sticks add to exactly the third lies flat, so it is not a triangle.', 'A set where the short sticks add to less than the long one cannot reach.'])],
      hint: 'In each set, do the two shorter sticks add up to more than the longest one?' }, { kind: 'triset', shape: 'whichset' });
  }
}
const KNOWN = {
  sss: (t, n) => `${n} knows all three sides: ${t.s[0]} cm, ${t.s[1]} cm and ${t.s[2]} cm.`, aaa: (t, n) => `${n} knows all three angles: ${t.g[0]}°, ${t.g[1]}° and ${t.g[2]}°.`,
  sas: (t, n) => `${n} knows two sides, ${t.s[0]} cm and ${t.s[1]} cm, and the angle between them, ${t.g[0]}°.`, asa: (t, n) => `${n} knows two angles, ${t.g[0]}° and ${t.g[1]}°, and the side between them, ${t.s[0]} cm.`,
  two: (t, n) => `${n} knows only two sides: ${t.s[0]} cm and ${t.s[1]} cm.`, one: (t, n) => `${n} knows only one angle, ${t.g[0]}°, and one side, ${t.s[0]} cm.`,
};
const COUNTS = ['Exactly one triangle', 'More than one different triangle', 'No triangle at all'];
function unique(L) {
  const cond = pick(L === 1 ? ['sss', 'two', 'aaa'] : L === 2 ? ['sss', 'aaa', 'sas', 'asa', 'two'] : ['sss', 'aaa', 'asa', 'sas', 'one']), good = chance(0.5), n = nm();
  const s = cond === 'sss' ? (good ? lengths(true, false) : lengths(false, false)).map(v => Math.max(1, v)) : [rnd(3, 12), rnd(3, 12), 0];
  const g = cond === 'aaa' ? (() => { const A = rnd(30, 90), B = rnd(30, 100 - A + 40), C = 180 - A - B; return good ? [A, B, C] : [A, B, C + pick([-20, -10, 10, 20])]; })() : cond === 'asa' ? (good ? [rnd(30, 80), rnd(30, 80)] : [rnd(100, 120), rnd(80, 100)]) : [rnd(30, 120), rnd(30, 120)];
  if (g.some(v => v <= 0) || s.some((v, i) => i < 3 && cond === 'sss' && v <= 0)) return unique(L);
  const t = { s, g }, one = cond === 'sss' ? works(s) : cond === 'aaa' ? g[0] + g[1] + g[2] === 180 : cond === 'asa' ? g[0] + g[1] < 180 : cond === 'sas';
  const right = cond === 'two' || cond === 'one' ? COUNTS[1] : cond === 'aaa' ? (one ? COUNTS[1] : COUNTS[2]) : one ? COUNTS[0] : COUNTS[2];
  const why = { sss: one ? 'Three sides lock the shape. It cannot bend, so every triangle with these sides is the same.' : `The two shorter sides add to ${R(sorted3(s)[0] + sorted3(s)[1])}, which is not more than ${sorted3(s)[2]}. They cannot reach.`, aaa: one ? 'The angles fix the shape, but not the size: a bigger or smaller copy has the same angles.' : `${g[0]} + ${g[1]} + ${g[2]} = ${g[0] + g[1] + g[2]}, not 180. No triangle has those angles.`,
    sas: 'Two sides and the angle between them lock the third side and the other angles.', asa: one ? 'Two angles fix the third angle, and the side between them fixes the size.' : `${g[0]} + ${g[1]} = ${g[0] + g[1]} is 180 or more, so there is no room for a third angle.`,
    two: 'Two sides can open to any angle between them, giving many different triangles.', one: 'One angle and one side leave the other sides free to change.' }[cond];
  return tag({ story: KNOWN[cond](t, n), ask: 'How many different triangles can be drawn with exactly these measurements?', answer: choice(right, [], { all: COUNTS }), choiceBig: true,
    ways: [way('What do the measurements fix?', [why, `So the answer is ${b(right.toLowerCase())}.`]), way('Try to draw it', [cond === 'sss' ? (one ? 'Draw one side, then swing arcs from its ends with the other two lengths. They cross in exactly one place above the line.' : 'Draw the longest side, then swing arcs from its ends with the other two lengths. The arcs never touch.') : cond === 'aaa' ? (one ? 'Draw a small triangle with those angles, then a bigger one. Both fit, and they are different sizes.' : 'Put the three corners side by side. They make more or less than a straight line, so the three sides can never close up.') : cond === 'sas' ? 'Draw the angle, then mark the two sides along its arms. Joining the ends finishes the triangle in only one way.' : cond === 'asa' ? 'Draw the side, then draw the two angles at its ends. The lines either cross in one place or never cross.' : 'Draw the sides and spread them to different angles. Each angle gives another triangle.', `That is ${b(right.toLowerCase())}.`])],
    hint: 'Ask: do these measurements lock the triangle so that it can only be drawn one way? Or can it still change shape or size?' }, { kind: 'triunique', shape: 'unique', cond, s: cond === 'sss' ? s : cond === 'two' || cond === 'sas' ? s.slice(0, 2) : cond === 'one' || cond === 'asa' ? [s[0]] : [], g: cond === 'aaa' ? g : cond === 'sas' || cond === 'one' ? [g[0]] : cond === 'asa' ? g.slice(0, 2) : [] });
}
export function genTriangles(L) {
  const r = Math.random();
  if (L === 1) return r < 0.3 ? sides(1) : r < 0.55 ? angles() : r < 0.8 ? whichThird() : unique(1);
  if (L === 2) return r < 0.25 ? range(pick(['longest', 'shortest'])) : r < 0.45 ? sides(2) : r < 0.65 ? twoAngles() : unique(2);
  return r < 0.2 ? perimeter() : r < 0.4 ? howMany() : r < 0.6 ? whichSet() : r < 0.8 ? unique(3) : range(pick(['longest', 'shortest']));
}
