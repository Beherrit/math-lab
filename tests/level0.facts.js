// Facts the level 0 tests know on their own, so a wrong generator cannot also be wrong in the check.
export const HEX = { red: '#B71C1C', blue: '#1E5BC6', yellow: '#FFD93B', green: '#5CC46A', orange: '#F57C00', purple: '#5E2A8C',
  pink: '#F6A6C4', brown: '#6B4A3A', black: '#161616', white: '#FFFFFF', grey: '#8C8C8C' };
const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
export function lstar(hex) {
  const [r, g, b] = [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16))), y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return y > 0.008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y;
}
const W1 = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
const W10 = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');
export const word = n => (n < 20 ? W1[n] : n === 100 ? 'one hundred' : W10[Math.floor(n / 10)] + (n % 10 ? ' ' + W1[n % 10] : ''));
export const SHAPE_NAMES = ['circle', 'square', 'triangle', 'rectangle', 'oval', 'hexagon', 'rhombus'];
export const CORNERS = { circle: 0, oval: 0, triangle: 3, square: 4, rectangle: 4, rhombus: 4, hexagon: 6 };
export const SOLID_KIND = { sphere: 'solid', cube: 'solid', cylinder: 'solid', cone: 'solid', circle: 'flat', square: 'flat', triangle: 'flat', rectangle: 'flat' };
export const ROLLS = ['sphere', 'cylinder'], STACKS = ['cube', 'cylinder'];
export const ALPHA = 'abcdefghijklmnopqrstuvwxyz';
// Letters that look alike (a second copy, kept here on purpose).
export const LOOK = {
  upper: [['E', 'F'], ['O', 'Q', 'C', 'G', 'D'], ['M', 'N', 'W', 'H'], ['P', 'R', 'B'], ['I', 'L', 'T'], ['V', 'Y', 'U'], ['K', 'X'], ['S', 'Z']],
  lower: [['b', 'd', 'p', 'q'], ['n', 'u', 'h', 'r'], ['i', 'l', 'j', 't'], ['m', 'n', 'w'], ['a', 'e', 'o', 'c', 's'], ['f', 't'], ['v', 'w', 'y'], ['g', 'q', 'y'], ['k', 'x']],
};
export const alike = (kind, a, b) => LOOK[kind].some(g => g.includes(a) && g.includes(b));
// What each letter can say at the start of a word. Letters that share an entry make the same sound.
export const SAYS = { a: 'A1 A2', e: 'E1 E2', i: 'I1 I2', o: 'O1 O2', u: 'U1 U2', b: 'b', c: 'k s', d: 'd', f: 'f', g: 'g j', h: 'h', j: 'j', k: 'k', l: 'l', m: 'm',
  n: 'n', p: 'p', q: 'k', r: 'r', s: 's', t: 't', v: 'v', w: 'w', x: 'z ks', y: 'y', z: 'z' };
export const sameSound = (a, b) => SAYS[a].split(' ').some(s => SAYS[b].split(' ').includes(s));
export const SHORT_VOWEL_WORDS = ['apple', 'ant', 'add', 'egg', 'elf', 'elbow', 'end', 'igloo', 'insect', 'ink', 'octopus', 'otter', 'ox', 'umbrella', 'under', 'up', 'us'];
