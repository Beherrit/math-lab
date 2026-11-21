// Percents: a rate per 100, percent of a number, and finding the whole from a part.
import { R, rnd, pick, chance, gcd, fmt, plain, money, F, b, k, way, nm, num, table } from '../../util.js';
import { T } from './helpers.js';
import { hundredGrid, pctBar } from './visuals.js';

const dec = p => plain(p / 100);
// Steps that build p% of n out of easy chunks (10%, 5%, 1%).
function chunkSteps(p, n) {
  const tens = Math.floor(p / 10), five = p % 10 >= 5 ? 1 : 0, ones = p % 5, ten = R(n / 10), out = [`10% is one tenth: ${fmt(n)} ÷ 10 = ${b(fmt(ten))}`], parts = [];
  if (tens) { parts.push(fmt(R(ten * tens))); if (tens > 1) out.push(`${tens * 10}% is ${tens} of those: ${tens} × ${fmt(ten)} = ${fmt(R(ten * tens))}`); }
  if (five) { parts.push(fmt(R(ten / 2))); out.push(`5% is half of 10%: ${fmt(ten)} ÷ 2 = ${fmt(R(ten / 2))}`); }
  if (ones) { parts.push(fmt(R(n / 100 * ones))); out.push(`1% is ${fmt(n)} ÷ 100 = ${fmt(R(n / 100))}, so ${ones}% is ${fmt(R(n / 100 * ones))}`); }
  out.push(parts.length > 1 ? `Add the chunks: ${parts.join(' + ')} = ${b(fmt(R(p * n / 100)))}` : `So ${p}% of ${fmt(n)} is ${b(fmt(R(p * n / 100)))}`);
  return out;
}
const decWay = (p, n) => way('Multiply by the decimal', [`Percent means “for every 100”. ${p}% = ${F(p, 100)} = ${dec(p)}`, `“Of” means multiply: ${dec(p)} × ${fmt(n)} = ${b(fmt(R(p * n / 100)))}`]);
function gridProblem() {
  const n = rnd(1, 99), free = chance(0.4);
  return T({ ask: free ? 'What percent of the big square is NOT shaded?' : 'What percent of the big square is shaded?', visual: hundredGrid(n), answer: num(free ? 100 - n : n), suffix: '%',
    ways: [way('Count per 100', [`The big square has 100 small squares, so each small square is 1%.`, `${n} are shaded: ${n} out of 100 = ${F(n, 100)} = ${n}%.`, ...(free ? [`Not shaded: 100 − ${n} = ${b(100 - n)}%`] : [`Answer: ${b(n)}%`])]),
      way('Count rows of ten', [`Each full row is 10 squares, which is 10%.`, `Shaded: ${Math.floor(n / 10)} full row${Math.floor(n / 10) === 1 ? '' : 's'} (${Math.floor(n / 10) * 10}%) and ${n % 10} more = ${n}%.`, ...(free ? [`The whole square is 100%, so ${100 - n}% is left.`] : [])])],
    hint: 'There are 100 small squares. Percent means “out of 100”.' }, 'grid', { n, free });
}
const EASY = { 50: [2, 'half'], 25: [4, 'a quarter'], 10: [10, 'a tenth'], 20: [5, 'a fifth'] };
function easyPercent() {
  const p = pick([50, 25, 10, 20]), [d, word] = EASY[p], n = d * rnd(2, 15);
  return T({ ask: `What is ${b(p + '%')} of ${b(n)}?`, visual: pctBar(d, 1, '0', String(n)), answer: num(n / d),
    ways: [way('Cut the bar', [`${p}% is ${p} out of 100. ${F(p, 100)} = ${F(1, d)}, so ${p}% is ${word}.`, `Cut ${n} into ${d} equal parts: ${n} ÷ ${d} = ${b(n / d)}`]), decWay(p, n)],
    hint: `${p}% is the same as ${word}. How do you find ${word} of a number?` }, 'pct', { p, n });
}
function percentOf(L) {
  const p = L === 2 ? pick([5, 15, 30, 35, 40, 45, 60, 65, 70, 75, 80, 90, 95]) : rnd(1, 99), n = L === 2 ? rnd(1, 20) * 20 : rnd(1, 9) * 100;
  if (L === 3 && p % 5 === 0) return percentOf(L);
  const bar = p % 5 === 0 ? pctBar(20, p / 5, '0', fmt(n)) : undefined;
  return T({ ask: `What is ${b(p + '%')} of ${b(fmt(n))}?`, visual: bar, answer: num(p * n / 100),
    why: `${p}% means ${p} out of every 100 of the number, not ${p} taken off it. A common slip is to subtract ${p}, or to treat ${p}% as the answer itself.`,
    ways: [way('Build it from easy chunks', chunkSteps(p, n)), decWay(p, n)],
    hint: 'Start with 10% of the number (divide by 10), then build up.' }, 'pct', { p, n });
}
// [thing, cheapest, dearest] in whole dollars, so the price before the discount is believable.
const SALE = [['jacket', 40, 200], ['pair of headphones', 40, 200], ['skateboard', 60, 160], ['backpack', 20, 100], ['video game', 20, 80], ['pair of sneakers', 40, 160], ['bike helmet', 20, 60]];
// Discount, tip or tax: find the percent, then take it off or add it on.
export function pctWord() {
  const off = chance(0.55), item = pick(SALE), p = pick(off ? [10, 15, 20, 25, 30, 40] : [5, 10, 15, 20]), n = (off ? rnd(item[1] / 20, item[2] / 20) : rnd(1, 5)) * 20, part = p * n / 100, ans = off ? n - part : n + part, who = nm();
  const story = off ? `A ${item[0]} costs ${k(money(n))}. Today it is ${k(p + '% off')}.` : `${who}'s restaurant bill is ${k(money(n))}. ${who} adds a ${k(p + '% tip')}.`;
  return T({ story, ask: off ? 'What is the sale price, in dollars?' : 'What is the total with the tip, in dollars?', answer: num(ans), op: 'multi',
    ways: [way('Find the percent, then ' + (off ? 'subtract' : 'add'), [...chunkSteps(p, n), off ? `Take it off the price: ${n} − ${fmt(part)} = ${b(money(ans))}` : `Add it to the bill: ${n} + ${fmt(part)} = ${b(money(ans))}`]),
      way('One multiplication', [off ? `${p}% off means you pay 100% − ${p}% = ${100 - p}% of the price.` : `The bill (100%) plus the tip (${p}%) is ${100 + p}% of the bill.`, `${dec(off ? 100 - p : 100 + p)} × ${n} = ${b(money(ans))}`])],
    read: { find: off ? 'The price after the discount.' : 'The bill and the tip together.', know: [money(n), `${p}%`], clue: off ? '“% off” means that part is taken away from the price.' : 'A tip is added on top of the bill.', plan: `${p}% of ${n}, then ${off ? 'subtract from' : 'add to'} ${n}` },
    hint: `First find ${p}% of ${n}. Then decide: does it come off or go on?` }, off ? 'pctOff' : 'pctAdd', { p, n });
}
export function genPct(L) {
  if (L === 1) return chance(0.4) ? gridProblem() : easyPercent();
  if (L === 2) return percentOf(2);
  return chance(0.55) ? pctWord() : percentOf(3);
}

// --- Finding the whole ---
// p% is (p / g) chunks of g%, and the whole is (100 / g) chunks.
function wholeWays(p, part) {
  const g = gcd(p, 100), have = p / g, all = 100 / g, chunk = R(part / have), whole = R(part * 100 / p);
  const steps = [pctBar(all, have, '0%', '100%'), `${p}% is ${have} chunk${have > 1 ? 's' : ''} of ${g}%. The whole is ${all} chunks.`];
  if (have > 1) steps.push(`One chunk (${g}%): ${fmt(part)} ÷ ${have} = ${b(fmt(chunk))}`);
  steps.push(`The whole (100%): ${fmt(chunk)} × ${all} = ${b(fmt(whole))}`);
  return [way('Find one chunk, then all of them', steps),
    way('Ratio table', [table(['percent', 'amount'], [[p + '%', fmt(part)], ...(have > 1 ? [[g + '%', fmt(chunk)]] : []), ['100%', b(fmt(whole))]]), have > 1 ? `Divide both columns by ${have}, then multiply both by ${all}.` : `Multiply both columns by ${all}.`, `Check: ${p}% of ${fmt(whole)} = ${dec(p)} × ${fmt(whole)} = ${fmt(part)}`])];
}
function pickWhole(L) {
  const p = L === 1 ? pick([50, 25, 10, 20]) : pick([5, 15, 30, 35, 40, 60, 70, 75, 80, 90]), g = gcd(p, 100), whole = (100 / g) * rnd(2, L === 1 ? 12 : 15);
  return { p, whole, part: p * whole / 100 };
}
function wholeBare(L) {
  const { p, part } = pickWhole(L);
  return T({ ask: chance(0.5) ? `${b(p + '%')} of a number is ${b(part)}. What is the number?` : `${b(part)} is ${b(p + '%')} of what number?`, answer: num(part * 100 / p), ways: wholeWays(p, part),
    hint: `${part} is only a part. Is the whole number bigger or smaller than ${part}?` }, 'whole', { p, part });
}
// f(p, x) gives [story, ask for the whole, ask for what is left, unit]; the whole stays between lo and hi so the story is believable.
const WHOLE_CTX = [
  { lo: 20, hi: 500, f: (p, x) => [`A phone has downloaded ${k(x + ' MB')} of a game. That is ${k(p + '%')} of the file.`, 'How many MB is the whole file?', 'How many MB are still left to download?', 'MB'] },
  { lo: 10, hi: 82, f: (p, x) => [`A team has played ${k(x + ' games')} so far, which is ${k(p + '%')} of the season.`, 'How many games are in the whole season?', 'How many games are still to play?', 'games'] },
  { lo: 10, hi: 300, f: (p, x) => [`A hiker has walked ${k(x + ' km')}, which is ${k(p + '%')} of the trail.`, 'How long is the whole trail, in km?', 'How many km are still to go?', 'km'] },
  { lo: 40, hi: 500, f: (p, x) => [`A band has sold ${k(x + ' tickets')}. That is ${k(p + '%')} of the seats.`, 'How many seats are there in all?', 'How many seats are still empty?', 'seats'] },
  { lo: 60, hi: 500, f: (p, x) => [`A reader has finished ${k(x + ' pages')}, which is ${k(p + '%')} of the book.`, 'How many pages does the book have?', 'How many pages are left?', 'pages'] },
];
export function wholeWord() {
  const ctx = pick(WHOLE_CTX); let w;
  do w = pickWhole(2); while (w.whole < ctx.lo || w.whole > ctx.hi);
  const { p, part, whole } = w, left = chance(0.45), [story, askWhole, askLeft, unit] = ctx.f(p, part), ways = wholeWays(p, part);
  if (left) ways[0].s.push(`Still to go: ${whole} − ${part} = ${b(whole - part)} ${unit}`);
  return T({ story, ask: left ? askLeft : askWhole, answer: num(left ? whole - part : whole), suffix: unit, op: left ? 'multi' : 'div', ways: left ? [ways[0], way('Use the percent that is left', [`${p}% is done, so 100% − ${p}% = ${100 - p}% is left.`, `The whole is ${whole} ${unit} (see the other way).`, `${dec(100 - p)} × ${whole} = ${b(whole - part)} ${unit}`])] : ways,
    read: { find: left ? 'What is still left, not the whole.' : 'The whole amount (100%).', know: [`${part} ${unit}`, `that is ${p}%`], clue: `${part} is a part. The whole is 100%, so it must be bigger than ${part}.`, plan: left ? `find 100%, then subtract ${part}` : `find ${gcd(p, 100)}%, then 100%` },
    hint: gcd(p, 100) < p ? `${part} ${unit} is ${p}%. What would ${gcd(p, 100)}% be?` : `${part} ${unit} is ${p}%. How many lots of ${p}% make 100%?` }, left ? 'wholeLeft' : 'whole', { p, part });
}
function whatPercent() {
  const whole = pick([4, 5, 10, 20, 25, 50, 200, 300]), unit = whole / gcd(whole, 100), part = unit * rnd(1, whole / unit - 1), p = part / whole * 100, m = 100 / whole;
  const n = nm(), opts = [`${n} got ${k(part)} out of ${k(whole)} points in a game round.`];
  if (whole >= 10) opts.push(`On a playlist of ${k(whole)} songs, ${k(part)} ${part === 1 ? 'is' : 'are'} by one band.`);
  if (whole >= 20) opts.push(`${n} has saved ${k(money(part))} of the ${k(money(whole))} needed for ${whole >= 200 ? 'a used bike' : 'a new bike helmet'}.`);
  const ctx = pick(opts);
  return T({ story: ctx, ask: 'What percent is that?', answer: num(p), suffix: '%',
    ways: [way('Make it out of 100', [`Write it as a fraction: ${F(part, whole)}`, m >= 1 ? `Scale to 100: multiply top and bottom by ${m}. ${F(part, whole)} = ${F(part * m, 100)}` : `Scale to 100: divide top and bottom by ${whole / 100}. ${F(part, whole)} = ${F(part / (whole / 100), 100)}`, `${fmt(p)} out of 100 is ${b(fmt(p) + '%')}`]),
      way('Divide, then read as a percent', [`${part} ÷ ${whole} = ${plain(R(part / whole))}`, `${plain(R(part / whole))} is ${fmt(p)} hundredths, so ${b(fmt(p) + '%')}`])],
    hint: `Write ${part} out of ${whole} as a fraction. Can you change the bottom to 100?` }, 'whatPct', { part, whole });
}
export function genPctWhole(L) {
  if (L < 3) return wholeBare(L);
  return chance(0.6) ? wholeWord() : whatPercent();
}
