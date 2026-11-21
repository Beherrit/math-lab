// A number that fits every clue, and three that fail one.
export const riddleMeta = {
  id: 'riddle',
  title: 'Number riddle',
  blurb: 'Every clue has to be true.',
  skill: 'l3pattern',
  levels: [3, 4, 5, 6, 7],
};

function fits(n, rule) {
  if (n <= rule.lo || n >= rule.hi) return false;
  if (rule.even && n % 2 !== 0) return false;
  if (rule.mult && n % rule.mult !== 0) return false;
  if (rule.not && n % rule.not === 0) return false;
  return true;
}

function clues(rule) {
  const bits = [`greater than ${rule.lo}`, `less than ${rule.hi}`];
  if (rule.even) bits.push('even');
  if (rule.mult) bits.push(`a multiple of ${rule.mult}`);
  if (rule.not) bits.push(`not a multiple of ${rule.not}`);
  return bits;
}

function ruleFor(rng, level) {
  const pool = [, , , [8, 10, 14, 16], [12, 16, 20, 24], [18, 24, 30, 36], [-8, -6, -4, 12], [-12, -8, 16, 24]][level];
  const answer = rng.pick(pool);
  const mult = Math.abs(answer) % 4 === 0 ? 4 : Math.abs(answer) % 3 === 0 ? 3 : 2;
  const rule = { lo: answer - 2, hi: answer + 2, even: true, mult, answer };
  if (level >= 5) {
    const not = mult === 3 ? 4 : 5;
    if (answer % not !== 0) rule.not = not;
  }
  return rule;
}

function distractors(rule, answer) {
  const pool = [];
  for (let n = rule.lo - 4; n <= rule.hi + 4; n++) {
    if (n !== answer && n !== 0 && !fits(n, rule)) pool.push(n);
  }
  return pool;
}

export function makeRiddle(rng, level = 3) {
  const rule = ruleFor(rng, level);
  const { answer } = rule;
  const bad = rng.shuffle(distractors(rule, answer)).slice(0, 3);
  const picks = rng.shuffle([answer, ...bad]);
  const show = n => String(n).replace('-', '\u2212');
  const list = clues(rule);
  const why = `Check each clue. The number has to be ${list.join(', and ')}. ${show(answer)} is the only choice that fits all of them.`;
  return {
    prompt: `I am ${list.join(', ')}. Which number am I?`,
    say: `I am ${list.join(', ')}. Which number am I?`,
    visual: `<svg class="grow" viewBox="0 0 280 72" role="img" aria-label="a number hiding behind a box"><rect x="90" y="8" width="100" height="56" rx="14" fill="#f4f0ff" stroke="#16365c" stroke-width="3" stroke-dasharray="7 5"/><text x="140" y="44" text-anchor="middle" font-size="28" font-weight="700" fill="#5b3fd6">?</text></svg>`,
    choices: picks.map(n => ({ id: String(n), label: show(n), html: `<span class="gnum">${show(n)}</span>` })),
    answer: String(answer),
    why,
    facts: { lo: rule.lo, hi: rule.hi, even: !!rule.even, mult: rule.mult || 0, not: rule.not || 0, picks },
  };
}
