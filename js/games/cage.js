// A KenKen-style cage: one operation, one missing number.
const INK = '#16365c';

export const cageMeta = {
  id: 'kenken',
  title: 'Number cages',
  blurb: 'The cage tells you the sum or the product.',
  skill: 'l1array',
  levels: [1, 2, 3, 4],
};

function cells(values, label) {
  const cell = 78;
  const w = values.length * cell + 16;
  const boxes = values.map((n, i) => {
    const x = 8 + i * cell;
    const empty = n == null;
    const box = `<rect x="${x}" y="28" width="${cell - 8}" height="70" rx="12" fill="${empty ? '#f4f0ff' : '#fff'}" stroke="${INK}" stroke-width="3"${empty ? ' stroke-dasharray="7 5"' : ''}/>`;
    const num = empty ? '' : `<text x="${x + (cell - 8) / 2}" y="72" text-anchor="middle" font-size="32" font-weight="700" fill="${INK}">${n}</text>`;
    return box + num;
  }).join('');
  const tag = `<text x="14" y="20" font-size="18" font-weight="700" fill="#5b3fd6">${label}</text>`;
  return `<svg class="grow" viewBox="0 0 ${w} 110" role="img" aria-label="a number cage with one empty box">${tag}${boxes}</svg>`;
}

function choices(rng, answer, hi) {
  const pool = [];
  for (let n = 1; n <= hi; n++) if (n !== answer) pool.push(n);
  const bad = rng.shuffle(pool).slice(0, 3);
  return rng.shuffle([answer, ...bad]).map(n => ({ id: String(n), label: String(n), html: `<span class="gnum">${n}</span>` }));
}

function pair(rng, op) {
  let known = rng.int(1, op === 'add' ? 6 : 4);
  let answer = rng.int(1, op === 'add' ? 8 : 6);
  if (answer === known) answer += 1;
  const target = op === 'add' ? known + answer : known * answer;
  return { op, target, known: [known], answer };
}

function triple(rng) {
  const nums = rng.shuffle([1, 2, 3]);
  const at = rng.int(0, 2);
  const known = nums.filter((_, i) => i !== at);
  return { op: 'add', target: 6, known, answer: nums[at], once: true };
}

function product(rng) {
  const [a, b, target] = rng.pick([[2, 3, 6], [2, 4, 8], [2, 5, 10], [3, 4, 12], [3, 5, 15], [4, 5, 20]]);
  const known = rng.int(0, 1) ? a : b;
  return { op: 'mul', target, known: [known], answer: known === a ? b : a };
}

export function makeCage(rng, level = 1) {
  const cage = level >= 4 ? product(rng) : level >= 3 ? triple(rng) : pair(rng, level >= 2 ? 'mul' : 'add');
  const values = [...cage.known, null];
  const sign = cage.op === 'add' ? '+' : '\u00d7';
  const word = cage.op === 'add' ? 'add up to' : 'multiply to';
  const how = cage.op === 'add'
    ? `${cage.known.join(' + ')} + ? = ${cage.target}`
    : `${cage.known.join(' \u00d7 ')} \u00d7 ? = ${cage.target}`;
  const once = cage.once ? ' The cage uses 1, 2, and 3 once each.' : '';
  const why = `The cage must ${word} ${cage.target}.${once} ${how}, so the empty box is ${cage.answer}.`;
  return {
    prompt: `The cage must ${word} ${cage.target}. What is the missing number?`,
    say: `The cage must ${word} ${cage.target}. What is the missing number?`,
    visual: cells(values, `${cage.target}${sign}`),
    choices: choices(rng, cage.answer, cage.op === 'mul' ? 12 : 14),
    answer: String(cage.answer),
    why,
    facts: { op: cage.op, target: cage.target, known: cage.known },
  };
}
