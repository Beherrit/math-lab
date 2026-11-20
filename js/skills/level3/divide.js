// Division by a one-digit divisor: partial quotients first, then the standard layout, and what a remainder means.
import { rnd, pick, chance, fmt, b, k, way, nm, num, choice } from '../../util.js';
import { BLANK, oneOf } from './helpers.js';

const CHUNKS = [5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
const split = (n, d) => [Math.floor(n / d), n % d];
const shown = (q, r) => (r ? `${fmt(q)} R${r}` : fmt(q));

// Easy numbers of groups to take away first: always fewer than the whole quotient, so they never give the answer away.
const starts = (n, d) => [1000, 500, 100, 50, 10, 5, 2].filter(c => c < n / d).slice(0, 2);
const startHint = (n, d) => { const s = starts(n, d); return s.length ? ` (such as ${s.map(c => `${c} groups`).join(' or ')})` : ''; };
// tail is an optional last line, used when a story decides what the answer is.
function chunkWay(n, d, tail) {
  const [q, r] = split(n, d), lines = [], took = []; let rem = n;
  while (rem >= d) {
    const m = CHUNKS.find(x => x * d <= rem);
    lines.push(`${fmt(m)} × ${d} = ${fmt(m * d)}. Take it away: ${fmt(rem)} − ${fmt(m * d)} = ${fmt(rem - m * d)}`);
    rem -= m * d; took.push(m);
  }
  return way('Partial quotients', [`Take away easy groups of ${d}${startHint(n, d)} until less than ${d} is left.`, ...lines,
    `Add up the groups you took: ${took.map(fmt).join(' + ')} = ${b(fmt(q))}${r ? `. Left over: ${b(r)}` : ''}.`, ...(tail ? [tail] : [])]);
}
function longWay(n, d, tail) {
  const ds = String(n).split('').map(Number), steps = [], [q, r] = split(n, d); let cur = 0, started = false;
  ds.forEach((x, i) => {
    cur = cur * 10 + x;
    if (!started && cur < d && i < ds.length - 1) { steps.push(`${d} does not fit into ${cur}, so use the next digit as well.`); return; }
    started = true;
    const t = Math.floor(cur / d), left = cur - t * d;
    steps.push(`${d} into ${b(cur)} goes ${b(t)}, because ${t} × ${d} = ${t * d}. Subtract: ${cur} − ${t * d} = ${left}.${i < ds.length - 1 ? ` Bring down the ${ds[i + 1]}.` : ''}`);
    cur = left;
  });
  return way('Standard layout', ['Work from the left, one digit at a time: divide, multiply, subtract, bring down. Each step is a partial quotient for one place.', ...steps,
    `The digits on top read ${b(fmt(q))}${r ? `, and ${b(r)} is left over` : ''}.`, ...(tail ? [tail] : [])]);
}
const checkWay = (n, d) => { const [q, r] = split(n, d); return way('Check by multiplying', [`${fmt(q)} × ${d} = ${fmt(q * d)}`, r ? `${fmt(q * d)} + ${r} left over = ${fmt(n)}. It matches.` : `That is the number we started with, so ${fmt(q)} is right.`]); };
const ways = (n, d, tail) => [chunkWay(n, d, tail), longWay(n, d, tail), checkWay(n, d)];

const SPAN = [[20, 99], [100, 999], [1000, 9999]];
function nums(L, exact, dMin = 2) {
  const d = rnd(dMin, 9), [lo, hi] = SPAN[L - 1], q = rnd(Math.ceil(lo / d), Math.floor(hi / d)), n = q * d + (exact ? 0 : rnd(1, d - 1));
  return n > hi ? nums(L, exact, dMin) : [n, d];
}

function exact(L) {
  const [n, d] = nums(L, true);
  return { ask: 'Divide.', expr: `${fmt(n)} ÷ ${d}`, answer: num(n / d), _t: { kind: 'div', n, d, want: 'q' }, ways: ways(n, d), hint: `Start by taking away an easy number of ${d}s${startHint(n, d)}. How much is left?` };
}
function onePart(L) {
  const [n, d] = nums(L, false), [q, r] = split(n, d), want = pick(['q', 'r']);
  return { ask: want === 'q' ? `Divide. How many whole times does ${d} go into ${fmt(n)}? (Leave out the remainder.)` : 'Divide. What is the remainder?', expr: `${fmt(n)} ÷ ${d}`, answer: num(want === 'q' ? q : r),
    _t: { kind: 'div', n, d, want }, ways: ways(n, d), hint: want === 'q' ? `Take away groups of ${d} until less than ${d} is left. Count the groups.` : `The remainder is what is left when no more groups of ${d} fit. It is always less than ${d}.` };
}
function withRemainder(L) {
  const [n, d] = nums(L, false), [q, r] = split(n, d);
  const wrong = [shown(q - 1, r + d), shown(q + 1, r), shown(q, r === d - 1 ? r - 1 : r + 1), shown(r, q)];
  return { ask: 'Divide. Pick the answer with the right remainder.', expr: `${fmt(n)} ÷ ${d}`, answer: choice(shown(q, r), wrong), _t: { kind: 'div', n, d, want: 'qr' },
    ways: [...ways(n, d, `So ${fmt(n)} ÷ ${d} = ${b(shown(q, r))}.`), way('Check the remainder', [`A remainder must be smaller than the divisor ${d}. If it is ${d} or more, another group still fits.`, `Here the remainder is ${r}, and ${r} is less than ${d}.`])],
    hint: `The remainder has to be less than ${d}.` };
}
function dividend(L) {
  const [n, d] = nums(L - 1, false), [q, r] = split(n, d);
  return { ask: 'What number was divided?', expr: `${BLANK} ÷ ${d} = ${shown(q, r)}`, answer: num(n), _t: { kind: 'dividend', d, q, r }, hint: `${q} groups of ${d}, plus the leftovers.`,
    ways: [way('Build it back up', [`The answer says: ${fmt(q)} full groups of ${d}, and ${r} left over.`, `${fmt(q)} × ${d} = ${fmt(q * d)}`, `${fmt(q * d)} + ${r} = ${b(fmt(n))}`]),
      way('Check by dividing', chunkWay(n, d).s)] };
}

const STORIES = [
  { want: 'up', mk: (n, d) => [`${k(n + ' people')} are waiting to cross a river. Each boat trip takes ${k(d + ' people')}.`, 'How many boat trips are needed so that everyone gets across?', 'The number of trips so that nobody is left behind.', [`${n} people`, `${d} on each trip`], '“So that everyone gets across” means the leftover people need a trip too.'],
    end: (q, r) => `The ${r} leftover ${r > 1 ? 'people still need' : 'person still needs'} a trip, so add one more: ${fmt(q)} + 1 = ${b(fmt(q + 1))}.` },
  { want: 'q', mk: (n, d) => [`A shop has ${k(n + ' batteries')} and sells them in packs of ${k(String(d))}.`, 'How many full packs can it make?', 'Only the packs that are completely full.', [`${n} batteries`, `${d} in each pack`], '“Full packs” means the leftovers do not count.'],
    end: (q, r) => `The ${r} leftover ${r > 1 ? 'batteries do' : 'battery does'} not fill a pack, so the answer is ${b(fmt(q))}.` },
  { want: 'r', mk: (n, d, who) => [`${who} has ${k(n + ' photos')} and prints ${k(d + ' photos')} on each page.`, 'After filling as many pages as possible, how many photos are left over?', 'The photos that do not fill a page.', [`${n} photos`, `${d} on each page`], '“Left over” means the answer is the remainder, not the number of pages.'],
    end: (q, r) => `The question asks for the leftovers: ${b(r)}.` },
  { want: 'q', mk: (n, d) => [`A coach shares ${k(n + ' water bottles')} equally among ${k(d + ' teams')}.`, 'How many bottles does each team get?', 'The bottles for one team.', [`${n} bottles`, `${d} teams`], '“Shares equally” means split into equal groups, so divide. Extra bottles stay with the coach.'],
    end: (q, r) => `Each team gets ${b(fmt(q))}. The ${r} extra ${r > 1 ? 'bottles are' : 'bottle is'} not enough to give every team one more.` },
];
export function divStory(L = 2) {
  const [n, d] = nums(L, false, 3), [q, r] = split(n, d), s = pick(STORIES), [story, ask, find, know, clue] = s.mk(fmt(n), d, nm());
  const answer = s.want === 'up' ? q + 1 : s.want === 'r' ? r : q;
  return { story, ask, answer: num(answer), op: 'div', _t: { kind: 'div', n, d, want: s.want }, hint: 'Divide first. Then read the question again: what should happen to the leftovers?',
    ways: [way('Divide, then decide', [`${fmt(n)} ÷ ${d} = ${shown(q, r)}`, `That means ${fmt(q)} full groups of ${d}, with ${r} left over.`, s.end(q, r)]), chunkWay(n, d, s.end(q, r)), longWay(n, d, s.end(q, r))],
    read: { find, know, clue, plan: `${fmt(n)} ÷ ${d}, then decide what to do with what is left` } };
}

const MAKERS = [[exact, exact, exact, onePart, onePart], [exact, withRemainder, withRemainder, onePart, divStory], [exact, withRemainder, withRemainder, dividend, divStory, divStory]];
export const genDiv = L => oneOf(MAKERS[L - 1], L);
