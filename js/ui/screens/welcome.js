// First screen for a new learner, and the "find your starting point" intro and result.
import { S } from '../../core/store.js';
import { GRADES, helloName } from '../../core/learner.js';
import { levelFull } from '../../levels.js';
import { I } from '../icons.js';
import { mount, esc } from '../dom.js';
import { logoSVG } from '../fragments.js';
const yearButtons = GRADES.map(g => `<button type="button" class="year-btn ${g.id === 'K' ? 'k' : ''}" data-act="pickgrade" data-grade="${g.id}" aria-pressed="false">${g.kid}</button>`).join('');
export function renderWelcome() {
mount(`<div class="page welcome">
<div class="logo-big">${logoSVG()}</div>
<h1>Math Lab</h1>
<p class="lead">Tap, listen, and figure it out. A little practice, then a puzzle.</p>
<form class="name-form" data-form="name">
<label for="nm">Your name</label>
<input id="nm" name="nm" autocomplete="off" maxlength="20" placeholder="You can skip this">
<fieldset class="years"><legend>School year, if you know it</legend><div class="year-grid">${yearButtons}</div></fieldset>
<input type="hidden" name="grade" value="">
<button class="btn primary big" type="submit">Let’s go</button>
</form>
<p class="fine">One learner on this device. Progress stays in this browser. You can change the name and year later on the grown-ups page.</p>
</div>`);
}
// The two ways in for a new learner, equal in weight and size.
export function renderPlaceChoice() {
const who = helloName(S);
mount(`<div class="page intro"><div class="intro-card paper-card choose"><h1>${who ? `Hi, ${esc(who)}!` : 'Hi!'}</h1>
<button class="btn primary big" data-go="place">Find my starting point</button>
<button class="btn primary big" data-act="beginearly">Start from the very beginning</button></div></div>`);
}
export function renderPlaceIntro() {
mount(`<div class="page intro"><header class="top"><button class="iconbtn" data-go="home" aria-label="Back">${I.back}</button></header>
<div class="intro-card paper-card"><h1>Let’s find your starting point</h1>
<p>Try a few questions${helloName(S) ? `, ${esc(helloName(S))}` : ''}. Skip any you haven’t learned yet. There is no timer and no score.</p>
<button class="btn primary big" data-act="placestart">Let’s go</button></div></div>`);
}
export function renderPlaceResult() {
mount(`<div class="page intro"><div class="intro-card paper-card">
<h1>You’re starting at ${levelFull(S.level)}</h1>
<p>You can change levels any time from the home page.</p>
<button class="btn primary big" data-go="home">Go</button></div></div>`);
}
