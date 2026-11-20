// Greatest common factor, least common multiple, and pulling a common factor out of a sum.
import { rnd, pick, chance, gcd, lcm, b, k, way, nm, num } from '../../util.js';
import { T, coprime } from './helpers.js';

const BLANK = '<span class="blank">?</span>';
const factorsOf = n => Array.from({ length: n }, (_, i) => i + 1).filter(i => n % i === 0);
// Divide both numbers by shared primes until nothing is shared: returns the lines and the dividers used.
function ladder(a, bb) {
  const lines = [], used = [];
  for (let p = 2; p <= Math.min(a, bb);) {
    if (a % p === 0 && bb % p === 0) { lines.push(`Both divide by ${p}: ${a} ÷ ${p} = ${a / p} and ${bb} ÷ ${p} = ${bb / p}`); a /= p; bb /= p; used.push(p); } else p++;
  }
  return { lines, used, a, bb };
}
function gcfWays(a, bb) {
  const g = gcd(a, bb), fa = factorsOf(a), fb = factorsOf(bb), both = fa.filter(x => fb.includes(x)), ld = ladder(a, bb);
  return [way('List the factors', [`Factors of ${a}: ${fa.join(', ')}`, `Factors of ${bb}: ${fb.join(', ')}`, `In both lists: ${both.join(', ')}. The greatest is ${b(g)}.`]),
    way('Keep dividing both', [...ld.lines, `${ld.a} and ${ld.bb} share nothing more.`, ld.used.length > 1 ? `Multiply what you divided by: ${ld.used.join(' × ')} = ${b(g)}` : `You divided by ${b(g)}, so that is the greatest common factor.`, `Why: every shared factor has been pulled out, so nothing bigger can divide both.`])];
}
function lcmWays(a, bb) {
  const m = lcm(a, bb), big = Math.max(a, bb), small = Math.min(a, bb), list = Array.from({ length: m / big }, (_, i) => big * (i + 1));
  return [way('List multiples of the bigger number', [`Multiples of ${big}: ${list.join(', ')}`, `Stop at the first one ${small} goes into: ${m} ÷ ${small} = ${m / small}`, `Least common multiple: ${b(m)}`]),
    way('Use the greatest common factor', [`The greatest common factor of ${a} and ${bb} is ${gcd(a, bb)}.`, `${a} × ${bb} = ${a * bb} counts that shared factor twice, so divide it out once: ${a * bb} ÷ ${gcd(a, bb)} = ${b(m)}`])];
}
function gcfPair(L) {
  const top = L === 1 ? 30 : 100;
  for (;;) { const g = rnd(2, L === 1 ? 6 : 15), [x, y] = coprime(1, L === 1 ? 6 : 9); if (g * x <= top && g * y <= top && g * Math.max(x, y) > g) return [g * x, g * y]; }
}
function lcmPair(L) {
  for (;;) { const a = rnd(2, L === 1 ? 9 : 12), bb = rnd(2, L === 1 ? 10 : 15); if (a !== bb && lcm(a, bb) <= (L === 1 ? 40 : 90) && (L === 1 || (a % bb && bb % a))) return [a, bb]; }
}
const bareGcf = L => { const [a, bb] = gcfPair(L); return T({ ask: `What is the greatest common factor of ${b(a)} and ${b(bb)}?`, answer: num(gcd(a, bb)), ways: gcfWays(a, bb), hint: `A common factor divides both numbers with nothing left over. Start with the factors of ${Math.min(a, bb)}.` }, 'gcf', { a, b: bb }); };
const bareLcm = L => { const [a, bb] = lcmPair(L); return T({ ask: `What is the least common multiple of ${b(a)} and ${b(bb)}?`, answer: num(lcm(a, bb)), ways: lcmWays(a, bb), hint: `Count up in ${Math.max(a, bb)}s until you land on a number that ${Math.min(a, bb)} also goes into.` }, 'lcm', { a, b: bb }); };

const KITS = [['pens', 'pencils', 'school kits'], ['granola bars', 'juice boxes', 'snack bags'], ['red beads', 'blue beads', 'bracelets'], ['guitar picks', 'stickers', 'prize packs'], ['apples', 'oranges', 'fruit baskets']];
const CYCLES = [
  (a, c) => [`One bus leaves the stop every ${k(a + ' minutes')} and another every ${k(c + ' minutes')}. They both leave right now.`, 'In how many minutes will they next leave together?'],
  (a, c) => [`A lighthouse flashes every ${k(a + ' seconds')}. A buoy light flashes every ${k(c + ' seconds')}. They flash together now.`, 'After how many seconds will they flash together again?'],
  (a, c, n) => [`${n} waters the tomatoes every ${k(a + ' days')} and the peppers every ${k(c + ' days')}. Today both get water.`, 'In how many days will both be watered on the same day again?'],
  (a, c) => [`Burger buns come in packs of ${k(a)} and burger patties in packs of ${k(c)}.`, 'What is the smallest number of burgers you can make with no buns or patties left over?'],
];
export function gcfWord(L) {
  if (chance(0.5)) {
    const [a, c] = lcmPair(2), [story, ask] = pick(CYCLES)(a, c, nm());
    return T({ story, ask, answer: num(lcm(a, c)), ways: lcmWays(a, c),
      read: { find: 'The first number that both counts land on.', know: [`counts by ${a}`, `counts by ${c}`], clue: '“Together again” or “none left over” with repeating groups means a common multiple. The first one is the least.', plan: `least common multiple of ${a} and ${c}` },
      hint: `Count by ${Math.max(a, c)}s. Which is the first number that is also in the ${Math.min(a, c)}s?` }, 'lcm', { a, b: c });
  }
  const [a, c] = gcfPair(2), g = gcd(a, c), [x, y, kits] = pick(KITS), per = L === 3 && chance(0.6), n = nm(), ways = gcfWays(a, c);
  if (per) ways.forEach(w => w.s.push(`${g} ${kits}, so each one gets ${a} ÷ ${g} = ${b(a / g)} ${x}.`));
  return T({ story: `${n} has ${k(a + ' ' + x)} and ${k(c + ' ' + y)} to pack into ${kits}. All the ${kits} must be exactly the same, with nothing left over, and ${n} wants to make as many as possible.`,
    ask: per ? `How many ${x} go in each of the ${kits}?` : `What is the greatest number of ${kits} ${n} can make?`, answer: num(per ? a / g : g), ways,
    read: { find: per ? `The ${x} in ONE of the ${kits} (find how many ${kits} first).` : `The largest number of identical ${kits}.`, know: [`${a} ${x}`, `${c} ${y}`], clue: '“Exactly the same, nothing left over, as many as possible” means the greatest number that divides both.', plan: per ? `greatest common factor of ${a} and ${c}, then ${a} ÷ that` : `greatest common factor of ${a} and ${c}` },
    hint: `The number of ${kits} has to divide both ${a} and ${c}.` }, per ? 'gcfPer' : 'gcf', { a, b: c });
}
// 36 + 48 = 12(3 + 4): the common factor comes out in front.
function factorOut() {
  const g = rnd(2, 12), [x, y] = coprime(1, 9), A = g * x, B = g * y, miss = pick(['g', 'x', 'y']), ans = { g, x, y }[miss];
  const sh = v => (v === miss ? BLANK : { g, x, y }[v]);
  return T({ ask: miss === 'g' ? 'The greatest common factor has been pulled out in front. What number is missing?' : 'What number is missing?', expr: `${A} + ${B} = ${sh('g')}(${sh('x')} + ${sh('y')})`, answer: num(ans),
    ways: [way('Share out the common factor', [`The greatest common factor of ${A} and ${B} is ${b(g)}.`, `${A} = ${g} × ${x} and ${B} = ${g} × ${y}`, `So ${A} + ${B} = ${g} × ${x} + ${g} × ${y} = ${g}(${x} + ${y}). The missing number is ${b(ans)}.`]),
      way('Check with an area picture', [`Think of two rectangles that are both ${g} tall: one ${x} wide (area ${A}) and one ${y} wide (area ${B}).`, `Push them together: ${g} tall and ${x} + ${y} = ${x + y} wide.`, `${g} × ${x + y} = ${A + B}, and ${A} + ${B} = ${A + B}`])],
    hint: miss === 'g' ? `What is the biggest number that divides both ${A} and ${B}?` : `The number in front multiplies each number inside the brackets.` }, 'factorOut', { A, B, miss });
}
export function genGcf(L) {
  if (L === 1) return chance(0.5) ? bareGcf(1) : bareLcm(1);
  if (L === 2) return pick([bareGcf, bareLcm, gcfWord])(2);
  return chance(0.5) ? factorOut() : gcfWord(3);
}
