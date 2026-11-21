// Small drawn pieces for the Kindergarten puzzles. No icon glyphs: shapes only.
const INK = '#16365c';
export const FILLS = { red: '#d23a4a', blue: '#2c6bed', yellow: '#e6b325', green: '#1c9a55', grape: '#5b3fd6' };

export function shapeSVG(shape, fill, size = 64) {
  const s = size;
  const paint = `fill="${fill}" stroke="${INK}" stroke-width="3"`;
  let body = `<circle cx="${s / 2}" cy="${s / 2}" r="${s / 2 - 7}" ${paint}/>`;
  if (shape === 'square') body = `<rect x="8" y="8" width="${s - 16}" height="${s - 16}" rx="6" ${paint}/>`;
  if (shape === 'triangle') body = `<polygon points="${s / 2},7 ${s - 8},${s - 8} 8,${s - 8}" ${paint}/>`;
  if (shape === 'rectangle') body = `<rect x="6" y="16" width="${s - 12}" height="${s - 32}" rx="6" ${paint}/>`;
  return `<svg class="gtile" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" aria-hidden="true">${body}</svg>`;
}

export function shapeRow(items, hole = false) {
  const cell = 72;
  const w = items.length * cell;
  const bits = items.map((it, i) => {
    const x = i * cell + 4;
    if (!it) return `<rect x="${x}" y="8" width="60" height="60" rx="10" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-dasharray="5 4"/>`;
    return `<g transform="translate(${x},6)">${shapeSVG(it.shape, it.fill, 60)}</g>`;
  }).join('');
  const label = hole ? 'pattern with an empty box' : 'a row of shapes';
  return `<svg class="grow" viewBox="0 0 ${w} 76" role="img" aria-label="${label}">${bits}</svg>`;
}

export function boxes(n, { filled = false, fill = FILLS.grape } = {}) {
  const cell = 34;
  const w = n * cell;
  let s = '';
  for (let i = 0; i < n; i++) {
    s += `<rect x="${i * cell + 3}" y="4" width="28" height="28" rx="4" fill="${filled ? fill : '#fff'}" stroke="${INK}" stroke-width="2.5"/>`;
  }
  return `<svg class="gboxes" viewBox="0 0 ${w} 36" role="img" aria-label="${filled ? n + ' squares' : n + ' empty spaces'}">${s}</svg>`;
}

// A ten frame: two rows of five. The first `filled` cells are colored.
export function tenFrame(filled) {
  let s = '';
  for (let i = 0; i < 10; i++) {
    const x = (i % 5) * 40 + 4;
    const y = Math.floor(i / 5) * 40 + 4;
    const on = i < filled;
    s += `<rect x="${x}" y="${y}" width="34" height="34" rx="6" fill="${on ? FILLS.grape : '#fff'}" stroke="${INK}" stroke-width="2.5"/>`;
  }
  return `<svg class="gten" viewBox="0 0 208 88" role="img" aria-label="ten frame with ${filled} filled">${s}</svg>`;
}
