// Grown-ups screen: a press-and-hold gate, then reports and settings.
import { mount } from '../dom.js';
import { I } from '../icons.js';
import { backBtn } from '../fragments.js';
import { statsSection, levelsSection, factsSection, skillsSection, settingsSection } from './parent-parts.js';
export const parentState = { open: false };
export function renderParent() {
if (!parentState.open) {
mount(`<div class="page"><header class="top">${backBtn()}<h1>Grown-ups</h1></header>
<div class="paper-card gate"><p>This area has progress reports and settings.</p><button class="btn primary big hold" data-act="hold"><span class="fill"></span><span class="lbl">Press and hold</span></button><p class="small muted">Hold for 2 seconds to open.</p></div></div>`);
return;
}
mount(`<div class="page parent"><header class="top"><button class="iconbtn" data-act="closeparent" aria-label="Back">${I.back}</button><h1>Grown-ups</h1></header>
${statsSection()}${levelsSection()}${factsSection()}${skillsSection()}${settingsSection()}
</div>`);
}
