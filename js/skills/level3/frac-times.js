// Multiplying a fraction by a whole number: repeated adding of same-size pieces.
import { rnd, pick, F, b, k, way, nm, num, frac, choice, fracBar } from '../../util.js';
import { BLANK, oneOf } from './helpers.js';
import { finish } from './frac-util.js';

// tail is an optional last line for questions that ask for something other than the product itself.
function ways(w, n, d, tail) {
  const R = w * n, sumLine = w <= 6 ? `${Array(w).fill(F(n, d)).join(' + ')} = ${F(R, d)}` : `Adding ${F(n, d)} again and again, ${w} times, gives ${F(R, d)}.`;
  const out = [way('Repeated addition', [`${w} × ${F(n, d)} means ${w} lots of ${F(n, d)}.`, 'Only the tops are added, because every piece is the same size.', sumLine, ...finish(R, d)]),
    way('Multiply the top', [n > 1 ? `${F(n, d)} is ${n} pieces, each one ${F(1, d)}.` : `${F(1, d)} is one piece.`, `${w} lots of ${n} piece${n > 1 ? 's' : ''} is ${w} × ${n} = ${R} pieces.`,
      `The size of a piece does not change, so the bottom stays ${d}: ${w} × ${F(n, d)} = ${b(F(R, d))}`, ...finish(R, d)])];
  if (R <= 5 * d && d <= 10) out.push(way('Picture it', [`Shade ${F(n, d)}, ${w} times over. Each bar is 1 whole.`, fracBar(R, d, { label: `${R}/${d}` }), `${R} pieces are shaded: ${b(F(R, d))}`]));
  return tail ? out.map(x => ({ ...x, s: [...x.s, tail] })) : out;
}
const SIZE = [() => [rnd(2, 7), 1, rnd(2, 8)], () => { const d = rnd(3, 10); return [rnd(2, 9), rnd(2, d - 1), d]; }, () => { const d = rnd(3, 12); return [rnd(4, 12), rnd(2, d - 1), d]; }];

function plain(L) {
  const [w, n, d] = SIZE[L - 1]();
  return { ask: 'Multiply.', expr: `${w} × ${F(n, d)}`, answer: frac(w * n, d), _t: { kind: 'fmul', w, n, d }, ways: ways(w, n, d), hint: `Think of ${w} lots of ${F(n, d)}. How many pieces is that?` };
}
function asUnits(L, one) {
  const [w0, n, d] = SIZE[L - 1](), w = one ? 1 : pick([1, w0]), R = w * n;
  return { ask: 'Find the missing whole number.', expr: `${w > 1 ? `${w} × ` : ''}${F(n, d)} = ${BLANK} × ${F(1, d)}`, answer: num(R), _t: { kind: 'units', w, n }, hint: `How many pieces of size ${F(1, d)} are there in all?`,
    ways: [way('Count unit pieces', [`${F(n, d)} is ${n} pieces of size ${F(1, d)}: ${F(n, d)} = ${n} × ${F(1, d)}.`, ...(w > 1 ? [`${w} lots of ${n} pieces is ${w} × ${n} = ${R} pieces.`] : []), `So the blank is ${b(R)}.`]),
      R <= 5 * d ? way('Picture it', [`Each shaded part is one ${F(1, d)}. Count them.`, fracBar(R, d), `There are ${b(R)} shaded parts.`])
        : way('Check it', [`${R} × ${F(1, d)} = ${F(R, d)}, and ${w} × ${F(n, d)} = ${F(R, d)} too. They match.`])] };
}
function between(L) {
  const [w, n, d] = SIZE[L - 1](), R = w * n, lo = Math.floor(R / d), start = Math.max(0, lo - 1), all = [0, 1, 2].map(i => `${start + i} and ${start + i + 1}`);
  if (R % d === 0) return null;
  return { ask: `${w} × ${F(n, d)} is between which two whole numbers?`, answer: choice(`${lo} and ${lo + 1}`, [], { all }), _t: { kind: 'fbetween', w, n, d }, ways: ways(w, n, d, `So ${w} × ${F(n, d)} is between ${b(lo)} and ${b(lo + 1)}.`),
    hint: 'Multiply first, then see how many wholes fit in the answer.' };
}

const CTX = [
  (A, w, n) => [`Each lap of the park path is ${k(A + ' km')}. ${n} runs ${k(w + ' laps')}.`, `How many km does ${n} run?`, 'The distance for all the laps.', [`one lap: ${A} km`, `${w} laps`]],
  (A, w, n) => [`One smoothie uses ${k(A + ' cup')} of yogurt. ${n} makes ${k(w + ' smoothies')}.`, 'How many cups of yogurt are needed?', 'The yogurt for all the smoothies.', [`one smoothie: ${A} cup`, `${w} smoothies`]],
  (A, w, n) => [`${n} practices drums for ${k(A + ' hour')} on each of ${k(w + ' days')}.`, `How many hours does ${n} practice in all?`, 'The practice time for all the days.', [`each day: ${A} hour`, `${w} days`]],
  (A, w) => [`A bag of rice weighs ${k(A + ' kg')}. A cook uses ${k(w + ' bags')}.`, 'How many kg of rice is that?', 'The weight of all the bags.', [`one bag: ${A} kg`, `${w} bags`]],
];
export function fmulWord(L) {
  const [w, n, d] = SIZE[Math.max(L, 2) - 1](), [story, ask, find, know] = pick(CTX)(F(n, d), w, nm());
  return { story, ask, answer: frac(w * n, d), op: 'mul', _t: { kind: 'fmul', w, n, d }, ways: ways(w, n, d), hint: 'The same fraction again and again. Which operation is a shortcut for that?',
    read: { find, know, clue: '“Each” means the same amount again and again, so multiply.', plan: `${w} × ${F(n, d)}` } };
}

const MAKERS = [[plain, plain, () => asUnits(2, true)], [plain, plain, plain, asUnits, fmulWord], [plain, plain, between, between, asUnits, fmulWord, fmulWord]];
export const genFmul = L => oneOf(MAKERS[L - 1], L);
