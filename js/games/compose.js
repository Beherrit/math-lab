// Two pieces pushed together. The sides that touch are hidden, so count the outside.
import { FILLS } from './draw.js';

export const shapeMeta = {
  id: 'g1shape',
  title: 'Pieces together',
  blurb: 'What shape is the outside?',
  skill: 'l1shapes',
};

const INK = '#16365c';
const paint = fill => `fill="${fill}" stroke="${INK}" stroke-width="3"`;

function triangles() {
  return `<svg class="grow" viewBox="0 0 220 120" role="img" aria-label="two triangles pushed together">
    <polygon points="20,20 200,20 20,100" ${paint(FILLS.grape)}/>
    <polygon points="200,20 200,100 20,100" ${paint(FILLS.yellow)}/>
  </svg>`;
}
function squares() {
  return `<svg class="grow" viewBox="0 0 220 120" role="img" aria-label="two squares pushed together">
    <rect x="20" y="25" width="80" height="80" ${paint(FILLS.grape)}/>
    <rect x="100" y="25" width="80" height="80" ${paint(FILLS.yellow)}/>
  </svg>`;
}
function house() {
  return `<svg class="grow" viewBox="0 0 160 140" role="img" aria-label="a square with a triangle on top">
    <polygon points="30,120 30,60 120,60 120,120" ${paint(FILLS.grape)}/>
    <polygon points="20,60 75,16 130,60" ${paint(FILLS.yellow)}/>
  </svg>`;
}

const KINDS = [
  { made: 'rectangle', pieces: 'two triangles', visual: triangles, sides: 'The touching side is hidden, so the outside has two long sides and two short sides.' },
  { made: 'rectangle', pieces: 'two squares', visual: squares, sides: 'The sides that touch are hidden. The outside is longer than it is tall, so it is a rectangle.' },
  { made: 'pentagon', pieces: 'a square and a triangle', visual: house, sides: 'The roof adds a point. Count the outside edges: 5. The edge where the shapes touch is hidden inside.' },
];
const NAMES = ['rectangle', 'triangle', 'pentagon', 'circle'];

export function makeCompose(rng) {
  const kind = rng.pick(KINDS);
  const choices = rng.shuffle(NAMES).map(name => ({ id: name, label: name, html: `<span class="gnum word">${name}</span>` }));
  const why = `These pieces are ${kind.pieces}. ${kind.sides} Counting a hidden side makes the shape sound like it has more sides than it does. The outside is a ${kind.made}.`;
  return {
    prompt: 'The pieces are pushed together. What shape is the outside?',
    say: 'The pieces are pushed together. What shape is the outside?',
    visual: kind.visual(),
    choices,
    answer: kind.made,
    why,
    facts: { made: kind.made, pieces: kind.pieces },
  };
}
