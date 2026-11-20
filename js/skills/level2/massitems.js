// Everyday things with a believable mass or liquid volume: [name, best unit, low, high] in that unit.
import { rnd } from '../../util.js';

export const UNIT_NAME = { g: 'grams', kg: 'kilograms', mL: 'milliliters', L: 'liters' };
export const OTHER = { g: 'kg', kg: 'g', mL: 'L', L: 'mL' };
export const MASS = [['an apple', 'g', 150, 220], ['a pencil', 'g', 5, 10], ['a phone', 'g', 150, 220], ['a slice of bread', 'g', 25, 40], ['a basketball', 'g', 550, 650], ['a loaf of bread', 'g', 400, 800],
  ['a bag of sugar', 'kg', 1, 2], ['a laptop', 'kg', 1, 3], ['a cat', 'kg', 3, 6], ['a backpack of books', 'kg', 3, 8], ['a watermelon', 'kg', 3, 6], ['a guitar', 'kg', 2, 4], ['a dog', 'kg', 10, 30], ['a bicycle', 'kg', 10, 15]];
export const VOLUME = [['a spoonful of medicine', 'mL', 5, 10], ['a cup of milk', 'mL', 200, 250], ['a can of soda', 'mL', 330, 355], ['a water bottle', 'mL', 500, 750], ['a glass of juice', 'mL', 200, 300],
  ['a carton of juice', 'L', 1, 2], ['a kettle', 'L', 1, 2], ['a bucket', 'L', 8, 12], ['a pot of soup', 'L', 2, 4], ['a fish tank', 'L', 20, 60], ['the fuel tank of a car', 'L', 40, 60], ['a bathtub', 'L', 150, 250]];
export const ITEMS = [...MASS, ...VOLUME];
// A number of the item's best unit, rounded the way people say it ("about 180 grams", "about 500 milliliters").
export function typical([, , lo, hi]) {
  const n = rnd(lo, hi);
  return n >= 300 ? Math.round(n / 50) * 50 : n >= 100 ? Math.round(n / 10) * 10 : n >= 40 ? Math.round(n / 5) * 5 : n;
}
export const FACTOR = { g: 1, kg: 1000, mL: 1, L: 1000 };
// Something you know, to compare with.
export const ANCHOR = { g: 'A paperclip is about 1 gram and a phone is about 200 grams.', kg: 'A bag of sugar is about 1 kilogram.', mL: 'A spoonful is about 5 milliliters and a cup is about 250 milliliters.', L: 'A big bottle of juice is about 1 liter.' };
