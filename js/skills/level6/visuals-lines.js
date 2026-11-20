// Level 6 line diagrams: a number line with a hop, plus/minus chips, an inequality ray, a balance, a percent bar.
import { fmt } from '../../util.js';

const open = (w, h, label, cls = '') => `<svg class="viz ${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;
const INK = 'var(--ink)', GRAPE = 'var(--grape)', BAD = 'var(--bad)', SOFT = 'var(--fbar-on)', CARD = 'var(--card)';
const W = 320, M = 24;

// Pick a tidy range and tick step that shows every value and zero.
function range(vals) {
  let lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
  const step = hi - lo <= 14 ? 1 : hi - lo <= 35 ? 5 : hi - lo <= 70 ? 10 : 20;
  lo = Math.floor(lo / step) * step - step; hi = Math.ceil(hi / step) * step + step;
  return { lo, hi, step };
}
function axis(lo, hi, step, y) {
  const px = v => M + (v - lo) / (hi - lo) * (W - 2 * M);
  const skip = (hi - lo) / step > 12 ? 2 : 1;
  let s = `<line x1="${M - 8}" y1="${y}" x2="${W - M + 8}" y2="${y}" class="axis"/>`;
  for (let v = lo; v <= hi; v += step) {
    s += `<line x1="${px(v)}" y1="${y - (v === 0 ? 10 : 6)}" x2="${px(v)}" y2="${y + (v === 0 ? 10 : 6)}" class="tick"/>`;
    if (Math.round(v / step) % skip === 0) s += `<text x="${px(v)}" y="${y + 24}" text-anchor="middle" class="lbl${v === 0 ? ' strong' : ' dim'}">${fmt(v)}</text>`;
  }
  return { s, px };
}
// A number line showing a move from one number to another, with an arrow over the top.
export function hopLine(from, to) {
  const { lo, hi, step } = range([from, to]); const y = 58;
  const { s, px } = axis(lo, hi, step, y);
  const x1 = px(from), x2 = px(to), dir = Math.sign(to - from) || 1, top = y - 12;
  let g = open(W, 92, `number line: start at ${fmt(from)}, land on ${fmt(to)}`, 'nline sline') + s;
  if (from !== to) {
    g += `<path d="M ${x1} ${top} Q ${(x1 + x2) / 2} ${top - 44} ${x2} ${top}" fill="none" stroke="${GRAPE}" stroke-width="2.5"/>`;
    g += `<polygon points="${x2},${top + 2} ${x2 - dir * 10},${top - 5} ${x2 - dir * 2},${top - 12}" fill="${GRAPE}"/>`;
  }
  g += `<circle cx="${x1}" cy="${y}" r="6" fill="${INK}"/><circle cx="${x2}" cy="${y}" r="7" class="dot"/>`;
  return g + '</svg>';
}
// Plus chips over minus chips. Each column with one of each is a zero pair.
export function chips(plus, minus) {
  const n = Math.max(plus, minus, 1), u = 30, w = n * u + 8;
  let g = open(w, 76, `${plus} plus chips and ${minus} minus chips`, 'chips');
  const chip = (i, row, sign) => `<circle cx="${4 + u / 2 + i * u}" cy="${20 + row * 36}" r="12" fill="${sign > 0 ? SOFT : CARD}" stroke="${sign > 0 ? INK : BAD}" stroke-width="2"/>`
    + `<text x="${4 + u / 2 + i * u}" y="${25 + row * 36}" text-anchor="middle" class="lbl">${sign > 0 ? '+' : '−'}</text>`;
  for (let i = 0; i < plus; i++) g += chip(i, 0, 1);
  for (let i = 0; i < minus; i++) g += chip(i, 1, -1);
  return g + '</svg>';
}
// The solutions of an inequality: a circle at the boundary (filled when the boundary counts) and a ray.
export function rayLine(bound, dir, closed) {
  const lo = Math.floor(bound) - 5, hi = Math.ceil(bound) + 5, y = 40;
  const { s, px } = axis(lo, hi, 1, y); const x = px(bound), end = dir > 0 ? W - M + 2 : M - 2;
  let g = open(W, 74, `number line: x ${dir > 0 ? 'greater' : 'less'} than ${closed ? 'or equal to ' : ''}${fmt(bound)}`, 'nline sline') + s;
  g += `<line x1="${x}" y1="${y}" x2="${end}" y2="${y}" stroke="${GRAPE}" stroke-width="6"/>`;
  g += `<polygon points="${end + dir * 10},${y} ${end - dir * 2},${y - 8} ${end - dir * 2},${y + 8}" fill="${GRAPE}"/>`;
  g += `<circle cx="${x}" cy="${y}" r="7" fill="${closed ? GRAPE : CARD}" stroke="${GRAPE}" stroke-width="3"/>`;
  return g + '</svg>';
}
// A balance scale: both pans hold the same amount, so whatever you do to one side you do to the other.
export function balance(left, right) {
  const pan = (x, text) => `<rect x="${x}" y="14" width="124" height="40" rx="8" fill="${SOFT}" stroke="${INK}" stroke-width="2"/>`
    + `<text x="${x + 62}" y="40" text-anchor="middle" class="lbl">${text}</text><line x1="${x + 62}" y1="54" x2="${x + 62}" y2="72" stroke="${INK}" stroke-width="2"/>`;
  let g = open(W, 108, `balance scale with ${left} on one side and ${right} on the other`, 'balance');
  g += pan(20, left) + pan(176, right);
  g += `<line x1="60" y1="72" x2="260" y2="72" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  g += `<polygon points="160,72 144,102 176,102" fill="${GRAPE}"/>`;
  return g + '</svg>';
}
// A bar for percents. The whole bar is 100%; `over` adds an extra piece past 100% (an increase, tax or tip).
export function pctBar(p, partL, wholeL, { over = false } = {}) {
  const full = over ? 100 + p : 100, bw = W - 2 * M, x100 = M + bw * 100 / full, xp = over ? x100 : M + bw * p / 100;
  let g = open(W, 82, `percent bar: ${p}% of ${wholeL}`, 'pbar');
  g += `<rect x="${M}" y="26" width="${x100 - M}" height="26" fill="var(--fbar-off)" stroke="${INK}" stroke-width="1.5"/>`;
  g += over ? `<rect x="${x100}" y="26" width="${M + bw - x100}" height="26" fill="${SOFT}" stroke="${INK}" stroke-width="1.5"/>`
    : `<rect x="${M}" y="26" width="${xp - M}" height="26" fill="${SOFT}" stroke="${INK}" stroke-width="1.5"/>`;
  const mid = over ? (x100 + M + bw) / 2 : (M + xp) / 2;
  g += `<text x="${Math.min(Math.max(mid, 50), W - 50)}" y="18" text-anchor="middle" class="lbl strong">${partL}</text>`;
  g += `<text x="${M}" y="70" text-anchor="start" class="lbl dim">0%</text>`;
  g += `<text x="${x100}" y="70" text-anchor="${over ? 'middle' : 'end'}" class="lbl dim">100% = ${wholeL}</text>`;
  if (over) g += `<text x="${M + bw}" y="70" text-anchor="end" class="lbl dim">${100 + p}%</text>`;
  else if (p >= 15 && p <= 55) g += `<text x="${xp}" y="70" text-anchor="middle" class="lbl dim">${p}%</text>`;
  return g + '</svg>';
}
