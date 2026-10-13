import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Browser client. The session (access + refresh token) is kept in localStorage
// and refreshed in the background, so users stay signed in across visits.
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "fitfuel-auth",
    // Email links use /auth/confirm?token_hash=… (verified explicitly), not URL fragments.
    detectSessionInUrl: false,
  },
});

/** Map Supabase auth errors to short, friendly text. */
export function friendlyError(err: unknown): string {
  const e = err as { message?: string; code?: string } | null;
  const msg = `${e?.message ?? err ?? ""} ${e?.code ?? ""}`;
  if (/invalid login credentials|invalid_credentials/i.test(msg)) return "Wrong email or password.";
  if (/email not confirmed|email_not_confirmed/i.test(msg)) return "Please confirm your email first — check your inbox.";
  if (/already registered|user_already_exists/i.test(msg)) return "That email already has an account. Try logging in.";
  if (/rate limit|too many/i.test(msg)) return "Too many attempts. Wait a minute and try again.";
  if (/expired|otp_expired/i.test(msg)) return "That link has expired. Request a new one.";
  if (/weak_password|password.*(short|least)/i.test(msg)) return "Choose a stronger password (at least 8 characters).";
  if (/sending.*email|smtp/i.test(msg)) return "We couldn't send the email right now. Please try again later.";
  if (/failed to fetch|network/i.test(msg)) return "Network problem. Check your connection.";
  return e?.message || "Something went wrong. Please try again.";
}
