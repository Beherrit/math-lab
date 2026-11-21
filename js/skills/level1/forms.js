// Question shapes shared by the level 1 number skills: a slip to find, true or false, an estimate, and "no repeats".
import { pick, b, way, nm, num, choice } from '../../util.js';

// Remembers the last few problems made at one place, so the same pair does not come round again straight away.
export function noRepeat(size = 8) {
  const seen = [];
  return (make, keyOf) => {
    let p;
    for (let i = 0; i < 20; i++) {
      p = make();
      const key = keyOf(p);
      if (!seen.includes(key)) { seen.push(key); if (seen.length > size) seen.shift(); break; }
    }
    return p;
  };
}
// A number that is close to `s` but not equal to it (a believable wrong result), kept between 0 and `max`.
export function nearMiss(s, max = 20) {
  let r;
  do { r = s + pick([-2, -1, 1, 2]); } while (r > max || r < 0);
  return r;
}
const SIGN = { add: '+', sub: '−' };
const answerOf = (a, c, op) => (op === 'add' ? a + c : a - c);
const tOf = (a, c, op) => (op === 'add' ? { f: 'add', xs: [a, c] } : { f: 'sub', a, b: c });

// "Sam says 48 + 37 = 75. What is the correct answer?" `slip` says in words what went wrong; `ways` are the usual solutions.
export function errorQ({ a, c, op, wrong, slip, ways, hint }) {
  const ans = answerOf(a, c, op);
  return { ask: `${nm()} says that ${a} ${SIGN[op]} ${c} = ${b(wrong)}. That has a slip in it. What is the correct answer?`, expr: `${a} ${SIGN[op]} ${c}`, answer: num(ans), hint, _t: tOf(a, c, op),
    ways: [way('Find the slip', [slip, `Do it again, carefully: ${a} ${SIGN[op]} ${c} = ${b(ans)}.`]), ...ways] };
}

// "True or false?" about a number sentence. `left` and `right` are plain arithmetic; `why` are the worked lines.
// `alt` is an optional second worked way (a way object) that replaces the plain "compare the two sides".
export function tfQ({ left, right, ok, why, hint, alt }) {
  return { ask: 'True or false?', expr: `${left} = ${right}`, answer: choice(ok ? 'True' : 'False', [], { all: ['True', 'False'] }), choiceBig: true, hint, _t: { f: 'tf', ok },
    ways: [way('Work out each side', why), alt || way('Compare the two sides', [ok ? 'Both sides come to the same number, so the sentence is true.' : 'The two sides come to different numbers, so the sentence is false.'])] };
}

const near10 = n => Math.round(n / 10) * 10;
// "Which is the best estimate for a + c?" Each number is rounded to the nearest ten. The wrong choices are a whole 100 or more away.
export function estQ({ a, c, op }) {
  const ra = near10(a), rc = near10(c), est = answerOf(ra, rc, op), exact = answerOf(a, c, op), sg = SIGN[op];
  return { ask: `Which is the best estimate for ${a} ${sg} ${c}? Round each number to the nearest ten first.`, choiceBig: true, _t: { f: 'est', op, a, c },
    answer: choice(String(est), [est + 100, est + 200, est >= 100 ? est - 100 : est + 300].map(String)),
    hint: `Round ${a} and ${c} to the nearest ten, then ${op === 'add' ? 'add' : 'subtract'} them.`,
    ways: [way('Round, then calculate', [`${a} is close to ${ra}, and ${c} is close to ${rc}.`, `${ra} ${sg} ${rc} = ${b(est)}.`]),
      way('Check against the exact answer', [`The exact answer is ${exact}.`, `${exact} is close to ${b(est)}, so the estimate is sensible.`])] };
}
