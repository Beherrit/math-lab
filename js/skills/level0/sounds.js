// First sounds: which letter does the spoken word start with? Steps 1 and 2 show the word with its first letter left out.
import { pick, shuffle, way } from '../../util.js';
import { pickQ, opt, tag, BLANK } from './kit.js';
import { WORDS, sameSound } from './soundwords.js';
import { spokenLetter } from './letterdata.js';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const soundWays = (word, first) => [
  way('Say it slowly', [`Say ${word} slowly and listen to the very first sound.`, `The first sound of ${word} is the sound of the letter ${first.toUpperCase()}.`]),
  way('Match the sound', [`Which letter makes the sound at the start of ${word}?`, `The letter ${first.toUpperCase()} does.`]),
];
// Three ways to ask the same thing, so a run of questions does not feel the same.
const ASKS = [
  { ask: 'Which letter starts the word?', say: w => `Which letter does ${w} start with?` },
  { ask: 'Which letter makes the first sound?', say: w => `What is the first sound in ${w}? Tap the letter that makes it.` },
  { ask: 'Tap the letter the word begins with.', say: w => `Tap the letter that ${w} begins with.` },
];
export function genSound(L) {
  const word = pick(WORDS), first = word[0], form = ASKS.indexOf(pick(ASKS)), k = L === 1 ? 3 : 4, kind = L === 3 ? 'upper' : 'lower';
  const wrong = shuffle(LETTERS.filter(c => !sameSound(c, first))).slice(0, k - 1);
  const show = c => (kind === 'upper' ? c.toUpperCase() : c);
  const o = c => opt(show(c), spokenLetter(c, kind));
  return pickQ({ ask: (L === 3 ? 'Listen. ' : '') + ASKS[form].ask + tag('sound', word),
    expr: L === 3 ? undefined : `${BLANK}${word.slice(1)}`, say: ASKS[form].say(word), right: o(first), wrong: wrong.map(o), big: true, mode: 'ask',
    hint: 'Say the word slowly. What sound do you hear first?', ways: soundWays(word, first), t: { f: 'sound', word, shown: L < 3, q: `form${form}` } });
}
