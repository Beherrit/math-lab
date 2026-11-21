// Clock pictures: a clean analogue clock face, and a time number line with jumps for elapsed time.
import { atMinutes } from './kit.js';

const xy = (deg, len) => [80 + len * Math.sin(deg * Math.PI / 180), 80 - len * Math.cos(deg * Math.PI / 180)];
const r1 = v => v.toFixed(1);

// 60 small ticks, 12 numbers, a short thick hour hand (class hh) and a long thin minute hand (class mh).
export function clockFace(h, m) {
  let g = '<svg class="viz fbar" viewBox="0 0 160 160" role="img" aria-label="analogue clock" style="max-width:180px">';
  g += '<circle cx="80" cy="80" r="74" style="fill:var(--card);stroke:var(--ink);stroke-width:3"/>';
  for (let i = 0; i < 60; i++) {
    const big = i % 5 === 0, [x1, y1] = xy(i * 6, big ? 62 : 67), [x2, y2] = xy(i * 6, 71);
    g += `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" style="stroke:var(--ink);stroke-width:${big ? 2.5 : 1}"/>`;
  }
  for (let n = 1; n <= 12; n++) { const [x, y] = xy(n * 30, 50); g += `<text x="${r1(x)}" y="${r1(y + 5)}" text-anchor="middle" class="lbl">${n}</text>`; }
  const [hx, hy] = xy((h % 12) * 30 + m * 0.5, 34), [mx, my] = xy(m * 6, 58);
  g += `<line class="hh" x1="80" y1="80" x2="${hx.toFixed(2)}" y2="${hy.toFixed(2)}" style="stroke:var(--ink);stroke-width:5;stroke-linecap:round"/>`;
  g += `<line class="mh" x1="80" y1="80" x2="${mx.toFixed(2)}" y2="${my.toFixed(2)}" style="stroke:var(--grape);stroke-width:3;stroke-linecap:round"/>`;
  return g + '<circle cx="80" cy="80" r="4" style="fill:var(--ink)"/></svg>';
}

// The stops between two times (minutes on a 12-hour clock): the start, each hour on the way, and the end.
export function stops(start, end) {
  const out = [start];
  for (let t = Math.floor(start / 60) * 60 + 60; t < end; t += 60) out.push(t);
  return [...out, end];
}
// A number line for elapsed time. `jumps` writes the minutes of each jump; otherwise only the two end times are written.
export function timeLine(start, end, jumps = true) {
  const W = 330, H = 84, m = 30, y = 50, px = t => m + (t - start) / (end - start) * (W - 2 * m), s = stops(start, end);
  let g = `<svg class="viz nline" viewBox="0 0 ${W} ${H}" role="img" aria-label="time line from ${atMinutes(start)} to ${atMinutes(end)}" style="max-width:${W}px">`;
  g += `<line x1="${m - 8}" y1="${y}" x2="${W - m + 8}" y2="${y}" class="axis"/>`;
  s.forEach((t, i) => {
    const ends = i === 0 || i === s.length - 1;
    g += `<line x1="${r1(px(t))}" y1="${y - 8}" x2="${r1(px(t))}" y2="${y + 8}" class="tick"/>`;
    if (ends || jumps) g += `<text x="${r1(px(t))}" y="${y + 26}" text-anchor="middle" class="lbl${ends ? ' strong' : ' dim'}">${atMinutes(t)}</text>`;
    if (jumps && i < s.length - 1) g += `<path d="M${r1(px(t))} ${y - 4} Q${r1((px(t) + px(s[i + 1])) / 2)} ${y - 36} ${r1(px(s[i + 1]))} ${y - 4}" style="fill:none;stroke:var(--ink);stroke-width:1.5"/><text x="${r1((px(t) + px(s[i + 1])) / 2)}" y="${y - 28}" text-anchor="middle" class="lbl">${s[i + 1] - t} min</text>`;
  });
  return g + '</svg>';
}
