// Pure auth helpers (no DOM, no network) so they can be unit tested.

export const MIN_PASSWORD = 8;
export const OTP_LENGTH = 6;

export const normalizeEmail = (s) => String(s || "").trim().toLowerCase();
export const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(s));

/** Keep digits only, max 6 (handles pasted "123 456"). */
export const cleanOtp = (s) => String(s || "").replace(/\D/g, "").slice(0, OTP_LENGTH);
export const isValidOtp = (s) => cleanOtp(s).length === OTP_LENGTH && String(s).replace(/\s/g, "").length === OTP_LENGTH;

/** Returns an error message, or "" when the inputs are fine. */
export function validateSignUp(email, password, confirm) {
  if (!isValidEmail(email)) return "Enter a valid email address.";
  if (String(password || "").length < MIN_PASSWORD) return `Password must be at least ${MIN_PASSWORD} characters.`;
  if (password !== confirm) return "Passwords do not match.";
  return "";
}

export function validateNewPassword(password, confirm) {
  if (String(password || "").length < MIN_PASSWORD) return `Password must be at least ${MIN_PASSWORD} characters.`;
  if (password !== confirm) return "Passwords do not match.";
  return "";
}

/** Map Supabase auth errors to short, friendly text. */
export function friendlyAuthError(err) {
  if (!err) return "";
  const msg = String(err.message || err);
  const code = err.code || "";
  if (/invalid login credentials/i.test(msg) || code === "invalid_credentials") return "Wrong email or password.";
  if (/email not confirmed/i.test(msg) || code === "email_not_confirmed") return "Please confirm your email first. Check your inbox for the link.";
  if (/already registered|already been registered/i.test(msg) || code === "user_already_exists") return "That email already has an account. Try signing in.";
  if (/rate limit|too many|over_email_send_rate_limit|over_request_rate_limit/i.test(msg + code)) return "Too many attempts. Please wait a minute and try again.";
  if (/token has expired|otp_expired|expired/i.test(msg + code)) return "That code has expired. Request a new one.";
  if (/invalid.*(token|otp)|otp_invalid/i.test(msg + code)) return "That code is not correct. Check it and try again.";
  if (/password.*(short|least|weak)|weak_password/i.test(msg + code)) return `Choose a stronger password (at least ${MIN_PASSWORD} characters).`;
  if (/same.*password|same_password/i.test(msg + code)) return "Choose a password different from your old one.";
  if (/failed to fetch|network|load failed/i.test(msg)) return "Network problem. Check your connection and try again.";
  if (/not configured/i.test(msg)) return "Sign-in is not available right now.";
  return msg || "Something went wrong. Please try again.";
}

/**
 * Supabase signUp quirk: for an already-registered address (with email
 * confirmation on) it returns a user with an empty identities array and no error.
 */
export function signUpOutcome(data) {
  if (data && data.session) return "signed-in";
  const u = data && data.user;
  if (u && Array.isArray(u.identities) && u.identities.length === 0) return "exists";
  return "confirm";
}

/** Decide where to go after a session is established. */
export function planAfterSignIn(remote, local) {
  if (remote && remote.done) return "use-remote";
  if (local && local.done) return "push-local";
  return "wizard";
}
