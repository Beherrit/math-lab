// A pattern with a hole in the middle, not just at the end.
import { shapeRow, FILLS } from './draw.js';

export const gapMeta = {
  id: 'gap',
  title: 'Find the gap',
  blurb: 'The pattern keeps going through the empty box.',
  skill: 'l0pattern',
  levels: [0, 1, 2],
};

const SHAPES = [
  { id: 'circle', shape: 'circle', label: 'circle' },
  { id: 'square', shape: 'square', label: 'square' },
  { id: 'triangle', shape: 'triangle', label: 'triangle' },
];

function shapeRound(rng) {
  const unit = rng.shuffle(SHAPES).slice(0, rng.pick([2, 3]));
  const index = unit.length;
  const shown = unit.length * 2 + 1;
  const seq = Array.from({ length: shown }, (_, i) => (i === index ? null : unit[i % unit.length]));
  const next = unit[index % unit.length];
  const names = unit.map(p => p.label).join(', ');
  const choices = rng.shuffle(SHAPES).map(p => ({
    id: p.id,
    label: p.label,
    html: `<span class="gnum word">${p.label}</span>`,
  }));
  return {
    prompt: 'What belongs in the empty box?',
    say: 'What belongs in the empty box of the pattern?',
    visual: shapeRow(seq.map(p => (p ? { shape: p.shape, fill: FILLS.grape } : null)), true),
    choices,
    answer: next.id,
    why: `The part that repeats is ${names}. Count along from the start. The empty box is a ${next.label}.`,
    facts: { kind: 'shape', unit: unit.map(p => p.id), index },
  };
}

function numRow(values) {
  const cell = 56;
  const w = values.length * cell;
  const bits = values.map((n, i) => {
    const x = i * cell + 4;
    const empty = n == null;
    const box = `<rect x="${x}" y="8" width="54" height="54" rx="10" fill="${empty ? '#f4f0ff' : '#fff'}" stroke="#16365c" stroke-width="3"${empty ? ' stroke-dasharray="6 4"' : ''}/>`;
    const text = empty ? '' : `<text x="${x + 27}" y="43" text-anchor="middle" font-size="22" font-weight="700" fill="#16365c">${n}</text>`;
    return box + text;
  }).join('');
  return `<svg class="grow" viewBox="0 0 ${w} 70" role="img" aria-label="a number pattern with an empty box">${bits}</svg>`;
}

function numChoices(rng, answer) {
  const bad = rng.shuffle([answer + 1, answer - 1, answer + 2, answer * 2, answer + 3].filter(n => n > 0 && n !== answer));
  return rng.shuffle([answer, ...bad.slice(0, 3)]).map(n => ({ id: String(n), label: String(n), html: `<span class="gnum">${n}</span>` }));
}

function numRound(rng, level) {
  const mul = level >= 2 && rng.int(0, 1) === 1;
  const start = mul ? 2 : rng.int(1, 6);
  const step = mul ? 2 : rng.int(2, 5);
  const index = rng.int(2, 3);
  const length = 5;
  const value = i => (mul ? start * step ** i : start + step * i);
  const seq = Array.from({ length }, (_, i) => (i === index ? null : value(i)));
  const answer = value(index);
  const rule = mul ? `multiply by ${step} each time` : `add ${step} each time`;
  return {
    prompt: 'What belongs in the empty box?',
    say: 'What number belongs in the empty box?',
    visual: numRow(seq),
    choices: numChoices(rng, answer),
    answer: String(answer),
    why: `The pattern starts at ${start} and you ${rule}. The empty box is step ${index + 1}, so it is ${answer}.`,
    facts: { kind: 'num', op: mul ? 'mul' : 'add', start, step, index },
  };
}

export function makeGap(rng, level = 0) {
  return level >= 1 ? numRound(rng, level) : shapeRound(rng);
}
