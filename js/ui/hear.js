// The "Hear it" buttons beside a question. Words, not icons. Shown only when read aloud is on and the browser can speak.
import { S } from '../core/store.js';
import { available } from '../core/speech.js';
import { spokenOptions, readAloudOn } from '../core/say.js';
import { esc } from './dom.js';
// The buttons themselves: "Hear the choices" appears only when the problem has spoken options.
export const hearButtons = q => `<div class="hear"><button class="btn sm hear-btn" data-act="hear">Hear it</button>${spokenOptions(q) ? '<button class="btn sm hear-btn" data-act="hearopts">Hear the choices</button>' : ''}</div>`;
// A speaker for an explanation. Hidden when the browser cannot speak.
export function explainHear(text, label = 'Hear it') {
  if (!S || !readAloudOn(S) || !available() || !text) return '';
  return `<button class="btn sm hear-btn" data-act="hearsay" data-say="${esc(text)}" aria-label="${esc(label)}">Hear it</button>`;
}
export const hearHTML = q => (S && readAloudOn(S) && available() ? hearButtons(q) : '');
