// Data for the scaled graph questions: a topic, categories, values on a scale, and the picture.
import { rnd, pick, chance, shuffle } from '../../util.js';
import { pictureGraph, barGraph } from './graphpics.js';

const TOPICS = [
  { title: 'Favorite sports', unit: 'votes', cats: ['Soccer', 'Tennis', 'Hockey', 'Running', 'Skating', 'Biking'] },
  { title: 'Pets in our street', unit: 'pets', cats: ['Dogs', 'Cats', 'Fish', 'Birds', 'Rabbits', 'Turtles'] },
  { title: 'Songs streamed this week', unit: 'songs', cats: ['Pop', 'Rock', 'Rap', 'Jazz', 'Dance', 'Folk'] },
  { title: 'Snacks sold at a game', unit: 'snacks', cats: ['Popcorn', 'Pretzels', 'Nachos', 'Fruit', 'Cookies'] },
  { title: 'Games sold this month', unit: 'games', cats: ['Racing', 'Puzzle', 'Sports', 'Action', 'Quest', 'Music'] },
];
// Each step: [kind of graph, scales to pick from, most circles or grid steps, may a value sit halfway between two steps].
const PLAN = { 1: [['pic', [2, 5], 8, false], ['bar', [2, 5], 8, false]], 2: [['pic', [5, 10], 10, false], ['bar', [2, 5, 10], 10, false]], 3: [['pic', [2, 10], 10, true], ['bar', [2, 10], 10, true]] };

// A graph with distinct values (so "which is most" has one answer). Halves (35 on a scale of 10) only come with an even scale.
export function makeGraph(L) {
  const [kind, scales, most, half] = pick(PLAN[L]), scale = pick(scales), topic = pick(TOPICS), n = L === 1 ? 4 : rnd(4, 5), cats = shuffle(topic.cats).slice(0, n);
  let vals;
  do { vals = cats.map(() => (rnd(1, most) * 2 - (half && chance(0.4) ? 1 : 0)) * scale / 2); } while (new Set(vals).size < n);
  const max = scale * Math.ceil(Math.max(...vals) / scale), spec = { title: topic.title, cats, vals, unit: topic.unit };
  const visual = kind === 'pic' ? pictureGraph({ ...spec, key: scale }) : barGraph({ ...spec, step: scale, max });
  return { kind, scale, cats, vals, unit: topic.unit, visual };
}
