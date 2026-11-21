// Kindergarten: sort by color, or count the shapes of one color.
import { shapeSVG, FILLS } from './draw.js';
import { four } from './pack.js';

export const sortMeta = {
  id: 'sort',
  title: 'Sort by color',
  blurb: 'Same color together, then count.',
  skill: 'l0sort',
  levels: [0],
};

const COLORS = [
  ['red', FILLS.red],
  ['blue', FILLS.blue],
  ['yellow', FILLS.yellow],
  ['green', FILLS.green],
];
const SHAPES = ['circle', 'square', 'triangle'];

function group(color, shape, n) {
  const fill = COLORS.find(c => c[0] === color)[1];
  const bits = Array.from({ length: n }, () => shapeSVG(shape, fill, 48)).join('');
  return `<span class="srow">${bits}</span>`;
}

function belong(rng) {
  const [name, fill] = rng.pick(COLORS);
  const shape = rng.pick(SHAPES);
  const others = COLORS.filter(c => c[0] !== name);
  const choices = four(rng, [[name, fill], ...rng.shuffle(others)].map(([color, ink]) => ({
    id: color,
    label: `the ${color} ${shape}`,
    html: shapeSVG(shape, ink, 72),
  })));
  const why = `The group is ${name}. The ${name} ${shape} belongs with them. A different color does not. There are 3 ${name} shapes in the group.`;
  return {
    prompt: 'Which one belongs?',
    say: `These shapes are ${name}. Tap the ${shape} that belongs with them.`,
    visual: group(name, shape, 3),
    choices,
    answer: name,
    why,
    facts: { mode: 'belong', color: name },
  };
}

function count(rng) {
  const [name, fill] = rng.pick(COLORS);
  const shape = rng.pick(SHAPES);
  const n = rng.int(1, 4);
  const extras = rng.int(0, 2);
  const bits = [
    ...Array.from({ length: n }, () => shapeSVG(shape, fill, 48)),
    ...Array.from({ length: extras }, () => shapeSVG(rng.pick(SHAPES), rng.pick(COLORS.filter(c => c[0] !== name))[1], 48)),
  ];
  const slips = [1, 2, 3, 4, 5].filter(k => k !== n);
  const choices = four(rng, [n, ...slips].map(k => ({
    id: String(k),
    label: `${k}`,
    html: `<span class="gnum">${k}</span>`,
  })));
  const why = `Count only the ${name} shapes, one at a time. There are ${n}. The other colors are not part of that count.`;
  return {
    prompt: `How many are ${name}?`,
    say: `How many shapes are ${name}?`,
    visual: `<span class="srow">${rng.shuffle(bits).join('')}</span>`,
    choices,
    answer: String(n),
    why,
    facts: { mode: 'count', color: name, n, extras },
  };
}

export function makeSort(rng) {
  return rng.int(0, 1) ? belong(rng) : count(rng);
}
