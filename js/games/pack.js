// Keep one right choice and up to three different wrong ones, then shuffle.
export function four(rng, items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    if (!it || seen.has(String(it.id))) continue;
    seen.add(String(it.id));
    out.push(it);
  }
  return rng.shuffle(out.slice(0, 4));
}
