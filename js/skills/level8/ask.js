// Shared problem packing for the grades 9-12 generators.
import { choice, way } from '../../util.js';

export function numChoice(right, slips) {
  const d = [];
  for (const s of slips) {
    const t = String(s);
    if (t !== String(right) && !d.includes(t)) d.push(t);
  }
  let bump = 1;
  const base = Number(right);
  while (d.length < 3 && bump < 14) {
    const t = String((Number.isFinite(base) ? base : 0) + bump);
    bump += 1;
    if (t !== String(right) && !d.includes(t)) d.push(t);
  }
  return choice(String(right), d);
}

export function wordChoice(right, slips) {
  return choice(right, slips);
}

export function ways(title, steps, title2, steps2) {
  return [way(title, steps), way(title2, steps2)];
}

export function problem({ ask, say, visual, answer, hint, why, steps, steps2, t1, t2 }) {
  return { ask, say: say || ask.replace(/<[^>]+>/g, ''), visual, answer, hint, why, ways: ways(t1, steps, t2, steps2) };
}

export function rule(m, b) {
  const mx = m === 1 ? 'x' : `${m}x`;
  return b ? `y = ${mx} + ${b}` : `y = ${mx}`;
}
