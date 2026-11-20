// Scatter plots: direction and strength of an association, outliers, and reading a line of best fit.
import { rnd, pick, shuffle, b, way, fmt, num } from '../../util.js';
import { pt, fixedChoice, count } from './h.js';
import { grid } from './draw.js';

const DIRS = ['Positive association', 'Negative association', 'No association'];
const STRENGTHS = ['Strong positive', 'Weak positive', 'Strong negative', 'Weak negative'];
const half = v => Math.round(v * 2) / 2;
// Correlation of a list of [x, y] points: near 1 or −1 is a tight line, near 0 is a cloud.
export function corr(pts) {
  const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const [x, y] of pts) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
}
const WANT = { strong: r => Math.abs(r) >= 0.92, weak: r => Math.abs(r) >= 0.45 && Math.abs(r) <= 0.78, none: r => Math.abs(r) <= 0.2 };
// Nine points around a line going up (dir 1) or down (dir −1), or a shapeless cloud (dir 0).
export function cloud(dir, strength) {
  for (let t = 0; t < 400; t++) {
    const m = dir * pick([0.75, 1]), c = dir > 0 ? rnd(0, 2) : rnd(8, 10), size = strength === 'strong' ? [0, 0.5] : [1.5, 2, 2.5, 3];
    const pts = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => [x, dir === 0 ? rnd(1, 9) : half(m * x + c + pick([-1, 1]) * pick(size))]);
    if (pts.every(p => p[1] >= 0 && p[1] <= 10) && WANT[dir === 0 ? 'none' : strength](corr(pts))) return pts;
  }
  return null;
}
export const dots = pts => pts.map(([x, y]) => ({ x, y, r: 5 }));
// [x, y, direction you would expect: 1 up, −1 down, 0 none]
const AXES = [['hours of practice in a week', 'goals scored in a month', 1], ['hours of sleep', 'score on a memory game', 1], ['weeks of saving', 'dollars saved, in tens', 1], ['number of pets', 'bags of pet food bought', 1],
  ['age of a phone in years', 'hours its battery lasts', -1], ['rows back from the stage', 'ticket price, in tens of dollars', -1], ['hours of gaming on a school night', 'hours of sleep', -1], ['speed of a runner', 'minutes to finish a lap', -1],
  ['shoe size', 'songs on a playlist, in tens', 0], ['letters in a first name', 'goals scored', 0], ['last digit of a phone number', 'number of pets', 0]];
const axes = dir => { const [x, y] = pick(AXES.filter(a => a[2] === dir)); return `Each dot is one person or thing. Across (x): ${x}. Up (y): ${y}.`; };
function direction() {
  const dir = pick([1, -1, 0]), pts = cloud(dir, 'strong');
  if (!pts) return null;
  const name = DIRS[dir === 1 ? 0 : dir === -1 ? 1 : 2];
  const ask = pick(['What kind of association does this scatter plot show?', 'As x gets bigger, what happens to y? Choose the association.', 'Which word describes the pattern in the dots?']);
  return { ask: `${axes(dir)} ${ask}`, visual: grid({ pts: dots(pts) }), answer: fixedChoice(name, DIRS), hint: 'Read the dots from left to right. Do they climb, fall, or do neither?', _t: { k: 'scdir', pts, want: 'dir' },
    ways: [way('Read left to right', [dir === 0 ? 'Going from left to right, the dots are sometimes high and sometimes low, with no pattern.' : `Going from left to right, the dots ${dir > 0 ? 'climb: as x gets bigger, y gets bigger too' : 'fall: as x gets bigger, y gets smaller'}.`, `That is ${b(name.toLowerCase())}.`]),
      way('Imagine a line through the dots', [dir === 0 ? 'No single straight line stays close to the dots. A flat line would be as good as any other.' : `A line drawn through the middle of the dots would slope ${dir > 0 ? 'upward' : 'downward'}.`, dir === 0 ? `So there is ${b('no association')}.` : `${dir > 0 ? 'Upward' : 'Downward'} slope means a ${b(dir > 0 ? 'positive' : 'negative')} association.`])] };
}
// Step 1 warm-up: every dot is a pair (x, y).
function readDot() {
  const dir = pick([1, -1]), pts = cloud(dir, 'strong'), whole = pts ? pts.filter(p => Number.isInteger(p[1])) : [];
  if (!whole.length) return null;
  const [x, y] = pick(whole);
  return { ask: `${axes(dir)} What is the y-value of the dot at x = ${x}?`, visual: grid({ pts: dots(pts) }), answer: num(y), hint: `Find ${x} on the x-axis, go straight up to the dot, then read across to the y-axis.`, _t: { k: 'scread', pts, x },
    ways: [way('Up, then across', [grid({ pts: dots(pts), segs: [{ a: [x, 0], b: [x, y] }, { a: [x, y], b: [0, y] }] }), `Go up from x = ${x} to the dot, then across to the y-axis: ${b(y)}.`]),
      way('Read it as a pair', [`Each dot is a pair of numbers (x, y) for one person or thing.`, `This dot is ${pt(x, y)}, so its y-value is ${b(y)}.`])] };
}
function strength() {
  const dir = pick([1, -1]), s = pick(['strong', 'weak']), pts = cloud(dir, s);
  if (!pts) return null;
  const name = STRENGTHS[(dir === 1 ? 0 : 2) + (s === 'strong' ? 0 : 1)];
  return { ask: `${axes(dir)} Which describes the association best?`, visual: grid({ pts: dots(pts) }), answer: fixedChoice(name, STRENGTHS), hint: 'First decide up or down. Then ask how tightly the dots hug a straight line.', _t: { k: 'scdir', pts, want: 'strength' },
    ways: [way('Direction, then strength', [`From left to right the dots go ${dir > 0 ? 'up, so it is positive' : 'down, so it is negative'}.`, s === 'strong' ? 'The dots stay very close to one straight line. That is a strong association.' : 'The dots follow the trend only loosely, with a lot of scatter. That is a weak association.', `${b(name)}.`]),
      way('Would a prediction be safe?', [s === 'strong' ? 'Cover one dot and you could guess its height quite well from its neighbours. Tight dots make trustworthy predictions.' : 'Cover one dot and your guess for its height could easily be off by 2 or 3. Loose dots make shaky predictions.', `That makes the association ${b(s)}.`])] };
}
function outlier() {
  const dir = pick([1, -1]), base = cloud(dir, 'strong');
  if (!base) return null;
  const i = rnd(2, 6), odd = [base[i][0], base[i][1] > 5 ? base[i][1] - rnd(4, 5) : base[i][1] + rnd(4, 5)], pts = base.map((p, j) => (j === i ? odd : p));
  const idx = shuffle([0, 1, 7, 8, 2, 6].filter(j => j !== i)).slice(0, 3).concat(i).sort((x, y) => x - y), letter = j => 'ABCD'[idx.indexOf(j)];
  if (odd[1] < 0 || odd[1] > 10) return null;
  const labelled = pts.map(([x, y], j) => ({ x, y, r: 5, label: idx.includes(j) ? letter(j) : '' }));
  return { ask: 'Which labelled point is the outlier?', visual: grid({ pts: labelled }), answer: fixedChoice(letter(i), ['A', 'B', 'C', 'D']), hint: 'An outlier sits far away from the pattern the other dots make.', _t: { k: 'scout', pts, idx },
    ways: [way('Find the pattern first', [`Most dots follow a line going ${dir > 0 ? 'up' : 'down'} from left to right.`, `Point ${letter(i)} at ${pt(...odd)} sits far ${odd[1] > base[i][1] ? 'above' : 'below'} that line.`, `So ${b(letter(i))} is the outlier.`]),
      way('Compare with neighbours', [`The dots just left and right of ${letter(i)} have heights ${fmt(pts[i - 1][1])} and ${fmt(pts[i + 1][1])}.`, `${letter(i)} has height ${fmt(odd[1])}, which is far from both. The other labelled points sit close to their neighbours.`])] };
}
// A line through grid points with a tight cloud around it, used for reading predictions.
export function fitted() {
  for (let t = 0; t < 200; t++) {
    const m = pick([1, 0.5, -1, -0.5]), c = m > 0 ? rnd(0, 3) : rnd(7, 10);
    const pts = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => [x, half(m * x + c + pick([-1, -0.5, 0.5, 1]))]);
    if (pts.every(p => p[1] >= 0 && p[1] <= 10) && Math.abs(corr(pts)) > 0.8) return { m, c, pts };
  }
  return null;
}
function readPrediction() {
  const f = fitted();
  if (!f) return null;
  const x = f.m % 1 ? pick([2, 4, 6, 8, 10]) : rnd(1, 10), y = f.m * x + f.c;
  if (y < 0 || y > 10) return null;
  const pic = more => grid({ pts: [...dots(f.pts), ...more], lines: [{ m: f.m, c: f.c, color: 'var(--good)' }] });
  return { ask: `The line is the line of best fit. What y-value does it predict for x = ${x}?`, visual: pic([]), answer: num(y), hint: `Go up from ${x} on the x-axis until you reach the line, not a dot.`, _t: { k: 'scpred', m: f.m, c: f.c, x },
    ways: [way('Read it off the line', [pic([{ x, y, cls: 'given', r: 7 }]), `Start at x = ${x}, go straight up to the line, then straight across to the y-axis.`, 'Use the line, not the nearest dot. The line is the summary of all the dots.', `The line is at height ${b(fmt(y))} there.`]),
      way('Use the line\'s rule', [`The line crosses the y-axis at ${f.c} and ${f.m > 0 ? 'rises' : 'falls'} ${fmt(Math.abs(f.m))} for each step right.`, `After ${count(x, 'step')}: ${f.c === 0 ? '' : `${f.c} ${f.m > 0 ? '+' : '−'} `}${x} × ${fmt(Math.abs(f.m))} = ${b(fmt(y))}`])] };
}
export { direction, readDot, strength, outlier, readPrediction };
