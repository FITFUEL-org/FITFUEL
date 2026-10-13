import { U, resetState } from "./state.js";
import { persist, onSave } from "./storage.js";
import { planAfterSignIn } from "./logic/auth.js";
import { loadProfile, saveProfile, addWeightLog, listWeightLogs } from "./lib/supabase.js";

// Cloud sync. localStorage stays the offline cache; Supabase is the source of truth once signed in.
const OWNER_KEY = "fitfuel.owner"; // user id the local cache belongs to (not a token)
const DELAY = 1000;

let enabled = false;
let timer = null;
let dirty = false;
let failedOnce = false;

export const syncStatus = { error: null };

async function push() {
  timer = null;
  if (!enabled || !dirty) return;
  dirty = false;
  const { error } = await saveProfile(U);
  if (error) {
    dirty = true; // retry on next save or when the browser comes back online
    syncStatus.error = error;
    if (!failedOnce) { failedOnce = true; console.warn("FITFUEL sync failed:", error.message); }
  } else { syncStatus.error = null; failedOnce = false; }
}

/** Debounced profile upload; call after every local save. */
export function scheduleSync() {
  if (!enabled) return;
  dirty = true;
  clearTimeout(timer);
  timer = setTimeout(push, DELAY);
}

/** Upload immediately (used before sign-out). */
export async function flushSync() {
  clearTimeout(timer);
  if (enabled && dirty) await push();
}

export function stopSync() {
  enabled = false;
  clearTimeout(timer);
  timer = null;
  dirty = false;
}

/** Log a weight to the cloud; failures are non-fatal (local copy already saved). */
export async function syncWeightLog(kg, date) {
  if (!enabled) return;
  const { error } = await addWeightLog(kg, date);
  if (error) console.warn("FITFUEL weight log sync failed:", error.message);
}

const ownerOf = () => { try { return localStorage.getItem(OWNER_KEY); } catch (x) { return null; } };
const setOwner = (id) => { try { localStorage.setItem(OWNER_KEY, id); } catch (x) {} };

/**
 * Reconcile local cache with the cloud after sign-in.
 * Returns "use-remote" | "push-local" | "wizard" | "offline-local" (cloud unreachable, using local cache).
 */
export async function reconcile(userId) {
  // Local cache from a different account must not leak into this one.
  if (ownerOf() && ownerOf() !== userId) resetState(U, {});
  setOwner(userId);

  const { data: remote, error } = await loadProfile();
  if (error) {
    enabled = true; // still try to sync later
    return U.done ? "offline-local" : "wizard";
  }
  const plan = planAfterSignIn(remote, U);
  if (plan === "use-remote") {
    Object.assign(U, remote); // remote wins; local-only trackers (dn, wt, sl, img) are kept
  }
  const logs = await listWeightLogs();
  if (!logs.error && logs.asU.length) {
    U.log = logs.asU;
  } else if (!logs.error && Array.isArray(U.log) && U.log.length && plan !== "wizard") {
    for (const [d, w] of U.log) await addWeightLog(w, d); // first sync: upload existing local history
  }
  try { persist(); } catch (x) {}
  enabled = true;
  if (plan === "push-local") { dirty = true; await push(); }
  return plan;
}

export function initSync() {
  onSave(scheduleSync);
  window.addEventListener("online", () => { if (dirty) scheduleSync(); });
}
