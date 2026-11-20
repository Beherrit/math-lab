// Wraps a story source into a full story problem: adds the "what will it take" question and the reading way.
import { pick, shuffle, b, way } from '../../util.js';

const OPS = { add: 'Add', sub: 'Subtract', mul: 'Multiply', div: 'Divide' };
const MULTI = ['Add only', 'Subtract only', 'More than one step', 'Multiply only'];

export function makeStory(sources, L) {
  for (let t = 0; t < 20; t++) {
    const p = pick(sources)(L);
    if (!p || !p.story || !p.read) continue;
    if (p.op === 'multi') p.pre = { q: 'What will this problem take?', options: shuffle(MULTI), correct: 'More than one step', why: p.read.clue };
    else if (OPS[p.op]) p.pre = { q: 'What do you need to do?', options: Object.values(OPS), correct: OPS[p.op], why: p.read.clue };
    const reading = way('Read it first', [`${b('What is the question asking?')} ${p.read.find}`, `${b('What do we know?')} ${p.read.know.join('; ')}`,
      `${b('Clue words:')} ${p.read.clue}`, `${b('Plan:')} ${p.read.plan}`]);
    p.ways = [reading, ...p.ways];
    return p;
  }
  return null;
}
