// Plays today's challenge one item at a time. Review and stretch update progress. The puzzle does not.
import { S, save } from '../core/store.js';
import { today } from '../core/dates.js';
import { speak } from '../core/speech.js';
import { spokenText, becauseText, readAloudOn, resultText } from '../core/say.js';
import { syncChallenge, seededProblem, noteAnswer } from '../core/challenge.js';
import { skillState, recordSkill } from '../core/mastery.js';
import { recordReview } from '../core/review.js';
import { makeRound, checkRound } from '../games/catalog.js';
import { check } from '../util.js';
import { mount } from '../ui/dom.js';
import { challengePlayHTML } from '../ui/screens/challenge-play.js';
import { renderChallenge } from '../ui/screens/challenge.js';

let run = null;

const say = text => { if (S && readAloudOn(S) && text) speak(text); };

function blank(kind) {
  if (kind === 'frac') return { w: '', n: '', d: '', neg: false, f: 'n' };
  if (kind === 'point') return { x: '', y: '', f: 'x' };
  return '';
}

function openItem(index) {
  const item = S.challenge.today.items[index];
  if (!item) { run = null; renderChallenge(); return; }
  if (item.kind === 'puzzle') {
    run = { index, item, round: makeRound(item.game, item.seed), answered: null };
    draw(); say(run.round.say); return;
  }
  const problem = seededProblem(S, item);
  run = { index, item, problem, answered: null, input: blank(problem?.answer.kind) };
  draw();
  if (problem) say(spokenText(problem));
}

function draw() {
  if (!run) return;
  const why = run.round ? run.round.why : skillWhy(run.problem);
  mount(challengePlayHTML(run, why));
}

function skillWhy(p) {
  return p?.why || p?.ways?.[0]?.s?.at(-1) || p?.hint || 'Look at the pieces and try again.';
}

export function playChallenge() {
  const set = syncChallenge(S, today());
  save();
  const index = set.items.findIndex(it => !it.status);
  if (index < 0) { run = null; renderChallenge(); return; }
  openItem(index);
}

function showAnswer(ok, pick) {
  run.answered = { ok, pick };
  draw();
  const why = run.round ? run.round.why : becauseText(run.problem);
  const lead = run.problem ? resultText(ok ? 'right' : 'reveal', run.problem) : (ok ? 'Yes, that is right.' : 'Not yet.');
  say(`${lead} ${why}`);
}

export function chooseChallenge(el) {
  if (!run || run.answered) return;
  if (run.round) {
    const r = checkRound(run.round, el.dataset.id);
    if (!r.known) return;
    showAnswer(r.ok, el.dataset.id);
    return;
  }
  const i = +el.dataset.i;
  showAnswer(i === run.problem.answer.correct, i);
}

function inputValue() {
  const kind = run.problem.answer.kind;
  if (kind === 'num') return run.input;
  if (kind === 'point') {
    if (run.input.x === '' || run.input.y === '') return null;
    return { x: Number(run.input.x), y: Number(run.input.y) };
  }
  return run.input;
}

export function checkChallenge() {
  if (!run || run.answered || run.round) return;
  if (!run.problem) { showAnswer(false, null); return; }
  const input = inputValue();
  if (input == null) return;
  const result = check(run.problem.answer, input);
  if (result.empty) return;
  showAnswer(!!result.ok, null);
}

function record(item, ok) {
  if (item.kind === 'puzzle' || !item.skill) return;
  const sk = skillState(S, item.skill);
  if (item.kind === 'review' && sk.mastered) recordReview(sk, ok ? 'right' : 'wrong', today());
  else recordSkill(S, item.skill, ok ? 'right' : 'wrong');
  if (ok) S.stars += 1;
}

export function nextChallengeItem() {
  if (!run?.answered) return;
  const res = noteAnswer(S, today(), run.index, run.answered.ok);
  if (res && !res.already) record(run.item, run.answered.ok);
  save();
  if (res?.done) { run = null; renderChallenge(); return; }
  openItem(run.index + 1);
}

export function hearChallenge() {
  if (!run) return;
  say(run.round ? run.round.say : spokenText(run.problem));
}

export function focusChallenge(field) {
  if (!run || run.answered || typeof run.input !== 'object') return;
  run.input.f = field;
  draw();
}

function typeInto(obj, field, k) {
  if (k === 'del') obj[field] = obj[field].slice(0, -1);
  else if (k === 'sign') obj.neg = !obj.neg;
  else if (k !== '.' && obj[field].length < 8) obj[field] += k;
}

export function typeChallenge(k) {
  if (!run || run.answered || run.round || !run.problem) return;
  const kind = run.problem.answer.kind;
  if (kind === 'num') run.input = typeNum(run.input, k, !!run.problem.answer.signed);
  else typeInto(run.input, run.input.f, k);
  draw();
}

function typeNum(cur, k, signed) {
  let s = cur || '';
  if (k === 'del') return s.slice(0, -1);
  if (k === 'sign' && signed) return s.startsWith('-') ? s.slice(1) : `-${s}`;
  if (k === '.' && s.includes('.')) return s;
  if (k === 'sign' || s.length >= 12) return s;
  return s + k;
}
