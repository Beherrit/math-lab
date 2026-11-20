import { R, pick, shuffle, b, k, way } from '../../util.js';
const OPS = { add: 'Add', sub: 'Subtract', mul: 'Multiply', div: 'Divide' };
export function makeStory(sources, L) {
for (let t = 0; t < 20; t++) {
const p = pick(sources)(L);
if (!p || !p.story || !p.read) continue;
if (p.op === 'multi') p.pre = { q: 'What will this problem take?', options: shuffle(['Add only', 'Subtract only', 'More than one step', 'Multiply only']), correct: 'More than one step', why: p.read.clue };
else if (OPS[p.op]) p.pre = { q: 'What do you need to do?', options: ['Add', 'Subtract', 'Multiply', 'Divide'], correct: OPS[p.op], why: p.read.clue };
p.ways = [way('Read it like a detective', [`${b('What is the question asking?')} ${p.read.find}`, `${b('What do we know?')} ${p.read.know.join(' • ')}`, `${b('Clue words:')} ${p.read.clue}`, `${b('Plan:')} ${p.read.plan}`]), ...p.ways];
return p;
}
}
