// A 3 by 3 square. Every row sums to the same number. One box is empty.
const INK = '#16365c';
const LO = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];

export const magicMeta = {
  id: 'magic',
  title: 'Magic square',
  blurb: 'Each row sums to the same number.',
  skill: 'l0add',
  levels: [0, 1],
};

function turn(g) {
  const n = g.length;
  return Array.from({ length: n }, (_, c) => Array.from({ length: n }, (_, r) => g[n - 1 - r][c]));
}
function flip(g) { return g.map(row => [...row].reverse()); }

function classics(rng) {
  let g = LO.map(row => [...row]);
  for (let i = 0; i < rng.int(0, 3); i++) g = turn(g);
  if (rng.int(0, 1)) g = flip(g);
  return { sum: 15, rows: g };
}

function easy(rng) {
  const sum = rng.pick([6, 9]);
  const row = () => {
    const a = rng.int(1, sum - 2);
    const b = rng.int(1, sum - a - 1);
    return [a, b, sum - a - b];
  };
  return { sum, rows: [row(), row(), row()] };
}

function grid(rows, blank) {
  const cell = 72;
  const pad = 6;
  const w = rows.length * cell + pad * 2;
  const cells = rows.map((row, r) => row.map((n, c) => {
    const x = pad + c * cell;
    const y = pad + r * cell;
    const empty = blank[0] === r && blank[1] === c;
    const box = `<rect x="${x + 4}" y="${y + 4}" width="${cell - 8}" height="${cell - 8}" rx="12" fill="${empty ? '#f4f0ff' : '#fff'}" stroke="${INK}" stroke-width="3"${empty ? ' stroke-dasharray="7 5"' : ''}/>`;
    const num = empty ? '' : `<text x="${x + cell / 2}" y="${y + cell / 2 + 11}" text-anchor="middle" font-size="32" font-weight="700" fill="${INK}">${n}</text>`;
    return box + num;
  }).join('')).join('');
  return `<svg class="grow" viewBox="0 0 ${w} ${w}" role="img" aria-label="a square of numbers with one empty box">${cells}</svg>`;
}

function choices(rng, answer) {
  const pool = [];
  for (let n = 1; n <= 12; n++) if (n !== answer) pool.push(n);
  const bad = rng.shuffle(pool).slice(0, 3);
  return rng.shuffle([answer, ...bad]).map(n => ({ id: String(n), label: String(n), html: `<span class="gnum">${n}</span>` }));
}

export function makeMagic(rng, level = 0) {
  const { sum, rows } = level >= 1 ? classics(rng) : easy(rng);
  const br = rng.int(0, 2);
  const bc = rng.int(0, 2);
  const answer = rows[br][bc];
  const shown = rows.map(row => [...row]);
  shown[br][bc] = 0;
  const known = rows[br].filter((_, c) => c !== bc);
  const place = ['top', 'middle', 'bottom'][br];
  const extra = level >= 1 ? ` Each column sums to ${sum} as well.` : '';
  const why = `The ${place} row sums to ${sum}. ${known[0]} + ${known[1]} = ${known[0] + known[1]}, so the empty box is ${answer}.${extra}`;
  return {
    prompt: `Each row sums to ${sum}. What belongs in the empty box?`,
    say: `Each row sums to ${sum}. What number belongs in the empty box?`,
    visual: grid(rows, [br, bc]),
    choices: choices(rng, answer),
    answer: String(answer),
    why,
    facts: { sum, rows: shown },
  };
}
