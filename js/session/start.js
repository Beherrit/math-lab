// Starting a session: the daily page, free practice, a sprint, or the placement check.
import { S, save } from '../core/store.js';
import { getFocus, logFocus } from '../core/focus.js';
import { workingLevel } from '../core/progression.js';
import { phaseSplit } from '../core/daily.js';
import { SKILL } from '../skills/registry.js';
import { setSess, newSess } from './state.js';
import { phaseIntro } from './intro.js';
import { playPhase } from './flow.js';
import { beginPlacement } from './placement-run.js';
export function startDaily() {
const M = S.settings.minutes * 60000; const focus = getFocus(S); const sp = phaseSplit(S);
if (focus) logFocus(S, focus); save();
const phases = [{ type: 'facts', ms: M * sp.facts, label: 'Times tables warm-up', intro: 'Answer as many as you can. Quick and correct grows your facts!' }];
if (focus) phases.push({ type: 'skill', skill: focus, ms: M * sp.focus, label: `Focus: ${SKILL[focus].title}`, intro: SKILL[focus].learn.big });
else phases[0].ms = M * (sp.facts + sp.focus);
if (!sp.facts && focus) phases.shift();
phases.push({ type: 'mix', ms: M * sp.mix, label: 'Mix-up', intro: workingLevel(S) === 0 ? 'A little of everything you’ve practiced.' : 'A little of everything you’ve practiced, plus story problems.' });
setSess(newSess('daily', phases));
phaseIntro();
}
export function startFree(type, arg) {
if (type === 'skill') setSess(newSess('free', [{ type: 'skill', skill: arg, ms: Infinity, label: SKILL[arg].title }]));
if (type === 'facts') setSess(newSess('free', [{ type: 'facts', ms: Infinity, label: 'Times tables' }]));
if (type === 'table') setSess(newSess('free', [{ type: 'facts', table: +arg, ms: Infinity, label: `The ×${arg} table` }]));
if (type === 'sprint') { setSess(newSess('sprint', [{ type: 'facts', ms: 60000, label: '1-minute sprint', hard: true }])); return phaseIntro(); }
playPhase();
}
export function startPlacementCheck() { beginPlacement(); playPhase(); }
