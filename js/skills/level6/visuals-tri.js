// Level 6 figure for triangle building: the longest stick above, the two shorter sticks laid end to end below it.
import { fmt } from '../../util.js';

const W = 320, M = 20;
const bar = (x, y, w, fill, label) => `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="24" rx="3" fill="${fill}" stroke="var(--ink)" stroke-width="2"/><text x="${(x + w / 2).toFixed(1)}" y="${y + 17}" text-anchor="middle" class="lbl">${label}</text>`;
// If the two short sticks reach past the end of the long one, they can lean together into a triangle.
export function sticksFig(a, b, c) {
  const [x, y, z] = [a, b, c].sort((p, q) => p - q), s = (W - 2 * M) / Math.max(z, x + y), end = M + z * s;
  let g = `<svg class="viz shape" viewBox="0 0 ${W} 112" role="img" aria-label="sticks of length ${fmt(x)}, ${fmt(y)} and ${fmt(z)}" style="max-width:${W}px">`;
  g += bar(M, 10, z * s, 'var(--fbar-on)', fmt(z)) + bar(M, 62, x * s, 'var(--fbar-off)', fmt(x)) + bar(M + x * s, 62, y * s, 'var(--fbar-on)', fmt(y));
  g += `<line x1="${end.toFixed(1)}" y1="6" x2="${end.toFixed(1)}" y2="96" stroke="var(--grape)" stroke-width="2" stroke-dasharray="5 4"/>`;
  return g + '</svg>';
}
