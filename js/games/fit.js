// Which piece fills the frame: count the empty spaces, then count the squares.
import { boxes } from './draw.js';

export const fitMeta = {
  id: 'kfit',
  title: 'Which piece fits',
  blurb: 'Count the spaces. Count the squares.',
  skill: 'l0shapes',
};

export function makeFit(rng) {
  const spaces = rng.int(3, 6);
  const counts = [spaces - 1, spaces, spaces + 1];
  const pieces = rng.shuffle(counts).map(count => ({
    id: `n${count}`,
    count,
    label: `${count} squares`,
    html: boxes(count, { filled: true }),
  }));
  const why = `The frame has ${spaces} empty spaces. One square goes in each space, so the piece that fits has ${spaces} squares.`;
  return {
    prompt: 'Which piece fills every space?',
    say: `Which piece fills every space? The frame has ${spaces} spaces.`,
    visual: boxes(spaces),
    choices: pieces.map(({ id, label, html }) => ({ id, label, html })),
    answer: `n${spaces}`,
    why,
    facts: { spaces, pieces: pieces.map(({ id, count }) => ({ id, count })) },
  };
}
