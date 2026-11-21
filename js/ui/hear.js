// The "Hear it" buttons beside a question. Words, not icons. Shown only when read aloud is on and the browser can speak.
import { S } from '../core/store.js';
import { available } from '../core/speech.js';
import { spokenOptions, readAloudOn } from '../core/say.js';
// The buttons themselves: "Hear the choices" appears only when the problem has spoken options.
export const hearButtons = q => `<div class="hear"><button class="btn sm hear-btn" data-act="hear">Hear it</button>${spokenOptions(q) ? '<button class="btn sm hear-btn" data-act="hearopts">Hear the choices</button>' : ''}</div>`;
export const hearHTML = q => (S && readAloudOn(S) && available() ? hearButtons(q) : '');
