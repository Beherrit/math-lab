// How a level 3 skill object is built. strand is one of STRANDS and groups the skills of the learning path.
export const STRANDS = ['Numbers', 'Adding and subtracting', 'Multiplying and dividing', 'Fractions and decimals', 'Ratios and percents', 'Algebra', 'Measurement', 'Shapes and space', 'Data and chance', 'Stories'];
export const skill = (id, strand, std, title, sub, gen, learn, extra = {}) => ({ id, level: 3, strand, std, title, sub, gen, school: true, learn, ...extra });
