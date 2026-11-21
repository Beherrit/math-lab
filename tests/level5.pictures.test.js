import assert from 'node:assert/strict';
import { SKILLS, generate } from '../js/skills/registry.js';
import { seeded } from './level5.checks.js';
import { problems, splitSvgs, readSvg, MIN_PX } from './level5.svg.js';

// Every picture a Level 5 problem can show (in the question or in a worked way), old skills and new, measured the way a
// phone would show it: label size on a 320 px wide screen, clipping, overlaps and points that must sit on the grid.
const L5 = SKILLS.filter(s => s.level === 5);
const PER_STEP = 120;
const gather = (id, L) => {
  const seen = new Map();
  for (let i = 0; i < PER_STEP; i++) {
    const p = generate(id, L);
    if (!p) continue;
    for (const svg of [...splitSvgs(p.visual), ...p.ways.flatMap(w => w.s.flatMap(splitSvgs))]) seen.set(svg, 1);
  }
  return [...seen.keys()];
};
const kind = m => m.replace(/-?\d+(\.\d+)?/g, '#');

for (const s of L5) {
  seeded(`${s.id}: every picture has readable, unclipped, non-overlapping labels and points on the grid`, () => {
    const bad = new Map();
    for (const L of [1, 2, 3]) for (const svg of gather(s.id, L)) for (const m of problems(svg)) if (!bad.has(kind(m))) bad.set(kind(m), `step ${L}: ${m}`);
    assert.deepEqual([...bad.values()], [], `${s.id}: picture problems`);
  });
}

// The checker itself must be able to fail: four hand-made pictures that each break one rule.
const frame = inner => `<svg class="viz plane" viewBox="0 0 320 320" role="img" aria-label="x" style="max-width:320px">${inner}</svg>`;
seeded('the picture checker catches small labels, clipped labels, overlaps and points off the grid', () => {
  assert.equal(readSvg(frame('<text x="10" y="20" class="tk">1</text>')).texts[0].px < MIN_PX, true, 'plane tick labels are measured from the stylesheet');
  assert.match(problems(frame('<text x="160" y="4" text-anchor="middle" style="font-size:20px">Big</text>')).join(), /clipped/);
  assert.match(problems(frame('<text x="100" y="100" style="font-size:20px">AB</text><text x="105" y="100" style="font-size:20px">CD</text>')).join(), /overlap/);
  assert.match(problems(frame('<line x1="30" y1="30" x2="290" y2="30" class="gl"/><line x1="30" y1="30" x2="30" y2="290" class="gl"/><circle cx="310" cy="100" r="6" class="pt"/>')).join(), /off the visible grid/);
  assert.match(problems(frame('<circle cx="100" cy="100" r="6" class="pt"/><text x="101" y="104" style="font-size:20px">A</text>')).join(), /touches a dot/);
});
