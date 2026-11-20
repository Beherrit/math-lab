// The skills added to level 7 in the second pass: their largest typed answer per step, and the allowed strands.
export const STRANDS = ['Numbers', 'Adding and subtracting', 'Multiplying and dividing', 'Fractions and decimals', 'Ratios and percents', 'Algebra', 'Measurement', 'Shapes and space', 'Data and chance', 'Stories'];
// Largest size a typed number answer may have at each step. 0 means the step asks only choices.
export const CAP_NEW = { l7propcmp: [9, 0, 90], l7slopewhy: [40, 100, 60], l7lineeq: [10, 100, 100], l7funccmp: [0, 0, 100], l7graphstory: [0, 10, 10], l7sysstory: [10, 140, 160], l7congruent: [130, 130, 130], l7similar: [60, 70, 130], l7pythreal: [50, 30, 200], l7irrline: [16, 10, 15] };
export const NEW_IDS = Object.keys(CAP_NEW);
