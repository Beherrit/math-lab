// Which skills the learner has had the guided lesson for (or chose to skip). Saved as S.learned[id] = date.
export const isLearned = (S, id) => !!S.learned?.[id];
export const markLearned = (S, id, now) => { (S.learned ||= {})[id] = now; };
// The one-time "Want to learn it first?" offer: a skill never practiced and not yet learned or skipped.
export const needsOffer = (S, id) => !isLearned(S, id) && !(S.skills[id]?.n > 0);
