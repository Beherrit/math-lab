// Tangram-style: one piece is missing from a picture made of simple shapes.
const INK = '#16365c';
const GRAPE = '#5b3fd6';
const GOLD = '#e6b325';

export const buildMeta = {
  id: 'build',
  title: 'Build the shape',
  blurb: 'Which piece fills the hole?',
  skill: 'l0shapes',
  levels: [0, 1, 2, 3],
};

const paint = (fill, dash) => `fill="${fill}" stroke="${INK}" stroke-width="3"${dash ? ' stroke-dasharray="7 5"' : ''}`;

const KITS = {
  rect: {
    need: 'triangle',
    shown: 'one triangle',
    made: 'a rectangle',
    visual: () => `<svg class="grow" viewBox="0 0 220 120" role="img" aria-label="a rectangle with a triangular hole"><polygon points="20,20 200,20 20,100" ${paint(GRAPE)}/><polygon points="200,20 200,100 20,100" ${paint('#f4f0ff', true)}/></svg>`,
  },
  house: {
    need: 'triangle',
    shown: 'a square',
    made: 'a house',
    visual: () => `<svg class="grow" viewBox="0 0 160 150" role="img" aria-label="a house with the roof missing"><polygon points="28,128 28,68 124,68 124,128" ${paint(GRAPE)}/><polygon points="18,68 76,18 134,68" ${paint('#f4f0ff', true)}/></svg>`,
  },
  window: {
    need: 'square',
    shown: 'one square',
    made: 'a wide rectangle',
    visual: () => `<svg class="grow" viewBox="0 0 220 120" role="img" aria-label="a rectangle with a square hole"><rect x="20" y="24" width="80" height="80" ${paint(GRAPE)}/><rect x="100" y="24" width="80" height="80" ${paint('#f4f0ff', true)}/></svg>`,
  },
  peak: {
    need: 'triangle',
    shown: 'two triangles along the bottom',
    made: 'a bigger triangle',
    visual: () => `<svg class="grow" viewBox="0 0 220 140" role="img" aria-label="a big triangle with the top missing"><polygon points="20,120 110,120 65,70" ${paint(GRAPE)}/><polygon points="110,120 200,120 155,70" ${paint(GOLD)}/><polygon points="65,70 155,70 110,20" ${paint('#f4f0ff', true)}/></svg>`,
  },
};

const PIECES = ['triangle', 'square', 'circle'];

function piece(name) {
  if (name === 'square') return `<svg class="gtile" viewBox="0 0 72 72" aria-hidden="true"><rect x="10" y="10" width="52" height="52" rx="6" ${paint(GOLD)}/></svg>`;
  if (name === 'circle') return `<svg class="gtile" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="26" ${paint(GRAPE)}/></svg>`;
  return `<svg class="gtile" viewBox="0 0 72 72" aria-hidden="true"><polygon points="36,8 66,62 6,62" ${paint(GOLD)}/></svg>`;
}

export function makeBuild(rng, level = 0) {
  const ids = level >= 2 ? ['rect', 'house', 'window', 'peak'] : ['rect', 'house', 'window'];
  const id = rng.pick(ids);
  const kit = KITS[id];
  const why = `The picture shows ${kit.shown}. Together with one more ${kit.need}, the outside is ${kit.made}. A circle cannot fill a straight hole. The missing piece is the ${kit.need}.`;
  return {
    prompt: 'Which piece fills the hole?',
    say: 'Which piece fills the hole?',
    visual: kit.visual(),
    choices: rng.shuffle(PIECES).map(name => ({ id: name, label: name, html: piece(name) })),
    answer: kit.need,
    why,
    facts: { kit: id, need: kit.need },
  };
}
