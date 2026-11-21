// Four numbers, used once each. Only one way lands on the target.
import { four } from './pack.js';

export const targetMeta = {
  id: 'target',
  title: 'Make the number',
  blurb: 'Use each number once.',
  skill: 'oa',
  levels: [2, 3, 4, 5, 6, 7],
};

const RUN = { '+': (a, b) => a + b, '-': (a, b) => a - b, x: (a, b) => a * b };
const WORD = { '+': 'plus', '-': 'minus', x: 'times' };

export function fold(nums, ops) {
  const steps = [nums[0]];
  let v = nums[0];
  for (let i = 0; i < ops.length; i++) {
    v = RUN[ops[i]](v, nums[i + 1]);
    steps.push(v);
  }
  return { v, steps };
}

export function code(nums, ops) {
  let s = String(nums[0]);
  for (let i = 0; i < ops.length; i++) s = `(${s} ${ops[i]} ${nums[i + 1]})`;
  return s;
}

function pretty(text) {
  return text.replaceAll('x', '\u00d7').replaceAll('-', '\u2212');
}

function poolFor(level) {
  return level >= 4 ? ['+', '-', 'x'] : ['+', '-'];
}

function attempt(rng, level) {
  const pool = poolFor(level);
  const hi = level >= 6 ? 9 : 6;
  const nums = [];
  while (nums.length < 4) {
    const n = rng.int(1, hi);
    if (!nums.includes(n)) nums.push(n);
  }
  const ops = [rng.pick(pool), rng.pick(pool), rng.pick(pool)];
  const got = fold(nums, ops);
  if (got.v < 0 || got.v > 80) return null;
  if (level <= 3 && got.steps.some(s => s < 0)) return null;
  const wrongs = [];
  for (let i = 0; i < 3; i++) {
    for (const op of pool) {
      if (op === ops[i] || wrongs.length === 3) continue;
      const next = ops.slice();
      next[i] = op;
      const alt = fold(nums, next);
      if (alt.v === got.v || alt.v < 0) continue;
      if (level <= 3 && alt.steps.some(s => s < 0)) continue;
      const id = code(nums, next);
      if (wrongs.some(w => w.id === id)) continue;
      wrongs.push({ id, v: alt.v });
    }
  }
  if (wrongs.length < 2) return null;
  return { nums, ops, value: got.v, steps: got.steps, wrongs };
}

function fallback() {
  const nums = [1, 2, 3, 4];
  const ops = ['+', '+', '+'];
  return {
    nums, ops, value: 10, steps: [1, 3, 6, 10],
    wrongs: [
      { id: code(nums, ['+', '+', '-']), v: 2 },
      { id: code(nums, ['+', '-', '+']), v: 4 },
    ],
  };
}

export function makeTarget(rng, level = 2) {
  let found = null;
  for (let i = 0; i < 40 && !found; i++) found = attempt(rng, level);
  const built = found || fallback();
  const id = code(built.nums, built.ops);
  const choices = four(rng, [
    { id, label: id, html: `<span class="gnum expr">${pretty(id)}</span>` },
    ...built.wrongs.map(w => ({ id: w.id, label: w.id, html: `<span class="gnum expr">${pretty(w.id)}</span>` })),
  ]);
  const bits = built.ops.map((op, i) => `${WORD[op]} ${built.nums[i + 1]} makes ${built.steps[i + 1]}`);
  const why = `Use ${built.nums.join(', ')} once each. ${bits.join(', ')}. You land on ${built.value}. The other ways change a step, so they land on a different number.`;
  return {
    prompt: `Which way makes ${built.value}?`,
    say: `Which way makes ${built.value}, using ${built.nums.join(', ')} once each?`,
    visual: `<p class="gnums">${built.nums.map(n => `<b>${n}</b>`).join(' ')}</p>`,
    choices,
    answer: id,
    why,
    facts: { nums: built.nums, ops: built.ops, value: built.value },
  };
}
