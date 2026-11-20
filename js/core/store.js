// The one live learner state plus localStorage access. Nothing runs at import time, so Node can import this.
import { KEY_V1, KEY_V2, migrate } from './state.js';
export let S = null;
export const setState = s => { S = s; };
function storage() { try { return globalThis.localStorage ?? null; } catch (e) { return null; } }
function readKey(st, key) { try { return migrate(JSON.parse(st.getItem(key))); } catch (e) { return null; } }
// v2 wins; otherwise a v1 save is migrated and written as v2. The v1 key is never touched.
export function loadSaved() {
const st = storage(); if (!st) return null;
const v2 = readKey(st, KEY_V2); if (v2) return v2;
const v1 = readKey(st, KEY_V1); if (!v1) return null;
try { st.setItem(KEY_V2, JSON.stringify(v1)); } catch (e) { }
return v1;
}
export function save() { try { storage()?.setItem(KEY_V2, JSON.stringify(S)); } catch (e) { } }
export function clearSaved() { const st = storage(); if (!st) return; try { st.removeItem(KEY_V2); st.removeItem(KEY_V1); } catch (e) { } }
// Backups: any v1 or v2 file restores (migrated); export always writes v2.
export const exportJSON = state => JSON.stringify(state, null, 1);
export function parseBackup(text) { try { return migrate(JSON.parse(text)); } catch (e) { return null; } }
