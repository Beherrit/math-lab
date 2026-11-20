// Division with remainders, and what the remainder means in a story.
import { rnd, pick, chance, b, k, way, nm, num } from '../../util.js';
import { groups } from './pics.js';
import { cnt, skips, tell } from './words.js';
import { tfQ } from './forms.js';

// `want` is what the question asks for: 'rem' (what is left over) or 'quo' (how many full groups). The first way ends on it.
export function remWays(t, d, want = 'rem') {
  const q = Math.floor(t / d), r = t % d, small = q <= 6 && d <= 10;
  const head = [...(small ? [groups(q, d, r)] : []), q <= 12 ? `Count by ${d}s without going past ${t}: ${skips(q, d)}.` : `${q} × ${d} = ${q * d} is the closest you can get without going past ${t}.`];
  const tail = want === 'rem'
    ? [`That is ${cnt(q, 'full group')}, using ${q * d}.`, `${t} − ${q * d} = ${b(r)} left over. That is the remainder.`]
    : [`${t} − ${q * d} = ${r} is left over. That is not enough for another group of ${d}.`, `So there are ${b(cnt(q, 'full group'))}.`];
  return [way('Make full groups', [...head, ...tail]),
    way('Check with multiplication', [`${q} × ${d} = ${q * d}, and ${q * d} + ${r} = ${t}.`, `The remainder (${r}) is smaller than ${d}. If it were ${d} or more, you could make another group.`])];
}
function remQ(t, d, picture) {
  const q = Math.floor(t / d), r = t % d, wantRem = chance(0.5);
  return { ask: picture ? `${b(t + ' dots')} are put into ${b('groups of ' + d)}. ${wantRem ? 'How many dots are left over?' : 'How many full groups are there?'}` : wantRem ? 'What is the remainder (how many are left over)?' : `How many full groups of ${d} fit into ${t}?`,
    expr: `${t} ÷ ${d}`, visual: picture ? groups(q, d, r) : undefined, answer: num(wantRem ? r : q), ways: remWays(t, d, wantRem ? 'rem' : 'quo'), _t: { f: wantRem ? 'rem' : 'quo', a: t, b: d },
    hint: picture ? (wantRem ? 'The left over dots are the ones outside the boxes.' : 'Count the boxes that are full.') : `Count by ${d}s. What is the last number you can say without going past ${t}?` };
}
// "3 full groups of 5 and 2 left over. How many in all?"
function backQ(q, d, r) {
  const t = q * d + r;
  return { ask: `There are ${b(cnt(q, 'full group'))} of ${b(d)} and ${b(r)} left over. How many are there in all?`, answer: num(t), hint: 'Multiply to get the full groups, then put the left over ones back.', _t: { f: 'add', xs: [q * d, r] },
    ways: [way('Multiply, then add', [`${q} groups of ${d} is ${q} × ${d} = ${q * d}.`, `Add the ${r} left over: ${q * d} + ${r} = ${b(t)}.`]), way('Check by dividing', [`${t} ÷ ${d} should give ${q} full groups and ${r} left over.`, `${q} × ${d} = ${q * d}, and ${q * d} + ${r} = ${b(t)}.`])] };
}
function tfRemQ(d, qMax) {
  const q = rnd(2, qMax), r = rnd(1, d - 1), t = q * d + r, ok = chance(0.5), [sq, sr] = ok ? [q, r] : pick([[q, r + d], [q + 1, r], [q - 1, r + d], [q, Math.max(1, r - 1)]].filter(([x, y]) => x * d + y !== t || y >= d));
  const q2 = tfQ({ expr: `${t} ÷ ${d} = ${sq} remainder ${sr}`, ok: sq * d + sr === t && sr < d, hint: 'Check with multiplication: groups times size, plus the remainder. Is the remainder smaller than the number you divide by?',
    why: [`${sq} × ${d} = ${sq * d}, and ${sq * d} + ${sr} = ${sq * d + sr}.`, sq * d + sr === t && sr < d ? `That makes ${t}, and ${sr} is less than ${d}, so it is ${b('true')}.` : `That does not fit: it either does not make ${t} or the remainder is ${d} or more. It is ${b('false')}.`], t: { rem: { t, d, q: sq, r: sr } } });
  return q2;
}
function biggestQ(d) {
  return { ask: `You divide a number by ${b(d)}. What is the ${b('biggest')} remainder you could get?`, answer: num(d - 1), hint: 'What would happen if the remainder were as big as the number you divide by?', _t: { f: 'sub', a: d, b: 1 },
    ways: [way('Think about full groups', [`A remainder of ${d} or more would make one more full group.`, `So the biggest remainder is one less: ${d} − 1 = ${b(d - 1)}.`]), way('Try some', [`Dividing by ${d}, the remainders go 0, 1, 2 and so on, then wrap back to 0 at ${d}.`, `The biggest one is ${b(d - 1)}.`])] };
}
// Stories where the remainder changes the answer: round up, ignore it, or it is the answer.
const UP = [
  (t, d) => [`${k(t + ' fans')} are travelling to a match. Each minibus takes ${k(d + ' fans')}.`, 'How many minibuses are needed so that everyone gets there?', 'The number of minibuses so that nobody is left behind.', [`${t} fans`, `${d} in each minibus`], '"So that everyone gets there" means the left over fans need a minibus too. Round up.', 'minibus', 'fans'],
  (t, d) => [`${k(t + ' people')} want to cross a lake. The boat carries ${k(d + ' people')} on each trip.`, 'How many trips does the boat need to make?', 'The number of trips so that everybody crosses.', [`${t} people`, `${d} on each trip`], 'The last few people still need a trip, even if the boat is not full. Round up.', 'trip', 'people'],
];
const DOWN = [
  (t, d) => [`A bakery has ${k(t + ' bread rolls')} and packs them in bags of ${k(String(d))}.`, 'How many full bags can it pack?', 'Only the bags that are completely full.', [`${t} rolls`, `${d} in each bag`], '"Full bags" means the left over rolls do not count. Use only the whole groups.', 'bag', 'rolls'],
  (t, d, n) => [`${n} has ${k(t + ' dollars')}. A cinema ticket costs ${k(d + ' dollars')}.`, `How many tickets can ${n} buy?`, 'How many whole tickets the money pays for.', [`${t} dollars`, `${d} dollars for each ticket`], 'You cannot buy part of a ticket, so the left over dollars do not count.', 'ticket', 'dollars'],
];
const LEFT = [
  (t, d, n) => [`${n} deals ${k(t + ' cards')} to ${k(d + ' players')} so that everyone gets the same number, as many as possible.`, 'How many cards are left over?', 'The cards that could not be dealt out fairly.', [`${t} cards`, `${d} players`], '"Left over" asks for the remainder, not the number each player gets.', 'round', 'cards'],
  (t, d, n) => [`${n} cuts a wire that is ${k(t + ' cm')} long into pieces of ${k(d + ' cm')}.`, 'How many cm of wire are left over at the end?', 'The short piece that is left at the end.', [`${t} cm of wire`, `${d} cm for each piece`], '"Left over" asks for the remainder, not the number of pieces.', 'piece', 'cm'],
];
export function remWord(L) {
  const d = L === 3 ? rnd(3, 9) : rnd(3, 6), q = L === 3 ? rnd(4, 12) : rnd(2, 6), r = rnd(1, d - 1), t = d * q + r, kind = pick(['up', 'down', 'left']);
  const row = pick(kind === 'up' ? UP : kind === 'down' ? DOWN : LEFT)(t, d, nm()), [unit, thing] = row.slice(5);
  const many = n => cnt(n, unit, unit === 'minibus' ? 'minibuses' : unit + 's');
  const base = [`${t} ÷ ${d}: ${q} × ${d} = ${q * d}, and ${t} − ${q * d} = ${r}.`, `So there are ${q} full groups of ${d}, with ${r} left over.`];
  const [ans, last, check] = kind === 'up' ? [q + 1, `The remainder, ${r}, still needs a ${unit} of its own: ${q} + 1 = ${b(q + 1)}.`, [`${many(q)} would only take ${q * d} ${thing}. ${r} would be left behind.`, `${many(q + 1)} can take ${(q + 1) * d}. Everyone fits.`]]
    : kind === 'down' ? [q, `The remainder, ${r}, is not enough for another ${unit}. The answer is ${b(q)}.`, [`${many(q)} use ${q * d} ${thing}. That works.`, `${many(q + 1)} would need ${(q + 1) * d} ${thing}, and there are only ${t}.`]]
    : [r, `The question asks for what is left over: ${b(r)}.`, [`${q} × ${d} = ${q * d} ${thing} are used.`, `${t} − ${q * d} = ${b(r)} left over.`]];
  return tell(row, 'div', num(ans), [way('Divide, then think about the left over', [...base, last]), way('Check it', check)], `${t} ÷ ${d}, then decide what the left over means`,
    { f: kind === 'up' ? 'ceil' : kind === 'down' ? 'quo' : 'rem', a: t, b: d }, { hint: kind === 'left' ? 'The question is about what is left, not about the groups.' : 'Divide first. Then ask: what happens to the ones left over?' });
}
export function genRem(L) {
  if (L === 1) {
    const d = rnd(2, 5), q = rnd(2, 4), r = rnd(1, d - 1), t = pick(['pic', 'pic', 'back', 'tf']);
    return t === 'back' ? backQ(q, d, r) : t === 'tf' ? tfRemQ(d, 4) : remQ(d * q + r, d, true);
  }
  if (L === 2) {
    const d = rnd(3, 9), q = rnd(2, 9), r = rnd(1, d - 1), t = pick(['plain', 'plain', 'back', 'tf', 'biggest']);
    return t === 'back' ? backQ(q, d, r) : t === 'tf' ? tfRemQ(d, 9) : t === 'biggest' ? biggestQ(d) : remQ(d * q + r, d, false);
  }
  if (chance(0.7)) return remWord(3);
  const d = rnd(6, 9), q = rnd(7, 12);
  return remQ(d * q + rnd(1, d - 1), d, false);
}
