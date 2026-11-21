// A straight line on a grid, and the equation that draws it.
const INK = '#16365c';

export const matchMeta = {
  id: 'match',
  title: 'Match the line',
  blurb: 'Slope and starting height name the line.',
  skill: 'l7line',
  levels: [7, 8],
};

export function eqn(m, b) {
  const slope = m === 1 ? 'x' : m === -1 ? '-x' : `${m}x`;
  if (b === 0) return `y = ${slope}`;
  if (b > 0) return `y = ${slope} + ${b}`;
  return `y = ${slope} - ${-b}`;
}

function pretty(text) { return text.replace(/-/g, '\u2212'); }

function onGrid(m, b, lo, hi) {
  const xs = [];
  for (let x = lo; x <= hi; x++) {
    const y = m * x + b;
    if (y >= lo && y <= hi) xs.push(x);
  }
  return xs.length >= 2 ? [xs[0], xs[xs.length - 1]] : [0, 1];
}

function plane(m, b, signed) {
  const lo = signed ? -4 : 0;
  const hi = signed ? 4 : 6;
  const [x1, x2] = onGrid(m, b, lo, hi);
  const size = 280;
  const span = hi - lo;
  const X = v => ((v - lo) / span) * (size - 36) + 18;
  const Y = v => size - 18 - ((v - lo) / span) * (size - 36);
  let grid = '';
  for (let v = lo; v <= hi; v++) {
    grid += `<line x1="${X(lo)}" y1="${Y(v)}" x2="${X(hi)}" y2="${Y(v)}" stroke="#d5d8e4" stroke-width="1"/>`;
    grid += `<line x1="${X(v)}" y1="${Y(lo)}" x2="${X(v)}" y2="${Y(hi)}" stroke="#d5d8e4" stroke-width="1"/>`;
  }
  const axis = `<line x1="${X(lo)}" y1="${Y(0)}" x2="${X(hi)}" y2="${Y(0)}" stroke="${INK}" stroke-width="2"/><line x1="${X(0)}" y1="${Y(lo)}" x2="${X(0)}" y2="${Y(hi)}" stroke="${INK}" stroke-width="2"/>`;
  const line = `<line x1="${X(x1)}" y1="${Y(m * x1 + b)}" x2="${X(x2)}" y2="${Y(m * x2 + b)}" stroke="#5b3fd6" stroke-width="4" stroke-linecap="round"/>`;
  const dots = [x1, x2].map(x => `<circle cx="${X(x)}" cy="${Y(m * x + b)}" r="6" fill="#e6b325" stroke="${INK}" stroke-width="2"/>`).join('');
  return { x: x2, svg: `<svg class="grow" viewBox="0 0 ${size} ${size}" role="img" aria-label="a straight line on a grid">${grid}${axis}${line}${dots}</svg>` };
}

function options(rng, m, b) {
  const right = eqn(m, b);
  const slope = m === -1 ? 2 : m + 1;
  const wrong = [eqn(slope, b), eqn(m, b + 1), eqn(m === 1 ? 2 : 1, b), eqn(m > 0 ? -m : 2, b), eqn(m, b - 1 || 1)];
  const bad = [...new Set(wrong.filter(e => e !== right))].slice(0, 3);
  return rng.shuffle([right, ...bad]).map(e => ({
    id: e,
    label: pretty(e),
    html: `<span class="gnum expr">${pretty(e)}</span>`,
  }));
}

export function makeMatch(rng, level = 7) {
  const signed = level >= 8;
  let m = rng.int(signed ? -3 : 1, 3);
  if (m === 0) m = 1;
  const b = signed ? rng.int(-2, 3) : rng.int(0, 3);
  const drawn = plane(m, b, signed);
  const x = drawn.x;
  const y = m * x + b;
  const slope = m < 0 ? `\u2212${-m}` : String(m);
  const height = y < 0 ? `\u2212${-y}` : String(y);
  const where = b === 0 ? 'goes through the origin' : `crosses the upright axis at ${b < 0 ? `\u2212${-b}` : b}`;
  const why = `The slope is ${slope}: one step across changes the height by ${slope}. The line ${where}. At x = ${x} the height is ${height}. That matches ${pretty(eqn(m, b))}.`;
  return {
    prompt: 'Which equation matches the line?',
    say: 'Which equation matches the line?',
    visual: drawn.svg,
    choices: options(rng, m, b),
    answer: eqn(m, b),
    why,
    facts: { m, b, x, y },
  };
}
