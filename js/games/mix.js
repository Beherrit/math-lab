// A bigger batch of the same mix. Adding the same number to both parts changes it.
import { tape } from '../skills/level5/visuals.js';

export const mixMeta = {
  id: 'g6mix',
  title: 'Same mix',
  blurb: 'Both parts grow together.',
  skill: 'l5eqratio',
};

const ratio = (a, b) => `${a}:${b}`;

export function makeMix(rng) {
  let a = rng.int(2, 5);
  let b = rng.int(2, 5);
  if (a === b) b = a === 5 ? 2 : a + 1;
  const m = rng.int(2, 4);
  const right = ratio(a * m, b * m);
  const slips = [ratio(a * m + 2, b * m + 2), ratio(b * m, a * m), ratio(a * m, b * (m + 1))].filter(x => x !== right);
  const texts = rng.shuffle([right, ...new Set(slips)]);
  const choices = texts.map(text => ({ id: text, label: text, html: `<span class="gnum expr">${text}</span>` }));
  const why = `Same mix means both numbers are multiplied by ${m}: ${a} times ${m} and ${b} times ${m} give ${right}. Adding 2 to both numbers changes the mix. Swapping the numbers compares them the other way.`;
  return {
    prompt: 'Which ratio is the same mix, just bigger?',
    say: `One batch is ${a} to ${b}. Which ratio is the same mix, just bigger?`,
    visual: tape([{ n: a, label: 'first', on: true }, { n: b, label: 'second' }]),
    choices,
    answer: right,
    why,
    facts: { a, b, m },
  };
}
