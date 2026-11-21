// Paint the grade color, the light or dark theme, and the easier-letters option.
import { S } from '../core/store.js';
import { bandFor } from '../core/look.js';

export function paintLook(state = S) {
  const root = globalThis.document?.documentElement;
  if (!root?.style?.setProperty) return;
  const theme = state?.settings?.theme || 'system';
  const mq = globalThis.matchMedia || globalThis.window?.matchMedia;
  const systemDark = !!mq?.('(prefers-color-scheme: dark)')?.matches;
  const dark = theme === 'dark' || (theme === 'system' && systemDark);
  root.dataset.theme = theme === 'system' ? '' : theme;
  root.dataset.letters = state?.settings?.letters ? 'easy' : 'plain';
  root.dataset.band = String(state ? state.level : 0);
  const b = bandFor(state ? state.level : 0);
  root.style.setProperty('--grape', b.strong);
  root.style.setProperty('--grape-2', b.deep);
  root.style.setProperty('--grape-soft', dark ? b.darkSoft : b.lightSoft);
  root.style.setProperty('--hi', dark ? '#f0c14a' : b.mark);
}

export function watchLook() {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener?.('change', () => paintLook());
}
