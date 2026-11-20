// Level 5 diagrams for the newer skills: a number line with fraction ticks, a box plot, a double number line and a
// ratio graph. Drawn with the shared .viz classes (no new CSS).
import { R, fmt, plane, PLANE } from '../../util.js';
import { open, txt } from './visuals.js';

const INK = 'style="stroke:var(--ink);stroke-width:2.5"';
const GRAPE = 'style="stroke:var(--grape);stroke-width:4"';

// Number line from lo to hi with a small tick every `step` and a number only at whole numbers.
// points: [{ v, label, cls }]. A point label is a letter, never a number.
export function ratLine(lo, hi, { step = 1, points = [] } = {}) {
  const W = 320, H = 78, m = 24, y = 42, px = v => m + (v - lo) / (hi - lo) * (W - 2 * m);
  let s = open(W, H, `number line from ${fmt(lo)} to ${fmt(hi)}`, 'nline sline') + `<line x1="${m - 8}" y1="${y}" x2="${W - m + 8}" y2="${y}" class="axis"/>`;
  for (let i = 0, v = lo; v <= hi + 1e-9; i++, v = R(lo + i * step)) {
    const whole = Number.isInteger(v);
    s += `<line x1="${px(v)}" y1="${y - (whole ? 9 : 5)}" x2="${px(v)}" y2="${y + (whole ? 9 : 5)}" class="tick"/>`;
    if (whole) s += txt(px(v), y + 24, fmt(v), `lbl${v === 0 ? ' strong' : ' dim'}`);
  }
  for (const p of points) {
    s += `<circle cx="${px(p.v)}" cy="${y}" r="7" class="dot ${p.cls || ''}"/>`;
    if (p.label) s += txt(px(p.v), y - 16, p.label, 'lbl strong');
  }
  return s + '</svg>';
}

// Box plot of five values on a number line from lo to hi. The box runs from Q1 to Q3, the line inside is the median,
// the whiskers reach the least and greatest values. Pieces carry classes (wh, cap, med) so a test can read them back.
export function boxPlot([mn, q1, med, q3, mx], { lo, hi, step = 1, title = '', name = '' } = {}) {
  const W = 320, m = 24, px = v => m + (v - lo) / (hi - lo) * (W - 2 * m), y = 30, base = 66;
  let s = open(W, title ? 112 : 96, `box plot${name ? ' of ' + name : ''}`, 'fbar lplot') + `<line x1="${m - 8}" y1="${base}" x2="${W - m + 8}" y2="${base}" class="axis"/>`;
  for (let v = lo; v <= hi + 1e-9; v = R(v + step)) s += `<line x1="${px(v)}" y1="${base - 5}" x2="${px(v)}" y2="${base + 5}" class="tick"/>` + txt(px(v), base + 21, fmt(v), 'tk');
  s += `<line x1="${px(mn)}" y1="${y}" x2="${px(q1)}" y2="${y}" class="wh" ${INK}/><line x1="${px(q3)}" y1="${y}" x2="${px(mx)}" y2="${y}" class="wh" ${INK}/>`;
  s += [mn, mx].map(v => `<line x1="${px(v)}" y1="${y - 10}" x2="${px(v)}" y2="${y + 10}" class="cap" ${INK}/>`).join('');
  s += `<rect x="${px(q1)}" y="${y - 18}" width="${px(q3) - px(q1)}" height="36" class="on"/><line x1="${px(med)}" y1="${y - 18}" x2="${px(med)}" y2="${y + 18}" class="med" ${GRAPE}/>`;
  return s + (title ? txt(W / 2, 106, title) : '') + '</svg>';
}

// Double number line: two lines with matching ticks. top and bottom are label strings, one per tick.
export function doubleLine(top, bottom, topName, bottomName) {
  const W = 320, m = 70, step = (W - m - 16) / (top.length - 1), x = i => m + i * step;
  let s = open(W, 116, `double number line: ${topName} and ${bottomName}`, 'nline') + txt(4, 42, topName, 'lbl dim', 'start') + txt(4, 90, bottomName, 'lbl dim', 'start');
  s += `<line x1="${m - 8}" y1="38" x2="${W - 8}" y2="38" class="axis"/><line x1="${m - 8}" y1="86" x2="${W - 8}" y2="86" class="axis"/>`;
  top.forEach((t, i) => { s += `<line x1="${x(i)}" y1="38" x2="${x(i)}" y2="86" style="stroke:var(--line);stroke-width:1;stroke-dasharray:4 3"/><line x1="${x(i)}" y1="32" x2="${x(i)}" y2="44" class="tick"/><line x1="${x(i)}" y1="80" x2="${x(i)}" y2="92" class="tick"/>` + txt(x(i), 22, t) + txt(x(i), 110, bottom[i]); });
  return s + '</svg>';
}

// First-quadrant grid with straight lines from (0, 0) to each given end point (a line of equivalent ratios).
// lines: [{ x, y, label }]; pts and interactive work as in the shared plane.
export function ratioPlane({ lines = [], pts = [], max = 10, interactive = false } = {}) {
  const { W, m } = PLANE, u = (W - m - 14) / max, X = x => m + x * u, Y = y => W - m - y * u;
  const segs = lines.map(l => `<polyline points="${X(0)},${Y(0)} ${X(l.x)},${Y(l.y)}" class="path"/>` + (l.label ? `<text x="${X(l.x) - 8}" y="${Y(l.y) - 10}" text-anchor="end" class="ptl">${l.label}</text>` : '')).join('');
  return plane({ pts, max, interactive }).replace(/<circle|<g class="cursor">/, segs + '$&');
}
