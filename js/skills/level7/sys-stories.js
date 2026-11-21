import { count } from './h.js';

// Two plans, two savers, two plants: situations where two amounts both grow from a start and may meet.
// say(name, start, rate) is one plan. same(x, y) says what the crossing point means. ask(z) asks which is better after z steps.
export const PLANS = [
  { names: ['Gym A', 'Gym B'], xs: 'visits', one: 'visit', qty: 'cost', better: 'less', vars: 'x is the number of visits and y is the total cost in dollars', say: (n, c, m) => `${n} charges $${c} to join, plus $${m} for each visit.`, same: (x, y) => `After ${count(x, 'visit')} both gyms cost $${y} in total.`, ask: z => `You plan to go ${count(z, 'time')}. Which gym is cheaper?` },
  { names: ['Ava', 'Leo'], xs: 'weeks', one: 'week', qty: 'savings', better: 'more', vars: 'x is the number of weeks and y is the dollars saved', say: (n, c, m) => `${n} has $${c} and saves $${m} every week.`, same: (x, y) => `After ${count(x, 'week')} Ava and Leo both have $${y}.`, ask: z => `After ${count(z, 'week')}, who has more money?` },
  { names: ['Shop A', 'Shop B'], xs: 'hours', one: 'hour', qty: 'cost', better: 'less', vars: 'x is the number of hours and y is the cost in dollars', say: (n, c, m) => `${n} charges $${c} to book a bike, plus $${m} for each hour.`, same: (x, y) => `After ${count(x, 'hour')} both shops charge $${y}.`, ask: z => `You want a bike for ${count(z, 'hour')}. Which shop is cheaper?` },
  { names: ['Plant A', 'Plant B'], xs: 'weeks', one: 'week', qty: 'height', better: 'more', vars: 'x is the number of weeks and y is the height in centimeters', say: (n, c, m) => `${n} is ${c} cm tall and grows ${m} cm every week.`, same: (x, y) => `After ${count(x, 'week')} both plants are ${y} cm tall.`, ask: z => `After ${count(z, 'week')}, which plant is taller?` },
  { names: ['Pool A', 'Pool B'], xs: 'minutes', one: 'minute', qty: 'water', better: 'more', vars: 'x is the number of minutes and y is the liters of water', say: (n, c, m) => `${n} already holds ${c} liters and gains ${m} liters every minute.`, same: (x, y) => `After ${count(x, 'minute')} both pools hold ${y} liters.`, ask: z => `After ${count(z, 'minute')}, which pool holds more water?` },
];
// "Will they ever have the same ...?" for the stories where the rates and starts are given in words.
export const SAME_THING = { 'Gym A': 'total cost', Ava: 'amount of money', 'Shop A': 'cost', 'Plant A': 'height', 'Pool A': 'amount of water' };
