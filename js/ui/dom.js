// DOM helpers. Only called from the browser, never at import time.
import { stop as stopSpeech } from '../core/speech.js';
import { paintLook } from './look.js';
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const mount = html => { stopSpeech(); paintLook(); document.getElementById('app').innerHTML = html; }; // a new screen never keeps talking
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const fmtTime = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
