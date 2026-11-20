// Grown-ups screen actions: backup, erase, and the settings controls.
import { S, setState, save, clearSaved, exportJSON, parseBackup } from '../core/store.js';
import { today } from '../core/dates.js';
import { checkLevelUp } from '../core/progression.js';
import { levelName, levelFull } from '../levels.js';
import { stop as stopSpeech } from '../core/speech.js';
import { render } from './router.js';
import { renderParent, parentState } from './screens/parent.js';
import { toast } from '../session/feedback.js';
function download() {
const blob = new Blob([exportJSON(S)], { type: 'application/json' });
const u = URL.createObjectURL(blob); const l = document.createElement('a');
l.href = u; l.download = `math-lab-${S.name}-${today()}.json`; l.click();
setTimeout(() => URL.revokeObjectURL(u), 1000);
}
function erase() {
if (!confirm(`Erase all of ${S.name}’s progress? This can’t be undone.`)) return;
clearSaved(); setState(null); parentState.open = false; render();
}
export const adultActions = { export: download, reset: erase };
function restore(file) {
file.text().then(t => {
const d = parseBackup(t);
if (!d) return toast('That file isn’t a Math Lab backup.');
setState(d); save(); toast('Progress restored'); renderParent();
});
}
function toggleSkill(el) {
if (el.checked) delete S.settings.off[el.dataset.id]; else S.settings.off[el.dataset.id] = true;
const up = checkLevelUp(S);
if (up) toast(`${levelName(up.done)} complete!${up.next ? ` Now on ${levelFull(up.next)}` : ''}`);
}
const SETTERS = {
toggleskill: toggleSkill,
minutes: el => { S.settings.minutes = +el.value; },
focus: el => { S.settings.focus = el.value; },
gradual: el => { S.settings.gradual = el.checked; },
speak: el => { S.settings.speak = el.checked; if (!el.checked) stopSpeech(); },
rename: el => { S.name = el.value.trim() || S.name; },
};
export function onChange(e) {
const el = e.target; const a = el.dataset.act; if (!a) return;
if (a === 'import') { if (el.files[0]) restore(el.files[0]); return; }
if (!SETTERS[a]) return;
SETTERS[a](el); save();
if (a !== 'rename') renderParent();
}
