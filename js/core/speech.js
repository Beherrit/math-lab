// Read-aloud engine: a thin, never-throwing wrapper around the browser's speechSynthesis.
// `createSpeech(getEnv)` takes a function returning { synth, Utterance } so tests can inject a fake; the default reads the globals.
const RATE = 0.85;
const isEnglish = v => /^en([-_]|$)/i.test(v?.lang || '');
const defaultEnv = () => ({ synth: globalThis.speechSynthesis, Utterance: globalThis.SpeechSynthesisUtterance });
export function createSpeech(getEnv = defaultEnv) {
let active = false;
const env = () => { try { const e = getEnv(); return e?.synth && e.Utterance ? e : null; } catch (e) { return null; } };
// An English voice once the browser has loaded its list (it can be empty at first); a local voice is preferred.
function voiceFor(synth) {
try { const all = synth.getVoices?.() || []; return all.find(v => isEnglish(v) && v.localService) || all.find(isEnglish) || null; } catch (e) { return null; }
}
function utter(e, text, hooks = {}) {
const u = new e.Utterance(text); u.lang = 'en-US'; u.rate = RATE;
const v = voiceFor(e.synth); if (v) u.voice = v;
u.onstart = () => hooks.onstart?.();
u.onend = () => hooks.onend?.();
u.onerror = ev => hooks.onerror?.(ev); // a refused or interrupted utterance is not an error for the child
return u;
}
const clean = t => String(t ?? '').replace(/\s+/g, ' ').trim();
// Speaks one text, cancelling whatever was being said. Returns true when it was handed to the browser.
function speak(text, hooks) {
const e = env(); const t = clean(text); if (!e || !t) return false;
try { e.synth.cancel(); e.synth.speak(utter(e, t, hooks)); active = true; return true; } catch (err) { return false; }
}
// Speaks several texts in order, calling onItem(i) as each starts and onItem(-1) when the last one ends.
function speakList(texts, onItem = () => { }) {
const e = env(); const list = (texts || []).map(clean).filter(Boolean); if (!e || !list.length) return false;
try {
e.synth.cancel();
list.forEach((t, i) => e.synth.speak(utter(e, t, {
onstart: () => onItem(i),
onend: () => { if (i === list.length - 1) onItem(-1); },
onerror: () => onItem(-1),
})));
active = true; return true;
} catch (err) { return false; }
}
function stop() { if (!active) return; active = false; try { env()?.synth.cancel(); } catch (e) { } }
return { speak, speakList, stop, available: () => !!env() };
}
const main = createSpeech();
export const speak = main.speak;
export const speakList = main.speakList;
export const stop = main.stop;
export const available = main.available;
