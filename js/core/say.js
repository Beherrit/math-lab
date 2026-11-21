// What to read aloud and whether to read it. Pure: no DOM, no speech engine.
import { MIN_LEVEL } from '../levels.js';
const SYMBOLS = [[/×/g, ' times '], [/÷/g, ' divided by '], [/[−–]/g, ' minus '], [/=/g, ' equals '], [/\+/g, ' plus '], [/%/g, ' percent ']];
const ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&lt;': ' less than ', '&gt;': ' greater than ', '&times;': ' times ', '&minus;': ' minus ' };
// Visible text of an HTML string: pictures (svg) and styles carry no words, tags are dropped.
export function stripHtml(html) {
return String(html ?? '').replace(/<svg[\s\S]*?<\/svg>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, m => ENTITIES[m.toLowerCase()] ?? ' ').replace(/\s+/g, ' ').trim();
}
// An expression: the blank becomes the word "blank", and the symbols become words.
const spokenExpr = html => SYMBOLS.reduce((s, [re, w]) => s.replace(re, w), stripHtml(String(html ?? '').replace(/<span class="blank">[^<]*<\/span>/g, ' blank '))).replace(/\s+/g, ' ').trim();
// The question as a child hears it: `say` when the skill wrote one, else the visible text stripped of HTML.
export function spokenText(q) {
if (typeof q?.say === 'string' && q.say.trim()) return q.say.trim();
return [stripHtml(q?.story), stripHtml(q?.ask), spokenExpr(q?.expr)].filter(Boolean).reduce((a, p) => (a ? a + (/[.?!]$/.test(a) ? ' ' : '. ') + p : p), '');
}
// One spoken string per option, or null when the question has none (saying them would give the answer away).
export function spokenOptions(q) {
const o = q?.sayOptions;
return Array.isArray(o) && o.length && o.every(x => typeof x === 'string' && x.trim()) ? o : null;
}
// Short plain results. `how` is 'right', 'retry' or 'reveal'. The reveal names the right option when it can.
export function resultText(how, q) {
if (how === 'right') return 'Yes, that is right.';
if (how === 'retry') return 'Not yet. Try again.';
const a = q?.answer; const opts = spokenOptions(q);
if (a?.kind === 'choice' && opts?.[a.correct]) return `Not yet. The answer is ${opts[a.correct]}.`;
if (a?.kind === 'num') return `Not yet. The answer is ${a.value}.`;
return 'Not yet.';
}
// Read aloud is a saved setting; with no choice made it is on for a learner at Early Start and off for everyone else.
export const readAloudOn = S => (typeof S?.settings?.speak === 'boolean' ? S.settings.speak : S?.level === MIN_LEVEL);
// The one-line reason a problem is true: a skill can set `why`, otherwise the last step of the first worked way.
export function becauseText(q) {
  const raw = q?.why || q?.ways?.[0]?.s?.at?.(-1) || '';
  return stripHtml(raw);
}
