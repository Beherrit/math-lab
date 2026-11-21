import test from 'node:test';
import assert from 'node:assert/strict';
import { gameList, makeRound, checkRound } from '../js/games/catalog.js';

const IDS = ['kpattern', 'kfit', 'kten', 'g1jump', 'g1clock', 'g1shape', 'g3split', 'g4bars', 'g5order', 'g6mix', 'g6balance', 'g7signs', 'g8squares'];

function truth(round) {
  const f = round.facts;
  if (round.game === 'kpattern') return f.unit[f.shown % f.unit.length];
  if (round.game === 'kfit') return f.pieces.find(p => p.count === f.spaces).id;
  if (round.game === 'g1jump') return String(f.land);
  if (round.game === 'g1clock') return f.right;
  if (round.game === 'g1shape') return f.made;
  if (round.game === 'g3split') return `${f.h} × ${f.s} + ${f.h} × ${f.t}`;
  if (round.game === 'g4bars') return (f.n1 / f.d1 > f.n2 / f.d2 ? `${f.n1}/${f.d1}` : `${f.n2}/${f.d2}`);
  if (round.game === 'g5order') return String(f.a + f.b * f.c);
  if (round.game === 'g6mix') return `${f.a * f.m}:${f.b * f.m}`;
  if (round.game === 'g6balance') return String(f.c - f.a);
  if (round.game === 'g7signs') return String(f.a * f.c);
  if (round.game === 'g8squares') return String(f.a * f.a + f.c * f.c);
  return String(10 - f.filled);
}

test('puzzles are tied to a lesson', () => {
  const list = gameList();
  assert.deepEqual(list.map(g => g.id), IDS);
  for (const g of list) assert.ok(g.title && g.blurb && g.skill);
});

for (const id of IDS) {
  test(`${id} is solvable, stable, and checked against the picture`, () => {
    const seeds = Array.from({ length: 40 }, (_, i) => `${id}-seed-${i}`);
    for (const seed of seeds) {
      const a = makeRound(id, seed);
      const b = makeRound(id, seed);
      assert.equal(a.answer, b.answer);
      assert.deepEqual(a.facts, b.facts);
      assert.ok(a.prompt && a.say && a.visual && a.why.length > 20);
      assert.ok(a.choices.length >= 2 && a.choices.length <= 4);
      assert.equal(new Set(a.choices.map(c => c.id)).size, a.choices.length);
      const right = truth(a);
      assert.equal(a.answer, right, `answer does not match the picture for ${id}`);
      assert.ok(a.choices.some(c => c.id === right));
      assert.equal(checkRound(a, right).ok, true);
      const wrong = a.choices.find(c => c.id !== right);
      assert.equal(checkRound(a, wrong.id).ok, false);
      assert.match(checkRound(a, wrong.id).why, /\w/);
      assert.equal(checkRound(a, 'not-a-choice').known, false);
      assert.equal(checkRound(a, 'not-a-choice').ok, false);
    }
  });
}

test('make ten really makes ten', () => {
  for (let i = 0; i < 20; i++) {
    const round = makeRound('kten', i + 3);
    assert.equal(round.facts.filled + round.facts.need, 10);
    assert.ok(round.facts.filled >= 1 && round.facts.filled <= 9);
  }
});
