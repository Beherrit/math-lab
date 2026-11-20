// Read aloud on the practice and lesson screens: speaks each new question once, repeats it on "Hear it",
// reads the choices while lighting each one, and says a short result. Does nothing when the setting is off.
import { S } from '../core/store.js';
import { speak, speakList } from '../core/speech.js';
import { spokenText, spokenOptions, resultText, readAloudOn } from '../core/say.js';
import { $$ } from '../ui/dom.js';
import { sess } from './state.js';
export const aloudOn = () => !!S && readAloudOn(S);
export function sayQuestion(q) { if (aloudOn() && q) speak(spokenText(q)); }
// how: 'right', 'retry' or 'reveal'
export function sayResult(how, q) { if (aloudOn() && q) speak(resultText(how, q)); }
const highlight = i => $$('.choice').forEach((c, k) => c.classList.toggle('hearing', k === i));
export const aloudActions = {
hear: () => sayQuestion(sess?.q),
hearopts: () => { const o = sess?.q ? spokenOptions(sess.q) : null; if (o && aloudOn()) speakList(o, highlight); },
};
