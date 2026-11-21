// Grade-band colors and the small home map. White on `strong`, and ink on `soft`, meet WCAG AA.
import { SKILL } from '../skills/registry.js';
import { enabledIn } from './progression.js';
import { pathPick, getFocus } from './focus.js';

const band = (strong, deep, lightSoft, darkSoft, onDark) => ({ strong, deep, lightSoft, darkSoft, onDark, mark: '#e0a106' });

export const BANDS = {
  0: band('#9a3412', '#7a280e', '#fde7dc', '#3a241c', '#ffc7ad'),
  1: band('#8a5800', '#6b4500', '#f8edd4', '#3a2e18', '#ffd591'),
  2: band('#0f6b3c', '#0b4e2b', '#e3f5ea', '#163528', '#9be7c0'),
  3: band('#0f5f6b', '#0b4650', '#e3f3f5', '#16343a', '#9adbe6'),
  4: band('#1e40af', '#163484', '#e6eefc', '#1c2c52', '#c5d6ff'),
  5: band('#3730a3', '#2a2580', '#ebe9fe', '#241f4a', '#d0cdff'),
  6: band('#6d28d9', '#5516b0', '#f3e8ff', '#321a4a', '#e4d0ff'),
  7: band('#7e22ce', '#6418a8', '#fae8ff', '#3a1848', '#f3d0ff'),
  8: band('#9f1239', '#7a0e2c', '#fde7ee', '#3f1824', '#ffc2d4'),
};

export const TONES = {
  Numbers: 'blue',
  'Adding and subtracting': 'green',
  'Multiplying and dividing': 'grape',
  'Shapes and space': 'grape',
  Colors: 'gold',
  Letters: 'rose',
};

export function bandFor(level) {
  return BANDS[level] || BANDS[1];
}

function lin(c) {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

export function contrast(a, b) {
  const hi = Math.max(lum(a), lum(b));
  const lo = Math.min(lum(a), lum(b));
  return (hi + 0.05) / (lo + 0.05);
}

// A started skill on the path, or null when practice has not begun.
export function resumeId(S) {
  const id = pathPick(S);
  return id && (S.skills[id]?.n || 0) > 0 ? id : null;
}

// Dots for the focus skill's subject: done, now, or later.
export function pathDots(S) {
  const id = getFocus(S);
  const skill = id && SKILL[id];
  if (!skill) return [];
  const strand = skill.strand || 'More';
  return enabledIn(S, S.level)
    .filter(s => !s.story && (s.strand || 'More') === strand)
    .map(s => ({ id: s.id, state: S.skills[s.id]?.mastered ? 'done' : s.id === id ? 'now' : 'later' }));
}
