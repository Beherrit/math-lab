// Entry point: load the saved learner, draw the first screen, wire events.
import { setState, loadSaved } from './core/store.js';
import { render } from './ui/router.js';
import { wireEvents } from './ui/events.js';
import { installDebug } from './debug.js';
setState(loadSaved());
wireEvents();
render();
if (/[?&]debug\b/.test(location.search)) installDebug();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(() => { });
