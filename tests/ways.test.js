// Method skills: a picture on the question, at least two pictured ways, and a card that says why.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILL, generate } from '../js/skills/registry.js';

const IDS = ['l1bonds', 'l1break', 'l1bar', 'l2equal', 'l2sticks', 'l2eleven', 'l2five', 'l2lattice', 'l2peasant', 'l2short'];
const CARDS = ['l1add20', 'l1jump', 'l2area2', 'l2tricks', ...IDS];

test('method skills explain why, and each way can show a picture', () => {
  for (const id of CARDS) {
    const why = SKILL[id].learn.card?.why || '';
    assert.ok(why.length > 40, `${id}: why card`);
    assert.match(why, /so /, `${id}: the card should say why`);
    assert.doesNotMatch(why, /\bgrade\b/i);
  }
  for (const id of IDS) for (const L of [1, 2, 3]) {
    const p = generate(id, L);
    assert.match(p.visual, /<svg/, `${id} L${L}: picture on the question`);
    assert.ok(p.ways.length >= 2, `${id}: two ways`);
    const pictured = p.ways.filter(w => w.s.some(step => step.includes('<svg')));
    assert.ok(pictured.length >= 2, `${id} L${L}: two pictured ways`);
  }
});
