import { U, resetState } from "./state.js";

// localStorage key for the user profile.
export const KEY = "fitfuel.v2";

// Write the profile; throws if storage is unavailable or full.
export const persist = () => localStorage.setItem(KEY, JSON.stringify(U));

// Optional listener run after every save() (used to sync the profile to Supabase).
let afterSave = null;
export const onSave = (fn) => { afterSave = fn; };

// Write the profile, ignoring storage errors.
export const save = () => {
  try { persist(); } catch (x) {}
  if (afterSave) { try { afterSave(); } catch (x) {} }
};

// Load the saved profile into U (empty object if missing or invalid).
export function load() {
  let data;
  try { data = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (x) { data = {}; }
  resetState(U, data);
  return U;
}

// Remove the saved profile.
export function clearSaved() {
  try { localStorage.removeItem(KEY); } catch (x) {}
}

// JSON text for the downloadable backup.
export const backupText = () => JSON.stringify(U);

// Parse and validate a backup file; throws if it is not a FITFUEL backup.
export function parseBackup(text) {
  const data = JSON.parse(text);
  if (!data || !data.done || !data.weight) throw 0;
  return data;
}
