// Stickers.
import { solidCount } from './facts.js';
import { masteredCount } from './progression.js';
const days = S => Object.values(S.days);
const mastered = masteredCount;
export const BADGES = [
{ id: 'first', name: 'First page', desc: 'Finished a daily 10 minutes', test: S => days(S).some(d => d.done) },
{ id: 'streak3', name: '3-day streak', desc: '3 days in a row', test: S => S.streak.n >= 3 },
{ id: 'streak7', name: 'Week warrior', desc: '7 days in a row', test: S => S.streak.n >= 7 },
{ id: 'streak14', name: 'Two weeks strong', desc: '14 days in a row', test: S => S.streak.n >= 14 },
{ id: 'streak30', name: 'Math habit', desc: '30 days in a row', test: S => S.streak.n >= 30 },
{ id: 'stars100', name: '100 stars', desc: 'Earned 100 stars', test: S => S.stars >= 100 },
{ id: 'stars500', name: '500 stars', desc: 'Earned 500 stars', test: S => S.stars >= 500 },
{ id: 'stars1000', name: 'Star collector', desc: 'Earned 1,000 stars', test: S => S.stars >= 1000 },
{ id: 'facts25', name: '25 solid facts', desc: '25 times tables you know fast', test: S => solidCount(S) >= 25 },
{ id: 'facts50', name: '50 solid facts', desc: '50 times tables you know fast', test: S => solidCount(S) >= 50 },
{ id: 'facts78', name: 'Times tables champ', desc: 'Every fact up to 12 × 12', test: S => solidCount(S) >= 78 },
{ id: 'sprint15', name: 'Speedy', desc: '15 facts in a 1-minute sprint', test: S => S.counters.sprintBest >= 15 },
{ id: 'sprint25', name: 'Lightning', desc: '25 facts in a 1-minute sprint', test: S => S.counters.sprintBest >= 25 },
{ id: 'detective', name: 'Story detective', desc: '15 story problems right on the first try', test: S => S.counters.story >= 15 },
{ id: 'master1', name: 'First mastery', desc: 'Mastered a whole skill', test: S => mastered(S) >= 1 },
{ id: 'master5', name: 'Five skills mastered', desc: 'Mastered 5 skills', test: S => mastered(S) >= 5 },
];
export function newBadges(S) {
const got = [];
for (const bd of BADGES) if (!S.badges.includes(bd.id) && bd.test(S)) { S.badges.push(bd.id); got.push(bd); }
return got;
}
