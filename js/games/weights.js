// One move, adding or taking a weight, makes the two pans match.
import { four } from './pack.js';

export const weightsMeta = {
  id: 'weights',
  title: 'Balance the scale',
  blurb: 'Add or take away one weight.',
  skill: 'l5eq',
  levels: [4, 5, 6, 7, 8],
};

const INK = '#241c16';

function pan(n, name) {
  const blocks = Array.from({ length: Math.min(n, 8) }, (_, i) => {
    const y = 70 - i * 8;
    return `<rect x="18" y="${y}" width="44" height="7" rx="2" fill="#c47b4a" stroke="${INK}"/>`;
  }).join('');
  return `<g><text x="40" y="16" text-anchor="middle" font-size="16" font-weight="700" fill="${INK}">${name}</text>${blocks}<text x="40" y="96" text-anchor="middle" font-size="18" font-weight="700" fill="${INK}">${n}</text></g>`;
}

function scale(left, right) {
  const tip = left === right ? 0 : left > right ? 8 : -8;
  return `<svg class="grow" viewBox="0 0 220 120" role="img" aria-label="left pan ${left}, right pan ${right}"><line x1="110" y1="28" x2="110" y2="108" stroke="${INK}" stroke-width="4"/><line x1="${30}" y1="${40 + tip}" x2="${190}" y2="${40 - tip}" stroke="${INK}" stroke-width="4"/><g transform="translate(0,0)">${pan(left, 'Left')}</g><g transform="translate(140,0)">${pan(right, 'Right')}</g></svg>`;
}

function move(verb, side, n) {
  const id = `${verb}:${side}:${n}`;
  const label = verb === 'add' ? `Add ${n} to the ${side}` : `Take ${n} off the ${side}`;
  return { id, label, html: `<span class="gnum word">${label}</span>` };
}

export function makeWeights(rng, level = 4) {
  const hi = level >= 6 ? 24 : 12;
  let left = rng.int(2, hi);
  let right = rng.int(2, hi);
  if (left === right) right = Math.min(hi, left + 1);
  if (left === right) left = Math.max(1, left - 1);
  const diff = Math.abs(left - right);
  const light = left < right ? 'left' : 'right';
  const heavy = light === 'left' ? 'right' : 'left';
  const rightMove = move('add', light, diff);
  const choices = four(rng, [
    rightMove,
    move('add', heavy, diff),
    move('take', light, diff),
    move('add', light, diff + 1),
  ]);
  const both = Math.max(left, right);
  const why = `The left pan holds ${left} and the right holds ${right}. The ${light} side is short by ${diff}. Adding ${diff} to the ${light} makes both sides ${both}. Adding it to the ${heavy} side, or taking it off the light side, does not balance the scale.`;
  return {
    prompt: 'Which move balances the scale?',
    say: `The left pan holds ${left} and the right holds ${right}. Which move balances the scale?`,
    visual: scale(left, right),
    choices,
    answer: rightMove.id,
    why,
    facts: { left, right },
  };
}
