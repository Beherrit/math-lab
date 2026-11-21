// Pictures for the method skills. Text on a colored box uses onshape (stays dark). Labels on the page use lab.
// A narrow picture stretched to the card width becomes too tall on a phone, so pad the viewBox.
export const svg = (w, h, label, body) => {
  const W = h / w > 0.62 ? Math.max(w, Math.ceil(h / 0.5)) : w;
  return `<svg class="viz hs" viewBox="0 0 ${W} ${h}" role="img" aria-label="${label}">${body}</svg>`;
};
export const box = (x, y, w, h, tone) => `<rect class="${tone || 'box'}" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`;
export const label = (x, y, text, cls = 'onshape') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="middle">${text}</text>`;

export function bondPic(whole, part) {
  return svg(220, 118, 'Number bond', [
    box(80, 6, 60, 36), label(110, 30, whole),
    `<line class="ax" x1="110" y1="42" x2="55" y2="68"/>`,
    `<line class="ax" x1="110" y1="42" x2="165" y2="68"/>`,
    box(25, 70, 60, 36, 'box2'), label(55, 94, part),
    box(135, 70, 60, 36), label(165, 94, '?'),
  ].join(''));
}

export function splitPic(a, take, rest) {
  const cell = (x, n, tone) => `${box(x, 28, 64, 44, tone)}${label(x + 32, 56, n)}`;
  return svg(276, 88, 'Break apart', `${cell(8, a, 'box')}${label(84, 56, '+', 'lab')}${cell(100, take, 'box2')}${label(176, 56, '+', 'lab')}${cell(192, rest, 'box2')}`);
}

export function barPic(rows) {
  const body = rows.map((r, i) => {
    const y = 10 + i * 40;
    return `${label(28, y + 22, r.text, 'lab')}${box(52, y, r.w, 28, r.tone || 'box')}`;
  }).join('');
  return svg(250, 16 + rows.length * 40, 'Bar model', body);
}

export function widths(vals) {
  const m = Math.max(...vals, 1);
  return vals.map(v => Math.max(24, Math.round(v / m * 160)));
}

export function stickPic(hGroups, vGroups) {
  const span = groups => {
    const at = []; let x = 0;
    for (const n of groups) {
      for (let i = 0; i < n; i++) { at.push(x); x += 14; }
      x += 26;
    }
    return at;
  };
  const ys = span(hGroups).map(y => y + 26);
  const xs = span(vGroups).map(x => x + 36);
  const right = Math.max(...xs) + 28;
  const bottom = Math.max(...ys) + 22;
  const lines = [
    ...ys.map(y => `<line class="ax" x1="24" y1="${y}" x2="${right}" y2="${y}"/>`),
    ...xs.map(x => `<line class="sec" x1="${x}" y1="12" x2="${x}" y2="${bottom}"/>`),
  ].join('');
  return svg(right + 12, bottom + 12, 'Line multiplication', lines);
}

export function elevenPic(parts) {
  const body = parts.map((p, i) => `${box(8 + i * 72, 20, 60, 44, i === 1 ? 'box2' : 'box')}${label(38 + i * 72, 48, p)}`).join('');
  return svg(16 + parts.length * 72, 80, 'Multiply by 11', body);
}

export function squarePic(t) {
  return svg(300, 84, 'Square ending in 5', [
    box(8, 22, 52, 44), label(34, 50, t),
    label(78, 50, '×', 'lab'),
    box(96, 22, 52, 44), label(122, 50, t + 1),
    label(176, 50, 'then', 'lab'),
    box(214, 22, 64, 44, 'box2'), label(246, 50, '25'),
  ].join(''));
}

export function latticePic(top, side, cells) {
  const cw = 78, ch = 58, ox = 36, oy = 26;
  let s = '';
  top.forEach((d, c) => { s += label(ox + c * cw + cw / 2, 16, d, 'lab'); });
  side.forEach((d, r) => { s += label(16, oy + r * ch + ch / 2 + 5, d, 'lab'); });
  cells.forEach((row, r) => row.forEach((cell, c) => {
    const x = ox + c * cw, y = oy + r * ch;
    s += `<rect class="box" x="${x}" y="${y}" width="${cw}" height="${ch}"/>`;
    s += `<line class="ax" x1="${x}" y1="${y}" x2="${x + cw}" y2="${y + ch}"/>`;
    s += label(x + 20, y + 20, cell[0]);
    s += label(x + cw - 20, y + ch - 14, cell[1]);
  }));
  return svg(ox + top.length * cw + 12, oy + side.length * ch + 8, 'Lattice', s);
}

export function peasantPic(rows) {
  const head = `${label(28, 16, 'Halve', 'lab')}${label(100, 16, 'Double', 'lab')}${label(176, 16, 'Use', 'lab')}`;
  const body = rows.map((r, i) => {
    const y = 40 + i * 28;
    const strike = r.keep ? '' : `<line class="ax" x1="70" y1="${y - 4}" x2="130" y2="${y - 4}"/>`;
    return `${label(28, y, r.left, 'lab')}${label(100, y, r.right, 'lab')}${label(176, y, r.keep ? 'keep' : 'skip', 'lab')}${strike}`;
  }).join('');
  return svg(210, 28 + rows.length * 28, 'Double and halve', head + body);
}

export function equalPic(a, b, add) {
  return svg(300, 88, 'Equal additions', [
    label(48, 28, a, 'lab'), label(100, 28, '−', 'lab'), label(152, 28, b, 'lab'),
    label(48, 66, a + add, 'lab'), label(100, 66, '−', 'lab'), label(152, 66, b + add, 'lab'),
    label(230, 48, `both +${add}`, 'lab'),
  ].join(''));
}

export function gapPic(from, to) {
  return svg(260, 72, 'Count up', [
    `<line class="ax" x1="24" y1="36" x2="236" y2="36"/>`,
    `<circle class="pt" cx="24" cy="36" r="5"/>`,
    `<circle class="pt" cx="236" cy="36" r="5"/>`,
    label(24, 20, from, 'lab'), label(236, 20, to, 'lab'), label(130, 62, '?', 'lab'),
  ].join(''));
}

export function areaPic(pieces) {
  let x = 8;
  const body = pieces.map(p => {
    const w = Math.max(72, String(p).length * 14);
    const bit = `${box(x, 22, w, 48, x === 8 ? 'box' : 'box2')}${label(x + w / 2, 52, p)}`;
    x += w + 8;
    return bit;
  }).join('');
  return svg(x + 4, 88, 'Area model', body);
}

export function shortPic(d, digits, carry) {
  const cells = digits.map((n, i) => {
    const x = 64 + i * 40;
    const c = carry && carry.index === i ? label(x - 8, 24, carry.value, 'lab') : '';
    return `${c}${box(x, 32, 32, 36)}${label(x + 16, 56, n)}`;
  }).join('');
  return svg(80 + digits.length * 40, 84, 'Short division', `${label(28, 56, d, 'lab')}<text class="lab" x="48" y="58">)</text>${cells}`);
}

export function rowsPic(n, each) {
  let s = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < each; c++) s += `<circle class="pt" cx="${14 + c * 16}" cy="${14 + r * 16}" r="5"/>`;
  return svg(20 + each * 16, 20 + n * 16, 'Equal rows', s);
}
