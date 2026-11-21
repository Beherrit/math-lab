// Area models, growth bars, triangles and the bell curve. Strings only.
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const open = (w, h, label) => `<svg class="viz hs" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">`;
const cell = (x, y, w, h, cls, t) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}"/>`
  + `<text class="onshape" x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle">${esc(t)}</text>`;

export function areaModel(a, b, corner = '?') {
  const x = 48, y = 28, cw = 112, aw = 72, rh = 70, bh = 50;
  let s = cell(x, y, cw, rh, 'box', 'x²');
  s += cell(x + cw, y, aw, rh, 'box2', `${a}x`);
  s += cell(x, y + rh, cw, bh, 'box2', `${b}x`);
  s += cell(x + cw, y + rh, aw, bh, 'box', corner);
  s += `<text class="tk" x="${x + cw / 2}" y="16" text-anchor="middle">x</text>`;
  s += `<text class="tk" x="${x + cw + aw / 2}" y="16" text-anchor="middle">${a}</text>`;
  s += `<text class="tk" x="36" y="${y + rh / 2}" text-anchor="end">x</text>`;
  s += `<text class="tk" x="36" y="${y + rh + bh / 2}" text-anchor="end">${b}</text>`;
  return open(250, 168, 'a rectangle split into four parts') + s + '</svg>';
}

export function cornerGap(h) {
  return areaModel(h, h, '?').replace(`aria-label="a rectangle split into four parts"`, 'aria-label="a square with a missing corner"');
}

export function rootSquare(area) {
  return open(200, 150, 'a square and its area')
    + `<rect class="box" x="50" y="24" width="100" height="100"/>`
    + `<text class="onshape" x="100" y="78" text-anchor="middle">area ${area}</text>`
    + `<text class="tk" x="100" y="16" text-anchor="middle">side ?</text></svg>`;
}

export function ruleBars(start, each, eachWord) {
  return open(230, 124, 'a starting amount and an equal add')
    + cell(28, 24, 74, 58, 'box', String(start))
    + cell(128, 24, 74, 58, 'box2', `+${each}`)
    + `<text class="tk" x="65" y="108" text-anchor="middle">start</text>`
    + `<text class="tk" x="165" y="108" text-anchor="middle">${esc(eachWord)}</text></svg>`;
}

export function growChart(addVals, mulVals) {
  const max = Math.max(...addVals, ...mulVals, 1);
  const h = v => Math.max(3, Math.round(v / max * 46));
  const row = (vals, base, cls) => vals.map((v, i) => {
    const bh = h(v);
    const x = 54 + i * 38;
    return `<rect class="${cls}" x="${x}" y="${base - bh}" width="30" height="${bh}"/>`
      + `<text class="tk" x="${x + 15}" y="${base + 16}" text-anchor="middle">${v}</text>`;
  }).join('');
  const s = `<text class="tk" x="8" y="36">add</text><text class="tk" x="8" y="118">times</text>`
    + row(addVals, 70, 'box') + row(mulVals, 152, 'box2');
  return open(220, 176, 'an adding list and a multiplying list') + s + '</svg>';
}

function tri(x, y, s) {
  return `<polygon class="box" points="${x},${y} ${x + 28 * s},${y} ${x},${y - 36 * s}"/>`;
}

export function similarPair(k, missing) {
  const long = missing ? '?' : String(5 * k);
  let s = tri(16, 78, 1.4) + tri(130, 120, 1.4 * Math.min(k, 2));
  s += `<text class="tk" x="36" y="96" text-anchor="middle">3</text>`;
  s += `<text class="tk" x="8" y="52" text-anchor="start">4</text>`;
  s += `<text class="tk" x="48" y="58">5</text>`;
  s += `<text class="tk" x="168" y="136" text-anchor="middle">${3 * k}</text>`;
  s += `<text class="tk" x="118" y="78">${4 * k}</text>`;
  s += `<text class="tk" x="176" y="70">${long}</text>`;
  return open(250, 150, 'two similar right triangles') + s + '</svg>';
}

export function rightTri(o, a, hyp) {
  return open(220, 160, `a right triangle with sides ${o}, ${a} and ${hyp}`)
    + `<polygon class="box" points="40,128 150,128 40,36"/>`
    + `<text class="tk" x="95" y="148" text-anchor="middle">${a}</text>`
    + `<text class="tk" x="28" y="86" text-anchor="end">${o}</text>`
    + `<text class="tk" x="112" y="78">${hyp}</text></svg>`;
}

export function powersRow() {
  return open(250, 100, 'terms with different powers')
    + cell(8, 28, 74, 48, 'box', 'power 4')
    + cell(90, 28, 74, 48, 'box2', 'power 1')
    + cell(172, 28, 70, 48, 'box', 'plain')
    + '</svg>';
}

export function termGroups(a, b, c, d) {
  const box = (x, t) => cell(x, 36, 52, 48, 'box', t);
  return open(250, 110, 'two groups of like terms')
    + box(8, `${a}x`) + box(66, String(b)) + box(132, `${c}x`) + box(190, String(d)) + '</svg>';
}

export function quarterCircle() {
  return open(220, 170, 'a quarter of a circle and the height of a point')
    + `<path class="curve" d="M 150 130 A 100 100 0 0 0 50 30"/>`
    + `<line class="ax" x1="50" y1="130" x2="170" y2="130"/><line class="ax" x1="50" y1="130" x2="50" y2="18"/>`
    + `<circle class="pt" cx="114" cy="53" r="5"/>`
    + `<line class="sec" x1="114" y1="53" x2="114" y2="130"/>`
    + `<text class="tk" x="122" y="96">height</text>`
    + `<text class="tk" x="78" y="148">along</text></svg>`;
}

export function bellCurve() {
  const pts = [[20, 120], [50, 112], [80, 88], [110, 40], [140, 88], [170, 112], [200, 120]];
  return open(230, 150, 'a bell curve with a band around the center')
    + `<rect class="band" x="80" y="28" width="60" height="96"/>`
    + `<polyline class="curve" points="${pts.map(p => p.join(',')).join(' ')}"/>`
    + `<text class="tk" x="110" y="142" text-anchor="middle">one step</text></svg>`;
}
