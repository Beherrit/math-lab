// Builds the skill objects of Level 5: skill(strand)(id, std, title, sub, gen, big, tips, words, extra).
export const skillIn = strand => (id, std, title, sub, gen, big, tips, words, extra = {}) => {
  const { card, ...rest } = extra;
  return { id, level: 5, strand, std, title, sub, gen, school: true, learn: { big, tips, words, ...(card ? { card } : {}) }, ...rest };
};
