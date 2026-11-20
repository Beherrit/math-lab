// Letter tables: the alphabet, and which letters look alike (the step 3 trap letters).
import { shuffle } from '../../util.js';

export const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const LOOK = {
  upper: [['E', 'F'], ['O', 'Q', 'C', 'G', 'D'], ['M', 'N', 'W', 'H'], ['P', 'R', 'B'], ['I', 'L', 'T'], ['V', 'Y', 'U'], ['K', 'X'], ['S', 'Z']],
  lower: [['b', 'd', 'p', 'q'], ['n', 'u', 'h', 'r'], ['i', 'l', 'j', 't'], ['m', 'n', 'w'], ['a', 'e', 'o', 'c', 's'], ['f', 't'], ['v', 'w', 'y'], ['g', 'q', 'y'], ['k', 'x']],
};
export const caseOf = (ch, kind) => (kind === 'upper' ? ch.toUpperCase() : ch.toLowerCase());
export const alphabet = kind => ALPHA.map(c => caseOf(c, kind));
export const lookOf = (kind, ch) => [...new Set(LOOK[kind].filter(g => g.includes(ch)).flat().filter(x => x !== ch))];
export const looks = (kind, a, b) => lookOf(kind, a).includes(b);
// How a letter is said by the read-aloud button: always the capital, with the case in words.
export const spokenLetter = (ch, kind) => `${kind === 'upper' ? 'capital' : 'small'} ${ch.toUpperCase()}`;

// `k` letters including `target`. Steps 1 and 2: none of them look alike. Step 3: some look like the target.
export function letterSet(kind, target, k, trap, ban = []) {
  const all = alphabet(kind).filter(c => c !== target && !ban.includes(c.toLowerCase()));
  const chosen = [target];
  const near = shuffle(lookOf(kind, target).filter(c => !ban.includes(c.toLowerCase()))).slice(0, trap ? Math.min(2, k - 1) : 0);
  chosen.push(...near);
  for (const c of shuffle(all)) {
    if (chosen.length >= k) break;
    if (chosen.includes(c)) continue;
    if (trap || chosen.every(x => !looks(kind, x, c))) chosen.push(c);
  }
  return chosen;
}
export const trapTargets = kind => alphabet(kind).filter(c => lookOf(kind, c).length > 0);
