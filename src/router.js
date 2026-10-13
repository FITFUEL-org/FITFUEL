// URL <-> tab mapping. Each tab has its own path so links, refresh and back/forward work.

export const ROUTES = { home: "/", diet: "/diet", ex: "/exercise", rep: "/report", me: "/me" };
export const LOGIN_PATH = "/login";
export const ONBOARD_PATH = "/onboarding";

/** Tab key for a pathname, or null when it is not a tab page. */
export function tabFromPath(path) {
  const p = (path || "/").replace(/\/+$/, "") || "/";
  for (const [k, v] of Object.entries(ROUTES)) if (v === p) return k;
  return null;
}

/** Push (or replace) a path without reloading. No-op when already there. */
export function navigate(path, replace = false) {
  if (location.pathname === path) return;
  history[replace ? "replaceState" : "pushState"]({}, "", path + location.search + location.hash);
}
