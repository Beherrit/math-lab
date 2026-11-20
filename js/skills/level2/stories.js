// Level 2 stories: telling which operation a story needs, and multiply / divide / mixed story problems.
import { rnd, pick, b, k, way, nm, num, choice } from '../../util.js';
import { groupWays } from './meaning.js';
import { divWays } from './dividing.js';
import { mul2Ways } from './area2.js';
import { tell } from './words.js';

// Each context: (x, y, name) => [story, ask, find, know, clue]. For MUL x groups of y; for DIV x is the total.
// A MUL context only fits sizes between lo and hi, so "37 muffins on a tray" or "3 bikes in a minute" never come up.
const MUL = [
  { lo: 2, hi: 10, f: (g, n) => [`A bike shop has ${k(g + ' racks')} with ${k(n + ' bikes')} on each rack.`, 'How many bikes are in the shop?', 'The total number of bikes.', [`${g} racks`, `${n} bikes on each`], '"On each" tells you the groups are equal, so multiply.'] },
  { lo: 2, hi: 12, f: (g, n, m) => [`${m} bakes ${k(g + ' trays')} of muffins with ${k(n + ' muffins')} on each tray.`, 'How many muffins is that?', 'The total number of muffins.', [`${g} trays`, `${n} muffins on each`], '"On each tray" means equal groups, so multiply.'] },
  { lo: 2, hi: 12, f: (g, n) => [`A teacher has ${k(g + ' boxes')} of pencils with ${k(n + ' pencils')} in each box.`, 'How many pencils is that?', 'The total number of pencils.', [`${g} boxes`, `${n} pencils in each`], '"In each box" means equal groups, so multiply.'] },
  { lo: 2, hi: 50, f: (g, n, m) => [`A game gives ${k(n + ' coins')} for every level. ${m} finishes ${k(g + ' levels')}.`, `How many coins does ${m} earn?`, 'The coins earned for all the levels.', [`${n} coins per level`, `${g} levels`], '"For every level" means equal groups, so multiply.'] },
  { lo: 10, hi: 60, f: (g, n, m) => [`${m} practises guitar for ${k(n + ' minutes')} every day for ${k(g + ' days')}.`, `How many minutes does ${m} practise in all?`, 'The total practice time.', [`${n} minutes each day`, `${g} days`], '"Every day" means the same amount again and again, so multiply.'] },
  { lo: 8, hi: 48, f: (g, n) => [`A hall has ${k(g + ' rows')} of chairs with ${k(n + ' seats')} in each row.`, 'How many seats are in the hall?', 'The total number of seats.', [`${g} rows`, `${n} seats in each row`], '"In each row" means equal groups, so multiply.'] },
  { lo: 8, hi: 48, f: (g, n) => [`A book has ${k(g + ' chapters')} with ${k(n + ' pages')} in each chapter.`, 'How many pages are in the book?', 'The total number of pages.', [`${g} chapters`, `${n} pages in each`], '"In each chapter" means equal groups, so multiply.'] },
  { lo: 10, hi: 50, f: (g, n, m) => [`${m} swims ${k(g + ' lengths')} of a pool that is ${k(n + ' m')} long.`, `How many meters does ${m} swim in all?`, 'The total distance swum.', [`${g} lengths`, `${n} m for each length`], 'Every length is the same distance, so multiply.'] },
  { lo: 10, hi: 50, f: (g, n, m) => [`${m} scores ${k(n + ' points')} in every game and plays ${k(g + ' games')}.`, `How many points does ${m} score in all?`, 'The total points.', [`${n} points per game`, `${g} games`], '"Every game" means equal groups, so multiply.'] },
];
const SHARE = [
  (t, d, m) => [`${m} deals ${k(t + ' cards')} equally to ${k(d + ' players')}.`, 'How many cards does each player get?', 'The cards for one player.', [`${t} cards`, `${d} players`], '"Equally to each" is sharing, so divide.'],
  (t, d) => [`${k(d + ' friends')} split a bill of ${k(t + ' dollars')} equally.`, 'How many dollars does each friend pay?', 'What one friend pays.', [`${t} dollars`, `${d} friends`], '"Split equally" means divide.'],
  (t, d) => [`A club splits ${k(t + ' players')} into ${k(d + ' equal teams')}.`, 'How many players are on each team?', 'The size of one team.', [`${t} players`, `${d} teams`], '"Equal teams" and "on each" mean divide.'],
];
const GROUP = [
  (t, d) => [`A farm packs ${k(t + ' eggs')} into boxes of ${k(String(d))}.`, 'How many boxes does it fill?', 'The number of boxes.', [`${t} eggs`, `${d} in each box`], 'You know the size of a group and ask how many groups, so divide.'],
  (t, d, m) => [`${m} has ${k(t + ' dollars')} for tickets that cost ${k(d + ' dollars')} each.`, `How many tickets can ${m} buy?`, 'The number of tickets.', [`${t} dollars`, `${d} dollars each`], 'How many groups of ' + d + ' fit in ' + t + '? That is dividing.'],
  (t, d, m) => [`${m} reads ${k(d + ' pages')} a day. The book has ${k(t + ' pages')}.`, `How many days does it take ${m} to finish?`, 'The number of days.', [`${t} pages`, `${d} pages a day`], 'How many groups of ' + d + ' fit in ' + t + '? That is dividing.'],
];
const ADD = [
  (a, c, m) => [`${m} has ${k(a + ' trading cards')} and gets ${k(c + ' more')} for a birthday.`, `How many cards does ${m} have now?`, 'The cards after getting more.', [`has ${a}`, `gets ${c} more`], 'Two different amounts are joined. They are not equal groups, so add.'],
  (a, c) => [`A team scored ${k(a + ' points')} in the first game and ${k(c + ' points')} in the second.`, 'How many points is that in both games?', 'The points for both games.', [`first game: ${a}`, `second game: ${c}`], 'Two different amounts are joined, so add.'],
];
const SUB = [
  (a, c, m) => [`${m} had ${k(a + ' dollars')} and spent ${k(c + ' dollars')}.`, `How many dollars does ${m} have left?`, 'The money left.', [`had ${a}`, `spent ${c}`], 'Some is taken away and "left" asks what remains, so subtract.'],
  (a, c, m) => [`A level has ${k(a + ' coins')}. ${m} has collected ${k(c + ' of them')}.`, 'How many coins are still to collect?', 'The coins not collected yet.', [`${a} coins`, `${c} collected`], 'The part still missing is the whole minus the part you have, so subtract.'],
];
function mulNums(L) {
  if (L === 1) return [rnd(2, 5), rnd(2, 5)];
  if (L === 2) return [rnd(3, 9), rnd(3, 10)];
  return [rnd(3, 8), rnd(12, 48)];
}
const divNums = L => { const d = L === 1 ? rnd(2, 5) : rnd(3, 9), q = L === 1 ? rnd(2, 5) : L === 2 ? rnd(3, 10) : rnd(6, 12); return [d * q, d]; };
export function mulWord(L) {
  let [g, n] = mulNums(L); if (g === n) n++;
  return tell(pick(MUL.filter(c => n >= c.lo && n <= c.hi)).f(g, n, nm()), 'mul', num(g * n), n > 10 ? mul2Ways(n, g) : groupWays(g, n), `${g} × ${n}`, { f: 'mul', a: g, b: n }, { hint: `That is ${g} equal groups of ${n}.` });
}
export function shareWord(L) {
  const [t, d] = divNums(L);
  return tell(pick(SHARE)(t, d, nm()), 'div', num(t / d), divWays(t, d, 'share'), `${t} ÷ ${d}`, { f: 'div', a: t, b: d }, { hint: `Sharing equally among ${d} is dividing by ${d}.` });
}
export function groupWord(L) {
  const [t, d] = divNums(L);
  return tell(pick(GROUP)(t, d, nm()), 'div', num(t / d), divWays(t, d, 'group'), `${t} ÷ ${d}`, { f: 'div', a: t, b: d }, { hint: `How many ${d}s fit in ${t}?` });
}
// Two steps: a multiplication or division joined to an addition or subtraction (step 3 only).
export function mixWord(L) {
  if (L < 3) return null;
  const m = nm(), g = rnd(3, 6), n = rnd(4, 9), e = rnd(3, 9), kind = rnd(1, 3), p = g * n, hint = 'There are two steps. Which one has to come first?';
  if (kind === 1) {
    const pay = p < 45 ? 50 : 100;
    return tell([`${m} buys ${k(g + ' tickets')} that cost ${k(n + ' dollars')} each and pays with a ${k(pay + ' dollar bill')}.`, `How many dollars does ${m} get back?`, 'The change after paying.', [`${g} tickets`, `${n} dollars each`, `paid ${pay} dollars`], '"Each" means multiply to find the cost. Change means subtract the cost from the money paid.'],
      'multi', num(pay - p), [way('Cost first, then change', [`Cost: ${g} × ${n} = ${p} dollars.`, `Change: ${pay} − ${p} = ${b(pay - p)} dollars.`]), way('Pay ticket by ticket', [`Each ticket takes ${n} off the ${pay}. Count down by ${n}s, ${g} times.`, `${pay} − ${p} = ${b(pay - p)} dollars are left.`])], `${g} × ${n}, then ${pay} − the cost`, { f: 'mulsub', g, n, pay }, { suffix: 'dollars', hint });
  }
  if (kind === 2) return tell([`A coach has ${k(g + ' bags')} with ${k(n + ' balls')} in each, and ${k(e + ' loose balls')}.`, 'How many balls are there altogether?', 'All the balls, in bags and loose.', [`${g} bags`, `${n} balls in each`, `${e} loose`], '"In each" means multiply for the bags. Then the loose balls are added on.'],
    'multi', num(p + e), [way('Bags first, then the loose ones', [`In bags: ${g} × ${n} = ${p}.`, `With the loose ones: ${p} + ${e} = ${b(p + e)}.`]), way('Count on by groups', [`Start with the ${e} loose balls.`, `Add ${n} for each of the ${g} bags: ${e} + ${p} = ${b(p + e)}.`])], `${g} × ${n}, then + ${e}`, { f: 'muladd', g, n, e }, { hint });
  return tell([`${m} bakes ${k(p + e + ' cookies')}, keeps ${k(String(e))} at home, and shares the rest equally among ${k(g + ' friends')}.`, 'How many cookies does each friend get?', 'The cookies for one friend.', [`${p + e} cookies`, `${e} kept`, `${g} friends`], 'First take away the ones kept (subtract). Then share the rest equally (divide).'],
    'multi', num(n), [way('Take away, then share', [`To share: ${p + e} − ${e} = ${p} cookies.`, `${p} ÷ ${g} = ${b(n)} for each friend.`]), way('Check by building it back', [`${g} friends with ${n} each is ${g} × ${n} = ${p}.`, `Add the ${e} kept at home: ${p} + ${e} = ${p + e}. It fits.`])], `${p + e} − ${e}, then ÷ ${g}`, { f: 'subdiv', t: p + e, e, d: g }, { hint });
}

const OPS = { add: 'Add', sub: 'Subtract', mul: 'Multiply', div: 'Divide' }, SIGN = { add: '+', sub: '−', mul: '×', div: '÷' };
const RULE_OUT = {
  add: 'Nothing is taken away, and the amounts are not equal groups, so it is not subtracting, multiplying or dividing.',
  sub: 'The amount gets smaller, and nothing is being split into equal groups, so it is not adding or dividing.',
  mul: 'Adding would work, but only by adding the same number again and again. Multiplying is the short way to do that.',
  div: 'You already know the total. You are looking for the size of each group or the number of groups, and that is what dividing finds.',
};
function plainStory(op, L) {
  if (op === 'mul') return mulWord(Math.min(L, 2));
  if (op === 'div') return (rnd(0, 1) ? shareWord : groupWord)(Math.min(L, 2));
  const c = L === 1 ? rnd(2, 9) : rnd(4, 20), a = c + (L === 1 ? rnd(2, 9) : rnd(5, 30));
  return tell(pick(op === 'add' ? ADD : SUB)(a, c, nm()), op, num(op === 'add' ? a + c : a - c), [], `${a} ${SIGN[op]} ${c}`, { f: op, a, b: c });
}
export function genWhich(L) {
  const op = pick(L === 1 ? ['add', 'sub', 'mul', 'mul'] : ['add', 'sub', 'mul', 'div', 'div']), p = plainStory(op, L), { a, b: c } = p._t;
  const hi = Math.max(a, c), lo = Math.min(a, c), exprs = Object.values(SIGN).map(s => `${hi} ${s} ${lo}`), asExpr = L === 3;
  return { story: `${p.story} ${p.ask}`, ask: asExpr ? 'Which calculation fits the story? You do not have to work it out.' : 'What do you need to do to solve it? You do not have to work it out.',
    answer: asExpr ? choice(`${hi} ${SIGN[op]} ${lo}`, [], { all: exprs }) : choice(OPS[op], [], { all: Object.values(OPS) }), _t: { f: 'op', op, a, b: c, asExpr },
    hint: 'Picture the story. Are amounts joined, taken away, or are there equal groups?',
    ways: [way('Picture the story', [`${b('What is asked?')} ${p.read.find}`, p.read.clue, `So: ${b(asExpr ? `${hi} ${SIGN[op]} ${lo}` : OPS[op].toLowerCase())}.`]), way('Rule out the others', [RULE_OUT[op], `That leaves ${b(OPS[op].toLowerCase())}.`])] };
}
