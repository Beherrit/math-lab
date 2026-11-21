// Steps that can only be answered by listening (no word on screen). They are served only when speech can really be heard.
import { readAloudOn } from './say.js';
import { available } from './speech.js';
export const SPEECH_ONLY_FROM = { l0sound: 3 }; // skill id -> first step that needs speech
// The step to ask: capped one below the speech-only step when speech is off or missing.
export const speechCap = (id, L, usable) => (!usable && SPEECH_ONLY_FROM[id] && L >= SPEECH_ONLY_FROM[id] ? SPEECH_ONLY_FROM[id] - 1 : L);
export const speechUsable = S => readAloudOn(S) && available();
