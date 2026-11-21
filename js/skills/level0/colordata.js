// The colors used by the Early Start level. Colors that share a question always differ in lightness as well as in hue,
// so two of them are never told apart by hue alone.
import { shuffle } from '../../util.js';

export const COLORS = { red: '#B71C1C', blue: '#1E5BC6', yellow: '#FFD93B', green: '#5CC46A', orange: '#F57C00', purple: '#5E2A8C',
  pink: '#F6A6C4', brown: '#6B4A3A', black: '#161616', white: '#FFFFFF', grey: '#8C8C8C' };
export const BASIC = ['red', 'blue', 'yellow', 'green', 'orange', 'purple'];
export const ALL = Object.keys(COLORS);
// light, medium and dark of four hues (each step is at least 18 lightness points apart).
export const TONES = {
  blue: { light: '#BFD8FA', mid: '#1E5BC6', dark: '#0A2A6B' }, green: { light: '#D4F2D8', mid: '#5CC46A', dark: '#1F6B31' },
  red: { light: '#F4B6B6', mid: '#B71C1C', dark: '#5E0E0E' }, purple: { light: '#D9C2EE', mid: '#7A3DB0', dark: '#35124F' },
};
export const MIN_APART = 14;

const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
export function lightness(hex) {
  const [r, g, b] = [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16)));
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return y > 0.008856 ? 116 * y ** (1 / 3) - 16 : 903.3 * y;
}
export const apart = (a, b) => Math.abs(lightness(COLORS[a]) - lightness(COLORS[b])) >= MIN_APART;

// k color names from `from`, starting with `must`, every pair at least MIN_APART apart in lightness.
export function colorSet(k, from = ALL, must = []) {
  for (let tries = 0; tries < 200; tries++) {
    const set = [...must];
    for (const c of shuffle(from)) if (set.length < k && !set.includes(c) && set.every(s => apart(s, c))) set.push(c);
    if (set.length === k) return set;
  }
  throw new Error(`no ${k} colors fit with ${must}`);
}
export const strokeOf = name => (name === 'white' ? '#6b7280' : '#1f2937');
