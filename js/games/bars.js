// Two fraction bars. More pieces means smaller pieces, unless the bottoms match.
import { fracBar } from '../util.js';

export const barsMeta = {
  id: 'g4bars',
  title: 'Which is greater',
  blurb: 'Same whole, different pieces.',
  skill: 'l3compare',
};

const name = (n, d) => `${n}/${d}`;

export function makeBars(rng) {
  const same = rng.int(0, 1) === 1;
  let n1, d1, n2, d2;
  if (same) {
    d1 = d2 = rng.pick([4, 5, 6, 8]);
    n1 = rng.int(1, d1 - 1);
    n2 = n1 === 1 ? 2 : n1 - 1;
  } else {
    const dens = rng.shuffle([2, 3, 4, 5, 6, 8]);
    d1 = dens[0];
    d2 = dens[1];
    n1 = 1;
    n2 = 1;
  }
  const a = name(n1, d1);
  const b = name(n2, d2);
  const right = n1 / d1 > n2 / d2 ? a : b;
  const labels = rng.shuffle([a, b, 'They are equal']);
  const choices = labels.map(label => ({
    id: label,
    label,
    html: `<span class="gnum${label.includes('/') ? '' : ' word'}">${label}</span>`,
  }));
  const why = d1 === d2
    ? `Both bars are cut into ${d1}, so the pieces are the same size. More shaded pieces is more, so ${right} is greater. A bigger top number means more only when the bottoms match.`
    : `The wholes match. Cutting into more pieces makes each piece smaller, so a bigger bottom number is not a bigger fraction. ${right} is greater.`;
  const visual = `<div class="bar-pair">${fracBar(n1, d1, { label: a, w: 220 })}${fracBar(n2, d2, { label: b, w: 220 })}</div>`;
  return {
    prompt: 'Which fraction is greater?',
    say: `Which fraction is greater, ${a} or ${b}?`,
    visual,
    choices,
    answer: right,
    why,
    facts: { n1, d1, n2, d2, right },
  };
}
