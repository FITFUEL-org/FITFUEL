// Shared mutable state. These are stable objects (never reassigned) so every
// module sees the same reference; use resetState() to replace their contents.

// User profile and tracker data (persisted to localStorage). Starts empty.
export const U = {};

// Current computed diet-plan settings and rendered fragments (set by the planner form).
export const S = {};

// Transient UI state: selected plan (0=A, 1=B), wizard step, current tab, last units,
// and whether the user has no equipment (bodyweight-only exercises).
export const ui = { plan: 0, si: 0, cur: "home", lastHu: "cm", lastWu: "kg", noEquipment: undefined };

// Optional banner photos keyed by tab: wiz, home, ex, rep, me.
export const IMG = {};

// Replace all properties of `target` with those of `next` (keeps the reference).
export function resetState(target, next = {}) {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, next);
  return target;
}
