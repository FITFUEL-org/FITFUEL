import "./styles/main.css";
import { U, IMG, ui } from "./state.js";
import { load } from "./storage.js";
import { $, esc } from "./ui/dom.js";
import { bindDietForm } from "./ui/diet.js";
import { bindWizard, draw1 } from "./ui/wizard.js";
import { bindTabs, enter, go } from "./ui/tabs.js";
import { fillSub } from "./ui/exercises.js";
import { auth, bindAuth, showAuth, hideAuth, showReset } from "./ui/auth.js";
import { initSync, reconcile } from "./sync.js";
import { isSupabaseEnabled, getSession, onAuthChange, verifyTokenHash } from "./lib/supabase.js";
import { friendlyAuthError } from "./logic/auth.js";
import { tabFromPath, navigate, ONBOARD_PATH } from "./router.js";

// Apply theme and banner photo from the loaded profile.
function applyLocalPrefs() {
  if (U.theme) document.documentElement.dataset.theme = U.theme;
  if (U.img) ["wiz", "home", "ex", "rep", "me"].forEach(k => IMG[k] = U.img);
}

// Show the app if onboarding is done, otherwise the wizard.
function start() {
  hideAuth();
  applyLocalPrefs();
  fillSub();
  if (U.done) { ui.cur = tabFromPath(location.pathname) || "home"; enter(); }
  else { navigate(ONBOARD_PATH, true); $("wiz").hidden = false; draw1(); }
}

let entered = false; // the signed-in user has been reconciled and the app shown

async function onSignedIn(session) {
  auth.user = session.user;
  if (entered) return;
  entered = true;
  await reconcile(session.user.id);
  start();
}

async function init() {
  bindDietForm();   // planner form listeners + first render (empty profile)
  bindWizard();     // onboarding wizard events
  bindTabs();       // bottom nav + global click/change delegation
  bindAuth();
  load();           // restore cached profile from localStorage
  applyLocalPrefs();

  // Back/forward between tab pages.
  window.addEventListener("popstate", () => {
    const t = tabFromPath(location.pathname);
    if (t && !$("app").hidden) go(t, true);
  });

  if (!isSupabaseEnabled) { start(); return; } // local-only mode

  initSync();
  let recovering = false;
  onAuthChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      recovering = true;
      if (session) auth.user = session.user;
      showReset(() => { recovering = false; if (session) onSignedIn(session); });
    } else if (event === "SIGNED_IN" && session && !recovering) {
      // Defer: supabase-js warns against awaiting other auth calls inside this callback.
      setTimeout(() => onSignedIn(session), 0);
    } else if (event === "SIGNED_OUT") {
      auth.user = null;
      entered = false;
      showAuth();
    }
  });

  // Email links land on /auth/confirm?token_hash=…&type=recovery|email|signup.
  const q = new URLSearchParams(location.search + "&" + location.hash.slice(1));
  if (location.pathname === "/auth/confirm" && q.get("token_hash")) {
    const type = q.get("type") || "email";
    if (type === "recovery") recovering = true;
    history.replaceState({}, "", type === "recovery" ? "/reset-password" : "/"); // drop the one-time token from the URL
    const { data, error } = await verifyTokenHash(q.get("token_hash"), type);
    if (error) {
      recovering = false;
      showAuth(type === "recovery" ? "forgot" : "signin",
        type === "recovery" ? "That reset link has expired or was already used. Request a new one below." : esc(friendlyAuthError(error)));
      return;
    }
    if (type === "recovery") {
      auth.user = data.user;
      showReset(() => { recovering = false; onSignedIn(data.session); });
      return;
    }
    await onSignedIn(data.session);
    return;
  }
  if (q.get("error_description")) {
    showAuth("signin", esc(q.get("error_description").replace(/\+/g, " ")));
    return;
  }

  const session = await getSession();
  if (recovering) return;
  if (session) await onSignedIn(session);
  else showAuth();
}

init();
