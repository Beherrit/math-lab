// The ladder. Children only ever see "Level N" and the title; `grades` is for the Grown-ups screen only.
export const LEVELS = [
{ n: 1, id: 'number-sense', title: 'Number sense', blurb: 'Adding, subtracting and place value', grades: '1-2' },
{ n: 2, id: 'times-and-sharing', title: 'Times tables and sharing', blurb: 'Multiplying and dividing', grades: '3' },
{ n: 3, id: 'bigger-and-fractions', title: 'Bigger numbers and first fractions', blurb: 'Larger numbers and the first fractions', grades: '4' },
{ n: 4, id: 'decimals-volume', title: 'Decimals, fractions and volume', blurb: 'Decimals, fraction operations, volume and graphs', grades: '5' },
{ n: 5, id: 'ratios-percents', title: 'Ratios, percents and negatives', blurb: 'Ratios, percents and numbers below zero', grades: '6' },
{ n: 6, id: 'proportions-equations', title: 'Proportions and equations', blurb: 'Proportions and solving equations', grades: '7' },
{ n: 7, id: 'powers-lines-triangles', title: 'Powers, lines and triangles', blurb: 'Powers, straight lines and triangles', grades: '8' },
];
export const MAX_LEVEL = LEVELS.length;
export const levelInfo = n => LEVELS[n - 1] || null;
export const clampLevel = n => Math.min(MAX_LEVEL, Math.max(1, Math.round(+n) || 1));
