// A graph drawn from a story: one connected path on the 0 to 10 grid, with optional labelled dots.
import { PLANE, plane } from '../../util.js';

// points: [[x, y], ...] in grid units. dots: [{ x, y, label }].
export function storyGraph(points, dots = []) {
  const u = (PLANE.W - PLANE.m - 14) / 10, X = x => +(PLANE.m + x * u).toFixed(1), Y = y => +(PLANE.W - PLANE.m - y * u).toFixed(1);
  const path = `<polyline class="story" points="${points.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" style="stroke:var(--grape);stroke-width:3;fill:none;stroke-linejoin:round"/>`;
  const marks = dots.map(d => `<circle cx="${X(d.x)}" cy="${Y(d.y)}" r="5" class="pt given"/><text x="${X(d.x) + 9}" y="${Y(d.y) - 8}" class="ptl">${d.label}</text>`).join('');
  return plane({ max: 10 }).replace('<g class="cursor">', `${path}${marks}<g class="cursor">`);
}
// The stories a graph can tell: what the x axis and y axis count, and a phrase for going up, staying level and going down.
export const TRIPS = [
  { lead: 'The graph shows a cyclist on a trip.', subj: 'The cyclist', xs: 'hours since the start', ys: 'kilometers from home', unit: 'kilometers', up: 'rides away from home', flat: 'rests', down: 'rides back toward home' },
  { lead: 'The graph shows a bucket during a day of chores.', subj: 'The bucket', xs: 'minutes', ys: 'liters of water in the bucket', unit: 'liters', up: 'is filled', flat: 'is left alone', down: 'is emptied' },
  { lead: 'The graph shows the money in a small jar.', subj: 'The jar', xs: 'weeks', ys: 'dollars in the jar', unit: 'dollars', up: 'gets new money', flat: 'sits untouched', down: 'loses money' },
  { lead: 'The graph shows a toy drone in flight.', subj: 'The drone', xs: 'seconds', ys: 'height above the ground in meters', unit: 'meters', up: 'climbs', flat: 'hovers', down: 'descends' },
];
export const axesLine = t => `Across (x): ${t.xs}. Up (y): ${t.ys}.`;
