// Adding within 100 with base-ten blocks, when the ones have to be traded for a ten.
import { rnd, b, way, num } from '../../util.js';
import { blocks } from './pics.js';
import { errorQ } from './forms.js';
import { mark } from './words.js';

const tens = n => Math.floor(n / 10);
const ones = n => n % 10;

function pair(maxSum) {
  for (let i = 0; i < 40; i++) {
    const a = rnd(8, Math.min(29, maxSum - 8));
    const c = rnd(5, Math.min(29, maxSum - a));
    if (ones(a) + ones(c) >= 10 && a + c <= maxSum) return [a, c];
  }
  return maxSum <= 40 ? [19, 16] : [48, 27];
}
function picture(a, c) {
  return `<div class="block-pair">${blocks(0, tens(a), ones(a))}${blocks(0, tens(c), ones(c))}</div>`;
}
function tag(a, c, kind) { return mark(a, c, kind); }

function sumQ(a, c) {
  const o = ones(a) + ones(c), t = tens(a) + tens(c) + 1;
  return {
    ask: 'Add the blocks. Trade 10 ones for a ten.' + tag(a, c, 'sum'),
    expr: `${a} + ${c}`, visual: picture(a, c), answer: num(a + c),
    hint: 'Add the ones. If you have 10 or more, trade 10 of them for a ten.',
    why: `${ones(a)} ones and ${ones(c)} ones make ${o}. That is more than 9, so 10 of them become 1 ten. Forgetting the trade leaves the answer 10 too small.`,
    _t: { f: 'add', xs: [a, c] },
    ways: [
      way('Trade the ones', [picture(a, c), `${ones(a)} ones + ${ones(c)} ones = ${o} ones.`, `Trade 10 ones for 1 ten. That leaves ${o - 10} ones and ${t} tens.`, `The total is ${b(a + c)}.`]),
      way('Add the numbers', [`${a} + ${c} = ${b(a + c)}.`]),
    ],
  };
}
function onesQ(a, c) {
  const o = ones(a) + ones(c);
  return {
    ask: 'How many ones are there before the trade?' + tag(a, c, 'ones'),
    visual: picture(a, c), answer: num(o),
    hint: 'Count the loose cubes only. A ten-rod is not an extra one.',
    why: `The rods are already tens. Only the cubes are ones: ${ones(a)} and ${ones(c)} make ${o}. Calling a rod one more one is the usual slip.`,
    _t: { f: 'add', xs: [ones(a), ones(c)] },
    ways: [
      way('Count the cubes', [picture(a, c), `One group has ${ones(a)} cubes and the other has ${ones(c)}.`, `${ones(a)} + ${ones(c)} = ${b(o)}.`]),
      way('Look at the ones digits', [`${a} has ${ones(a)} ones and ${c} has ${ones(c)} ones.`, `Together that is ${b(o)} ones, before any trade.`]),
    ],
  };
}
function tensQ(a, c) {
  const t = tens(a) + tens(c) + 1;
  return {
    ask: 'How many tens are there after the trade?' + tag(a, c, 'tens'),
    visual: picture(a, c), answer: num(t),
    hint: 'Count the rods, then add the ten you get from 10 ones.',
    why: `There are ${tens(a) + tens(c)} rods already, and the ones make one more ten. Stopping at the rods leaves the tens one short.`,
    _t: { f: 'add', xs: [tens(a), tens(c), 1] },
    ways: [
      way('Rods, plus the trade', [picture(a, c), `${tens(a)} tens and ${tens(c)} tens are ${tens(a) + tens(c)} tens.`, `10 ones trade for 1 more ten.`, `That is ${b(t)} tens.`]),
      way('From the total', [`${a} + ${c} = ${a + c}.`, `The tens digit after the trade is ${b(t)}.`]),
    ],
  };
}
function slipQ(a, c) {
  const wrong = a + c - 10;
  const p = errorQ({
    a, c, op: 'add', wrong,
    hint: 'Check the ones. Did 10 of them become a ten?',
    slip: `The ones came to more than 9, but 10 ones were never traded for 1 ten, so the answer is 10 short.`,
    ways: [way('Do the trade', [`${ones(a)} + ${ones(c)} = ${ones(a) + ones(c)} ones.`, `Trade 10 of them for 1 ten.`, `${a} + ${c} = ${b(a + c)}.`])],
  });
  p.visual = picture(a, c);
  p.ask += tag(a, c, 'slip');
  p.why = `The ones are ${ones(a) + ones(c)}, so a ten has to move over. ${wrong} is the total with that ten missing. The real total is ${a + c}.`;
  return p;
}

export function genTrade(L) {
  const [a, c] = pair(L === 1 ? 40 : 99);
  const kind = ['sum', 'sum', 'ones', 'tens', 'slip'][rnd(0, 4)];
  if (kind === 'ones') return onesQ(a, c);
  if (kind === 'tens') return tensQ(a, c);
  if (kind === 'slip') return slipQ(a, c);
  return sumQ(a, c);
}
