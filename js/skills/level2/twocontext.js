// Story wordings for the two-step problems. Each is (v, name) => [story, ask, find, know, clue, unit].
import { k } from '../../util.js';

export const CONTEXTS = {
  muladd: [
    ({ g, n, e }, m) => [`${m} buys ${k(g + ' packs')} of guitar strings with ${k(n + ' strings')} in each pack and finds ${k(e + ' more')} in a drawer.`, `How many strings does ${m} have?`, 'All the strings, bought and found.', [`${g} packs`, `${n} strings in each`, `${e} more`], '"In each" means multiply for the packs. The strings found are added on.', 'strings'],
    ({ g, n, e }) => [`A phone game gives ${k(n + ' gems')} for each of ${k(g + ' levels')}, plus a bonus of ${k(e + ' gems')}.`, 'How many gems is that in all?', 'The gems from the levels and the bonus.', [`${n} gems per level`, `${g} levels`, `${e} bonus`], '"Each" means multiply. The bonus is added after.', 'gems'],
  ],
  mulsub: [
    ({ g, n, pay }, m) => [`${m} buys ${k(g + ' cinema tickets')} at ${k(n + ' dollars')} each and pays with ${k(pay + ' dollars')}.`, `How many dollars of change does ${m} get?`, 'The change after paying.', [`${g} tickets`, `${n} dollars each`, `paid ${pay} dollars`], '"Each" means multiply to find the cost. Change means subtract the cost from the money paid.', 'dollars'],
    ({ g, n, pay }) => [`A club has ${k(pay + ' dollars')} of team money and orders ${k(g + ' pizzas')} at ${k(n + ' dollars')} each.`, 'How many dollars of team money are left?', 'The money left after the pizzas.', [`${pay} dollars`, `${g} pizzas`, `${n} dollars each`], '"Each" means multiply for the cost. What is left means subtract.', 'dollars'],
  ],
  subdiv: [
    ({ t, e, d }) => [`A team has ${k(t + ' water bottles')}. ${k(e + ' of them')} are broken. The rest are shared equally among ${k(d + ' players')}.`, 'How many bottles does each player get?', 'The bottles one player gets.', [`${t} bottles`, `${e} broken`, `${d} players`], 'Take away the broken ones first. "Shared equally" then means divide.', 'bottles'],
    ({ t, e, d }, m) => [`${m} has ${k(t + ' songs')}, deletes ${k(e + ' of them')}, and splits the rest equally into ${k(d + ' playlists')}.`, 'How many songs are in each playlist?', 'The songs in one playlist.', [`${t} songs`, `${e} deleted`, `${d} playlists`], 'Subtract the deleted songs first. "Splits equally" then means divide.', 'songs'],
  ],
  addmul: [
    ({ a, b, g }) => [`A snack costs ${k(a + ' dollars')} and a drink costs ${k(b + ' dollars')}. ${k(g + ' friends')} each buy one of both.`, 'How many dollars do they spend in all?', 'The total spent by all the friends.', [`snack ${a} dollars`, `drink ${b} dollars`, `${g} friends`], 'Add to find what one friend spends. "Each" friend spends the same, so multiply.', 'dollars'],
    ({ a, b, g }) => [`Each of ${k(g + ' players')} gets ${k(a + ' red cards')} and ${k(b + ' blue cards')}.`, 'How many cards are dealt in all?', 'The total number of cards.', [`${a} red`, `${b} blue`, `${g} players`], 'Add to find what one player gets. "Each" player gets the same, so multiply.', 'cards'],
  ],
  adddiv: [
    ({ a, b, d }) => [`One crate has ${k(a + ' oranges')} and another has ${k(b + ' oranges')}. They are all packed equally into ${k(d + ' boxes')}.`, 'How many oranges are in each box?', 'The oranges in one box.', [`${a} oranges`, `${b} oranges`, `${d} boxes`], 'Join the two crates first. "Packed equally" then means divide.', 'oranges'],
  ],
  divadd: [
    ({ t, d, e }) => [`${k(t + ' marbles')} are shared equally between ${k(d + ' players')}. Then each player finds ${k(e + ' more')}.`, 'How many marbles does each player have now?', 'The marbles one player has at the end.', [`${t} marbles`, `${d} players`, `${e} more each`], 'Divide to share first. Then add the ones each player finds.', 'marbles'],
    ({ t, d, e }) => [`A group of ${k(t + ' hikers')} splits into ${k(d + ' equal teams')}. Then ${k(e + ' more hikers')} join one team.`, 'How many hikers are in that team now?', 'The size of the team that was joined.', [`${t} hikers`, `${d} teams`, `${e} join`], 'Divide to find one team. Then add the hikers who join.', 'hikers'],
  ],
  divsub: [
    ({ t, d, e }, m) => [`${m} splits ${k(t + ' dollars')} equally across ${k(d + ' weeks')}, then spends ${k(e + ' dollars')} in the first week.`, 'How many dollars are left for that week?', 'The money left for the first week.', [`${t} dollars`, `${d} weeks`, `${e} spent`], 'Divide to find one week. Then subtract what was spent.', 'dollars'],
    ({ t, d, e }) => [`${k(t + ' cards')} are dealt equally to ${k(d + ' players')}. One player gives away ${k(e + ' cards')}.`, 'How many cards does that player have left?', 'That player\'s cards at the end.', [`${t} cards`, `${d} players`, `${e} given away`], 'Divide to find one hand. Then subtract the cards given away.', 'cards'],
  ],
  addsub: [
    ({ a, b, c }, m) => [`${m} has ${k(a + ' points')}, wins ${k(b + ' more')}, then loses ${k(c + ' points')} in a trap.`, `How many points does ${m} have now?`, 'The points at the end.', [`start ${a}`, `wins ${b}`, `loses ${c}`], 'Winning adds. Losing subtracts. Go in order.', 'points'],
    ({ a, b, c }) => [`A bus has ${k(a + ' people')} on it. ${k(b + ' people')} get on and ${k(c + ' people')} get off.`, 'How many people are on the bus now?', 'The people on the bus at the end.', [`${a} on the bus`, `${b} get on`, `${c} get off`], 'Getting on adds. Getting off subtracts.', 'people'],
  ],
};
