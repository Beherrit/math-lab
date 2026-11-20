// Whole numbers written out in words, up to the millions.
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
  'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function under1000(n) {
  const h = Math.floor(n / 100), r = n % 100, out = [];
  if (h) out.push(ONES[h] + ' hundred');
  if (r) out.push(r < 20 ? ONES[r] : TENS[Math.floor(r / 10)] + (r % 10 ? '-' + ONES[r % 10] : ''));
  return out.join(' ');
}

// The three-digit groups of n with their group word: [[4, 'million'], [305, 'thousand'], [12, '']].
export function groups(n) {
  return [[Math.floor(n / 1e6), 'million'], [Math.floor(n / 1000) % 1000, 'thousand'], [n % 1000, '']].filter(g => g[0]);
}

export const words = n => groups(n).map(([v, w]) => under1000(v) + (w ? ' ' + w : '')).join(', ');
