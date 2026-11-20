import { R, rnd, pick, chance, shuffle, gcd, fmt, plain, F, fr, frText, b, k, way, nm, num, frac, choice, point, prism, plane, linePlot, table, simp } from './util.js';
const CONV = [
{ big: 'foot', bigs: 'feet', sm: 'inch', sms: 'inches', f: 12, sys: 'us' },
{ big: 'yard', bigs: 'yards', sm: 'foot', sms: 'feet', f: 3, sys: 'us' },
{ big: 'yard', bigs: 'yards', sm: 'inch', sms: 'inches', f: 36, sys: 'us', hard: true },
{ big: 'pound', bigs: 'pounds', sm: 'ounce', sms: 'ounces', f: 16, sys: 'us' },
{ big: 'gallon', bigs: 'gallons', sm: 'quart', sms: 'quarts', f: 4, sys: 'us' },
{ big: 'quart', bigs: 'quarts', sm: 'pint', sms: 'pints', f: 2, sys: 'us' },
{ big: 'pint', bigs: 'pints', sm: 'cup', sms: 'cups', f: 2, sys: 'us' },
{ big: 'hour', bigs: 'hours', sm: 'minute', sms: 'minutes', f: 60, sys: 'us' },
{ big: 'minute', bigs: 'minutes', sm: 'second', sms: 'seconds', f: 60, sys: 'us' },
{ big: 'ton', bigs: 'tons', sm: 'pound', sms: 'pounds', f: 2000, sys: 'us', hard: true },
{ big: 'meter', bigs: 'meters', sm: 'centimeter', sms: 'centimeters', f: 100, sys: 'metric' },
{ big: 'kilometer', bigs: 'kilometers', sm: 'meter', sms: 'meters', f: 1000, sys: 'metric' },
{ big: 'centimeter', bigs: 'centimeters', sm: 'millimeter', sms: 'millimeters', f: 10, sys: 'metric' },
{ big: 'kilogram', bigs: 'kilograms', sm: 'gram', sms: 'grams', f: 1000, sys: 'metric' },
{ big: 'liter', bigs: 'liters', sm: 'milliliter', sms: 'milliliters', f: 1000, sys: 'metric' },
];
const pl = (u, x, one, many) => x === 1 ? one : many;
function convWays(x, u, toSmall) {
const ans = R(toSmall ? x * u.f : x / u.f);
const ways = [way(toSmall ? 'Big unit → small unit: multiply' : 'Small unit → big unit: divide', [
`1 ${u.big} = ${fmt(u.f)} ${u.sms}.`,
toSmall ? `Small units are tiny, so you need MORE of them. Multiply: ${plain(x)} × ${fmt(u.f)} = ${b(fmt(ans))}` : `Big units hold a lot, so you need FEWER of them. Divide: ${fmt(x)} ÷ ${fmt(u.f)} = ${b(plain(ans))}`])];
if (u.sys === 'metric') ways.push(way('Slide the decimal', [`${fmt(u.f)} has ${String(u.f).length - 1} zero${u.f > 10 ? 's' : ''}.`, `${toSmall ? 'Multiplying' : 'Dividing'} by ${fmt(u.f)} moves the decimal point ${String(u.f).length - 1} place${u.f > 10 ? 's' : ''} to the ${toSmall ? 'right' : 'left'}: ${plain(x)} → ${b(plain(ans))}`]));
else if (Number.isInteger(x) && (toSmall ? x : ans) <= 12) {
const n = toSmall ? x : ans;
ways.push(way('Make a table', [table([u.bigs, u.sms], Array.from({ length: Math.min(n, 6) }, (_, i) => { const j = n <= 6 ? i + 1 : Math.round((i + 1) * n / 6); return [j === n ? b(j) : j, j === n ? b(fmt(j * u.f)) : fmt(j * u.f)]; }))]));
}
ways.push(way('Check by going back', [toSmall ? `${fmt(ans)} ${u.sms} ÷ ${fmt(u.f)} = ${plain(x)} ${u.bigs} ✓` : `${plain(ans)} ${u.bigs} × ${fmt(u.f)} = ${fmt(x)} ${u.sms} ✓`, toSmall ? 'Small units → more of them. The number got bigger ✓' : 'Big units → fewer of them. The number got smaller ✓']));
return { ans, ways };
}
export function convWord(L) {
const n = nm();
const t = pick([0, 1, 2]);
if (t === 0) { const km = R(rnd(15, 49) / 10), m = rnd(5, 29) * 100; if (km * 1000 <= m) return convWord(L);
const diff = R(km * 1000 - m);
return { story: `${n} ran ${k(plain(km) + ' kilometers')}. A friend ran ${k(fmt(m) + ' meters')}.`, ask: `How many more meters did ${n} run?`, answer: num(diff), op: 'multi',
ways: [way('Same units first', [`You can't compare km and m directly. Change km to m: 1 km = 1,000 m.`, `${plain(km)} × 1,000 = ${fmt(km * 1000)} m`, `Now subtract: ${fmt(km * 1000)} − ${fmt(m)} = ${b(fmt(diff))} meters`]),
way('Or work in kilometers', [`${fmt(m)} m = ${plain(m / 1000)} km`, `${plain(km)} − ${plain(m / 1000)} = ${plain(R(km - m / 1000))} km`, `Back to meters: ${plain(R(km - m / 1000))} × 1,000 = ${b(fmt(diff))} ✓`])],
read: { find: 'The difference, in meters.', know: [`${n}: ${plain(km)} km`, `friend: ${fmt(m)} m`], clue: 'Two different units! Convert first. “How many more” → subtract.', plan: `${plain(km)} km → meters, then subtract ${fmt(m)}` }, hint: 'Make both distances meters first.' }; }
if (t === 1) { const g = rnd(2, 5); const cups = g * 16;
return { story: `A cooler holds ${k(g + ' gallons')} of lemonade. Each glass holds ${k('1 cup')}.`, ask: 'How many glasses can be filled?', answer: num(cups), op: 'multi',
ways: [way('Step down the units', [`1 gallon = 4 quarts → ${g} gallons = ${g * 4} quarts`, `1 quart = 2 pints → ${g * 4} quarts = ${g * 8} pints`, `1 pint = 2 cups → ${g * 8} pints = ${b(g * 16)} cups`]), way('Use the shortcut', ['1 gallon = 16 cups.', `${g} × 16 = ${b(cups)}`])],
read: { find: 'How many 1-cup glasses.', know: [`${g} gallons`, '1 cup per glass'], clue: 'Gallons are big, cups are small → you need lots of cups → multiply.', plan: `${g} gallons → cups` }, hint: 'Gallons → quarts → pints → cups.' }; }
const ft = rnd(3, 6), inch = rnd(1, 11), tot = ft * 12 + inch;
return { story: `${n} is ${k(ft + ' feet ' + inch + ' inches')} tall.`, ask: `How tall is ${n} in inches?`, answer: num(tot), op: 'multi',
ways: [way('Feet first, then add', [`1 foot = 12 inches. ${ft} feet = ${ft} × 12 = ${ft * 12} inches.`, `Add the extra ${inch} inches: ${ft * 12} + ${inch} = ${b(tot)}`]),
way('Count by 12s', [`Count 12 for each foot: ${Array.from({ length: ft }, (_, i) => 12 * (i + 1)).join(', ')}.`, `Then add ${inch} more: ${b(tot)}`])],
read: { find: 'Height using only inches.', know: [`${ft} feet`, `${inch} more inches`], clue: 'Change the feet to inches, then add the extra inches.', plan: `${ft} × 12 + ${inch}` }, hint: 'How many inches in one foot?' };
}
export function genConv(L) {
if (L === 3 && chance(0.6)) return convWord(L);
const pool = CONV.filter(u => L > 1 || !u.hard);
const u = pick(pool);
let x, toSmall;
if (L === 1) { toSmall = true; x = rnd(2, 12); }
else if (u.sys === 'metric' && chance(0.6)) { toSmall = chance(0.5); x = toSmall ? R(rnd(11, 99) / 10) : (u.f === 10 ? rnd(11, 99) : rnd(2, 99) * u.f / 10); }
else { toSmall = chance(0.4); x = toSmall ? rnd(3, 20) : u.f * rnd(2, 12); }
const { ans, ways } = convWays(x, u, toSmall);
if (places(ans) > 3) return genConv(L);
const from = toSmall ? pl(u, x, u.big, u.bigs) : pl(u, x, u.sm, u.sms);
const to = toSmall ? u.sms : u.bigs;
return { ask: 'Convert.', expr: `${fmt(x)} ${from} = <span class="blank">?</span> ${to}`, exprSmall: true, answer: num(ans), suffix: to, ways,
hint: toSmall ? `Going to a smaller unit means you need more of them. Multiply by ${fmt(u.f)}.` : `Going to a bigger unit means you need fewer of them. Divide by ${fmt(u.f)}.` };
}
const places = x => { const s = plain(x); const i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; };
const LP_CTX = [
{ title: 'Ribbon lengths', unit: 'inch', units: 'inches', thing: 'ribbon', things: 'ribbons', long: 'longest', short: 'shortest' },
{ title: 'Water in beakers', unit: 'liter', units: 'liters', thing: 'beaker', things: 'beakers', long: 'fullest', short: 'emptiest' },
{ title: 'Apple weights', unit: 'pound', units: 'pounds', thing: 'apple', things: 'apples', long: 'heaviest', short: 'lightest' },
{ title: 'Pencil lengths', unit: 'inch', units: 'inches', thing: 'pencil', things: 'pencils', long: 'longest', short: 'shortest' },
];
function lpData() {
const den = pick([2, 4, 8, 8]);
const max = den === 8 ? 8 : den === 4 ? pick([4, 8]) : 6;
const ticks = shuffle(Array.from({ length: max }, (_, i) => i + 1)).slice(0, rnd(3, Math.min(5, max)));
const data = {}; for (const t of ticks) data[t] = rnd(1, 4);
return { den, max, data, ticks: ticks.sort((a, c) => a - c) };
}
export function genLplot(L) {
const c = pick(LP_CTX); const { den, max, data, ticks } = lpData();
const viz = linePlot(den, max, data, { title: c.title, unit: c.units });
const total = ticks.reduce((s, t) => s + data[t], 0);
const readWay = way('How to read a line plot', [`Each ✕ is one ${c.thing}.`, `The number under a stack tells how many ${c.units} that ${c.thing} measured.`]);
const tp = L === 1 ? pick(['count', 'total', 'most']) : L === 2 ? pick(['diff', 'sumAt', 'count2']) : pick(['share', 'share', 'all']);
if (tp === 'count' || tp === 'count2') {
const t = pick(ticks);
if (tp === 'count2') { const t2 = pick(ticks.filter(x => x !== t)) ?? t; const lo = Math.min(t, t2);
const cnt = ticks.filter(x => x > lo).reduce((s, x) => s + data[x], 0);
return { ask: `How many ${c.things} measured MORE than ${frText(lo, den)} ${c.unit}?`, visual: viz, answer: num(cnt),
ways: [readWay, way('Count the stacks to the right', [`Look at every stack to the RIGHT of ${frText(lo, den)} (not including it).`, ticks.filter(x => x > lo).map(x => `${frText(x, den)}: ${data[x]}`).join(', '), `Total: ${b(cnt)}`])], hint: `Only count the X's to the right of ${frText(lo, den)}.` }; }
return { ask: `How many ${c.things} measured exactly ${frText(t, den)} ${c.unit}?`, visual: viz, answer: num(data[t]),
ways: [readWay, way('Count the stack', [`Find ${frText(t, den)} on the line. Count the ✕ marks above it: ${b(data[t])}.`])], hint: `Find ${frText(t, den)} on the number line first.` };
}
if (tp === 'total') return { ask: `How many ${c.things} were measured in all?`, visual: viz, answer: num(total),
ways: [readWay, way('Count every ✕', [ticks.map(t => data[t]).join(' + ') + ` = ${b(total)}`])], hint: `Every ✕ is one ${c.thing}. Count them all.` };
if (tp === 'most') {
const mx = Math.max(...ticks.map(t => data[t])); const tops = ticks.filter(t => data[t] === mx);
if (tops.length > 1) return genLplot(L);
const ans = frText(tops[0], den);
return { ask: `Which measurement happened most often?`, visual: viz, answer: choice(ans, ticks.filter(t => t !== tops[0]).map(t => frText(t, den))),
ways: [readWay, way('Find the tallest stack', [`The tallest stack has ${mx} ✕ marks. It's at ${b(ans)} ${c.unit}.`])], hint: 'Look for the tallest stack.' };
}
if (tp === 'diff') {
const hi = ticks[ticks.length - 1], lo = ticks[0];
return { ask: `What is the difference between the ${c.long} and ${c.short} ${c.thing}?`, visual: viz, answer: frac(hi - lo, den), fracInput: true,
ways: [readWay, way('Biggest minus smallest', [`The ${c.long} is the ✕ farthest right: ${fr(hi, den)}.`, `The ${c.short} is the ✕ farthest left: ${fr(lo, den)}.`, `${F(hi, den)} − ${F(lo, den)} = ${F(hi - lo, den)}${gcd(hi - lo, den) > 1 || hi - lo > den ? ` = ${fr(hi - lo, den)}` : ''}. Answer: ${b(fr(hi - lo, den))} ${c.unit}`])],
hint: 'Farthest right minus farthest left.' };
}
if (tp === 'sumAt') {
const t = pick(ticks.filter(x => data[x] > 1).concat(ticks)); const v = t * data[t];
return { ask: `All the ${c.things} that measured ${frText(t, den)} ${c.unit} are put together. What is their total?`, visual: viz, answer: frac(v, den), fracInput: true,
ways: [way('Multiply', [`There ${data[t] === 1 ? 'is 1' : `are ${data[t]}`} ${data[t] === 1 ? c.thing : c.things} at ${fr(t, den)}.`, `${data[t]} × ${F(t, den)} = ${F(v, den)} = ${b(fr(v, den))} ${c.units}`]),
way('Add them up', [Array(data[t]).fill(F(t, den)).join(' + ') + ` = ${b(fr(v, den))}`])], hint: 'Count the ✕ marks, then multiply by the measurement.' };
}
const sum = ticks.reduce((s, t) => s + t * data[t], 0);
if (tp === 'all') return { ask: `What is the total of all the measurements?`, visual: viz, answer: frac(sum, den), fracInput: true,
ways: [way('Count the pieces', [`Every measurement is made of ${F(1, den)} pieces. A ✕ at ${F(3, den)} is 3 pieces.`, `Count all the pieces: ${ticks.map(t => `${data[t]} × ${t}`).join(' + ')} = ${sum}`, `${sum} pieces of ${F(1, den)} = ${F(sum, den)} = ${b(fr(sum, den))}`]),
way('Stack by stack', [...ticks.map(t => `${data[t]} × ${F(t, den)} = ${F(t * data[t], den)}`), `Add the tops: ${ticks.map(t => t * data[t]).join(' + ')} = ${sum}, so ${F(sum, den)} = ${b(fr(sum, den))} ${c.units}`])], hint: 'Find each stack’s total, then add them.' };
return { ask: `If all the ${c.things} were combined and shared out equally, how much would each ${c.thing} get?`, visual: viz, answer: frac(sum, den * total), fracInput: true,
ways: [way('Count the pieces', [`Total pieces of size ${F(1, den)}: ${ticks.map(t => `${data[t]} × ${t}`).join(' + ')} = ${sum}. So the total is ${F(sum, den)}.`, `Share among ${total}: ${F(sum, den)} ÷ ${total} = ${F(sum, den * total)} = ${b(fr(sum, den * total))}`]),
way('Total, then share', [`Step 1, the total: ${ticks.map(t => `${data[t]} × ${F(t, den)}`).join(' + ')} = ${F(sum, den)}`, `Step 2, count the ${c.things}: ${total}`, `Step 3, share equally: ${F(sum, den)} ÷ ${total} = ${F(sum, den * total)} = ${b(fr(sum, den * total))} ${c.unit}`])],
read: { find: `The equal amount for each ${c.thing}.`, know: [`${total} ${c.things}`, 'the amounts are on the line plot'], clue: '“combined” → add everything. “shared equally” → divide by how many.', plan: `(total of all ✕ values) ÷ ${total}` },
hint: 'First add everything together. Then divide by how many there are.' };
}
const UNITS = [['cm', 'cubic centimeters'], ['in', 'cubic inches'], ['ft', 'cubic feet'], ['m', 'cubic meters']];
function volWays(l, w, h) {
const V = l * w * h;
return [way('Layers', [`The bottom layer has ${l} × ${w} = ${l * w} cubes.`, `There are ${h} layers stacked up.`, `${l * w} × ${h} = ${b(fmt(V))}`]),
way('The formula', [`Volume = length × width × height`, `V = ${l} × ${w} × ${h} = ${b(fmt(V))}`]),
way('Another order works too', [`Multiplying in any order gives the same answer: ${w} × ${h} = ${w * h}, then × ${l} = ${fmt(V)} ✓`])];
}
export function volWord(L) {
const l = rnd(10, 30), w = rnd(5, 15), h = rnd(6, 20); const n = nm();
return { story: `${n}'s fish tank is ${k(l + ' inches')} long, ${k(w + ' inches')} wide and ${k(h + ' inches')} tall.`, ask: 'How much water can it hold, in cubic inches?', answer: num(l * w * h), suffix: 'cubic inches', ways: volWays(l, w, h), op: 'mul',
read: { find: 'The volume (space inside) of the tank.', know: [`length ${l} in`, `width ${w} in`, `height ${h} in`], clue: '“how much it can hold” = volume → length × width × height', plan: `${l} × ${w} × ${h}` }, hint: 'Volume = length × width × height.' };
}
export function genVol(L) {
if (L === 1) {
const l = rnd(2, 5), w = rnd(2, 4), h = rnd(2, 4);
return { ask: 'Each little cube is 1 cubic unit. What is the volume of the box?', visual: prism(l, w, h, { grid: true }), answer: num(l * w * h), suffix: 'cubic units', ways: volWays(l, w, h), hint: 'How many cubes in the bottom layer? How many layers?' };
}
const [u, uu] = pick(UNITS);
if (L === 2) {
const t = pick(['dims', 'dims', 'base', 'missing']);
const l = rnd(3, 12), w = rnd(2, 9), h = rnd(2, 10);
if (t === 'dims') return { ask: 'Find the volume.', visual: prism(l, w, h, { unit: u }), answer: num(l * w * h), suffix: uu, ways: volWays(l, w, h), hint: 'Volume = length × width × height.' };
if (t === 'base') return { ask: `The bottom of a box has an area of ${l * w} square ${u === 'ft' ? 'feet' : u}. The box is ${h} ${u} tall. What is its volume?`, answer: num(l * w * h), suffix: uu,
ways: [way('Base × height', [`The base area tells how many cubes fit in one layer: ${l * w}.`, `There are ${h} layers: ${l * w} × ${h} = ${b(fmt(l * w * h))}`]),
way('Picture the layers', [prism(l, w, h, { unit: u }), `For example, a base of ${l} × ${w} = ${l * w}. Stack ${h} of those layers: ${b(fmt(l * w * h))}`])], hint: 'Volume = area of the base × height.' };
return { ask: `A box has a volume of ${fmt(l * w * h)} ${uu}. It is ${l} ${u} long and ${w} ${u} wide. How tall is it?`, answer: num(h), suffix: u,
ways: [way('Work backward', [`Length × width = ${l} × ${w} = ${l * w}. That's one layer.`, `How many layers make ${fmt(l * w * h)}? ${fmt(l * w * h)} ÷ ${l * w} = ${b(h)}`]), way('Check it', [`${l} × ${w} × ${h} = ${fmt(l * w * h)} ✓`])], hint: 'Find the area of one layer, then divide.' };
}
if (chance(0.35)) return volWord(L);
const a = [rnd(3, 8), rnd(2, 5), rnd(2, 6)], c = [rnd(2, 6), a[1], rnd(3, 9)];
const Va = a[0] * a[1] * a[2], Vc = c[0] * c[1] * c[2];
const vis = `<div class="pair">${prism(a[0], a[1], a[2], { unit: u })}<span class="plus">+</span>${prism(c[0], c[1], c[2], { unit: u })}</div>`;
return { ask: 'A building is made of these two boxes stuck together. What is its total volume?', visual: vis, answer: num(Va + Vc), suffix: uu,
ways: [way('Find each, then add', [`Box 1: ${a[0]} × ${a[1]} × ${a[2]} = ${Va}`, `Box 2: ${c[0]} × ${c[1]} × ${c[2]} = ${Vc}`, `Together: ${Va} + ${Vc} = ${b(fmt(Va + Vc))}`]),
way('Layers', [`Box 1: one layer is ${a[0]} × ${a[1]} = ${a[0] * a[1]}, and there are ${a[2]} layers → ${Va}`, `Box 2: one layer is ${c[0]} × ${c[1]} = ${c[0] * c[1]}, and there are ${c[2]} layers → ${Vc}`, `Add: ${b(fmt(Va + Vc))}`])], hint: 'Find the volume of each box separately.' };
}
const VOCAB = [
{ q: 'The point where the x-axis and y-axis cross is called the…', c: 'origin', d: ['center', 'x-axis', 'grid'], why: 'The origin is (0, 0), where both lines start.' },
{ q: 'In the ordered pair (4, 7), what does the 4 tell you?', c: 'Go 4 to the right', d: ['Go 4 up', 'Go 7 to the right', 'Go 4 down'], why: 'The first number is x: how far to go ACROSS (right).' },
{ q: 'In the ordered pair (2, 9), what does the 9 tell you?', c: 'Go 9 up', d: ['Go 9 to the right', 'Go 2 up', 'Go 9 down'], why: 'The second number is y: how far to go UP.' },
{ q: 'Which line goes left to right (across)?', c: 'x-axis', d: ['y-axis', 'origin', 'ordered pair'], why: 'The x-axis runs across. Think: “x is a cross.”' },
{ q: 'Which line goes straight up and down?', c: 'y-axis', d: ['x-axis', 'origin', 'ordered pair'], why: 'The y-axis goes up. Think: “y to the sky.”' },
{ q: 'What are the coordinates of the origin?', c: '(0, 0)', d: ['(1, 1)', '(0, 1)', '(1, 0)'], why: 'At the origin you haven’t moved at all: 0 across, 0 up.' },
];
const plotWays = (x, y) => [
way('Walk, then climb', [`Start at the origin (0, 0).`, `The first number is ${x}: walk ${b(x + ' to the right')} along the x-axis.`, `The second number is ${y}: climb ${b(y + ' up')}.`, `Put your point there: (${x}, ${y}).`]),
way('Ladder rule', ['You have to walk to the ladder before you can climb it.', 'So: across first (x), then up (y). Never the other way around!']),
];
export function genCoord(L) {
if (L === 1 && chance(0.35)) {
const v = pick(VOCAB);
return { ask: v.q, answer: choice(v.c, v.d), visual: plane({ pts: [] }), ways: [way('Remember', [v.why, 'x comes first (across), y comes second (up). Alphabetical order!']), way('Look at the grid', ['The bottom line with numbers going across is the x-axis.', 'The side line with numbers going up is the y-axis.', 'They meet at the corner, (0, 0): the origin.'])], hint: 'x is across, y is up.' };
}
const x = rnd(0, 10), y = rnd(0, 10);
if (x === 0 && y === 0) return genCoord(L);
if (L === 1 || (L === 2 && chance(0.4))) return { ask: `Tap the grid to plot the point (${x}, ${y}).`, visual: plane({ interactive: true }), answer: point(x, y), ways: plotWays(x, y), hint: 'First number: go right. Second number: go up.' };
if (L === 2) {
if (x === y) return genCoord(L);
const label = pick(['A', 'B', 'P', 'Q', 'M']);
return { ask: `What are the coordinates of point ${label}?`, visual: plane({ pts: [{ x, y, label }] }), answer: choice(`(${x}, ${y})`, [`(${y}, ${x})`, `(${x}, ${Math.min(10, y + 1)})`, `(${Math.max(0, x - 1)}, ${y})`]),
ways: [way('Across, then up', [`From the origin, count how far ACROSS to get under the point: ${b(x)}.`, `Then count how far UP: ${b(y)}.`, `Write across first: ${b(`(${x}, ${y})`)}`]), way('Watch out for the trap', [`(${y}, ${x}) has the numbers flipped. That's a totally different point!`])],
hint: 'How far across is it? Write that number first.' };
}
const t = pick(['move', 'move', 'dist']);
const n = nm();
if (t === 'move') {
const sx = rnd(0, 5), sy = rnd(0, 5), r = rnd(1, 10 - sx), u = rnd(1, 10 - sy);
return { story: `${n} is at the library at ${k(`(${sx}, ${sy})`)}. ${n} walks ${k(r + ' blocks east')} (right) and ${k(u + ' blocks north')} (up) to the park.`, ask: 'Tap where the park is.', visual: plane({ interactive: true, pts: [{ x: sx, y: sy, label: 'Library', cls: 'given' }] }), answer: point(sx + r, sy + u), op: 'add',
ways: [way('Add the moves', [`Moving right adds to x: ${sx} + ${r} = ${sx + r}`, `Moving up adds to y: ${sy} + ${u} = ${sy + u}`, `The park is at ${b(`(${sx + r}, ${sy + u})`)}`]), way('Count on the grid', [`Put your finger on the library. Count ${r} squares right, then ${u} squares up.`])],
read: { find: 'Where the park is.', know: [`start at (${sx}, ${sy})`, `${r} right`, `${u} up`], clue: 'East = right (x gets bigger). North = up (y gets bigger).', plan: `(${sx} + ${r}, ${sy} + ${u})` }, hint: 'Right changes the first number. Up changes the second.' };
}
const same = chance(0.5); const a = rnd(0, 10), p1 = rnd(0, 5), p2 = rnd(p1 + 2, 10);
const A = same ? { x: a, y: p1 } : { x: p1, y: a }, B2 = same ? { x: a, y: p2 } : { x: p2, y: a };
return { ask: `How many units apart are points A (${A.x}, ${A.y}) and B (${B2.x}, ${B2.y})?`, visual: plane({ pts: [{ ...A, label: 'A' }, { ...B2, label: 'B' }], path: [A, B2] }), answer: num(p2 - p1), suffix: 'units',
ways: [way('Find what changes', [same ? `Both have x = ${a}, so they're on the same up-and-down line.` : `Both have y = ${a}, so they're on the same across line.`, `Subtract the numbers that change: ${p2} − ${p1} = ${b(p2 - p1)}`]), way('Count on the grid', [`Count the squares from A to B: ${p2 - p1}.`])],
hint: 'Which number is the same in both points? Subtract the other ones.' };
}
const S3 = Math.sqrt(3);
const SHAPES = {
square: { pts: [[20, 20], [80, 20], [80, 80], [20, 80]], ticks: [1, 1, 1, 1], right: [0, 1, 2, 3] },
rectangle: { pts: [[8, 28], [92, 28], [92, 72], [8, 72]], ticks: [1, 2, 1, 2], right: [0, 1, 2, 3] },
rhombus: { pts: [[50, 8], [82, 50], [50, 92], [18, 50]], ticks: [1, 1, 1, 1], right: [] },
parallelogram: { pts: [[28, 25], [92, 25], [72, 75], [8, 75]], ticks: [1, 2, 1, 2], right: [] },
trapezoid: { pts: [[32, 25], [68, 25], [92, 75], [8, 75]], ticks: [0, 0, 0, 0], right: [] },
equilateral: { pts: [[50, 12], [90, 12 + 40 * S3], [10, 12 + 40 * S3]], ticks: [1, 1, 1], right: [] },
isosceles: { pts: [[50, 8], [76, 88], [24, 88]], ticks: [1, 0, 1], right: [] },
rightScalene: { pts: [[18, 12], [18, 88], [82, 88]], ticks: [0, 0, 0], right: [1] },
rightIso: { pts: [[15, 15], [15, 85], [85, 85]], ticks: [1, 1, 0], right: [1] },
obtuse: { pts: [[35, 55], [90, 80], [10, 80]], ticks: [0, 0, 0], right: [] },
acuteScalene: { pts: [[65, 12], [90, 85], [15, 85]], ticks: [0, 0, 0], right: [] },
};
function drawShape(key) {
const s = SHAPES[key]; const ang = pick([0, 0, 0, 180, 12, -12, 90, 20]);
const th = ang * Math.PI / 180;
const pts = s.pts.map(([x, y]) => [50 + (x - 50) * Math.cos(th) - (y - 50) * Math.sin(th), 50 + (x - 50) * Math.sin(th) + (y - 50) * Math.cos(th)]);
const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
const pad = 12, minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad, W = Math.max(...xs) - minX + pad, H = Math.max(...ys) - minY + pad;
let g = `<svg class="viz shape" viewBox="${minX.toFixed(1)} ${minY.toFixed(1)} ${W.toFixed(1)} ${H.toFixed(1)}" role="img" aria-label="shape" style="max-width:220px">`;
g += `<polygon points="${pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" class="body"/>`;
const n = pts.length;
s.ticks.forEach((c, i) => {
if (!c) return; const P = pts[i], Q = pts[(i + 1) % n];
const len = Math.hypot(Q[0] - P[0], Q[1] - P[1]); const ux = (Q[0] - P[0]) / len, uy = (Q[1] - P[1]) / len; const nx = -uy, ny = ux;
const mx = (P[0] + Q[0]) / 2, my = (P[1] + Q[1]) / 2;
for (let j = 0; j < c; j++) { const o = (j - (c - 1) / 2) * 4; const cx = mx + ux * o, cy = my + uy * o; g += `<line x1="${(cx - nx * 5).toFixed(1)}" y1="${(cy - ny * 5).toFixed(1)}" x2="${(cx + nx * 5).toFixed(1)}" y2="${(cy + ny * 5).toFixed(1)}" class="mark"/>`; }
});
for (const i of s.right) {
const V = pts[i], A = pts[(i + n - 1) % n], B2 = pts[(i + 1) % n];
const ua = [(A[0] - V[0]) / Math.hypot(A[0] - V[0], A[1] - V[1]), (A[1] - V[1]) / Math.hypot(A[0] - V[0], A[1] - V[1])];
const ub = [(B2[0] - V[0]) / Math.hypot(B2[0] - V[0], B2[1] - V[1]), (B2[1] - V[1]) / Math.hypot(B2[0] - V[0], B2[1] - V[1])];
const z = 8; g += `<polyline points="${V[0] + ua[0] * z},${V[1] + ua[1] * z} ${V[0] + ua[0] * z + ub[0] * z},${V[1] + ua[1] * z + ub[1] * z} ${V[0] + ub[0] * z},${V[1] + ub[1] * z}" class="mark ra"/>`;
}
return g + '</svg>';
}
const TREE = `<div class="tree"><div>Quadrilateral <small>(4 sides)</small><div>Trapezoid <small>(a pair of parallel sides)</small></div><div>Parallelogram <small>(2 pairs of parallel sides)</small><div>Rectangle <small>(+ 4 right angles)</small><div>Square</div></div><div>Rhombus <small>(+ 4 equal sides)</small><div>Square</div></div></div></div></div>`;
const MARKS_WAY = way('Read the marks', ['Little tick marks on sides mean those sides are the same length.', 'A tiny square in a corner means a right angle (like the corner of a paper).']);
const QUAD = {
square: '4 equal sides AND 4 right angles. It is also a rectangle, a rhombus and a parallelogram, but “square” is the most exact name.',
rectangle: '4 right angles, but the sides are not all equal. Opposite sides match.',
rhombus: '4 equal sides, but no right angles. It leans like a diamond.',
parallelogram: 'Two pairs of parallel sides (opposite sides match), but no right angles and not all sides equal.',
trapezoid: 'Only one pair of sides is parallel (the top and bottom).',
};
const STATEMENTS = [
['Every square is a rectangle.', true, 'A rectangle needs 4 right angles. Squares have them, so every square counts as a rectangle.'],
['Every rectangle is a square.', false, 'A rectangle can have a long side and a short side. Then it’s not a square.'],
['Every square is a rhombus.', true, 'A rhombus needs 4 equal sides. Squares have that, so yes.'],
['Every rhombus is a square.', false, 'A rhombus can lean over with no right angles. Then it’s not a square.'],
['Every rectangle is a parallelogram.', true, 'Rectangles have 2 pairs of parallel sides, so they are parallelograms.'],
['Every parallelogram is a rectangle.', false, 'A parallelogram can lean with no right angles. Then it’s not a rectangle.'],
['Every rhombus is a parallelogram.', true, 'A rhombus has 2 pairs of parallel sides, so it is a parallelogram.'],
['A rectangle always has 4 right angles.', true, 'That’s what makes it a rectangle!'],
['A parallelogram always has 4 right angles.', false, 'Some parallelograms lean over, so their angles aren’t right angles.'],
['A triangle can have two right angles.', false, 'Two right angles would make the sides go straight up, side by side, so they could never meet to close the shape.'],
['A right triangle can also be isosceles.', true, 'A right triangle can have two equal sides around its right angle.'],
['Every equilateral triangle is also isosceles.', true, 'Isosceles means at least 2 equal sides. Equilateral has 3, so it counts.'],
['An obtuse triangle has one angle bigger than a right angle.', true, 'That’s what “obtuse” means: wider than a right angle.'],
['Every quadrilateral is a parallelogram.', false, 'A trapezoid is a quadrilateral but has only one pair of parallel sides.'],
];
const CLUES = [
['I have 4 equal sides and 4 right angles. What am I?', 'square', ['rectangle', 'rhombus', 'trapezoid']],
['I have 4 right angles, but my sides are not all equal. What am I?', 'rectangle', ['square', 'rhombus', 'trapezoid']],
['I have 4 equal sides but no right angles. What am I?', 'rhombus', ['square', 'rectangle', 'trapezoid']],
['I have exactly one pair of parallel sides. What am I?', 'trapezoid', ['parallelogram', 'rectangle', 'rhombus']],
['I have 3 equal sides. What am I?', 'equilateral triangle', ['isosceles triangle', 'scalene triangle', 'right triangle']],
['I have no equal sides. What triangle am I?', 'scalene triangle', ['isosceles triangle', 'equilateral triangle', 'square']],
['I have one angle that is wider than a right angle. What triangle am I?', 'obtuse triangle', ['acute triangle', 'right triangle', 'equilateral triangle']],
['All three of my angles are smaller than a right angle. What triangle am I?', 'acute triangle', ['obtuse triangle', 'right triangle', 'scalene triangle']],
['Which shape is NOT a parallelogram?', 'trapezoid', ['square', 'rectangle', 'rhombus']],
];
export function genShapes(L) {
if (L === 1) {
if (chance(0.5)) {
const key = pick(Object.keys(QUAD));
return { ask: 'What is the best (most exact) name for this shape?', visual: drawShape(key), answer: choice(key, shuffle(Object.keys(QUAD).filter(x => x !== key)).slice(0, 3)),
ways: [MARKS_WAY, way('Check the clues', [`What makes it a ${key}: ${QUAD[key]}`, `So the best name is ${b(key)}.`]), way('The shape family tree', [TREE, 'Shapes lower in the tree are special kinds of the ones above them.'])],
hint: 'Look for tick marks (equal sides) and little squares (right angles).' };
}
const byAngle = chance(0.5);
const key = pick(['equilateral', 'isosceles', 'rightScalene', 'rightIso', 'obtuse', 'acuteScalene']);
const ang = { equilateral: 'acute', isosceles: 'acute', rightScalene: 'right', rightIso: 'right', obtuse: 'obtuse', acuteScalene: 'acute' }[key];
const side = { equilateral: 'equilateral', isosceles: 'isosceles', rightScalene: 'scalene', rightIso: 'isosceles', obtuse: 'scalene', acuteScalene: 'scalene' }[key];
if (byAngle) return { ask: 'Name this triangle by its ANGLES.', visual: drawShape(key), answer: choice(ang, [], { all: ['acute', 'right', 'obtuse'] }), choiceBig: true,
ways: [way('Look at the corners', ['Right: one corner is a perfect square corner.', 'Obtuse: one corner is wider than a square corner.', 'Acute: every corner is narrower than a square corner.', `This one is ${b(ang)}.`]),
way('The paper corner test', ['Hold the corner of a sheet of paper inside each angle.', 'Fits exactly → right angle. Paper sticks out past the sides → that angle is wider (obtuse). Sides go past the paper → narrower (acute).'])], hint: 'Is any corner a square corner? Wider than one?' };
return { ask: 'Name this triangle by its SIDES.', visual: drawShape(key), answer: choice(side, [], { all: ['equilateral', 'isosceles', 'scalene'] }), choiceBig: true,
ways: [MARKS_WAY, way('Count the equal sides', ['Equilateral: all 3 sides equal.', 'Isosceles: 2 sides equal.', 'Scalene: no sides equal.', `This one is ${b(side)}.`])], hint: 'Count the sides with matching tick marks.' };
}
if (L === 2) {
const [s, t, why] = pick(STATEMENTS);
return { ask: 'True or false?', expr: `“${s}”`, exprSmall: true, answer: choice(t ? 'True' : 'False', [], { all: ['True', 'False'] }), choiceBig: true,
ways: [way('Think it through', [why]), way('The shape family tree', [TREE, 'Every shape is also everything ABOVE it in the tree, but not the other way around.'])], hint: 'Can you picture one that breaks the rule?' };
}
const [q, c, d] = pick(CLUES);
return { ask: q, answer: choice(c, d), ways: [way('Use the family tree', [TREE, `Answer: ${b(c)}.`]), way('Triangles', ['By sides: equilateral (3 equal), isosceles (2 equal), scalene (none equal).', 'By angles: right (one square corner), obtuse (one wide corner), acute (all narrow corners).'])], hint: 'Picture the shape. Does it match every clue?' };
}
const OPS = { add: 'Add', sub: 'Subtract', mul: 'Multiply', div: 'Divide' };
export function makeStory(sources, L) {
for (let t = 0; t < 20; t++) {
const p = pick(sources)(L);
if (!p || !p.story || !p.read) continue;
if (p.op === 'multi') p.pre = { q: 'What will this problem take?', options: shuffle(['Add only', 'Subtract only', 'More than one step', 'Multiply only']), correct: 'More than one step', why: p.read.clue };
else if (OPS[p.op]) p.pre = { q: 'What do you need to do?', options: ['Add', 'Subtract', 'Multiply', 'Divide'], correct: OPS[p.op], why: p.read.clue };
p.ways = [way('Read it like a detective', [`${b('What is the question asking?')} ${p.read.find}`, `${b('What do we know?')} ${p.read.know.join(' • ')}`, `${b('Clue words:')} ${p.read.clue}`, `${b('Plan:')} ${p.read.plan}`]), ...p.ways];
return p;
}
}
