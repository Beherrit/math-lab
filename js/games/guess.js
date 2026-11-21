// Two estimates: how many dots are in the jar, and where a mark sits on a line.
const INK = '#16365c';

export const guessMeta = {
  id: 'guess',
  title: 'Best estimate',
  blurb: 'How many in the jar, or where is the mark?',
  skill: 'l1tally',
  levels: [1, 2, 3, 4, 5],
};

function closest(target, picks) {
  return picks.reduce((best, n) => (Math.abs(n - target) < Math.abs(best - target) ? n : best));
}

function picksFor(rng, target, step) {
  let best = Math.round(target / step) * step;
  if (best <= 0) best = step;
  const far = [best - 2 * step, best - step, best + step, best + 2 * step, best + 3 * step];
  const pool = [...new Set([best, ...far].filter(n => n > 0 && (n === best || Math.abs(n - target) > Math.abs(best - target))))];
  return rng.shuffle(pool.slice(0, 4));
}

function choiceList(picks) {
  return picks.map(n => ({ id: String(n), label: String(n), html: `<span class="gnum">${n}</span>` }));
}

function jar(rng, count) {
  let dots = '';
  for (let i = 0; i < count; i++) {
    const t = rng.rnd() * Math.PI * 2;
    const r = Math.sqrt(rng.rnd()) * 72;
    const x = (120 + r * Math.cos(t)).toFixed(1);
    const y = (128 + r * Math.sin(t)).toFixed(1);
    dots += `<circle cx="${x}" cy="${y}" r="5.5" fill="#5b3fd6"/>`;
  }
  return `<svg class="grow" viewBox="0 0 240 240" role="img" aria-label="dots in a jar"><rect x="86" y="8" width="68" height="22" rx="8" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="120" cy="128" r="96" fill="#f4f0ff" stroke="${INK}" stroke-width="4"/>${dots}</svg>`;
}

function line(lo, hi, mark) {
  const x = 24 + ((mark - lo) / (hi - lo)) * 272;
  return `<svg class="grow" viewBox="0 0 320 88" role="img" aria-label="a mark on a number line"><line x1="20" y1="36" x2="300" y2="36" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><line x1="20" y1="26" x2="20" y2="46" stroke="${INK}" stroke-width="3"/><line x1="300" y1="26" x2="300" y2="46" stroke="${INK}" stroke-width="3"/><text x="20" y="72" text-anchor="middle" font-size="18" font-weight="700" fill="${INK}">${lo}</text><text x="300" y="72" text-anchor="middle" font-size="18" font-weight="700" fill="${INK}">${hi}</text><circle cx="${x.toFixed(1)}" cy="36" r="9" fill="#5b3fd6"/></svg>`;
}

function jarRound(rng, level) {
  const hi = [12, 24, 40, 60, 90][Math.min(level, 5) - 1] || 12;
  const count = rng.int(Math.max(6, Math.floor(hi / 3)), hi);
  const step = count < 16 ? 2 : count < 40 ? 5 : 10;
  const picks = picksFor(rng, count, step);
  const answer = closest(count, picks);
  return {
    prompt: 'About how many dots are in the jar?',
    say: 'About how many dots are in the jar?',
    visual: jar(rng, count),
    choices: choiceList(picks),
    answer: String(answer),
    why: `There are ${count} dots. ${answer} is the closest of these choices. The others are farther from ${count}.`,
    facts: { mode: 'jar', count, picks },
  };
}

function lineRound(rng, level) {
  const span = level <= 2 ? 10 : level === 3 ? 20 : 100;
  const lo = 0;
  const hi = span;
  const mark = rng.int(1, hi - 1);
  const step = span <= 10 ? 1 : span === 20 ? 2 : 10;
  const picks = picksFor(rng, mark, step);
  const answer = closest(mark, picks);
  const side = mark < hi / 2 ? 'before the middle' : 'after the middle';
  return {
    prompt: `The line runs from ${lo} to ${hi}. Which number is closest to the mark?`,
    say: `The line runs from ${lo} to ${hi}. Which number is closest to the mark?`,
    visual: line(lo, hi, mark),
    choices: choiceList(picks),
    answer: String(answer),
    why: `The mark is at ${mark}, ${side} of the line. ${answer} is closer to ${mark} than the other choices.`,
    facts: { mode: 'line', mark, picks },
  };
}

export function makeGuess(rng, level = 1) {
  return rng.int(0, 1) ? jarRound(rng, level) : lineRound(rng, level);
}
