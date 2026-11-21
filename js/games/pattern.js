// What comes next: a short repeating pattern of shapes or colors.
import { shapeSVG, shapeRow, FILLS } from './draw.js';

export const patternMeta = {
  id: 'kpattern',
  title: 'What comes next',
  blurb: 'Say the pattern, then finish it.',
  skill: 'l0pattern',
};

const SHAPES = [
  { id: 'circle', shape: 'circle', label: 'circle' },
  { id: 'square', shape: 'square', label: 'square' },
  { id: 'triangle', shape: 'triangle', label: 'triangle' },
  { id: 'rectangle', shape: 'rectangle', label: 'rectangle' },
];
const COLORS = [
  { id: 'red', label: 'red', fill: FILLS.red },
  { id: 'blue', label: 'blue', fill: FILLS.blue },
  { id: 'yellow', label: 'yellow', fill: FILLS.yellow },
  { id: 'green', label: 'green', fill: FILLS.green },
];

const asItem = (kind, piece) => (kind === 'shape'
  ? { id: piece.id, shape: piece.shape, fill: FILLS.grape, label: piece.label }
  : { id: piece.id, shape: 'circle', fill: piece.fill, label: piece.label });

function choiceOf(item) {
  return { id: item.id, label: item.label, html: shapeSVG(item.shape, item.fill, 72) };
}

export function makePattern(rng) {
  const kind = rng.pick(['shape', 'color']);
  const palette = (kind === 'shape' ? SHAPES : COLORS).map(p => asItem(kind, p));
  const unitLen = rng.pick([2, 3]);
  const unit = rng.shuffle(palette).slice(0, unitLen);
  const shown = unitLen === 2 ? 5 : 6;
  const seq = Array.from({ length: shown }, (_, i) => unit[i % unitLen]);
  const next = unit[shown % unitLen];
  const distractors = rng.shuffle(palette.filter(p => p.id !== next.id)).slice(0, 2);
  const choices = rng.shuffle([next, ...distractors]).map(choiceOf);
  const names = unit.map(p => p.label).join(', ');
  const why = `The part that repeats is ${names}. Say it again from the start. After ${seq.at(-1).label} comes ${next.label}.`;
  return {
    prompt: 'What comes next?',
    say: 'What comes next in the pattern?',
    visual: shapeRow(seq),
    choices,
    answer: next.id,
    why,
    facts: { kind, unit: unit.map(p => p.id), shown, next: next.id },
  };
}
