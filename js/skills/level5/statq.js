// Statistical questions, and the shape of data on a dot plot: gaps, peaks, clusters and spread.
import { rnd, pick, chance, shuffle, b, way, num, choice } from '../../util.js';
import { T, sum } from './helpers.js';
import { dotPlot } from './visuals.js';
import { DOTS } from './plots.js';

// Statistical questions name a group and expect answers that vary. The other kind has one answer.
const STAT_NUM = ['How many pets do the students in our class have?', 'How many minutes do the students in Room 6 spend on homework each night?', 'How many goals do the players on our soccer team score in a match?', 'How many siblings do my classmates have?',
  'How many hours do the riders in a bike club ride each week?', 'How many books did the kids on our street read in June?', 'How many minutes does it take the students in our school to walk to class?'];
const STAT_WORD = ['Which pizza topping do the students in our class like best?', 'What kinds of pets do the families on our street have?', 'What is the favorite sport of the players on our school teams?'];
const NOT = ['How many pets does Maya have?', 'How many minutes did Leo spend on homework last night?', 'How many goals did our team score in last Saturday’s match?', 'How tall is the school flagpole?', 'What is the capital of France?', 'How many days are in March?',
  'How many sides does a hexagon have?', 'How old is our teacher?', 'What time does the bus leave today?', 'How long is the school hallway?', 'How many seats does the school bus have?'];
const WHY = 'A statistical question expects different answers from different people or times, so you need to collect data to answer it. A question with one fixed answer is not statistical.';

function which(L) {
  const good = pick(L === 1 ? STAT_NUM : [...STAT_NUM, ...STAT_WORD]), others = shuffle(NOT).slice(0, 3);
  return T({ ask: 'Which of these is a statistical question?', answer: choice(good, others), choiceBig: true,
    ways: [way('Will the answers vary?', [WHY, `“${good}” is about a whole group, and each member can give a different answer. The other choices each have one answer.`, `So the statistical question is ${b(good)}`]),
      way('Ask who could answer', [`If everybody must give the same answer, it is not statistical. Try each choice.`, `Only ${b(good)} would get different answers from different people.`])],
    hint: 'Which question would get different answers from different people? Which one has just one answer?' }, 'sqWhich', { good, others });
}
function yesNo(L) {
  const stat = chance(0.5), q = pick(stat ? (L === 1 ? STAT_NUM : [...STAT_NUM, ...STAT_WORD]) : NOT);
  return T({ ask: `Is this a statistical question? ${b(q)}`, answer: choice(stat ? 'Yes' : 'No', [], { all: ['Yes', 'No'] }), choiceBig: true,
    ways: [way('Will the answers vary?', [WHY, stat ? 'This question is about a whole group, and the answers will differ from person to person.' : 'This question has one answer that does not change from person to person.', `The answer is ${b(stat ? 'Yes' : 'No')}.`]),
      way('Picture the answers', [`Imagine asking ${stat ? 'everyone in the group' : 'ten different people'}.`, stat ? `You would get a mix of answers. That means ${b('Yes')}: it is a statistical question.` : `You would get the same answer from everyone. That means ${b('No')}: it is not statistical.`])],
    hint: 'Imagine asking many people. Would they all give the same answer?' }, 'sqYesNo', { q });
}
function answers() {
  const q = pick(STAT_NUM), n = rnd(5, 7), vs = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 4), varied = Array.from({ length: n }, (_, i) => (i < 4 ? vs[i] : pick(vs))).join(', '), same = Array(n).fill(vs[0]).join(', ');
  return T({ ask: `${b(q)} Which list of answers could come from asking this question to a group?`, answer: choice(varied, [same, String(vs[0]), Array.from({ length: n }, () => pick(['yes', 'no'])).join(', ')]), choiceBig: true,
    ways: [way('Look for variety', [WHY, `Answers to this question should be numbers that differ from person to person. ${varied} is a mix of different numbers.`, `A list of the same number over and over, one single number, or yes and no, does not fit. The answer is ${b(varied)}.`]),
      way('Check each list', [`The question asks for a number from each person, so the list needs several numbers.`, `It must also vary: a list where everyone says ${vs[0]} would not make a statistical question worth asking. So ${b(varied)}.`])],
    hint: 'Each person gives a number, and different people give different numbers. Which list looks like that?' }, 'sqAnswers', { q });
}
// ---- Dot plot shapes ----
const dots = (counts, lo, title) => dotPlot(lo, counts, title);
// Strictly rising to a top h, then strictly falling: exactly one peak.
const pyramid = h => { const l = rnd(1, Math.min(3, h - 1)), r = rnd(1, Math.min(3, h - 1)); return [...Array.from({ length: l }, (_, i) => h - l + i), h, ...Array.from({ length: r }, (_, i) => h - 1 - i)]; };
function gap() {
  const [title, lo] = pick(DOTS); let counts;
  do { counts = Array.from({ length: 7 }, () => rnd(1, 4)); counts[rnd(1, 5)] = 0; } while (sum(counts) > 17);
  const at = lo + counts.findIndex((c, i) => i > 0 && i < 6 && c === 0);
  return T({ ask: `Which value has no dots at all, a gap in the data? The data is “${title.toLowerCase()}”.`, visual: dots(counts, lo, title), answer: num(at),
    ways: [way('Scan along the line', [`A gap is a value with no dots, with dots on both sides of it.`, `Move along the number line and look for a value with an empty space above it: ${b(at)}.`]), way('Count stack by stack', [`Stack heights from left to right: ${counts.join(', ')}.`, `The 0 sits above the value ${b(at)}, so that is where the gap is.`])],
    hint: 'Look for the number on the line that has no dots above it, with dots on both sides.' }, 'sqGap', { lo, counts });
}
function peaks(two) {
  const [title, lo] = pick(DOTS), counts = two ? [...pyramid(rnd(4, 6)), 0, ...pyramid(rnd(4, 6))] : pyramid(rnd(4, 6));
  const n = two ? 2 : 1;
  return T({ ask: `How many peaks does this dot plot have? A peak is a stack taller than the stacks on both sides of it.`, visual: dots(counts, lo, title), answer: num(n),
    ways: [way('Look for tall stacks', [`Check each stack against its two neighbours. A peak is taller than both.`, `The stack heights are ${counts.join(', ')}. ${n === 1 ? 'Only one stack is taller than both neighbours' : 'Two stacks are taller than both neighbours, with a dip between them'}: ${b(n)} peak${n > 1 ? 's' : ''}.`]),
      way('Follow the shape', [`Trace the tops of the stacks from left to right. Each time the shape climbs and then falls, that is a peak.`, `The shape ${n === 1 ? 'climbs once and falls once' : 'climbs, falls, then climbs and falls again'}: ${b(n)}.`])],
    hint: 'Trace the tops of the stacks from left to right. How many times does the shape go up and then down?' }, 'sqPeak', { lo, counts });
}
// A tight cluster of three neighbouring values with a few stragglers on the sides.
function cluster(len) {
  const [title, lo] = pick(DOTS);
  for (;;) {
    const s = rnd(1, len - 4), counts = Array.from({ length: len }, (_, i) => (i >= s && i < s + 3 ? rnd(3, 6) : rnd(0, 1))), win = i => counts[i] + counts[i + 1] + counts[i + 2], best = Math.max(...counts.slice(0, len - 2).map((_, i) => win(i)));
    if (win(s) !== best || counts.slice(0, len - 2).filter((_, i) => win(i) === best).length > 1 || counts[0] === 0 || counts[len - 1] === 0) continue;
    const text = i => `${lo + i} to ${lo + i + 2}`, wrong = shuffle([...Array(len - 2).keys()].filter(i => i !== s && Math.abs(i - s) >= 2)).slice(0, 3).map(text);
    if (wrong.length < 2) continue;
    return T({ ask: `Most of the data is close together. Between which two values is the cluster? The data is “${title.toLowerCase()}”.`, visual: dots(counts, lo, title), answer: choice(text(s), wrong), choiceBig: true,
      ways: [way('Find the crowded part', [`A cluster is where the dots bunch up. Stack heights: ${counts.join(', ')}.`, `The three neighbouring stacks with the most dots together are above ${b(text(s))} (${win(s)} dots).`]),
        way('Count in windows', [`Try three neighbouring values at a time and add the dots.`, `The window ${b(text(s))} holds ${win(s)} dots, more than any other window. That is the cluster.`])],
      hint: 'Look for the place where the stacks are tallest and closest together. Which values are underneath?' }, 'sqCluster', { lo, counts });
  }
}
const range = c => c.length - 1 - [...c].reverse().findIndex(x => x > 0) - c.findIndex(x => x > 0);
function spread() {
  const [title, lo] = pick(DOTS), tight = [0, 0, rnd(2, 4), rnd(3, 5), rnd(2, 4), 0, 0, 0, 0].map((c, i) => (i === 2 || i === 4 ? c : c)), wide = [rnd(1, 2), 0, rnd(1, 3), rnd(1, 2), rnd(1, 3), rnd(1, 2), 0, rnd(1, 2), rnd(1, 2)], aWide = chance(0.5);
  const A = aWide ? wide : tight, B = aWide ? tight : wide, win = aWide ? 'Class A' : 'Class B';
  return T({ ask: `Both classes were asked about “${title.toLowerCase()}”. Which class has data that is more spread out?`, visual: dots(A, lo, 'Class A') + dots(B, lo, 'Class B'), answer: choice(win, [], { all: ['Class A', 'Class B'] }), choiceBig: true,
    ways: [way('Compare the range', [`Spread tells how far apart the values are. Look at the smallest and biggest value with dots in each plot.`, `${win} stretches over ${range(aWide ? A : B)} steps, the other over ${range(aWide ? B : A)}. The wider one is more spread out: ${b(win)}.`]),
      way('Compare the pictures', [`In a tight cluster the dots sit close together. In a spread out plot they reach far to the left and right.`, `${b(win)} has dots reaching much further apart.`])],
    hint: 'Look at how far apart the first and last dots are in each plot. The larger distance means more spread.' }, 'sqSpread', { lo, cA: A, cB: B });
}
const SHAPES = { 1: [() => which(1), () => yesNo(1), answers, gap], 2: [() => which(2), answers, gap, () => peaks(false), () => cluster(7)], 3: [spread, () => cluster(9), () => peaks(true), () => yesNo(2), gap, () => peaks(false)] };
export const genStatQ = L => pick(SHAPES[L])();
