// Which screen is showing. Screens never import this; they navigate with data-go buttons.
import { S } from '../core/store.js';
import { renderWelcome, renderPlaceIntro, renderPlaceChoice } from './screens/welcome.js';
import { renderHome } from './screens/home.js';
import { renderLab, renderTable } from './screens/lab.js';
import { renderBadges, renderPickFocus } from './screens/lists.js';
import { renderSkill } from './screens/skill.js';
import { renderParent } from './screens/parent.js';
import { renderGames } from './screens/games.js';
import { renderSubject } from './screens/subject.js';
import { beginGame } from '../session/game-run.js';
let view = 'home', viewArg = null;
export const currentView = () => ({ view, arg: viewArg });
export function go(v, arg = null) { view = v; viewArg = arg; render(); window.scrollTo(0, 0); }
const SCREENS = {
home: renderHome, lab: renderLab, table: a => renderTable(a), skill: a => renderSkill(a),
parent: renderParent, pick: renderPickFocus, badges: renderBadges, place: renderPlaceIntro,
games: a => renderGames(a), game: id => beginGame(id), subject: name => renderSubject(name),
};
export function render() {
if (!S) return renderWelcome();
if (!S.placed) return view === 'place' ? renderPlaceIntro() : renderPlaceChoice();
(SCREENS[view] || renderHome)(viewArg);
}
