// Compound events: listing every outcome in a table or tree, then counting the ones you want.
import { rnd, pick, chance, simp, fr, b, k, way, num, frac, table } from '../../util.js';
import { tag, plural } from './helpers.js';

const CUBE = [1, 2, 3, 4, 5, 6], COIN = ['H', 'T'];
// Every pair of outcomes as a table. Cells that pass `hit` are bold.
function grid(rows, cols, hit, cell = (r, c) => `${r}${c}`) {
  return table(['', ...cols], rows.map(r => [b(r), ...cols.map(c => (hit(r, c) ? b(cell(r, c)) : cell(r, c)))]));
}
const count = (rows, cols, hit) => rows.reduce((s, r) => s + cols.filter(c => hit(r, c)).length, 0);
// Choice stories. cats names each thing being chosen, and the question must name every one of them.
const COMBOS = [
  { cats: ['shirt', 'shorts'], s: (m, n) => `A team kit has ${k(plural(m, 'shirt'))} and ${k(plural(n, 'pair of shorts', 'pairs of shorts'))} to choose from.`, ask: 'How many different kits (one shirt with one pair of shorts) are possible?' },
  { cats: ['main', 'drink'], s: (m, n) => `A lunch deal lets you pick one of ${k(plural(m, 'main'))} and one of ${k(plural(n, 'drink'))}.`, ask: 'How many different lunches (one main and one drink) are possible?' },
  { cats: ['bus route', 'train route'], s: (m, n) => `There are ${k(plural(m, 'bus route'))} to the city and ${k(plural(n, 'train route'))} back.`, ask: 'How many different round trips (one bus route there and one train route back) are possible?' },
  { cats: ['colour', 'case design'], s: (m, n) => `A phone comes in ${k(plural(m, 'colour'))} and there are ${k(plural(n, 'case design'))}.`, ask: 'How many different pairs of phone colour and case design are possible?' },
];
const COMBOS3 = [
  { cats: ['colour', 'case design', 'storage size'], s: (m, n, e) => `A phone comes in ${k(plural(m, 'colour'))}, there are ${k(plural(n, 'case design'))}, and the phone has ${k(plural(e, 'storage size'))}.`, ask: 'How many different combinations of colour, case design and storage size are possible?' },
  { cats: ['flavour', 'cone', 'topping'], s: (m, n, e) => `An ice-cream stall has ${k(plural(m, 'flavour'))}, ${k(plural(n, 'type of cone', 'types of cone'))} and ${k(plural(e, 'topping'))}. A serving has one of each.`, ask: 'How many different servings (one flavour, one cone and one topping) are possible?' },
  { cats: ['shirt', 'shorts', 'socks'], s: (m, n, e) => `A team kit has ${k(plural(m, 'shirt'))}, ${k(plural(n, 'pair of shorts', 'pairs of shorts'))} and ${k(plural(e, 'pair of socks', 'pairs of socks'))} to choose from.`, ask: 'How many different kits (one shirt, one pair of shorts and one pair of socks) are possible?' },
  { cats: ['frame colour', 'saddle', 'bell'], s: (m, n, e) => `A bike shop lets you choose from ${k(plural(m, 'frame colour'))}, ${k(plural(n, 'saddle style'))} and ${k(plural(e, 'bell design'))}.`, ask: 'How many different bikes (one frame colour, one saddle style and one bell design) are possible?' },
];
export function countWord(L) {
  const three = L >= 3, c = pick(three ? COMBOS3 : COMBOS), m = rnd(2, L >= 3 ? 8 : 5), n = rnd(2, L >= 3 ? 9 : 6), e = three ? rnd(2, 4) : 1, total = m * n * e;
  const rows = Array.from({ length: Math.min(m, 4) }, (_, i) => `A${i + 1}`), cols = Array.from({ length: Math.min(n, 4) }, (_, i) => `B${i + 1}`);
  const cell = `Give each ${c.cats[0]} a row and each ${c.cats[1]} a column.`;
  return tag({ story: three ? c.s(m, n, e) : c.s(m, n), ask: c.ask, answer: num(total), op: three ? 'multi' : 'mul',
    ways: [way('Think of a table', [`${cell} Here is the start of it:`, grid(rows, cols, () => false, (r, c2) => `${r} + ${c2}`),
      `The full table has ${plural(m, 'row')} and ${plural(n, 'column')}, so ${m} × ${n} = ${b(m * n)} cells. Each cell is one pair.`, ...(three ? [`Each pair can go with any of the ${e} choices of ${c.cats[2]}: ${m * n} × ${e} = ${b(total)}`] : [])]),
      way('Think of a tree', [`Start with ${plural(m, 'branch', 'branches')}, one for each ${c.cats[0]}. Every branch splits into ${n} more.`, `${m} groups of ${n} is ${m} × ${n} = ${b(m * n)} branch ends${three ? `, and each of those splits into ${e}: ${b(total)}` : ''}.`])],
    read: { find: 'The number of different combinations.', know: [`${m} ${c.cats[0]} choices`, `${n} ${c.cats[1]} choices`, ...(three ? [`${e} ${c.cats[2]} choices`] : [])], clue: 'Every choice can go with every choice of the others, so multiply.', plan: `${m} × ${n}${three ? ` × ${e}` : ''}` },
    hint: three ? 'For EACH pair of the first two choices, how many choices of the third are there?' : 'For EACH first choice, how many second choices are there?' }, { kind: 'count', xs: three ? [m, n, e] : [m, n], cats: c.cats });
}
function countOutcomes() {
  const n = rnd(3, 8), spin = { cat: 'spinner', name: `a spinner with ${k(plural(n, 'equal section'))} (numbered 1 to ${n}) is spun`, out: Array.from({ length: n }, (_, i) => i + 1) };
  const first = pick([{ cat: 'coin', name: 'A coin is flipped', out: COIN }, { cat: 'number cube', name: `A number cube (${k('1 to 6')}) is rolled`, out: CUBE.map(v => `${v}-`) }]), second = first.out === COIN && chance(0.4) ? { cat: 'number cube', name: `a number cube (${k('1 to 6')}) is rolled`, out: CUBE } : spin;
  const r = first.out.length, c = second.out.length;
  return tag({ story: `${first.name} and ${second.name}.`, ask: `How many different outcomes are possible altogether, with one result from the ${first.cat} and one from the ${second.cat}?`, answer: num(r * c),
    ways: [way('Count the table', [grid(first.out, second.out, () => false), 'Each cell is one outcome: a result from the first thing paired with a result from the second.', `${r} rows × ${c} columns = ${b(r * c)} outcomes.`]),
      way('Think of a tree', [`${r} branches for the first result. Each one splits into ${c} for the second.`, `${r} × ${c} = ${b(r * c)}`])],
    hint: 'Each result of the first thing can go with every result of the second.' }, { kind: 'count', xs: [r, c], cats: [first.cat, second.cat] });
}
function coinAndCube() {
  const side = pick(COIN), ev = pick([['an even number', [2, 4, 6]], ['an odd number', [1, 3, 5]], ['a number greater than 4', [5, 6]], ['a number less than 3', [1, 2]], ['a 6', [6]], ['a number greater than 1', [2, 3, 4, 5, 6]]]);
  const hit = (r, c) => r === side && ev[1].includes(c), fav = count(COIN, CUBE, hit);
  return tag({ story: `A coin is flipped and a number cube (${k('1 to 6')}) is rolled.`, ask: `What is the probability of getting ${side === 'H' ? 'heads' : 'tails'} AND ${ev[0]}? Give a fraction.`, answer: frac(fav, 12),
    ways: [way('Table of all outcomes', [grid(COIN, CUBE, hit), `There are 12 equally likely outcomes. The bold ones are the ones you want: ${b(fav)}.`, `Probability = ${fr(fav, 12, { simplify: false })} = ${b(fr(fav, 12))}`]),
      way('A fraction of a fraction', [`Half of all the outcomes have ${side === 'H' ? 'heads' : 'tails'}. Of those, ${fr(ev[1].length, 6)} have ${ev[0]}.`, `${fr(1, 2)} × ${fr(ev[1].length, 6)} = ${b(fr(fav, 12))}`])],
    hint: 'List every coin-and-number pair. How many fit both conditions?' }, { kind: 'both', sets: [COIN, CUBE], fav: [[side], ev[1]] });
}
function twoSpins() {
  const n = pick([3, 4, 5]), colours = pick([['red', 'red', 'blue'], ['red', 'blue', 'blue', 'green'], ['red', 'red', 'red', 'blue'], ['red', 'blue', 'green']]), nums = Array.from({ length: n }, (_, i) => i + 1);
  const odd = chance(0.5), wantC = pick([...new Set(colours)]), okN = v => (odd ? v % 2 === 1 : v % 2 === 0), cols = colours.map((c, i) => `${c[0].toUpperCase()}${colours.filter((x, j) => x === c && j <= i).length}`);
  const hit = (r, c) => okN(r) && c[0] === wantC[0].toUpperCase(), fav = count(nums, cols, hit), total = n * colours.length;
  return tag({ story: `Spinner A has equal sections numbered ${k(`1 to ${n}`)}. Spinner B has ${colours.length} equal sections: ${k(colours.join(', '))}. Both are spun.`,
    ask: `What is the probability of getting ${odd ? 'an odd' : 'an even'} number AND ${wantC}? Give a fraction.`, answer: frac(fav, total),
    ways: [way('Table of all outcomes', [grid(nums, cols, hit), `${n} × ${colours.length} = ${total} equally likely outcomes. Bold ones fit both conditions: ${b(fav)}.`, `Probability = ${b(fr(fav, total))}`]),
      way('A fraction of a fraction', [`P(${odd ? 'odd' : 'even'}) = ${fr(nums.filter(okN).length, n)} and P(${wantC}) = ${fr(colours.filter(c => c === wantC).length, colours.length)}.`,
        `The spinners do not affect each other, so take one fraction of the other: ${fr(nums.filter(okN).length, n)} × ${fr(colours.filter(c => c === wantC).length, colours.length)} = ${b(fr(fav, total))}`])],
    hint: 'Make a table: numbers down the side, colours across the top.' }, { kind: 'both', sets: [nums, colours], fav: [nums.filter(okN), [wantC]], n, m: colours.length });
}
function twoCubes() {
  const kind = pick(['sumEq', 'sumEq', 'sumGt', 'double']), arg = kind === 'sumEq' ? rnd(3, 11) : kind === 'sumGt' ? rnd(7, 10) : 0;
  const hit = (r, c) => (kind === 'sumEq' ? r + c === arg : kind === 'sumGt' ? r + c > arg : r === c), fav = count(CUBE, CUBE, hit);
  const what = kind === 'sumEq' ? `a total of ${arg}` : kind === 'sumGt' ? `a total greater than ${arg}` : 'a double (the same number on both)';
  return tag({ story: `Two number cubes (${k('1 to 6')}) are rolled${kind === 'double' ? '' : ' and the two numbers are added'}.`, ask: `What is the probability of getting ${what}? Give a fraction.`, answer: frac(fav, 36),
    ways: [way('Table of all 36 outcomes', [grid(CUBE, CUBE, hit, (r, c) => (kind === 'double' ? `${r},${c}` : r + c)), `6 × 6 = 36 equally likely outcomes. The bold cells show ${what}: there are ${b(fav)}.`, `Probability = ${fr(fav, 36, { simplify: false })} = ${b(fr(fav, 36))}`]),
      way('List them in order', [`Go through the first cube's number and find what the second must be: ${CUBE.flatMap(r => CUBE.filter(c => hit(r, c)).map(c => `(${r}, ${c})`)).join(', ')}.`, `That is ${fav} out of 36: ${b(fr(fav, 36))}`, '(1, 2) and (2, 1) are different outcomes, because the cubes are different.'])],
    hint: 'There are 36 outcomes in all. Which pairs give what you want?' }, { kind: 'cubes', pred: kind, arg });
}
function coins() {
  const n = pick([2, 3, 3]), atLeast = chance(0.4), kHeads = rnd(atLeast ? 1 : 0, atLeast ? n - 1 : n), all = [];
  for (let i = 0; i < 2 ** n; i++) all.push(Array.from({ length: n }, (_, j) => ((i >> (n - 1 - j)) & 1 ? 'T' : 'H')).join(''));
  const heads = s => s.split('H').length - 1, hit = s => (atLeast ? heads(s) >= kHeads : heads(s) === kHeads), fav = all.filter(hit).length;
  return tag({ story: `${k(n === 2 ? 'Two coins' : 'Three coins')} are flipped.`, ask: `What is the probability of getting ${atLeast ? 'at least' : 'exactly'} ${kHeads} head${kHeads === 1 ? '' : 's'}? Give a fraction.`, answer: frac(fav, all.length),
    ways: [way('Tree of outcomes', [`Each coin doubles the number of branches: ${Array(n).fill(2).join(' × ')} = ${all.length} outcomes.`, all.map(s => (hit(s) ? b(s) : s)).join(', '), `The bold ones fit: ${fav} out of ${all.length} = ${b(fr(fav, all.length))}`]),
      way('Count by number of heads', [Array.from({ length: n + 1 }, (_, h) => `${h} head${h === 1 ? '' : 's'}: ${all.filter(s => heads(s) === h).length}`).join(', ') + '.', `Add the ones that fit: ${b(fav)} out of ${all.length}.`])],
    hint: 'Write out every outcome in order, like HH, HT, TH, TT.' }, { kind: 'coins', n, atLeast, k: kHeads });
}
function drawTwice() {
  const r = rnd(1, 4), bl = rnd(1, 4), total = r + bl, first = pick(['red', 'blue']), second = pick(['red', 'blue']), cnt = c => (c === 'red' ? r : bl), fav = cnt(first) * cnt(second);
  return tag({ story: `A bag holds ${k(r + ' red')} and ${k(bl + ' blue')} marbles. A marble is picked, its colour is noted, and it is ${k('put back')}. Then a second marble is picked.`,
    ask: `What is the probability of ${first} first and then ${second}? Give a fraction.`, answer: frac(fav, total * total),
    ways: [way('A fraction of a fraction', [`First pick: P(${first}) = ${fr(cnt(first), total, { simplify: false })}. The marble goes back, so the bag is the same for the second pick: P(${second}) = ${fr(cnt(second), total, { simplify: false })}.`,
      `${fr(cnt(first), total, { simplify: false })} × ${fr(cnt(second), total, { simplify: false })} = ${b(fr(fav, total * total, { simplify: false }))}${simp(fav, total * total)[1] === total * total ? '' : ` = ${b(fr(fav, total * total))}`}`]),
      way('Count pairs in a table', [`Picture a table with ${total} rows (first pick) and ${total} columns (second pick): ${total * total} pairs.`, `Rows for ${first}: ${cnt(first)}. Columns for ${second}: ${cnt(second)}. So ${cnt(first)} × ${cnt(second)} = ${plural(fav, 'cell')} fit.`, `${fav} out of ${total * total} = ${b(fr(fav, total * total))}`])],
    hint: 'Find the probability of each pick. The bag is the same both times.' }, { kind: 'draw', r, bl, first, second });
}
export function genCompound(L) {
  const r = Math.random();
  if (L === 1) return r < 0.4 ? countOutcomes() : countWord(L);
  if (L === 2) return r < 0.4 ? coinAndCube() : r < 0.75 ? twoSpins() : coins();
  return r < 0.4 ? twoCubes() : r < 0.6 ? coins() : r < 0.85 ? drawTwice() : countWord(L);
}
