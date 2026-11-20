// Toasts, confetti and the feedback line under the question.
import { pick } from '../util.js';
import { $ } from '../ui/dom.js';
export const RIGHT = ['Nice!', 'You got it!', 'Yes!', 'Great thinking!', 'Nailed it!', 'Awesome!', 'Correct!', 'Smart!', 'Way to go!'];
export function toast(msg) {
const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = msg; document.body.appendChild(t);
requestAnimationFrame(() => t.classList.add('in'));
setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, 2400);
}
export function confetti() {
if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
const ctx = c.getContext('2d'); const W = c.width = innerWidth * devicePixelRatio, H = c.height = innerHeight * devicePixelRatio;
const cols = ['#5b3fd6', '#ffd43b', '#16a36b', '#ff5fa2', '#2f80ed'];
const ps = Array.from({ length: 120 }, () => ({ x: W / 2 + (Math.random() - .5) * W * .3, y: H * .35, vx: (Math.random() - .5) * 18 * devicePixelRatio, vy: (-Math.random() * 16 - 6) * devicePixelRatio, s: (6 + Math.random() * 8) * devicePixelRatio, r: Math.random() * 6, c: pick(cols) }));
let f = 0;
(function loop() {
ctx.clearRect(0, 0, W, H);
for (const p of ps) { p.vy += 0.55 * devicePixelRatio; p.x += p.vx; p.y += p.vy; p.r += 0.15; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }
if (++f < 110) requestAnimationFrame(loop); else c.remove();
})();
}
export function fb(html, cls) { const e = $('.fb'); if (e) { e.className = 'fb ' + cls; e.innerHTML = html; } }
export function clearFb() { const e = $('.fb'); if (e && !e.classList.contains('keep')) { e.className = 'fb'; e.innerHTML = ''; } }
