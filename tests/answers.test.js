import test from 'node:test';
import assert from 'node:assert/strict';
import { num, frac, check, answerHTML, pow, signedLine, fr, fmt } from '../js/util.js';
test('num: existing calls keep working and are unsigned', () => {
  assert.equal(num(5).signed, false);
  assert.equal(check(num(5), '5').ok, true);
  assert.equal(check(num(0.3), '0.3').ok, true);
  assert.equal(check(num(5), '').empty, true);
  assert.equal(check(num(5), '.').empty, true);
});
test('num: signed values compare correctly', () => {
  const a = num(-7, { signed: true });
  assert.equal(a.signed, true);
  assert.equal(check(a, '-7').ok, true);
  assert.equal(check(a, '7').ok, false);
  assert.equal(check(a, '−7').ok, true);
  assert.equal(check(a, '-').empty, true);
  assert.equal(check(num(7, { signed: true }), '-7').ok, false);
  assert.equal(check(num(-2.5), '-2.5').ok, true);
  assert.equal(num(-1).signed, true);
});
test('num: zero is zero either way', () => {
  assert.equal(check(num(0, { signed: true }), '-0').ok, true);
});
test('frac: negative sign', () => {
  const a = frac(-3, 4, { signed: true });
  assert.deepEqual([a.n, a.d, a.signed], [-3, 4, true]);
  assert.equal(check(a, { w: '', n: '3', d: '4', neg: true }).ok, true);
  assert.equal(check(a, { w: '', n: '3', d: '4', neg: false }).ok, false);
  assert.equal(check(a, { w: '', n: '6', d: '8', neg: true }).ok, true);
  assert.equal(check(frac(3, -4), { w: '', n: '3', d: '4', neg: true }).ok, true);
  assert.equal(check(frac(3, 4), { w: '', n: '3', d: '4' }).ok, true);
});
test('frac: negative mixed numbers', () => {
  const a = frac(-7, 4, { signed: true });
  assert.equal(check(a, { w: '1', n: '3', d: '4', neg: true }).ok, true);
});
test('display of negatives uses the minus sign', () => {
  assert.equal(answerHTML(num(-4)), '−4');
  assert.equal(fmt(-1.5), '−1.5');
  assert.ok(fr(-3, 4).startsWith('−'));
});
test('pow renders an exponent', () => assert.equal(pow(10, 3), '10<sup>3</sup>'));
test('signedLine draws labelled ticks through zero and the points', () => {
  const svg = signedLine(-5, 5, { points: [{ v: -3, label: 'A' }, { v: 2, label: 'B' }] });
  assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'));
  assert.equal((svg.match(/class="tick"/g) || []).length, 11);
  assert.ok(svg.includes('−5') && svg.includes('>A<') && svg.includes('>B<'));
});
