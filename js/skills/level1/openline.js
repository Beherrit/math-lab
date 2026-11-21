// An open number line: jump in friendly chunks, with no closed 0-to-20 scale.
import { rnd } from '../../util.js';
import { ask, problem, attempt } from '../methods/pack.js';
import { svg, label } from '../methods/pics.js';

const FRAMES = [
  'Start at {start} and jump {j1}, then {j2}. Where do you land?',
  '{start} + {j1} + {j2} on an open number line.',
  'Add {j1} and then {j2} to {start}. What number do you reach?',
  'From {start}, a jump of {j1} and a jump of {j2} land on what?',
];
const HINT = 'Add the first jump to the start, then add the second jump to that landing.';
const SLIP = 'The jump labels are pieces of the distance, so you still add them to the start. A jump label is not the landing.';

function openPic(start, j1, j2) {
  const y = 58, tick = x => `<line class="ax" x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + 8}"/>`;
  return svg(340, 110, 'an open number line', [
    `<line class="ax" x1="20" y1="${y}" x2="320" y2="${y}"/>`,
    tick(40), tick(150), tick(260), tick(310),
    label(40, 92, start, 'lab'), label(95, 36, `+${j1}`, 'lab'), label(205, 36, `+${j2}`, 'lab'), label(310, 92, '?', 'lab'),
  ].join(''));
}

function row(L) {
  const start = L === 1 ? rnd(3, 8) : L === 2 ? rnd(18, 54) : rnd(40, 110);
  const j1 = L === 1 ? rnd(2, 4) : rnd(1, L === 2 ? 3 : 5) * 10;
  const j2 = rnd(1, L === 1 ? 4 : 9);
  const value = start + j1 + j2;
  if (value > (L === 1 ? 30 : L === 2 ? 150 : 250)) return null;
  return { start, j1, j2, value };
}

export function genOpen(L) {
  return attempt(() => {
    const r = row(L);
    if (!r) return null;
    const pic = openPic(r.start, r.j1, r.j2);
    const mid = r.start + r.j1;
    return problem({
      ask: ask(FRAMES, r), expr: `${r.start} + ${r.j1} + ${r.j2}`, visual: pic, value: r.value, hint: HINT, slip: SLIP,
      t: { f: 'add', xs: [r.start, r.j1, r.j2] },
      methods: [
        { title: 'Jump in parts', steps: [pic, `First jump: ${r.start} + ${r.j1} = ${mid}.`, `Then: ${mid} + ${r.j2} = ${r.value}.`] },
        { title: 'Add the jumps', steps: [pic, `The jumps add: ${r.j1} + ${r.j2} = ${r.j1 + r.j2}.`, `${r.start} + ${r.j1 + r.j2} = ${r.value}.`] },
      ],
    });
  });
}

export const l1open = {
  id: 'l1open', level: 1, strand: 'Adding and subtracting', std: '2.NBT.5', title: 'Open number line',
  sub: 'Jump in friendly chunks', gen: genOpen, school: true,
  learn: {
    big: 'An open number line starts where you are, not at zero. Jump the friendly part first, then the rest.',
    tips: ['Label the start, then each jump, then the landing.', '47 + 36 can be a jump of 30 and a jump of 6.', 'The jumps are pieces of one distance. Add every jump to the start.', 'A jump of 30 lands 30 past the start, not on 30.'],
    words: [['open number line', 'a line that starts at your number, with only the jumps you use'], ['jump', 'a move of a known size'], ['landing', 'the number you reach']],
    card: { title: 'Why the open line works', why: 'The jumps are pieces of the same distance, so the landing is the start plus every jump.' },
  },
};
