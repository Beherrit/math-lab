// Multiply before you add. Going straight left to right is the usual slip.
export const orderMeta = {
  id: 'g5order',
  title: 'What comes first',
  blurb: 'Multiply before you add.',
  skill: 'oa',
};

function art(a, b, c) {
  return `<svg class="viz" viewBox="0 0 280 78" role="img" aria-label="${a} plus ${b} times ${c}">
    <text x="140" y="50" text-anchor="middle" class="lbl strong" style="font-size:36px">${a} + ${b} × ${c}</text>
  </svg>`;
}

export function makeOrder(rng) {
  const a = rng.int(2, 8);
  const b = rng.int(2, 6);
  const c = rng.int(2, 6);
  const right = a + b * c;
  const left = (a + b) * c;
  const decoys = [...new Set([left, b * c, a * b + c, a + b + c])].filter(n => n !== right);
  let extra = right + 1;
  while (decoys.length < 3) {
    if (!decoys.includes(extra)) decoys.push(extra);
    extra += 1;
  }
  const nums = rng.shuffle([right, ...decoys.slice(0, 3)]);
  const choices = nums.map(n => ({ id: String(n), label: String(n), html: `<span class="gnum">${n}</span>` }));
  const why = `Multiply before you add. ${b} × ${c} is ${b * c}, then ${a} + ${b * c} is ${right}. Adding ${a} + ${b} first makes ${a + b}, and ${a + b} × ${c} is ${left}. That left-to-right total skips the multiply.`;
  return {
    prompt: `What is ${a} + ${b} × ${c}?`,
    say: `What is ${a} plus ${b} times ${c}? Multiply before you add.`,
    visual: art(a, b, c),
    choices,
    answer: String(right),
    why,
    facts: { a, b, c, right, left },
  };
}
