// Short correct and incorrect tones. Off unless a grown-up turns sound on. Never throws.
function beep(ac, freq, at, dur, type) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = ac.currentTime + at;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.06, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(ac.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

// `enabled` and `AudioContext` are injected so tests can run without a speaker.
export function playChime(ok, env = {}) {
  if (!env.enabled) return false;
  const AC = env.AudioContext || globalThis.AudioContext || globalThis.webkitAudioContext;
  if (typeof AC !== 'function') return false;
  try {
    const ac = env.ctx || new AC();
    const notes = ok ? [[523, 0, 0.12, 'sine'], [784, 0.09, 0.16, 'sine']] : [[196, 0, 0.18, 'triangle']];
    for (const [freq, at, dur, type] of notes) beep(ac, freq, at, dur, type);
    return true;
  } catch (e) {
    return false;
  }
}

export function chimeResult(S, ok) {
  return playChime(ok, { enabled: !!S?.settings?.sound });
}
