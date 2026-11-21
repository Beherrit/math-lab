import test from 'node:test';
import assert from 'node:assert/strict';
import { gameList, makeRound, checkRound } from '../js/games/catalog.js';

const IDS = ['kpattern', 'kfit', 'kten', 'g1jump', 'g1clock', 'g1shape', 'g3split', 'g4bars', 'g5order', 'g6mix', 'g6balance', 'g7signs', 'g8squares', 'g9cross', 'g9corner', 'g9growth', 'g9secant', 'magic', 'kenken', 'gap', 'guess', 'build', 'riddle', 'match', 'pizza', 'target', 'weights', 'treasure', 'shop', 'later', 'mirror', 'spin', 'machine', 'sort'];
const NEED = { rect: 'triangle', house: 'triangle', window: 'square', peak: 'triangle' };

function closest(target, picks) {
  return picks.reduce((best, n) => (Math.abs(n - target) < Math.abs(best - target) ? n : best));
}

function fitsClue(n, f) {
  if (n <= f.lo || n >= f.hi) return false;
  if (f.even && n % 2 !== 0) return false;
  if (f.mult && n % f.mult !== 0) return false;
  if (f.not && n % f.not === 0) return false;
  return true;
}

function lineEqn(m, b) {
  const slope = m === 1 ? 'x' : m === -1 ? '-x' : `${m}x`;
  if (b === 0) return `y = ${slope}`;
  if (b > 0) return `y = ${slope} + ${b}`;
  return `y = ${slope} - ${-b}`;
}

function truth(round) {
  const f = round.facts;
  if (round.game === 'magic') {
    const row = f.rows.find(r => r.includes(0));
    return String(f.sum - row.reduce((a, b) => a + b, 0));
  }
  if (round.game === 'kenken') {
    const known = f.known.reduce((a, b) => (f.op === 'add' ? a + b : a * b), f.op === 'add' ? 0 : 1);
    return String(f.op === 'add' ? f.target - known : f.target / known);
  }
  if (round.game === 'gap' && f.kind === 'shape') return f.unit[f.index % f.unit.length];
  if (round.game === 'gap') return String(f.op === 'mul' ? f.start * f.step ** f.index : f.start + f.step * f.index);
  if (round.game === 'guess') return String(closest(f.mode === 'jar' ? f.count : f.mark, f.picks));
  if (round.game === 'build') return NEED[f.kit];
  if (round.game === 'riddle') {
    const ok = f.picks.filter(n => fitsClue(n, f));
    return ok.length === 1 ? String(ok[0]) : 'not-unique';
  }
  if (round.game === 'match') return f.y === f.m * f.x + f.b ? lineEqn(f.m, f.b) : 'off-line';
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
  if (round.game === 'g9cross') return String((f.b2 - f.b1) / (f.m1 - f.m2));
  if (round.game === 'g9corner') return String(f.a * f.b);
  if (round.game === 'g9growth') {
    const mul = f.s * f.m ** f.step;
    const sum = f.s + f.add * f.step;
    return mul > sum ? 'mul' : sum > mul ? 'add' : 'same';
  }
  if (round.game === 'g9secant') return Math.abs(3 - 2) < Math.abs((2 + f.h) - 2) ? 'short' : 'long';
  if (round.game === 'pizza') return `${f.n}/${f.d}`;
  if (round.game === 'target') return targetCode(f);
  if (round.game === 'weights') return `add:${f.left < f.right ? 'left' : 'right'}:${Math.abs(f.left - f.right)}`;
  if (round.game === 'treasure') return `(${f.x}, ${f.y})`;
  if (round.game === 'shop') return String(f.paid - f.price);
  if (round.game === 'later') return f.ask === 'gap' ? String(f.add) : laterStamp(f);
  if (round.game === 'mirror') return f.left.map(row => row.concat([...row].reverse()).join('')).join('-');
  if (round.game === 'spin') return String(f.spins * f.red / f.total);
  if (round.game === 'machine') return f.kind === 'add' ? `add ${f.k}` : f.kind === 'mul' ? `times ${f.k}` : `times ${f.m}, then add ${f.k}`;
  if (round.game === 'sort') return f.mode === 'count' ? String(f.n) : f.color;
  return String(10 - f.filled);
}

function targetCode(f) {
  const run = { '+': (a, b) => a + b, '-': (a, b) => a - b, x: (a, b) => a * b };
  let v = f.nums[0];
  let s = String(f.nums[0]);
  for (let i = 0; i < f.ops.length; i++) {
    v = run[f.ops[i]](v, f.nums[i + 1]);
    s = `(${s} ${f.ops[i]} ${f.nums[i + 1]})`;
  }
  return v === f.value ? s : 'bad-target';
}

function laterStamp(f) {
  const mins = (f.h % 12) * 60 + f.m + f.add;
  const hour = Math.floor(mins / 60) % 12;
  return `${hour === 0 ? 12 : hour}:${String(mins % 60).padStart(2, '0')}`;
}

test('puzzles are tied to a lesson', () => {
  const list = gameList();
  assert.deepEqual(list.map(g => g.id), IDS);
  for (const g of list) assert.ok(g.title && g.blurb && g.skill);
});

for (const id of IDS) {
  test(`${id} is solvable, stable, and checked against the picture`, () => {
    const seeds = Array.from({ length: 40 }, (_, i) => `${id}-seed-${i}`);
    const levels = gameList().find(g => g.id === id).levels || [undefined];
    for (const level of levels) {
      for (const seed of seeds) {
        const a = makeRound(id, seed, level);
        const b = makeRound(id, seed, level);
        assert.equal(a.answer, b.answer);
        assert.deepEqual(a.facts, b.facts);
        assert.ok(a.prompt && a.say && a.visual && a.why.length > 20);
        assert.ok(a.choices.length >= 2 && a.choices.length <= 4);
        assert.equal(new Set(a.choices.map(c => c.id)).size, a.choices.length);
        const right = truth(a);
        assert.equal(a.answer, right, `answer does not match the picture for ${id} at ${level}`);
        assert.ok(a.choices.some(c => c.id === right));
        assert.equal(checkRound(a, right).ok, true);
        const wrong = a.choices.find(c => c.id !== right);
        assert.equal(checkRound(a, wrong.id).ok, false);
        assert.match(checkRound(a, wrong.id).why, /\w/);
        assert.equal(checkRound(a, 'not-a-choice').known, false);
        assert.equal(checkRound(a, 'not-a-choice').ok, false);
        const spoken = `${a.prompt} ${a.why} ${a.choices.map(c => c.label).join(' ')}`;
        assert.doesNotMatch(spoken, /[←-⇿☀-➿…]/u);
        assert.doesNotMatch(spoken, /grade/i);
      }
    }
  });
}

test('each new puzzle covers its grade range and says why', () => {
  const ranges = { magic: [0, 1], kenken: [1, 2, 3, 4], gap: [0, 1, 2], guess: [1, 2, 3, 4, 5], build: [0, 1, 2, 3], riddle: [3, 4, 5, 6, 7], match: [7, 8] };
  const why = { magic: /sum/, kenken: /cage/, gap: /pattern|empty box/, guess: /clos/, build: /piece/, riddle: /clue/, match: /slope/ };
  for (const [id, levels] of Object.entries(ranges)) {
    assert.deepEqual(gameList().find(g => g.id === id).levels, levels);
    for (const level of levels) {
      const round = makeRound(id, `${id}-${level}`, level);
      assert.match(round.why, why[id]);
      if (id === 'guess') {
        const target = round.facts.mode === 'jar' ? round.facts.count : round.facts.mark;
        const near = round.facts.picks.filter(n => Math.abs(n - target) === Math.abs(Number(round.answer) - target));
        assert.deepEqual(near, [Number(round.answer)]);
      }
      if (id === 'build') assert.ok(round.choices.some(c => c.id === 'circle' && c.id !== round.answer));
    }
  }
});

test('the second set of puzzles covers its grades and says why', () => {
  const ranges = {
    pizza: [1, 2, 3, 4], target: [2, 3, 4, 5, 6, 7], weights: [4, 5, 6, 7, 8], treasure: [4, 5, 6, 7],
    shop: [1, 2, 3], later: [1, 2], mirror: [1, 2, 3, 4, 5], spin: [5, 6, 7, 8], machine: [2, 3, 4, 5, 6, 7, 8], sort: [0],
  };
  const why = { pizza: /equal pieces/, target: /once each/, weights: /balance/, treasure: /Across/, shop: /Change/, later: /minutes/, mirror: /mirror/, spin: /expect/, machine: /every row/, sort: /color/ };
  for (const [id, levels] of Object.entries(ranges)) {
    assert.deepEqual(gameList().find(g => g.id === id).levels, levels);
    for (const level of levels) assert.match(makeRound(id, `${id}-${level}`, level).why, why[id]);
  }
});

test('make ten really makes ten', () => {
  for (let i = 0; i < 20; i++) {
    const round = makeRound('kten', i + 3);
    assert.equal(round.facts.filled + round.facts.need, 10);
    assert.ok(round.facts.filled >= 1 && round.facts.filled <= 9);
  }
});
