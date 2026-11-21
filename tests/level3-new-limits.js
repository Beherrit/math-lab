// Believable numbers for each step of the newer level 3 skills: (t, L, p) => true when the raw numbers of a problem fit step L.
const within = (v, lo, hi) => v === undefined || (Number.isFinite(v) && v >= lo && v <= hi);
const top = ([w, n, d]) => w * d + n;
const EASY_PAIRS = ['m-cm', 'km-m', 'h-min', 'ft-in', 'kg-g', 'L-mL'];
const DEN = [[2, 4], [4, 8], [4, 8]];
const MAXD = [8, 10, 12];

export const LIMITS_NEW = {
  l3times: (t, L) => within(t.t, 2, [5, 9, 12][L - 1]) && within(t.s, 2, [5, 12, 25][L - 1]) && within(t.big, 4, 300) && within(t.prod, 4, 300) && within(t.u, 2, 4) && within(t.m, 2, 12),
  l3pattern: (t, L) => within(t.start, 1, [10, 20, 30][L - 1]) && within(t.step, 2, [5, 9, 12][L - 1]) && (L > 1 || t.op !== '×') && (t.kind !== 'patnth' || within(t.n, L === 2 ? 6 : 15, L === 2 ? 12 : 30)) && within(t.x, 1, 400),
  l3shift: (t, L) => (t.f === undefined || (L === 1 ? t.f === 10 || t.f === 100 : [10, 100, 1000].includes(t.f))) && (t.kind !== 'tenmul' || within(t.a, 2, [99, 999, 9999][L - 1])) && (t.kind !== 'tenfold' || (t.hiP - t.loP >= [1, 1, 2][L - 1] && t.hiP - t.loP <= [1, 2, 3][L - 1])) && within(t.n, 1, 9999999),
  l3fparts: (t, L) => within(t.d, 2, [8, 11, 13][L - 1]) && within(t.w, 1, 6) && (t.n === undefined || t.n > 0),
  l3mixadd: (t, L) => (t.kind === 'fsum' ? t.a[2] <= MAXD[L - 1] && (t.op === '+' || top(t.a) > top(t.c)) && (L > 1 || (t.op === '+' ? t.a[1] + t.c[1] < t.a[2] : t.a[1] > t.c[1])) : within(t.d, 3, MAXD[L - 1])),
  l3tenhund: (t, L) => within(t.t, 1, 9) && within(t.h, 0, L === 1 ? 9 : L === 2 ? 25 : 99) && (t.kind !== 'thdown' || within(t.n, 10, 90)),
  l3decorder: t => (t.kind !== 'docloser' || (t.i >= 1 && t.i <= 9 && t.i !== 5)) && (t.kind !== 'dofcmp' || t.d === 10 || t.d === 100) && (t.kind !== 'dobetween' || Math.abs(t.hi - t.lo - 0.1) < 1e-9),
  l3convert: (t, L) => within(t.n, 2, [9, 30, 60][L - 1]) && (L > 1 || EASY_PAIRS.includes(t.pair)) && within(t.piece, 4, 500),
  l3lineplot: (t, L) => DEN[L - 1].includes(t.den) && t.counts.reduce((a, x) => a + x, 0) <= (t.kind === 'lpSum' ? 8 : [10, 14, 14][L - 1]) && t.counts.filter(c => c > 0).length >= 3,
  l3protractor: (t, L) => (t.kind !== 'prread' || (L === 1 ? t.deg % 10 === 0 && within(t.deg, 20, 160) : t.deg % 5 === 0 && within(t.deg, 15, 175))) && (t.kind !== 'prturn' || L > 1 || [90, 180, 270].includes(t.deg)) && (t.kind !== 'prmin' || (L === 1 ? [15, 30, 45].includes(t.min) : L === 2 ? t.min % 5 === 0 : t.min % 5 !== 0)) && within(t.r2, 1, 175) && (t.known === undefined || t.known.every(a => a >= 30)),
  l3lines: t => (t.kind !== 'lnprop' || (within(t.pairs, 0, 2) && within(t.right, 0, 4))),
  l3symmetry: (t, L) => (t.kind !== 'sypoint' || (t.x < t.axis && within(t.axis, L === 2 ? 4 : 8, L === 2 ? 12 : 30))) && within(t.half, 3, 40),
  l3estimate: (t, L) => (t.kind !== 'esmul' || (L === 1 ? within(t.a, 11, 99) && within(t.c, 2, 9) : within(t.a, 101, 999))) && (t.kind !== 'eswhich' || L > 1 || t.to === 100) && within(t.price, 2, 19.99) && within(t.qty, 3, 9) && within(t.d, 3, 9),
};
