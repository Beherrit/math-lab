// Question shapes shared by the level 2 skills: true or false about a number sentence, and a slip to find.
import { b, way, nm, num, choice } from '../../util.js';

// "True or false?" about an equation such as 4 × 6 = 6 × 4. `why` are the worked lines.
export function tfQ({ expr, ok, why, hint, t = {} }) {
  return { ask: 'True or false?', expr, answer: choice(ok ? 'True' : 'False', [], { all: ['True', 'False'] }), choiceBig: true, hint, _t: { f: 'tf', ok, ...t },
    ways: [way('Work out each side', why), way('Compare the two sides', [ok ? 'Both sides come to the same number, so the sentence is true.' : 'The two sides come to different numbers, so the sentence is false.'])] };
}
// "Sam says 47 × 6 = 252. What is the correct answer?" `slip` says what went wrong; `t` is the usual _t for the calculation.
export function slipQ({ expr, wrong, answer, slip, ways, hint, t }) {
  return { ask: `${nm()} says that ${expr} = ${b(wrong)}. That has a slip in it. What is the correct answer?`, expr, answer: num(answer), hint, _t: t,
    ways: [way('Find the slip', [slip, `Do it again, carefully: ${expr} = ${b(answer)}.`]), ...ways] };
}
