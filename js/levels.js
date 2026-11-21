// The ladder. Children see "Level N" and the title, except Early Start, which is only ever called "Early Start".
// `grades` is for the Grown-ups screen only.
export const LEVELS = [
{ n: 0, id: 'early', title: 'Early Start', blurb: 'Counting, numbers, colors, shapes and letters', grades: 'K to 1' },
{ n: 1, id: 'number-sense', title: 'Number sense', blurb: 'Adding, subtracting and place value', grades: '1-2' },
{ n: 2, id: 'times-and-sharing', title: 'Times tables and sharing', blurb: 'Multiplying and dividing', grades: '3' },
{ n: 3, id: 'bigger-and-fractions', title: 'Bigger numbers and first fractions', blurb: 'Larger numbers and the first fractions', grades: '4' },
{ n: 4, id: 'decimals-volume', title: 'Decimals, fractions and volume', blurb: 'Decimals, fraction operations, volume and graphs', grades: '5' },
{ n: 5, id: 'ratios-percents', title: 'Ratios, percents and negatives', blurb: 'Ratios, percents and numbers below zero', grades: '6' },
{ n: 6, id: 'proportions-equations', title: 'Proportions and equations', blurb: 'Proportions and solving equations', grades: '7' },
{ n: 7, id: 'powers-lines-triangles', title: 'Powers, lines and triangles', blurb: 'Powers, straight lines and triangles', grades: '8' },
{ n: 8, id: 'functions-curves', title: 'Functions and curves', blurb: 'Lines, curves, chance and change', grades: '9-12' },
];
export const MIN_LEVEL = LEVELS[0].n;
export const MAX_LEVEL = LEVELS[LEVELS.length - 1].n;
export const levelInfo = n => LEVELS.find(l => l.n === n) || null;
// A whole number inside the ladder; anything else becomes 1 (never 0 by accident).
export function clampLevel(n) {
const v = Math.round(+n);
return Number.isFinite(v) ? Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, v)) : 1;
}
export const levelTitle = n => levelInfo(n)?.title ?? '';
// The level after n, or null at the top of the ladder (or for something that is not a level).
export const nextLevel = n => (levelInfo(n) && n < MAX_LEVEL ? n + 1 : null);
// Child-facing names: "Early Start" for 0, "Level N" otherwise; the full form adds the title.
export const levelName = n => (n === 0 ? 'Early Start' : `Level ${n}`);
export const levelFull = n => (n === 0 ? 'Early Start' : `Level ${n}: ${levelTitle(n)}`);
