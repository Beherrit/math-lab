// Dividing as sharing and as grouping: pictures, words, the special cases, breaking a bigger number apart, and matching stories.
import { rnd, pick, chance, b, way, num, choice } from '../../util.js';
import { groups } from './pics.js';
import { BLANK, skips } from './words.js';
import { tfQ } from './forms.js';

// Worked solutions for t ÷ d. `mode` is 'share' (how many in each group), 'group' (how many groups) or 'any' (no story, just the sum).
export function divWays(t, d, mode = 'any') {
  const q = t / d, small = q <= 10 && d <= 10;
  const share = way('Share them out', [...(small && d <= 6 ? [groups(d, q)] : []), `Deal ${t} out into ${d} equal groups, one at a time, until nothing is left.`, `Each group ends up with ${b(q)}.`]);
  const make = way('Make groups', [...(small && q <= 6 ? [groups(q, d)] : []), `Take ${d} at a time out of ${t} and make a group each time, until none are left.`, `Counting the groups you made: ${b(q)}.`]);
  const skip = way('Skip count', [q <= 12 ? `Count by ${d}s until you reach ${t}: ${skips(q, d)}.` : `Count by ${d}s until you reach ${t}. It takes ${q} counts.`, `You said ${q} numbers, so the answer is ${b(q)}.`]);
  if (mode === 'share') return [share, way('Think multiplication', [`${d} groups with ? in each: ${d} × ? = ${t}.`, `${d} × ${q} = ${t}, so each group gets ${b(q)}.`])];
  if (mode === 'group') return [make, skip, way('Think multiplication', [`? groups of ${d}: ? × ${d} = ${t}.`, `${q} × ${d} = ${t}, so there are ${b(q)} groups.`])];
  return [share, make, way('Think multiplication', [`Dividing asks a multiplying question backwards: ${d} × ? = ${t}.`, `${d} × ${q} = ${t}, so ${t} ÷ ${d} = ${b(q)}.`])];
}
const SHARE = [['cards', 'players'], ['stickers', 'friends'], ['game tokens', 'teams'], ['strawberries', 'bowls'], ['guitar picks', 'band members']];
const GROUP = [['eggs', 'boxes'], ['players', 'teams'], ['photos', 'pages'], ['bottles', 'packs'], ['songs', 'playlists']];
function divQ(t, d, mode, style) {
  const q = t / d, base = { expr: `${t} ÷ ${d}`, answer: num(q), ways: divWays(t, d, mode), _t: { f: 'div', a: t, b: d } };
  if (style === 'dots') return mode === 'share'
    ? { ...base, ask: `${b(t + ' dots')} are shared equally into ${b(d + ' groups')}. How many dots are in each group?`, visual: groups(d, q), hint: 'Look at one group. How many dots are in it?' }
    : { ...base, ask: `${b(t + ' dots')} are put into ${b('groups of ' + d)}. How many groups are there?`, visual: groups(q, d), hint: 'Count the groups, not the dots.' };
  if (style === 'bare') return { ...base, ways: divWays(t, d, 'any'), ask: 'Divide.', hint: `Think: ${d} times what makes ${t}?` };
  const [thing, who] = pick(mode === 'share' ? SHARE : GROUP);
  return mode === 'share'
    ? { ...base, ask: `Share ${b(t + ' ' + thing)} equally among ${b(d + ' ' + who)}. How many does each get?`, hint: `Sharing equally among ${d} is dividing by ${d}. Think: ${d} times what makes ${t}?` }
    : { ...base, ask: `${b(t + ' ' + thing)} go into ${who} of ${b(d)}. How many ${who} is that?`, hint: `How many ${d}s fit in ${t}? Count by ${d}s.` };
}
// Start with t and keep taking d away until nothing is left.
function takeAwayQ(t, d) {
  const q = t / d, chain = Array.from({ length: q }, (_, i) => `${t - i * d} − ${d} = ${t - (i + 1) * d}`).join(', ');
  return { ask: `Start with ${b(t)} and keep taking away ${b(d)} until nothing is left. How many times do you take away ${d}?`, answer: num(q), hint: 'Keep a tally: one mark for each time you take the same amount away.', _t: { f: 'div', a: t, b: d },
    ways: [way('Take away again and again', [`${chain}.`, `You took ${d} away exactly ${b(q)} times.`]), way('Make groups', [`Each time you take ${d} away, you have made one group of ${d}.`, `${t} ÷ ${d} = ${b(q)} groups.`])] };
}
function missingFactorQ(t, d) {
  const q = t / d;
  return { ask: `What number goes in the box? It tells you how many ${d}s make ${t}.`, expr: `${d} × ${BLANK} = ${t}`, answer: num(q), hint: 'Count by the number on the left until you reach the total.', _t: { f: 'div', a: t, b: d },
    ways: [way('Skip count', [`Count by ${d}s until you reach ${t}: ${skips(q, d)}.`, `You said ${q} numbers, so the box holds ${b(q)}.`]), way('Divide', [`${d} × ? = ${t} asks the same as ${t} ÷ ${d}.`, `${t} ÷ ${d} = ${b(q)}.`])] };
}
function tfDivQ(t, d) {
  const q = t / d, ok = chance(0.5), r = ok ? q : q + pick([-1, 1, 2]);
  return tfQ({ expr: `${t} ÷ ${d} = ${r}`, ok, hint: 'Check by multiplying the answer by the number you divided by.', why: [`${t} ÷ ${d} = ${q}.`, ok ? `${q} matches, so it is ${b('true')}.` : `${r} is not ${q}, so it is ${b('false')}.`] });
}
function specialQ() {
  const n = rnd(3, 12), kind = pick(['one', 'self', 'zero']);
  const [expr, ans, steps, hint] = kind === 'one' ? [`${n} ÷ 1`, n, ['Dividing by 1 means everything goes into one group.', `That one group holds all ${b(n)}.`], 'How many groups is everything going into?']
    : kind === 'self' ? [`${n} ÷ ${n}`, 1, [`${n} things shared among ${n} groups.`, `Each group gets exactly ${b(1)}.`], `Picture ${n} things for ${n} people.`]
    : [`0 ÷ ${n}`, 0, [`There is nothing to share among the ${n} groups.`, `Each group gets ${b(0)}.`], 'How much is there to share?'];
  const [t, d] = expr.split(' ÷ ').map(Number);
  return { ask: 'Divide. Picture the sharing.', expr, answer: num(ans), hint, _t: { f: 'div', a: t, b: d }, ways: [way('Picture it', steps), way('Think multiplication', [`${d} × ? = ${t}.`, `${d} × ${ans} = ${t}, so the answer is ${b(ans)}.`])] };
}

// Bigger numbers that are not in a table: break them into tens and ones that each divide evenly (48 ÷ 4 = 40 ÷ 4 + 8 ÷ 4).
const BREAKABLE = [];
for (let d = 2; d <= 6; d++) for (let q = 11; q <= 29; q++) { const t = d * q, ones = t % 10, tens = t - ones; if (t < 100 && ones && tens % d === 0 && ones % d === 0) BREAKABLE.push([t, d]); }
function breakApartQ() {
  const [t, d] = pick(BREAKABLE), ones = t % 10, tens = t - ones, q = t / d;
  return { ask: `${b(`${t} ÷ ${d}`)} is not in a table you know. Break ${t} into ${tens} and ${ones}, divide each part by ${d}, and add the answers. What is ${t} ÷ ${d}?`, expr: `${t} ÷ ${d}`, answer: num(q), hint: 'Divide each part on its own. Then put the two answers together.', _t: { f: 'div', a: t, b: d },
    ways: [way('Break it apart', [`${t} = ${tens} + ${ones}.`, `${tens} ÷ ${d} = ${tens / d}, and ${ones} ÷ ${d} = ${ones / d}.`, `${tens / d} + ${ones / d} = ${b(q)}.`]), way('Think multiplication', [`${d} × ${tens / d} = ${tens} and ${d} × ${ones / d} = ${ones}.`, `So ${d} × ${tens / d + ones / d} = ${t}, and ${t} ÷ ${d} = ${b(q)}.`])] };
}
function splitChoiceQ() {
  const [t, d] = pick(BREAKABLE), ones = t % 10, tens = t - ones, right = `${tens} ÷ ${d} + ${ones} ÷ ${d}`;
  return { ask: `Which is a correct way to break up ${b(`${t} ÷ ${d}`)}?`, answer: choice(right, [`${tens} ÷ ${d} + ${ones}`, `${tens} + ${ones} ÷ ${d}`, `${tens} ÷ ${d} − ${ones} ÷ ${d}`]), hint: `Each part of ${t} must be divided by ${d}, then the answers are added.`, _t: { f: 'div', a: t, b: d, evalOptions: true },
    ways: [way('Divide each part', [`${t} = ${tens} + ${ones}, and both parts get divided by ${d}.`, `${b(right)} = ${tens / d} + ${ones / d} = ${t / d}.`]), way('Work each one out', [`${t} ÷ ${d} = ${t / d}.`, `Only ${b(right)} comes to ${t / d}. The others come to different numbers.`])] };
}

// Stories for "which story matches t ÷ d?": the right one is a sharing or a grouping story, and the others use similar words for other operations.
const STORIES = [
  (t, d) => ({ right: `${t} cards are dealt equally to ${d} players`, others: [[`${d} players are dealt ${t} cards each, so every hand is equal`, 'Players with cards each is multiplying.'], [`${t} cards are dealt, and then ${d} more cards are dealt`, '"More cards" is adding.'], [`${t} cards are dealt, and ${d} of them are lost`, '"Lost" is subtracting.']] }),
  (t, d) => ({ right: `${t} eggs are packed into boxes of ${d}`, others: [[`${d} boxes are packed into a crate, with ${t} eggs in each box`, 'Boxes with eggs in each is multiplying.'], [`${t} eggs are packed into a box, and then ${d} more eggs are packed into it`, '"More eggs" is adding.'], [`${t} eggs are packed into boxes, and ${d} eggs are broken`, '"Broken" is subtracting.']] }),
  (t, d) => ({ right: `${d} friends split a bill of ${t} dollars equally`, others: [[`${d} friends each pay ${t} dollars, so every share is equal`, 'Friends who each pay is multiplying.'], [`A bill of ${t} dollars is split, and then a tip of ${d} dollars is added`, 'A tip added on is adding.'], [`A bill of ${t} dollars is split, and ${d} dollars is taken off the total`, 'Taken off the total is subtracting.']] }),
  (t, d) => ({ right: `${t} dollars buys tickets that cost ${d} dollars each`, others: [[`${d} tickets cost ${t} dollars each`, 'Tickets that cost so much each is multiplying.'], [`${t} dollars buys a ticket, and a snack that costs ${d} dollars`, 'A ticket and a snack is adding.'], [`${t} dollars is saved for tickets, and ${d} dollars is spent on a snack`, 'Money spent is subtracting.']] }),
  (t, d) => ({ right: `A ribbon ${t} cm long is cut into ${d} equal pieces`, others: [[`${d} equal pieces of ribbon, each ${t} cm long, are laid in a row`, 'Equal pieces each is multiplying.'], [`A ribbon ${t} cm long is cut into two, and a ${d} cm piece is added`, 'A piece added on is adding.'], [`A ribbon ${t} cm long is cut into two, and a ${d} cm piece is thrown away`, 'A piece thrown away is subtracting.']] }),
  (t, d) => ({ right: `${t} players are put into teams of ${d}`, others: [[`${d} teams are put into a league, with ${t} players in each team`, 'Teams with players in each is multiplying.'], [`${t} players are put into teams, and ${d} more players join`, '"More players join" is adding.'], [`${t} players are put into teams, and ${d} players go home`, '"Go home" is subtracting.']] }),
];
function storyChoiceQ(t, d) {
  const { right, others } = pick(STORIES)(t, d), q = t / d;
  return { ask: `Which story matches ${b(`${t} ÷ ${d}`)}?`, answer: choice(right, others.map(o => o[0])), hint: 'Dividing starts with a total and makes equal groups, or counts how many groups of one size fit. Read what each story does with its numbers.', _t: { f: 'deal', t, d },
    ways: [way('What dividing means', [`${t} ÷ ${d} starts with a total of ${t} and either makes ${d} equal groups or counts how many groups of ${d} fit.`, `"${right}" does exactly that. The answer is ${b(q)}.`]),
      way('Name the other stories', others.map(o => o[1]).concat(`That leaves the story that divides: ${b(q)} in each group, or ${b(q)} groups.`))] };
}
export function genDiv(L) {
  const mode = () => (chance(0.5) ? 'share' : 'group');
  if (L === 1) {
    const d = rnd(2, 5), q = rnd(2, 5), t = d * q, k = pick(['dots', 'dots', 'take', 'tf', 'missing']);
    return k === 'dots' ? divQ(t, d, mode(), 'dots') : k === 'take' ? takeAwayQ(t, d) : k === 'tf' ? tfDivQ(t, d) : missingFactorQ(t, d);
  }
  if (L === 2) { const d = rnd(2, 9), q = rnd(2, 10), t = d * q, k = pick(['words', 'words', 'words', 'bare', 'tf']); return k === 'tf' ? tfDivQ(t, d) : divQ(t, d, mode(), k); }
  const t = pick(['bare', 'words', 'special', 'story', 'story', 'break', 'break', 'split']), d = rnd(6, 9), q = rnd(6, 12);
  if (t === 'special') return specialQ();
  if (t === 'story') return storyChoiceQ(d * q, d);
  if (t === 'break') return breakApartQ();
  if (t === 'split') return splitChoiceQ();
  return divQ(d * q, d, mode(), t);
}
