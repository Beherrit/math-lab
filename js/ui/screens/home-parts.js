// Pieces of the home screen: the week strip.
import { S } from '../../core/store.js';
import { today, addDays } from '../../core/dates.js';
import { I } from '../icons.js';
export function weekStrip() {
  const t = today();
  const dow = (new Date().getDay() + 6) % 7; // Monday first
  const names = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  let h = '<div class="week" aria-label="This week">';
  for (let i = 0; i < 7; i++) {
    const ds = addDays(t, i - dow);
    const rec = S.days[ds];
    const cls = rec?.done ? 'done' : rec?.q ? 'some' : '';
    h += `<div class="day ${cls} ${ds === t ? 'today' : ''}"><span class="dn">${names[i]}</span><span class="stamp">${rec?.done ? I.star : ''}</span></div>`;
  }
  return h + '</div>';
}
