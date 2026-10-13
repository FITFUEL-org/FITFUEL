import { $, esc, hero, toast } from "./dom.js";
import { clearSaved } from "../storage.js";
import { stopSync, flushSync } from "../sync.js";
import { LOGIN_PATH, navigate } from "../router.js";
import {
  normalizeEmail, isValidEmail, cleanOtp, isValidOtp, validateSignUp, validateNewPassword,
  friendlyAuthError, signUpOutcome, MIN_PASSWORD, OTP_LENGTH,
} from "../logic/auth.js";
import {
  signInWithPassword, signUpWithPassword, signInWithOtp, verifyEmailOtp,
  sendPasswordReset, updatePassword, signOut,
} from "../lib/supabase.js";

// Sign-in screen (password, emailed code, sign up, reset). The session itself is
// kept by supabase-js in localStorage ("fitfuel-auth") and refreshed automatically.

export const auth = { user: null };

let mode = "signin"; // signin | signup | code | verify | forgot | reset
let email = "";
let busy = false;
let note = "";

const TABS = [["signin", "Password"], ["code", "Email code"], ["signup", "Sign up"]];

const field = (id, label, type, extra = "") =>
  `<label class="field">${label}<input id="${id}" type="${type}" ${extra}></label>`;
const emailField = () =>
  field("au_email", "Email", "email", `autocomplete="email" inputmode="email" required value="${esc(email)}"`);

function body() {
  switch (mode) {
    case "signup":
      return `<h2>Create your account</h2>${emailField()}
        ${field("au_pw", `Password (at least ${MIN_PASSWORD} characters)`, "password", 'autocomplete="new-password" required')}
        ${field("au_pw2", "Confirm password", "password", 'autocomplete="new-password" required')}
        <button type="submit">Create account</button>`;
    case "code":
      return `<h2>Sign in with a code</h2><p class="muted">We will email you a ${OTP_LENGTH}-digit code. No password needed.</p>
        ${emailField()}<button type="submit">Email me a code</button>`;
    case "verify":
      return `<h2>Enter your code</h2><p class="muted">We sent a ${OTP_LENGTH}-digit code to <b>${esc(email)}</b>.</p>
        ${field("au_otp", "Code", "text", `inputmode="numeric" autocomplete="one-time-code" maxlength="${OTP_LENGTH + 2}" required`)}
        <button type="submit">Verify and sign in</button>
        <button type="button" class="ghost" data-au="code">Use a different email</button>
        <button type="button" class="ghost" data-au="resend">Send a new code</button>`;
    case "forgot":
      return `<h2>Reset your password</h2><p class="muted">We will email you a link to set a new password.</p>
        ${emailField()}<button type="submit">Send reset link</button>
        <button type="button" class="ghost" data-au="signin">Back to sign in</button>`;
    case "reset":
      return `<h2>Set a new password</h2>
        ${field("au_pw", `New password (at least ${MIN_PASSWORD} characters)`, "password", 'autocomplete="new-password" required')}
        ${field("au_pw2", "Confirm new password", "password", 'autocomplete="new-password" required')}
        <button type="submit">Save new password</button>`;
    default:
      return `<h2>Welcome back</h2>${emailField()}
        ${field("au_pw", "Password", "password", 'autocomplete="current-password" required')}
        <button type="submit">Sign in</button>
        <button type="button" class="ghost" data-au="forgot">Forgot password?</button>`;
  }
}

function render() {
  const tabs = mode === "reset" ? "" :
    `<div class="seg" role="tablist">${TABS.map(([k, l]) =>
      `<button type="button" role="tab" data-au="${k}" aria-pressed="${mode === k || (k === "code" && mode === "verify") || (k === "signin" && mode === "forgot")}">${l}</button>`).join("")}</div>`;
  $("auth").innerHTML = `${hero("wiz")}${tabs}
    <form id="au_form" class="card" novalidate aria-busy="${busy}">
      ${note ? `<div class="guard warn" role="status">${note}</div>` : ""}
      <div id="au_err" class="guard bad" role="alert" hidden></div>
      ${body()}
    </form>`;
  const first = $("auth").querySelector("input");
  if (first) first.focus();
}

function setMode(m, n = "") { mode = m; note = n; render(); }
function showError(msg) { const e = $("au_err"); if (e) { e.textContent = msg; e.hidden = !msg; } }
function setBusy(b) {
  busy = b;
  const f = $("au_form");
  if (f) { f.setAttribute("aria-busy", b); f.querySelectorAll("button,input").forEach(x => { x.disabled = b; }); }
}

async function run(fn) {
  if (busy) return;
  showError("");
  setBusy(true);
  try { await fn(); } catch (x) { showError(friendlyAuthError(x)); } finally { setBusy(false); }
}

const val = id => ($(id) ? $(id).value : "");
function readEmail() {
  email = normalizeEmail(val("au_email"));
  if (!isValidEmail(email)) throw new Error("Enter a valid email address.");
  return email;
}
const check = ({ error }) => { if (error) throw error; };

async function sendCode() {
  check(await signInWithOtp(email));
  setMode("verify", "Check your inbox (and spam folder) for the code.");
}

async function submit() {
  if (mode === "signin") {
    readEmail();
    check(await signInWithPassword(email, val("au_pw")));
  } else if (mode === "signup") {
    readEmail();
    const err = validateSignUp(email, val("au_pw"), val("au_pw2"));
    if (err) throw new Error(err);
    const res = await signUpWithPassword(email, val("au_pw"));
    check(res);
    const out = signUpOutcome(res.data);
    if (out === "exists") setMode("signin", "That email already has an account. Sign in instead.");
    else if (out === "confirm") setMode("signin", `We sent a confirmation link to <b>${esc(email)}</b>. Open it, then sign in.`);
  } else if (mode === "code") {
    readEmail();
    await sendCode();
  } else if (mode === "verify") {
    const code = cleanOtp(val("au_otp"));
    if (!isValidOtp(code)) throw new Error(`Enter the ${OTP_LENGTH}-digit code.`);
    check(await verifyEmailOtp(email, code));
  } else if (mode === "forgot") {
    readEmail();
    check(await sendPasswordReset(email));
    setMode("signin", "If that email has an account, a reset link is on its way.");
  } else if (mode === "reset") {
    const err = validateNewPassword(val("au_pw"), val("au_pw2"));
    if (err) throw new Error(err);
    check(await updatePassword(val("au_pw")));
    toast("Password updated");
    onResetDone();
  }
}

let onResetDone = () => {};

/** Show the sign-in screen and hide the app. */
export function showAuth(m = "signin", n = "") {
  ["wiz", "app", "bn"].forEach(id => { $(id).hidden = true; });
  $("auth").hidden = false;
  if (m !== "reset") navigate(LOGIN_PATH, true);
  setMode(m, n);
  scrollTo(0, 0);
}

export function hideAuth() { $("auth").hidden = true; }

/** Password-recovery link opened: ask for a new password, then continue. */
export function showReset(done) { onResetDone = done; showAuth("reset"); }

/** Sign out, clear this device's cached profile and return to the sign-in screen. */
export async function signOutEverywhere() {
  await flushSync();
  stopSync();
  await signOut();
  clearSaved();
  try { localStorage.removeItem("fitfuel.owner"); } catch (x) {}
  location.replace(LOGIN_PATH);
}

export function bindAuth() {
  $("auth").addEventListener("submit", e => { e.preventDefault(); run(submit); });
  $("auth").addEventListener("click", e => {
    const b = e.target.closest("button[data-au]");
    if (!b || busy) return;
    if ($("au_email")) email = normalizeEmail(val("au_email"));
    if (b.dataset.au === "resend") run(sendCode);
    else setMode(b.dataset.au);
  });
}
