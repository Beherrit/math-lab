// First screen for a new learner, and the "find your starting point" intro and result.
import { S } from '../../core/store.js';
import { levelInfo } from '../../levels.js';
import { I } from '../icons.js';
import { mount, esc } from '../dom.js';
import { logoSVG } from '../fragments.js';
export function renderWelcome() {
mount(`<div class="page welcome">
<div class="logo-big">${logoSVG()}</div>
<h1>Math Lab</h1>
<p class="lead">Ten minutes a day. Times tables, math practice that starts where you are, and help whenever you need it.</p>
<form class="name-form" data-form="name">
<label for="nm">What’s your name?</label>
<input id="nm" name="nm" autocomplete="off" maxlength="20" placeholder="Your name" required>
<button class="btn primary big" type="submit">Let’s go</button>
</form>
<p class="fine">Progress saves on this device. Grown-ups can back it up from the settings page.</p>
</div>`);
}
export function renderPlaceIntro() {
mount(`<div class="page intro"><header class="top">${S.placed ? `<button class="iconbtn" data-go="home" aria-label="Back">${I.back}</button>` : ''}</header>
<div class="intro-card paper-card"><h1>Let’s find your starting point</h1>
<p>Try a few questions, ${esc(S.name)}. Skip any you haven’t learned yet. There is no timer and no score.</p>
<button class="btn primary big" data-act="placestart">Let’s go</button></div></div>`);
}
export function renderPlaceResult() {
const l = levelInfo(S.level);
mount(`<div class="page intro"><div class="intro-card paper-card">
<h1>You’re starting at Level ${l.n}: ${l.title}</h1>
<p>You can change levels any time from the home page.</p>
<button class="btn primary big" data-go="home">Go</button></div></div>`);
}
