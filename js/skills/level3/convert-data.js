// The measurement pairs for converting from a larger unit to a smaller one, with the story frames that use them.
// big and small are [one, many, abbreviation]. lo and hi are the sizes of the larger count that read as believable.
export const PAIRS = {
  'km-m': { big: ['kilometer', 'kilometers', 'km'], small: ['meter', 'meters', 'm'], f: 1000, lo: 2, hi: 30, adj: 'longer', pieces: [250, 500],
    div: (B, p) => `A trail is ${B} long. It is split into legs of ${p} meters each.`, divAsk: 'How many legs are there?',
    sub: (B, S, who) => `A cycling route is ${B} long. ${who} has ridden ${S} meters.`, subAsk: 'How many meters are left?' },
  'm-cm': { big: ['meter', 'meters', 'm'], small: ['centimeter', 'centimeters', 'cm'], f: 100, lo: 2, hi: 30, adj: 'longer', pieces: [20, 25, 50],
    div: (B, p) => `A board is ${B} long. It is cut into pieces ${p} centimeters long.`, divAsk: 'How many pieces is that?',
    sub: (B, S, who) => `A ribbon is ${B} long. ${who} cuts off ${S} centimeters.`, subAsk: 'How many centimeters of ribbon are left?' },
  'kg-g': { big: ['kilogram', 'kilograms', 'kg'], small: ['gram', 'grams', 'g'], f: 1000, lo: 2, hi: 25, adj: 'heavier', pieces: [250, 500],
    div: (B, p) => `A bakery has ${B} of flour. Each loaf uses ${p} grams.`, divAsk: 'How many loaves can it make?',
    sub: (B, S, who) => `A bag holds ${B} of rice. ${who} cooks with ${S} grams.`, subAsk: 'How many grams of rice are left?' },
  'L-mL': { big: ['liter', 'liters', 'L'], small: ['milliliter', 'milliliters', 'mL'], f: 1000, lo: 2, hi: 20, adj: 'more', pieces: [200, 250, 500],
    div: (B, p) => `A jug holds ${B} of juice. Each glass takes ${p} milliliters.`, divAsk: 'How many glasses can be filled?',
    sub: (B, S, who) => `A bottle holds ${B} of water. ${who} drinks ${S} milliliters.`, subAsk: 'How many milliliters are left in the bottle?' },
  'h-min': { big: ['hour', 'hours', 'h'], small: ['minute', 'minutes', 'min'], f: 60, lo: 2, hi: 12, adj: 'longer', pieces: [10, 15, 20, 30],
    div: (B, p) => `A practice session lasts ${B}. Each drill takes ${p} minutes.`, divAsk: 'How many drills fit in the session?',
    sub: (B, S, who) => `A movie marathon lasts ${B}. ${who} has watched ${S} minutes.`, subAsk: 'How many minutes are left?' },
  'min-s': { big: ['minute', 'minutes', 'min'], small: ['second', 'seconds', 's'], f: 60, lo: 2, hi: 15, adj: 'longer', pieces: [15, 20, 30],
    div: (B, p) => `A playlist runs for ${B}. Each short song lasts ${p} seconds.`, divAsk: 'How many songs are in the playlist?',
    sub: (B, S, who) => `A video is ${B} long. ${who} has watched ${S} seconds.`, subAsk: 'How many seconds are left?' },
  'ft-in': { big: ['foot', 'feet', 'ft'], small: ['inch', 'inches', 'in'], f: 12, lo: 2, hi: 15, adj: 'longer', pieces: [4, 6, 8],
    div: (B, p) => `A shelf board is ${B} long. Each small shelf needs ${p} inches.`, divAsk: 'How many small shelves can be cut from it?',
    sub: (B, S, who) => `A plank is ${B} long. ${who} saws off ${S} inches.`, subAsk: 'How many inches of plank are left?' },
  'lb-oz': { big: ['pound', 'pounds', 'lb'], small: ['ounce', 'ounces', 'oz'], f: 16, lo: 2, hi: 12, adj: 'heavier', pieces: [4, 8],
    div: (B, p) => `A shop has ${B} of trail mix. It fills bags of ${p} ounces.`, divAsk: 'How many bags can it fill?',
    sub: (B, S, who) => `A box of books weighs ${B}. ${who} takes out ${S} ounces of books.`, subAsk: 'How many ounces does the box weigh now?' },
};
export const PAIR_IDS = Object.keys(PAIRS);
// Pairs that suit the first step: whole-number facts a learner already meets in daily life.
export const EASY = ['m-cm', 'km-m', 'h-min', 'ft-in', 'kg-g', 'L-mL'];
