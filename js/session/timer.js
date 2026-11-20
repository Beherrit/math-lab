// The 250 ms session clock. The tick itself lives in flow.js and is passed in.
let timer = null;
export function stopTimer() { if (timer) clearInterval(timer); timer = null; }
export function startTimer(onTick) { stopTimer(); timer = setInterval(onTick, 250); }
