// Situations that grow or shrink at a steady rate from a starting amount: the stories behind writing y = mx + b.
import { count } from './h.js';

// rate(m): the steady change. at(x, y): one measurement. two(x1, y1, x2, y2): two measurements. start: what b means.
export const SITUATIONS = [
  { rate: m => `A gym charges $${m} for each visit, plus a joining fee.`, at: (x, y) => `After ${count(x, 'visit')} a member has paid $${y} in total.`, two: (x1, y1, x2, y2) => `A gym charges a joining fee plus the same price for every visit. After ${count(x1, 'visit')} a member has paid $${y1} in total, and after ${count(x2, 'visit')} $${y2}.`,
    start: 'How many dollars was the joining fee?', vars: 'x is the number of visits and y is the total in dollars', down: false, hi: 70 },
  { rate: m => `Maya adds $${m} to her savings jar every week. The jar already held some money.`, at: (x, y) => `After ${count(x, 'week')} the jar holds $${y}.`, two: (x1, y1, x2, y2) => `Maya adds the same amount to her savings jar every week. After ${count(x1, 'week')} it holds $${y1}, and after ${count(x2, 'week')} it holds $${y2}.`,
    start: 'How many dollars were in the jar at the start?', vars: 'x is the number of weeks and y is the dollars in the jar', down: false, hi: 90 },
  { rate: m => `A plant grows ${m} cm every week.`, at: (x, y) => `After ${count(x, 'week')} it is ${y} cm tall.`, two: (x1, y1, x2, y2) => `A plant grows the same amount every week. After ${count(x1, 'week')} it is ${y1} cm tall, and after ${count(x2, 'week')} it is ${y2} cm tall.`,
    start: 'How tall was the plant at the start, in centimeters?', vars: 'x is the number of weeks and y is the height in centimeters', down: false, hi: 80 },
  { rate: m => `A tank is filled with ${m} liters every minute. It already held some water.`, at: (x, y) => `After ${count(x, 'minute')} it holds ${y} liters.`, two: (x1, y1, x2, y2) => `A tank is filled at a steady rate. After ${count(x1, 'minute')} it holds ${y1} liters, and after ${count(x2, 'minute')} it holds ${y2} liters.`,
    start: 'How many liters were in the tank at the start?', vars: 'x is the number of minutes and y is the liters in the tank', down: false, hi: 90 },
  { rate: m => `A taxi charges $${m} for each kilometer, plus a fixed fee.`, at: (x, y) => `A ride of ${count(x, 'kilometer')} costs $${y}.`, two: (x1, y1, x2, y2) => `A taxi charges a fixed fee plus the same price for every kilometer. A ride of ${count(x1, 'kilometer')} costs $${y1}, and a ride of ${count(x2, 'kilometer')} costs $${y2}.`,
    start: 'How many dollars is the fixed fee?', vars: 'x is the number of kilometers and y is the cost in dollars', down: false, hi: 80 },
  { rate: m => `A phone battery loses ${m} percent every hour of video.`, at: (x, y) => `After ${count(x, 'hour')} it shows ${y} percent.`, two: (x1, y1, x2, y2) => `A phone battery loses the same amount every hour of video. After ${count(x1, 'hour')} it shows ${y1} percent, and after ${count(x2, 'hour')} it shows ${y2} percent.`,
    start: 'What percent did the battery show at the start?', vars: 'x is the number of hours and y is the percent shown', down: true, hi: 100 },
];
