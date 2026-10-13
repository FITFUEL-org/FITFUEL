import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Null when env vars are missing, so the app keeps working offline/local-only. */
export const supabase = url && anonKey
  ? createClient(url, anonKey, {
      auth: {
        // Keep the session (access + refresh token) in localStorage so users stay signed in across reloads.
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'fitfuel-auth',
        // Refresh the access token in the background before it expires.
        autoRefreshToken: true,
        // Pick up the session from email confirmation / magic-link redirects.
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null;
export const isSupabaseEnabled = supabase !== null;

const OFFLINE = { data: null, error: new Error('Supabase is not configured') };
const SIGNED_OUT = { data: null, error: new Error('Not signed in') };

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signInWithOtp(email) {
  if (!supabase) return OFFLINE;
  return supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
}

export async function signOut() {
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
}

// U (localStorage) key -> profiles column. Keep in sync with the migration.
const MAP = {
  name: 'name', profession: 'profession', age: 'age', gender: 'gender',
  height: 'height_cm', weight: 'weight_kg', target: 'target_weight_kg', start: 'start_weight_kg',
  hu: 'height_unit', wu: 'weight_unit', goal: 'goal', activity: 'activity_multiplier',
  lv: 'level', workout: 'workout_type', days: 'days_per_week', wk: 'week_start',
  duration: 'workout_minutes', time: 'workout_time', place: 'place', equip: 'equipment',
  foc: 'focus', fk: 'focus_key', sub: 'sub_focus', diet: 'diet', budget: 'daily_budget_inr',
  meals: 'meals_per_day', cook: 'cook_time', allergies: 'allergies', foods: 'liked_foods',
  theme: 'theme',
};
const NUMERIC = new Set(['age', 'height', 'weight', 'target', 'start', 'activity', 'days',
  'duration', 'budget', 'meals']);

/** U -> row. Skips empty values and U.img (banner data URL is never stored). */
export function profileToRow(U) {
  const row = {};
  for (const [k, col] of Object.entries(MAP)) {
    let v = U[k];
    if (v === undefined || v === null || v === '') continue;
    if (NUMERIC.has(k)) {
      v = Number(v);
      if (!Number.isFinite(v)) continue;
    }
    row[col] = v;
  }
  if (U.health !== undefined) row.has_health_condition = U.health === 'yes' || U.health === true;
  if (U.done !== undefined) row.onboarded = !!U.done;
  return row;
}

/** Row -> U fragment (merge over the local U). */
export function rowToProfile(row) {
  if (!row) return null;
  const U = {};
  for (const [k, col] of Object.entries(MAP)) {
    const v = row[col];
    if (v === null || v === undefined) continue;
    if (Array.isArray(v) && !v.length) continue;
    U[k] = typeof v === 'string' && NUMERIC.has(k) ? Number(v) : v;
  }
  if (typeof row.has_health_condition === 'boolean') U.health = row.has_health_condition ? 'yes' : 'no';
  if (row.onboarded) U.done = 1;
  return U;
}

async function currentUserId() {
  const s = await getSession();
  return s ? s.user.id : null;
}

export async function loadProfile() {
  if (!supabase) return OFFLINE;
  const id = await currentUserId();
  if (!id) return SIGNED_OUT;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  return { data: rowToProfile(data), error };
}

export async function saveProfile(U) {
  if (!supabase) return OFFLINE;
  const id = await currentUserId();
  if (!id) return SIGNED_OUT;
  return supabase.from('profiles').upsert({ id, ...profileToRow(U) }).select().single();
}

export async function addWeightLog(weightKg, loggedOn = new Date().toISOString().slice(0, 10)) {
  if (!supabase) return OFFLINE;
  const user_id = await currentUserId();
  if (!user_id) return SIGNED_OUT;
  return supabase
    .from('weight_logs')
    .upsert({ user_id, logged_on: loggedOn, weight_kg: weightKg }, { onConflict: 'user_id,logged_on' })
    .select()
    .single();
}

/** Returns rows plus `asU` in the app's legacy [date, weight] tuple shape. */
export async function listWeightLogs(limit = 365) {
  if (!supabase) return { ...OFFLINE, asU: [] };
  const { data, error } = await supabase
    .from('weight_logs')
    .select('logged_on, weight_kg')
    .order('logged_on', { ascending: true })
    .limit(limit);
  return { data, error, asU: (data || []).map((r) => [r.logged_on, Number(r.weight_kg)]) };
}

// ---- Auth wrappers (thin; UI lives in src/ui/auth.js) ----

export async function signUpWithPassword(email, password) {
  if (!supabase) return OFFLINE;
  return supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
}

export async function signInWithPassword(email, password) {
  if (!supabase) return OFFLINE;
  return supabase.auth.signInWithPassword({ email, password });
}

export async function verifyEmailOtp(email, token) {
  if (!supabase) return OFFLINE;
  return supabase.auth.verifyOtp({ email, token, type: 'email' });
}

export async function sendPasswordReset(email) {
  if (!supabase) return OFFLINE;
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
}

export async function updatePassword(password) {
  if (!supabase) return OFFLINE;
  return supabase.auth.updateUser({ password });
}

/** Subscribe to auth events. Returns an unsubscribe function. */
export function onAuthChange(cb) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange(cb);
  return () => data.subscription.unsubscribe();
}

/** Verify an emailed link (?token_hash=…&type=…). Works on any device, unlike the PKCE redirect. */
export async function verifyTokenHash(token_hash, type) {
  if (!supabase) return OFFLINE;
  return supabase.auth.verifyOtp({ token_hash, type });
}
