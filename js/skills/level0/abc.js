// Alphabet order: what letter comes next, what comes before, which letter is missing from a run of four.
import { rnd, pick, shuffle, way } from '../../util.js';
import { pickQ, opt, big, tag } from './kit.js';
import { svg, el, text, INK } from './svg.js';
import { ALPHA, caseOf, spokenLetter } from './letterdata.js';

// A run of letter boxes; null is the empty box.
function runPic(chars) {
  const n = chars.length, w = 60, W = n * w + 8;
  const inner = chars.map((c, i) => {
    const x = 4 + i * w;
    const box = el('rect', { x: x + 3, y: 4, width: w - 6, height: 56, rx: 8, fill: 'none', stroke: c === null ? INK.fill : INK.edge, 'stroke-width': 2.5, 'stroke-dasharray': c === null ? '5 4' : undefined });
    return box + (c === null ? text('?', x + w / 2, 46, 34, { 'data-hidden': 1 }) : text(c, x + w / 2, 46, 36, { 'data-letter': c }));
  }).join('');
  return svg(W, 64, inner, { label: 'a run of letters with one box empty' });
}
const names = (idx, kind) => idx.map(i => caseOf(ALPHA[i], kind));
const sayRun = (chars, kind) => chars.map(c => (c === null ? 'blank' : c.toUpperCase())).join(', ');
const abcWays = (kind, ans) => [way('Sing the alphabet', ['Sing or say the letters in order from the start.', `The letter ${caseOf(ALPHA[ans], kind)} fits.`]), way('Look at the neighbors', ['Look at the letters on each side of the box.', 'Which letter comes between them?'])];

function answerQ({ kind, ans, chars, ask, say, hint, q, near }) {
  const set = shuffle(near.filter(i => i !== ans && i >= 0 && i < 26)).slice(0, 3);
  const o = i => opt(caseOf(ALPHA[i], kind), spokenLetter(ALPHA[i], kind));
  return pickQ({ ask: ask + tag('abc', q, kind, ans), say, visual: chars ? runPic(chars) : undefined, right: o(ans), wrong: set.map(o), big: true, mode: 'ask', hint, ways: abcWays(kind, ans), t: { f: 'abc', kind, q } });
}
// next/before show three letters and an empty box; missing shows four in a row with the box inside.
function runQ(kind, lo, hi, q) {
  const p = rnd(lo, hi - 3), idx = [p, p + 1, p + 2, p + 3];
  const hole = q === 'next' ? 3 : q === 'before' ? 0 : pick([1, 2]), ans = idx[hole], chars = names(idx, kind).map((c, i) => (i === hole ? null : c));
  const word = q === 'next' ? 'comes next' : q === 'before' ? 'comes before' : 'is missing';
  return answerQ({ kind, ans, chars, q, near: [ans - 1, ans + 1, ans - 2, ans + 2, ans + 3, ans - 3],
    ask: q === 'missing' ? 'Which letter is missing?' : `What letter ${word}?`, say: `${sayRun(chars, kind)}. ${q === 'missing' ? 'Which letter is missing?' : `What letter ${word}?`}`,
    hint: q === 'before' ? 'Think of the letter that comes just before these.' : q === 'next' ? 'Say the alphabet up to the last letter. What is next?' : 'Say the letters in order. Where do you get stuck?' });
}
function singleQ(kind, q) {
  const ref = q === 'after' ? rnd(0, 24) : rnd(1, 25), ans = q === 'after' ? ref + 1 : ref - 1, letter = caseOf(ALPHA[ref], kind);
  return answerQ({ kind, ans, chars: null, q, near: [ans - 1, ans + 1, ans - 2, ans + 2, ans + 3, ans - 3, ref + 1, ref - 1], ask: `What letter comes ${q} ${big(letter)}?`,
    say: `What letter comes ${q} ${letter.toUpperCase()}?`, hint: 'Sing the alphabet song. Stop at the letter.' });
}
export function genAbc(L) {
  if (L === 1) return runQ('upper', 0, 9, pick(['next', 'next', 'before', 'missing']));
  if (L === 2) return runQ('upper', 0, 25, pick(['next', 'before', 'missing']));
  return pick([() => runQ('lower', 0, 25, pick(['next', 'before', 'missing', 'missing'])), () => singleQ('lower', 'after'), () => singleQ('lower', 'before')])();
}
