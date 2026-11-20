// A small multiplication table as an HTML table. The diagonal can be bold, and one square box can be hidden behind a question mark.
import { table } from '../../util.js';

export function timesGrid(max, { diag = false, hide = 0 } = {}) {
  const nums = Array.from({ length: max }, (_, i) => i + 1);
  const cell = (r, c) => (hide && r === hide && c === hide ? '?' : diag && r === c ? `<b>${r * c}</b>` : r * c);
  return table(['×', ...nums], nums.map(r => [`<b>${r}</b>`, ...nums.map(c => cell(r, c))]), { cls: 'tg' });
}
