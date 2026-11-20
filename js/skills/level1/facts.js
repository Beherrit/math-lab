// Worked solutions for adding and subtracting within 20: make a ten, doubles, near doubles, count on, think addition.
import { b, way } from '../../util.js';
import { tenBar, hops } from './pics.js';
import { cnt, countList } from './words.js';

function makeTenWay(a, c) {
  const big = Math.max(a, c), small = Math.min(a, c), need = 10 - big;
  if (big >= 10 || need >= small) return null;
  return way('Make a ten', [tenBar(big, small),
    `${big} needs ${b(need)} more to reach 10.`,
    `So split ${small} into ${need} and ${small - need}.`,
    `${big} + ${need} = 10. Then 10 + ${small - need} = ${b(a + c)}.`]);
}
function doublesWay(a, c) {
  const lo = Math.min(a, c), d = Math.abs(a - c);
  if (d === 0) return way('Doubles', ['Both numbers are the same, so this is a double.', `Double ${a} is ${b(2 * a)}.`]);
  if (d === 1) return way('Near doubles', [`${lo + 1} is just one more than ${lo}.`, `Start from the double: ${lo} + ${lo} = ${2 * lo}.`, `One more makes ${b(a + c)}.`]);
  if (d === 2) return way('Share to make a double', [`Move 1 from the ${lo + 2} over to the ${lo}. Now both numbers are ${lo + 1}.`, `${lo + 1} + ${lo + 1} = ${b(a + c)}.`]);
  return null;
}
function countOnWay(a, c) {
  const big = Math.max(a, c), small = Math.min(a, c);
  const start = a === c ? `Both numbers are ${a}. Start at ${a}.` : `Start at the bigger number, ${big}. That is quicker than starting at ${small}.`;
  return way('Count on', [start, `Count on ${small}: ${countList(big, small)}.`, `You land on ${b(a + c)}.`]);
}
export function addWays(a, c) {
  const ways = [makeTenWay(a, c), doublesWay(a, c), countOnWay(a, c)].filter(Boolean);
  if (ways.length < 2 && a + c <= 20) ways.unshift(way('See it as a bar', [tenBar(a, c), `The bar shows ${a}, and then ${c} more.`, `Together they make ${b(a + c)}.`]));
  return ways;
}
// "Count up" from a to the sum: a way for a missing addend.
export function countUpWay(a, sum) {
  const d = sum - a;
  if (a < 10 && sum > 10) return way('Count up through ten', [hops([a, 10, sum]), `From ${a} up to 10 is ${10 - a}.`, `From 10 up to ${sum} is ${sum - 10}.`, `${10 - a} + ${sum - 10} = ${b(d)}.`]);
  return way('Count up', [`Start at ${a} and count up to ${sum}: ${countList(a, d)}.`, `That was ${b(cnt(d, 'count'))}.`]);
}

export function subWays(a, c) {
  const d = a - c, ones = a - 10, ways = [];
  if (c < 10 && a > 10 && c > ones) ways.push(way('Think addition', [`Ask: ${c} plus what makes ${a}?`, hops([c, 10, a]), `${c} up to 10 is ${10 - c}. 10 up to ${a} is ${ones}.`, `${10 - c} + ${ones} = ${b(d)}, so ${a} − ${c} = ${b(d)}.`]));
  else ways.push(way('Think addition', [`Ask: ${c} plus what makes ${a}?`, `${c} + ${b(d)} = ${a}, so ${a} − ${c} = ${b(d)}.`]));
  if (a > 10 && c > ones && c < 10) ways.push(way('Back through ten', [`Take away ${ones} first to land on 10: ${a} − ${ones} = 10.`, `${c} is ${ones} and ${c - ones}, so there is still ${c - ones} to take away.`, `10 − ${c - ones} = ${b(d)}.`]));
  if (c <= 4) ways.push(way('Count back', [`Start at ${a} and count back ${c}: ${countList(a, c, -1)}.`, `You land on ${b(d)}.`]));
  ways.push(way('Check by adding', ['Adding undoes subtracting.', `${d} + ${c} = ${a}, so ${b(d)} fits.`]));
  return ways;
}
