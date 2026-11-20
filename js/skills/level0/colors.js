// Colors: find the named color, name the shown color, color plus shape, then light and dark.
import { pick, shuffle, way } from '../../util.js';
import { pickQ, opt, tag } from './kit.js';
import { flatTile } from './shapedraw.js';
import { COLORS, TONES, BASIC, ALL, colorSet } from './colordata.js';

const SHAPES = ['circle', 'square', 'triangle', 'hexagon'];
const swatch = (c, shape = 'circle', extra = {}) => flatTile(shape, { fill: COLORS[c], size: 30, turn: shape === 'circle' ? 0 : pick([0, 0, 10, -10]), data: { color: c }, ...extra });
const big = c => flatTile('circle', { fill: COLORS[c], size: 30, turn: 0, scale: 1.6, data: { color: c } });
const colorWays = c => [way('Look at the color', [`This color is ${c}.`, 'Say the name out loud.']), way('Match it', [`Find something else that is ${c}.`, 'The names go with the colors.'])];
const pool = L => (L === 1 ? BASIC : ALL);

function findColor(L) {
  const c = pick(pool(L)), set = colorSet(L === 1 ? 3 : 4, pool(L), [c]), shape = pick(['circle', 'square']);
  return pickQ({ ask: `Tap the ${c} one.` + tag('findcolor', c), say: `Tap the ${c} one.`, right: opt(swatch(c, shape), ''), wrong: set.filter(x => x !== c).map(x => opt(swatch(x, shape), '')), mode: 'find',
    hint: 'Look at the color of each one.', ways: colorWays(c), t: { f: 'colorfind', target: { color: c }, q: 'find' } });
}
function nameColor(L) {
  const c = pick(pool(L)), set = colorSet(L === 1 ? 3 : 4, pool(L), [c]);
  return pickQ({ ask: 'What color is this?' + tag('namecolor', c), say: 'What color is this?', visual: big(c), right: opt(c, c), wrong: set.filter(x => x !== c).map(x => opt(x, x)),
    hint: 'Say the names of the colors. Which one fits?', ways: colorWays(c), t: { f: 'colorname', c, q: 'name' } });
}
function sameColor(L) {
  const c = pick(pool(L)), set = colorSet(L === 1 ? 3 : 4, pool(L), [c]), [s0, ...ss] = shuffle(SHAPES);
  return pickQ({ ask: 'Tap the one with the same color.' + tag('samecolor', c), say: 'Tap the one that has the same color.', visual: swatch(c, s0, { scale: 1 }), right: opt(swatch(c, ss[0]), ''), wrong: set.filter(x => x !== c).map((x, i) => opt(swatch(x, ss[(i + 1) % 3]), '')), mode: 'pick', quiet: true,
    hint: 'Look at the color on top. Find the same color.', ways: [way('Match the color', ['Look at the color on top.', 'Find the one that looks just the same.'])], t: { f: 'colorsame', c, q: 'same' } });
}
function colorShape(L) {
  const c = pick(ALL), shape = pick(SHAPES), others = colorSet(L === 3 ? 4 : 3, ALL, [c]).filter(x => x !== c), shapes = shuffle(SHAPES.filter(s => s !== shape));
  const wrong = [opt(swatch(c, shapes[0]), ''), opt(swatch(others[0], shape), '')];
  if (L === 3) wrong.push(opt(swatch(others[1], shapes[1]), ''), opt(swatch(others[2], shape), ''));
  return pickQ({ ask: `Tap the ${c} ${shape}.` + tag('colorshape', c, shape), say: `Tap the ${c} ${shape}.`, right: opt(swatch(c, shape), ''), wrong, mode: 'find',
    hint: 'Check the color and the shape. Both must match.', ways: [way('Check both', [`Look for the color ${c}.`, `Then check that it is a ${shape}.`])], t: { f: 'colorshape', target: { color: c, shape }, q: 'shape' } });
}
// Light and dark: three tones of one hue.
function lightDark() {
  const hue = pick(Object.keys(TONES)), t = TONES[hue], k = pick([2, 3]), want = pick(['dark', 'light']), order = ['light', 'mid', 'dark'];
  const set = k === 3 ? order : shuffle(order).slice(0, 2).sort((p, q) => order.indexOf(p) - order.indexOf(q));
  const right = want === 'dark' ? set[set.length - 1] : set[0];
  const one = x => opt(flatTile('circle', { fill: t[x], size: 30, turn: 0, data: { color: hue, tone: x } }), '');
  const word = k === 3 ? (want === 'dark' ? 'darkest' : 'lightest') : (want === 'dark' ? 'darker' : 'lighter');
  return pickQ({ ask: `Which one is ${word}?` + tag('tone', hue, word, set.join(' ')), say: `Which one is ${word}?`, right: one(right), wrong: set.filter(x => x !== right).map(one), mode: 'pick', quiet: true,
    hint: want === 'dark' ? 'Dark colors look deep. Light colors look pale.' : 'Light colors look pale. Dark colors look deep.', ways: [way('Compare them', ['Put them side by side in your mind.', `The ${word} one is the answer.`])], t: { f: 'colortone', want, q: 'tone' } });
}
function toneName() {
  const hue = pick(Object.keys(TONES)), tone = pick(['light', 'dark']);
  return pickQ({ ask: 'Is this color light or dark?' + tag('tonename', hue, tone), say: 'Is this color light or dark?', visual: flatTile('circle', { fill: TONES[hue][tone], size: 30, turn: 0, scale: 1.6, data: { color: hue, tone } }),
    right: opt(tone, tone), wrong: [opt(tone === 'light' ? 'dark' : 'light', tone === 'light' ? 'dark' : 'light')], mode: 'pick', hint: 'Pale colors are light. Deep colors are dark.', ways: [way('Think of the sky', ['A bright morning sky is a light blue.', 'The night sky is a dark blue.'])], t: { f: 'colortonename', tone, q: 'tonename' } });
}
export function genColors(L) {
  if (L === 1) return pick([findColor, nameColor, sameColor, findColor])(L);
  if (L === 2) return pick([findColor, nameColor, sameColor, colorShape, colorShape])(L);
  return pick([colorShape, colorShape, lightDark, lightDark, toneName, nameColor])(L);
}
