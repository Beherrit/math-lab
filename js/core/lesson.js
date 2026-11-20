// Sequencing of the guided "Learn it" lesson. Pure: no DOM, no saved state. Nothing here counts an answer.
// Stages: idea, watch, together, turn (TURNS problems), done.
export const TURNS = 2;
const readSteps = r => [`<b>What is it asking?</b> ${r.find}`, `<b>What do we know?</b> ${r.know.join('; ')}`, `<b>Clue words:</b> ${r.clue}`, `<b>Plan:</b> ${r.plan}`];
// The worked ways of a problem; a story problem with a read panel starts its first way with the reading steps.
export function lessonWays(p) {
const ways = p.ways.map(w => ({ t: w.t, s: [...w.s] }));
if (p.read) ways[0].s = [...readSteps(p.read), ...ways[0].s];
return ways;
}
const watchOf = p => ({ p, ways: lessonWays(p), wi: 0, shown: 0 });
const taskOf = p => ({ p, ways: lessonWays(p), shown: 0, hint: false, tries: 0, solved: false });
export const newLesson = id => ({ id, stage: 'idea', watch: null, task: null, turn: 0 });
// One step at a time in "watch": the learner must have read the whole first way before moving on.
export function canContinue(l) {
if (l.stage === 'idea') return true;
if (l.stage === 'watch') return l.watch.wi > 0 || l.watch.shown >= l.watch.ways[0].s.length;
if (l.stage === 'together' || l.stage === 'turn') return l.task.solved;
return false;
}
// make() returns a fresh step-1 problem. Returns false when the learner is not ready to move on.
export function advanceStage(l, make) {
if (!canContinue(l)) return false;
if (l.stage === 'idea') { l.stage = 'watch'; l.watch = watchOf(make()); }
else if (l.stage === 'watch') { l.stage = 'together'; l.task = taskOf(make()); }
else if (l.stage === 'together') { l.stage = 'turn'; l.turn = 0; l.task = taskOf(make()); }
else if (++l.turn < TURNS) l.task = taskOf(make());
else { l.stage = 'done'; l.task = null; }
return true;
}
export function revealWatch(l) {
const w = l.watch; if (w.shown >= w.ways[w.wi].s.length) return false;
w.shown++; return true;
}
export const hasAnotherWay = l => l.stage === 'watch' && l.watch.shown >= l.watch.ways[l.watch.wi].s.length && l.watch.wi + 1 < l.watch.ways.length;
export function anotherWay(l) { if (!hasAnotherWay(l)) return false; l.watch.wi++; l.watch.shown = 0; return true; }
export const watchLeft = l => l.watch.ways[l.watch.wi].s.length - l.watch.shown;
// Together and your-turn problems. A wrong answer only opens the hint and lets the learner try again.
export const showHint = t => { t.hint = true; };
export const stepsLeft = t => t.ways[0].s.length - t.shown;
export function showStep(t) { if (stepsLeft(t) <= 0) return false; t.hint = true; t.shown++; return true; }
export function answerTask(t, ok) {
if (t.solved) return { solved: true };
if (ok) t.solved = true; else { t.tries++; t.hint = true; }
return { solved: t.solved, tries: t.tries };
}
// The one-line "why it works": the last step of the first way as the skill wrote it.
export const recap = t => t.p.ways[0].s.at(-1);
export const lessonProgress = l => ['idea', 'watch', 'together', 'turn', 'done'].indexOf(l.stage);
