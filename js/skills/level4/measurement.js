import { R, rnd, pick, chance, shuffle, gcd, fmt, plain, F, fr, frText, b, k, way, nm, num, frac, choice, point, prism, linePlot, table } from '../../util.js';
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
const ways = [way(toSmall ? 'Big unit to small unit: multiply' : 'Small unit to big unit: divide', [
`1 ${u.big} = ${fmt(u.f)} ${u.sms}.`,
toSmall ? `Small units are tiny, so you need MORE of them. Multiply: ${plain(x)} × ${fmt(u.f)} = ${b(fmt(ans))}` : `Big units hold a lot, so you need FEWER of them. Divide: ${fmt(x)} ÷ ${fmt(u.f)} = ${b(plain(ans))}`])];
if (u.sys === 'metric') ways.push(way('Slide the decimal', [`${fmt(u.f)} has ${String(u.f).length - 1} zero${u.f > 10 ? 's' : ''}.`, `${toSmall ? 'Multiplying' : 'Dividing'} by ${fmt(u.f)} moves the decimal point ${String(u.f).length - 1} place${u.f > 10 ? 's' : ''} to the ${toSmall ? 'right' : 'left'}: ${plain(x)} becomes ${b(plain(ans))}`]));
else if (Number.isInteger(x) && (toSmall ? x : ans) <= 12) {
const n = toSmall ? x : ans;
ways.push(way('Make a table', [table([u.bigs, u.sms], Array.from({ length: Math.min(n, 6) }, (_, i) => { const j = n <= 6 ? i + 1 : Math.round((i + 1) * n / 6); return [j === n ? b(j) : j, j === n ? b(fmt(j * u.f)) : fmt(j * u.f)]; }))]));
}
ways.push(way('Check by going back', [toSmall ? `${fmt(ans)} ${u.sms} ÷ ${fmt(u.f)} = ${plain(x)} ${u.bigs}` : `${plain(ans)} ${u.bigs} × ${fmt(u.f)} = ${fmt(x)} ${u.sms}`, toSmall ? 'Small units, so more of them. The number got bigger.' : 'Big units, so fewer of them. The number got smaller.']));
return { ans, ways };
}
export function convWord(L) {
const n = nm();
const t = pick([0, 1, 2]);
if (t === 0) { const km = R(rnd(15, 49) / 10), m = rnd(5, 29) * 100; if (km * 1000 <= m) return convWord(L);
const diff = R(km * 1000 - m);
return { story: `${n} ran ${k(plain(km) + ' kilometers')}. A friend ran ${k(fmt(m) + ' meters')}.`, ask: `How many more meters did ${n} run?`, answer: num(diff), op: 'multi',
ways: [way('Same units first', [`You can't compare km and m directly. Change km to m: 1 km = 1,000 m.`, `${plain(km)} × 1,000 = ${fmt(km * 1000)} m`, `Now subtract: ${fmt(km * 1000)} − ${fmt(m)} = ${b(fmt(diff))} meters`]),
way('Or work in kilometers', [`${fmt(m)} m = ${plain(m / 1000)} km`, `${plain(km)} − ${plain(m / 1000)} = ${plain(R(km - m / 1000))} km`, `Back to meters: ${plain(R(km - m / 1000))} × 1,000 = ${b(fmt(diff))}`])],
read: { find: 'The difference, in meters.', know: [`${n}: ${plain(km)} km`, `friend: ${fmt(m)} m`], clue: 'Two different units! Convert first. “How many more” means subtract.', plan: `${plain(km)} km to meters, then subtract ${fmt(m)}` }, hint: 'Make both distances meters first.' }; }
if (t === 1) { const g = rnd(2, 5); const cups = g * 16;
return { story: `A cooler holds ${k(g + ' gallons')} of lemonade. Each glass holds ${k('1 cup')}.`, ask: 'How many glasses can be filled?', answer: num(cups), op: 'multi',
ways: [way('Step down the units', [`1 gallon = 4 quarts, so ${g} gallons = ${g * 4} quarts`, `1 quart = 2 pints, so ${g * 4} quarts = ${g * 8} pints`, `1 pint = 2 cups, so ${g * 8} pints = ${b(g * 16)} cups`]), way('Use the shortcut', ['1 gallon = 16 cups.', `${g} × 16 = ${b(cups)}`])],
read: { find: 'How many 1-cup glasses.', know: [`${g} gallons`, '1 cup per glass'], clue: 'Gallons are big and cups are small, so you need lots of cups: multiply.', plan: `${g} gallons to cups` }, hint: 'Gallons to quarts to pints to cups.' }; }
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
const readWay = way('How to read a line plot', [`Each X is one ${c.thing}.`, `The number under a stack tells how many ${c.units} that ${c.thing} measured.`]);
const tp = L === 1 ? pick(['count', 'total', 'most']) : L === 2 ? pick(['diff', 'sumAt', 'count2']) : pick(['share', 'share', 'all']);
if (tp === 'count' || tp === 'count2') {
const t = pick(ticks);
if (tp === 'count2') { const t2 = pick(ticks.filter(x => x !== t)) ?? t; const lo = Math.min(t, t2);
const cnt = ticks.filter(x => x > lo).reduce((s, x) => s + data[x], 0);
return { ask: `How many ${c.things} measured MORE than ${frText(lo, den)} ${c.unit}?`, visual: viz, answer: num(cnt),
ways: [readWay, way('Count the stacks to the right', [`Look at every stack to the RIGHT of ${frText(lo, den)} (not including it).`, ticks.filter(x => x > lo).map(x => `${frText(x, den)}: ${data[x]}`).join(', '), `Total: ${b(cnt)}`])], hint: `Only count the X's to the right of ${frText(lo, den)}.` }; }
return { ask: `How many ${c.things} measured exactly ${frText(t, den)} ${c.unit}?`, visual: viz, answer: num(data[t]),
ways: [readWay, way('Count the stack', [`Find ${frText(t, den)} on the line. Count the X marks above it: ${b(data[t])}.`])], hint: `Find ${frText(t, den)} on the number line first.` };
}
if (tp === 'total') return { ask: `How many ${c.things} were measured in all?`, visual: viz, answer: num(total),
ways: [readWay, way('Count every X', [ticks.map(t => data[t]).join(' + ') + ` = ${b(total)}`])], hint: `Every X is one ${c.thing}. Count them all.` };
if (tp === 'most') {
const mx = Math.max(...ticks.map(t => data[t])); const tops = ticks.filter(t => data[t] === mx);
if (tops.length > 1) return genLplot(L);
const ans = frText(tops[0], den);
return { ask: `Which measurement happened most often?`, visual: viz, answer: choice(ans, ticks.filter(t => t !== tops[0]).map(t => frText(t, den))),
ways: [readWay, way('Find the tallest stack', [`The tallest stack has ${mx} X marks. It's at ${b(ans)} ${c.unit}.`])], hint: 'Look for the tallest stack.' };
}
if (tp === 'diff') {
const hi = ticks[ticks.length - 1], lo = ticks[0];
return { ask: `What is the difference between the ${c.long} and ${c.short} ${c.thing}?`, visual: viz, answer: frac(hi - lo, den), fracInput: true,
ways: [readWay, way('Biggest minus smallest', [`The ${c.long} is the X farthest right: ${fr(hi, den)}.`, `The ${c.short} is the X farthest left: ${fr(lo, den)}.`, `${F(hi, den)} − ${F(lo, den)} = ${F(hi - lo, den)}${gcd(hi - lo, den) > 1 || hi - lo > den ? ` = ${fr(hi - lo, den)}` : ''}. Answer: ${b(fr(hi - lo, den))} ${c.unit}`])],
hint: 'Farthest right minus farthest left.' };
}
if (tp === 'sumAt') {
const t = pick(ticks.filter(x => data[x] > 1).concat(ticks)); const v = t * data[t];
return { ask: `All the ${c.things} that measured ${frText(t, den)} ${c.unit} are put together. What is their total?`, visual: viz, answer: frac(v, den), fracInput: true,
ways: [way('Multiply', [`There ${data[t] === 1 ? 'is 1' : `are ${data[t]}`} ${data[t] === 1 ? c.thing : c.things} at ${fr(t, den)}.`, `${data[t]} × ${F(t, den)} = ${F(v, den)} = ${b(fr(v, den))} ${c.units}`]),
way('Add them up', [Array(data[t]).fill(F(t, den)).join(' + ') + ` = ${b(fr(v, den))}`])], hint: 'Count the X marks, then multiply by the measurement.' };
}
const sum = ticks.reduce((s, t) => s + t * data[t], 0);
if (tp === 'all') return { ask: `What is the total of all the measurements?`, visual: viz, answer: frac(sum, den), fracInput: true,
ways: [way('Count the pieces', [`Every measurement is made of ${F(1, den)} pieces. A X at ${F(3, den)} is 3 pieces.`, `Count all the pieces: ${ticks.map(t => `${data[t]} × ${t}`).join(' + ')} = ${sum}`, `${sum} pieces of ${F(1, den)} = ${F(sum, den)} = ${b(fr(sum, den))}`]),
way('Stack by stack', [...ticks.map(t => `${data[t]} × ${F(t, den)} = ${F(t * data[t], den)}`), `Add the tops: ${ticks.map(t => t * data[t]).join(' + ')} = ${sum}, so ${F(sum, den)} = ${b(fr(sum, den))} ${c.units}`])], hint: 'Find each stack’s total, then add them.' };
return { ask: `If all the ${c.things} were combined and shared out equally, how much would each ${c.thing} get?`, visual: viz, answer: frac(sum, den * total), fracInput: true,
ways: [way('Count the pieces', [`Total pieces of size ${F(1, den)}: ${ticks.map(t => `${data[t]} × ${t}`).join(' + ')} = ${sum}. So the total is ${F(sum, den)}.`, `Share among ${total}: ${F(sum, den)} ÷ ${total} = ${F(sum, den * total)} = ${b(fr(sum, den * total))}`]),
way('Total, then share', [`Step 1, the total: ${ticks.map(t => `${data[t]} × ${F(t, den)}`).join(' + ')} = ${F(sum, den)}`, `Step 2, count the ${c.things}: ${total}`, `Step 3, share equally: ${F(sum, den)} ÷ ${total} = ${F(sum, den * total)} = ${b(fr(sum, den * total))} ${c.unit}`])],
read: { find: `The equal amount for each ${c.thing}.`, know: [`${total} ${c.things}`, 'the amounts are on the line plot'], clue: '“combined” means add everything. “shared equally” means divide by how many.', plan: `(total of all X values) ÷ ${total}` },
hint: 'First add everything together. Then divide by how many there are.' };
}
const UNITS = [['cm', 'cubic centimeters'], ['in', 'cubic inches'], ['ft', 'cubic feet'], ['m', 'cubic meters']];
function volWays(l, w, h) {
const V = l * w * h;
return [way('Layers', [`The bottom layer has ${l} × ${w} = ${l * w} cubes.`, `There are ${h} layers stacked up.`, `${l * w} × ${h} = ${b(fmt(V))}`]),
way('The formula', [`Volume = length × width × height`, `V = ${l} × ${w} × ${h} = ${b(fmt(V))}`]),
way('Another order works too', [`Multiplying in any order gives the same answer: ${w} × ${h} = ${w * h}, then × ${l} = ${fmt(V)}`])];
}
export function volWord(L) {
const l = rnd(10, 30), w = rnd(5, 15), h = rnd(6, 20); const n = nm();
return { story: `${n}'s fish tank is ${k(l + ' inches')} long, ${k(w + ' inches')} wide and ${k(h + ' inches')} tall.`, ask: 'How much water can it hold, in cubic inches?', answer: num(l * w * h), suffix: 'cubic inches', ways: volWays(l, w, h), op: 'mul',
read: { find: 'The volume (space inside) of the tank.', know: [`length ${l} in`, `width ${w} in`, `height ${h} in`], clue: '“how much it can hold” = volume: length × width × height', plan: `${l} × ${w} × ${h}` }, hint: 'Volume = length × width × height.' };
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
ways: [way('Work backward', [`Length × width = ${l} × ${w} = ${l * w}. That's one layer.`, `How many layers make ${fmt(l * w * h)}? ${fmt(l * w * h)} ÷ ${l * w} = ${b(h)}`]), way('Check it', [`${l} × ${w} × ${h} = ${fmt(l * w * h)}`])], hint: 'Find the area of one layer, then divide.' };
}
if (chance(0.35)) return volWord(L);
const a = [rnd(3, 8), rnd(2, 5), rnd(2, 6)], c = [rnd(2, 6), a[1], rnd(3, 9)];
const Va = a[0] * a[1] * a[2], Vc = c[0] * c[1] * c[2];
const vis = `<div class="pair">${prism(a[0], a[1], a[2], { unit: u })}<span class="plus">+</span>${prism(c[0], c[1], c[2], { unit: u })}</div>`;
return { ask: 'A building is made of these two boxes stuck together. What is its total volume?', visual: vis, answer: num(Va + Vc), suffix: uu,
ways: [way('Find each, then add', [`Box 1: ${a[0]} × ${a[1]} × ${a[2]} = ${Va}`, `Box 2: ${c[0]} × ${c[1]} × ${c[2]} = ${Vc}`, `Together: ${Va} + ${Vc} = ${b(fmt(Va + Vc))}`]),
way('Layers', [`Box 1: one layer is ${a[0]} × ${a[1]} = ${a[0] * a[1]}, and there are ${a[2]} layers, so ${Va}`, `Box 2: one layer is ${c[0]} × ${c[1]} = ${c[0] * c[1]}, and there are ${c[2]} layers, so ${Vc}`, `Add: ${b(fmt(Va + Vc))}`])], hint: 'Find the volume of each box separately.' };
}
