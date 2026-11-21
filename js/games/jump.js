// Jump to the next ten, then only what is left. The landing is hidden.
import { hops } from '../skills/level1/pics.js';

export const jumpMeta = {
  id: 'g1jump',
  title: 'Jump to a ten',
  blurb: 'Jump to the ten, then finish.',
  skill: 'l1jump',
};

function nearby(land, start, bridge) {
  return [...new Set([land + bridge, land + 1, land - 1, start + bridge, start])].filter(n => n !== land && n > 0);
}

export function makeJump(rng) {
  const raw = rng.int(6, 86);
  const start = raw % 10 === 0 ? raw + 4 : raw;
  const bridge = 10 - (start % 10);
  const rest = rng.int(1, Math.min(6, 99 - (start + bridge)));
  const step = bridge + rest;
  const land = start + step;
  const nums = rng.shuffle([land, ...rng.shuffle(nearby(land, start, bridge)).slice(0, 3)]);
  const choices = nums.map(n => ({ id: String(n), label: String(n), html: `<span class="gnum">${n}</span>` }));
  const why = `Start at ${start}. The next ten is ${bridge} away, and ${rest} is still left of the ${step}. You land on ${land}. Adding the whole ${step} again after the ten would count ${bridge} twice.`;
  return {
    prompt: `Start at ${start} and jump ${step}. Where do you land?`,
    say: `Start at ${start} and jump ${step}. Where do you land?`,
    visual: hops([start, start + bridge, land], { hide: 2 }),
    choices,
    answer: String(land),
    why,
    facts: { start, step, land, bridge, rest },
  };
}
