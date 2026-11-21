// The shape of one level 6 skill entry, shared by the skill lists.
export const skill = (id, std, title, sub, gen, learn, extra = {}) => ({ id, level: 6, std, title, sub, gen, school: true, learn, ...extra });
