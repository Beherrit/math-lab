// Multi-step story problems: each needs two or three operations, done in an order the story decides.
import { rnd, pick, fmt, b, k, way, nm, num } from '../../util.js';

const $ = v => '$' + fmt(v);
// Shared wrapper: every multi-step story gets a step-by-step way and the same work written as one line.
function make(o) {
  return { story: o.story, ask: o.ask, answer: num(o.answer), suffix: o.suffix, op: 'multi', _t: o.t, hint: o.hint,
    ways: [way('One step at a time', o.steps), way('Write it as one line', ['Write the whole plan as one line. The part in parentheses is the step that has to be done first.', `${o.line} = ${b(o.shown)}`])],
    read: { find: o.find, know: o.know, clue: o.clue, plan: o.plan } };
}
const size = (L, a, c, d) => [a, c, d][L - 1];

// Each item has a believable price range (p for the many, x for the single one) and a most-you-would-buy (qmax).
const SHOP = [
  { many: 'notebooks', one: 'backpack', p: [2, 6], x: [18, 45], qmax: 9 }, { many: 'movie tickets', one: 'gift card', p: [8, 14], x: [10, 50], qmax: 6 },
  { many: 'sets of guitar strings', one: 'tuner', p: [5, 12], x: [12, 30], qmax: 5 }, { many: 'plants', one: 'garden tool set', p: [3, 15], x: [15, 40], qmax: 8 },
  { many: 'phone cases', one: 'pair of earbuds', p: [8, 20], x: [15, 60], qmax: 4 }, { many: 'T-shirts', one: 'pair of sneakers', p: [8, 20], x: [30, 80], qmax: 6 },
];
function shop(L) {
  const it = pick(SHOP), many = it.many, one = it.one, q = rnd(2, Math.min(it.qmax, size(L, 5, 8, 9))), p = rnd(...it.p), x = rnd(...it.x), n = nm(), cost = q * p + x;
  const bill = L === 1 ? 0 : Math.ceil((cost + 1) / 50) * 50, first = [`The ${many}: ${q} × ${$(p)} = ${$(q * p)}`, `Add the ${one}: ${$(q * p)} + ${$(x)} = ${$(cost)}`];
  const base = { story: `${n} buys ${k(q + ' ' + many)} at ${k($(p) + ' each')} and one ${one} for ${k($(x))}.${bill ? ` ${n} pays with ${k($(bill))}.` : ''}`, suffix: 'dollars',
    know: [`${q} ${many} at ${$(p)} each`, `one ${one} at ${$(x)}`, ...(bill ? [`pays with ${$(bill)}`] : [])] };
  if (!bill) return make({ ...base, ask: 'How much does it all cost? Answer in dollars.', answer: cost, t: { kind: 'shop', q, p, x, bill }, steps: [...first, `Total: ${b($(cost))}`], line: `(${q} × ${p}) + ${x}`, shown: $(cost),
    find: 'The total cost of everything.', clue: '“Each” means multiply for the group of items. Then the single item is added on.', plan: `${q} × ${p}, then + ${x}`, hint: `Find the cost of the ${many} first.` });
  return make({ ...base, ask: 'How much change does ' + n + ' get? Answer in dollars.', answer: bill - cost, t: { kind: 'shop', q, p, x, bill }, steps: [...first, `Change: ${$(bill)} − ${$(cost)} = ${b($(bill - cost))}`],
    line: `${bill} − ((${q} × ${p}) + ${x})`, shown: $(bill - cost), find: 'The money handed back after paying.', clue: '“Each” means multiply, the single item is added, and “change” is what is left of the money paid.', plan: `${q} × ${p}, then + ${x}, then ${bill} − the total`,
    hint: 'Find the total cost first. The change comes last.' });
}
function seats(L) {
  const r = rnd(4, size(L, 9, 20, 30)), s = rnd(6, size(L, 12, 25, 40)), e = rnd(3, Math.floor(r * s / 3));
  return make({ story: `A concert hall has ${k(r + ' rows')} with ${k(s + ' seats')} in each row. Tonight ${k(e + ' seats')} are empty.`, ask: 'How many people are in the concert hall?', answer: r * s - e, t: { kind: 'seats', r, s, e },
    steps: [`All the seats: ${r} × ${s} = ${fmt(r * s)}`, `Take away the empty ones: ${fmt(r * s)} − ${e} = ${b(fmt(r * s - e))}`], line: `(${r} × ${s}) − ${e}`, shown: fmt(r * s - e),
    find: 'The seats that have someone in them.', know: [`${r} rows`, `${s} seats in each row`, `${e} empty`], clue: '“In each row” means multiply to get all the seats. “Empty” seats are taken away.', plan: `${r} × ${s}, then − ${e}`, hint: 'How many seats are there altogether?' });
}
function bags(L) {
  const d = rnd(3, 9), a = rnd(12, size(L, 40, 150, 600)), c = rnd(12, size(L, 40, 150, 600)), total = a + c, q = Math.floor(total / d), left = total % d, wantLeft = L > 1 && pick([true, false]);
  if (!left) return null;
  return make({ story: `A sports shop has ${k(a + ' red cones')} and ${k(c + ' blue cones')}. The cones are packed in bags of ${k(String(d))}.`, ask: wantLeft ? 'After filling as many bags as possible, how many cones are left over?' : 'How many full bags can the shop fill?',
    answer: wantLeft ? left : q, t: { kind: 'bags', a, c, d, wantLeft }, steps: [`All the cones: ${a} + ${c} = ${fmt(total)}`, `Bags of ${d}: ${fmt(total)} ÷ ${d} = ${fmt(q)} with ${left} left over`,
      wantLeft ? `The question asks for the leftovers: ${b(left)}` : `Only full bags count: ${b(fmt(q))}`], line: `(${a} + ${c}) ÷ ${d}`, shown: `${fmt(q)} R${left}, so the answer is ${wantLeft ? left : fmt(q)}`,
    find: wantLeft ? 'The cones that do not fill a bag.' : 'The number of completely full bags.', know: [`${a} red`, `${c} blue`, `${d} in each bag`], clue: 'Two piles are joined first (add). Then “bags of” means equal groups (divide).', plan: `${a} + ${c}, then ÷ ${d}`,
    hint: 'How many cones are there altogether?' });
}
const THINGS = [['a pair of headphones', 30, 120], ['a skateboard', 45, 150], ['a used bike', 80, 250], ['a concert ticket', 40, 150], ['a keyboard', 60, 200]];
function saving(L) {
  for (let t = 0; t < 60; t++) {
    const w = rnd(3, size(L, 9, 15, 25)), weeks = rnd(3, size(L, 8, 12, 24)), more = rnd(5, size(L, 30, 90, 250)), cost = w * weeks + more, [thing, lo, hi] = pick(THINGS);
    if (cost < lo || cost > hi) continue;
    const n = nm();
    return make({ story: `${n} saves ${k($(w))} every week for ${k(weeks + ' weeks')}. ${n} wants ${thing} that costs ${k($(cost))}.`, ask: `How much more money does ${n} need? Answer in dollars.`, answer: more, suffix: 'dollars', t: { kind: 'saving', w, weeks, cost },
      steps: [`Saved so far: ${weeks} × ${$(w)} = ${$(w * weeks)}`, `Still needed: ${$(cost)} − ${$(w * weeks)} = ${b($(more))}`], line: `${fmt(cost)} − (${weeks} × ${w})`, shown: $(more),
      find: 'The gap between the price and the savings.', know: [`${$(w)} each week`, `${weeks} weeks`, `price ${$(cost)}`], clue: '“Every week” means multiply to get the savings. “How much more” is the gap, so subtract.', plan: `${weeks} × ${w}, then ${fmt(cost)} − that`, hint: 'How much has been saved so far?' });
  }
  return null;
}
function trip(L) {
  const perDay = rnd(4, size(L, 9, 60, 95)) * (L === 1 ? 10 : 1), days = rnd(2, size(L, 5, 7, 9)), left = rnd(2, size(L, 9, 90, 400)) * (L === 1 ? 10 : 1), total = perDay * days + left;
  return make({ story: `A cycling tour is ${k(fmt(total) + ' km')} long. The riders cover ${k(perDay + ' km')} each day for ${k(days + ' days')}.`, ask: 'How many km are still left?', answer: left, suffix: 'km', t: { kind: 'trip', total, perDay, days },
    steps: [`Distance covered: ${days} × ${perDay} = ${fmt(perDay * days)} km`, `Still to go: ${fmt(total)} − ${fmt(perDay * days)} = ${b(fmt(left))} km`], line: `${fmt(total)} − (${days} × ${perDay})`, shown: `${fmt(left)} km`,
    find: 'The distance not yet covered.', know: [`${fmt(total)} km in all`, `${perDay} km each day`, `${days} days`], clue: '“Each day” means multiply to get the distance covered. “Left” means subtract it from the whole.', plan: `${days} × ${perDay}, then ${fmt(total)} − that`, hint: 'How far have they gone so far?' });
}
function sharing(L) {
  const d = rnd(2, size(L, 4, 6, 8)), each = rnd(6, size(L, 12, 40, 100)), total = d * each, a = rnd(Math.ceil(total / 4), Math.floor(3 * total / 4)), c = total - a, n = nm();
  return make({ story: `${n}’s band earns ${k($(a))} on Friday and ${k($(c))} on Saturday. The ${k(d + ' members')} share the money equally.`, ask: 'How much does each member get? Answer in dollars.', answer: each, suffix: 'dollars', t: { kind: 'sharing', a, c, d },
    steps: [`All the money: ${$(a)} + ${$(c)} = ${$(total)}`, `Shared by ${d}: ${$(total)} ÷ ${d} = ${b($(each))}`], line: `(${a} + ${c}) ÷ ${d}`, shown: $(each),
    find: 'One member’s equal share.', know: [`Friday: ${$(a)}`, `Saturday: ${$(c)}`, `${d} members`], clue: 'Two amounts are joined first (add). “Share equally” means divide.', plan: `${a} + ${c}, then ÷ ${d}`, hint: 'How much money is there to share?' });
}
function compare(L) {
  const g = rnd(3, size(L, 6, 9, 12)), per = rnd(4, size(L, 9, 30, 85)), gap = rnd(2, size(L, 15, 60, 200)), other = g * per + pick([-1, 1]) * gap, n = nm();
  if (other < 10) return null;
  return make({ story: `${n} scores ${k(per + ' points')} in each of ${k(g + ' rounds')} of a quiz game. A rival finishes with ${k(fmt(other) + ' points')} in total.`, ask: 'By how many points does the winner win?', answer: gap, t: { kind: 'compare', g, per, other },
    steps: [`${n}’s total: ${g} × ${per} = ${fmt(g * per)}`, `The gap: ${fmt(Math.max(other, g * per))} − ${fmt(Math.min(other, g * per))} = ${b(fmt(gap))}`], line: other > g * per ? `${fmt(other)} − (${g} × ${per})` : `(${g} × ${per}) − ${fmt(other)}`, shown: fmt(gap),
    find: 'The gap between the two totals.', know: [`${per} points in each round`, `${g} rounds`, `rival: ${fmt(other)} points`], clue: '“In each” means multiply to get one total. “By how many” asks for the gap, so subtract the smaller total from the bigger.', plan: `${g} × ${per}, then find the gap to ${fmt(other)}`,
    hint: `Find ${n}’s total first.` });
}

export const MULTI = [shop, shop, seats, bags, saving, trip, sharing, compare];
