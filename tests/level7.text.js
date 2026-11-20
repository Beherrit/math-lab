// Turning what a child sees (HTML) and what a problem stores (an answer object) into plain text and numbers.
// The hidden tag that index.js adds to picture questions is not shown, so it is dropped first.
export const text = s => String(s).replace(/<span hidden>.*?<\/span>/g, '').replace(/<span class="fr"><span class="n">(.*?)<\/span><span class="d">(.*?)<\/span><\/span>/g, '$1/$2')
  .replace(/<br\s*\/?>|<\/t[dh]>/g, ' ').replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '').replace(/−/g, '-').replace(/,(?=\d{3})/g, '');
// The answer in a plain form: number, fraction value, chosen text, or [x, y].
export function ans(p) {
  const a = p.answer;
  if (a.kind === 'num') return a.value;
  if (a.kind === 'frac') return a.n / a.d;
  if (a.kind === 'choice') return text(a.options[a.correct]);
  return [a.x, a.y];
}
// Every number written in a piece of text, signs dropped; "3/4" counts as the number 3 and the number 4 and 0.75.
export function nums(str) {
  const out = [];
  const spaced = String(str).replace(/(\d+)<span class="mxs"><\/span><span class="fr"><span class="n">(\d+)<\/span><span class="d">(\d+)<\/span><\/span>/g, (_, w, n, d) => ` ${Number(w) + n / d} `).replace(/<span class="fr">/g, ' <span class="fr">');
  for (const m of text(spaced).matchAll(/(\d+(?:\.\d+)?)(?:\/(\d+))?/g)) {
    out.push(Number(m[1]));
    if (m[2]) out.push(Number(m[2]), Number(m[1]) / Number(m[2]));
  }
  return out;
}
export const has = (list, v) => list.some(x => Math.abs(x - Math.abs(v)) <= 1e-9 * Math.max(1, Math.abs(v)));
// What the child reads: story, question, expression and any table (a picture drawn with svg shows no numbers).
export const seenText = p => [p.story, p.ask, p.expr, p.visual && !/<svg/.test(p.visual) ? p.visual : ''].filter(Boolean).join(' ');
