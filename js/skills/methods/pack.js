// Shared packing for the method skills: two or three pictured ways, and a last line that states the answer.
import { way, num, b, pick } from '../../util.js';

export const fill = (frame, vars) => frame.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
export const ask = (frames, vars) => fill(pick(frames), vars);

export function problem({ ask: q, expr, visual, value, hint, methods, t, slip }) {
  const ways = methods.map((m, i) => way(m.title, i === 0 ? [...m.steps, `The answer is ${b(value)}.`] : m.steps));
  return { ask: q, expr, visual, answer: num(value), hint, say: q, ways, why: slip, _t: t };
}

export function attempt(make) {
  for (let i = 0; i < 60; i++) {
    const p = make();
    if (p) return p;
  }
  throw new Error('method skill: no problem');
}
