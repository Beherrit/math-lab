// The one live learner state plus localStorage access. Nothing runs at import time, so Node can import this.
import { KEY_V1, KEY_V2, KEY_V3, migrate } from './state.js';
export let S = null;
export const setState = s => { S = s; };
function storage() { try { return globalThis.localStorage ?? null; } catch (e) { return null; } }
function readKey(st, key) { try { return migrate(JSON.parse(st.getItem(key))); } catch (e) { return null; } }
// v3 wins, then v2, then v1: an older save is migrated and written as v3. The older keys are never touched.
export function loadSaved() {
const st = storage(); if (!st) return null;
const v3 = readKey(st, KEY_V3); if (v3) return v3;
const old = readKey(st, KEY_V2) || readKey(st, KEY_V1); if (!old) return null;
try { st.setItem(KEY_V3, JSON.stringify(old)); } catch (e) { }
return old;
}
export function save() { try { storage()?.setItem(KEY_V3, JSON.stringify(S)); } catch (e) { } }
export function clearSaved() { const st = storage(); if (!st) return; try { st.removeItem(KEY_V3); st.removeItem(KEY_V2); st.removeItem(KEY_V1); } catch (e) { } }
// Backups: any v1, v2 or v3 file restores (migrated); export always writes v3.
export const exportJSON = state => JSON.stringify(state, null, 1);
export function parseBackup(text) { try { return migrate(JSON.parse(text)); } catch (e) { return null; } }
