// Plays one puzzle at a time. Answers are not scored and do not change mastery.
import { S } from '../core/store.js';
import { speak } from '../core/speech.js';
import { readAloudOn } from '../core/say.js';
import { gameMeta, makeRound, checkRound } from '../games/catalog.js';
import { chimeResult } from '../core/sound.js';
import { mount } from '../ui/dom.js';
import { gameScreen } from '../ui/screens/game-play.js';
import { renderGames } from '../ui/screens/games.js';

let run = null;

function say(text) { if (S && readAloudOn(S) && text) speak(text); }

function draw() {
  if (!run) return;
  mount(gameScreen(run.meta, run.round, run.result));
}

export function beginGame(id) {
  const meta = gameMeta(id);
  if (!meta) { run = null; renderGames(); return; }
  run = { meta, n: 1, salt: Date.now(), round: null, result: null };
  deal();
}

function deal() {
  run.result = null;
  run.round = makeRound(run.meta.id, `${run.meta.id}:${run.salt}:${run.n}`, S.level);
  draw();
  say(run.round.say);
}

export function pickGame(choiceId) {
  if (!run || run.result) return;
  const r = checkRound(run.round, choiceId);
  if (!r.known) return;
  run.result = { ok: r.ok, pick: choiceId };
  chimeResult(S, r.ok);
  draw();
  say(`${r.ok ? 'Yes.' : 'Not yet.'} ${run.round.why}`);
}

export function nextGameRound() {
  if (!run) return;
  run.n += 1;
  deal();
}

export function hearGame() { if (run?.round) say(run.round.say); }
