// First-sound words and the letters that can make each sound. Every word starts with a letter making its usual sound:
// no silent letters, no ph / kn / wr, no soft c or g, and vowels only in their short sound (apple, egg, igloo, octopus, umbrella).
export const WORDS = [
  'apple', 'ant', 'add', 'egg', 'elf', 'elbow', 'igloo', 'insect', 'ink', 'octopus', 'otter', 'ox', 'umbrella', 'under', 'up',
  'ball', 'bed', 'bus', 'bat', 'bug', 'cat', 'cup', 'cow', 'cap', 'car', 'cake', 'dog', 'doll', 'duck', 'door', 'dish',
  'fish', 'fan', 'fox', 'frog', 'foot', 'goat', 'gum', 'game', 'gate', 'hat', 'hen', 'house', 'horse', 'hand',
  'jam', 'jet', 'jump', 'jug', 'kite', 'key', 'king', 'kid', 'lion', 'leg', 'lamp', 'leaf', 'log',
  'moon', 'mat', 'milk', 'mouse', 'mop', 'nest', 'net', 'nose', 'nut', 'pig', 'pen', 'pan', 'pot', 'park',
  'rat', 'ring', 'rain', 'rug', 'red', 'sun', 'sock', 'sit', 'soap', 'star', 'top', 'tent', 'toy', 'tub', 'tiger',
  'van', 'vest', 'vet', 'web', 'wig', 'worm', 'wing', 'window', 'yak', 'yarn', 'yell', 'yes', 'zip', 'zoo', 'zebra', 'zero',
];
// Which sounds each letter can start a word with. Two letters that share a sound are never offered together.
export const SOUNDS = {
  a: ['a-short', 'a-long'], e: ['e-short', 'e-long'], i: ['i-short', 'i-long'], o: ['o-short', 'o-long'], u: ['u-short', 'u-long'],
  b: ['b'], c: ['k', 's'], d: ['d'], f: ['f'], g: ['g', 'j'], h: ['h'], j: ['j'], k: ['k'], l: ['l'], m: ['m'], n: ['n'], p: ['p'],
  q: ['k'], r: ['r'], s: ['s'], t: ['t'], v: ['v'], w: ['w'], x: ['z', 'ks'], y: ['y'], z: ['z'],
};
export const sameSound = (a, b) => SOUNDS[a].some(s => SOUNDS[b].includes(s));
