// Typed reads/writes against the Supabase tables (RLS limits every query to the signed-in user).
import { supabase } from "./supabase";
import type { Place } from "./exercises";
import type { DayKey, Experience, Goal, Limitation, Split, WeekPlan, PlanInput } from "./planner";
import type { Allergy, DietType } from "./diet";

export interface Profile {
  id: string;
  name: string | null;
  age: number | null;
  gender: "m" | "f" | "x" | null;
  height_cm: number | null;
  weight_kg: number | null;
  target_weight_kg: number | null;
  start_weight_kg: number | null;
  goal: Goal | null;
  level: Experience | null;
  place: "gym" | "home" | "out" | null;
  equipment: string[];
  training_days: DayKey[];
  workout_minutes: number | null;
  limitations: Limitation[];
  preferred_split: Split | null;
  has_health_condition: boolean;
  onboarded: boolean;
  diet: DietType | null;
  meals_per_day: number | null;
  allergies: Allergy[];
}

const PROFILE_COLS = "id,name,age,gender,height_cm,weight_kg,target_weight_kg,start_weight_kg,goal,level,place,equipment,training_days,workout_minutes,limitations,preferred_split,has_health_condition,onboarded,diet,meals_per_day,allergies";

export const toPlace = (p: Profile["place"]): Place => (p === "out" ? "outdoor" : p === "home" ? "home" : "gym");
export const fromPlace = (p: Place): Profile["place"] => (p === "outdoor" ? "out" : p);

/** Numeric columns come back as strings from Postgres `numeric`; normalise them. */
function normalise(row: Record<string, unknown>): Profile {
  const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  return {
    ...(row as unknown as Profile),
    height_cm: num(row.height_cm), weight_kg: num(row.weight_kg),
    target_weight_kg: num(row.target_weight_kg), start_weight_kg: num(row.start_weight_kg),
  };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select(PROFILE_COLS).eq("id", userId).maybeSingle();
  if (error) throw error;
  return data ? normalise(data) : null;
}

export async function saveProfile(userId: string, patch: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ ...patch, id: userId, updated_at: new Date().toISOString() })
    .select(PROFILE_COLS)
    .single();
  if (error) throw error;
  return normalise(data);
}

export function planInput(p: Profile): PlanInput {
  return {
    goal: p.goal ?? "muscle",
    experience: p.level ?? "beg",
    place: toPlace(p.place),
    equipment: p.equipment ?? [],
    days: p.training_days?.length ? p.training_days : ["mon", "wed", "fri"],
    minutes: p.workout_minutes ?? 45,
    limitations: p.limitations ?? [],
    split: p.preferred_split ?? "auto",
    seed: p.id,
  };
}

// ---- Plans ----
export async function getPlan(userId: string): Promise<WeekPlan | null> {
  const { data, error } = await supabase.from("workout_plans").select("plan").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return (data?.plan as WeekPlan) ?? null;
}

export async function savePlan(userId: string, plan: WeekPlan): Promise<void> {
  const { error } = await supabase
    .from("workout_plans")
    .upsert({ user_id: userId, plan, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ---- Sessions ----
export interface LoggedSet { reps: number | null; kg: number | null; done: boolean }
export interface LoggedExercise { id: string; name: string; sets: LoggedSet[] }
export interface Session {
  id: string;
  performed_on: string;
  day_key: string;
  title: string | null;
  exercises: LoggedExercise[];
  duration_min: number | null;
}

export async function listSessions(limit = 60): Promise<Session[]> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("id,performed_on,day_key,title,exercises,duration_min")
    .order("performed_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Session[];
}

export async function addSession(userId: string, s: Omit<Session, "id">): Promise<void> {
  const { error } = await supabase.from("workout_sessions").insert({ ...s, user_id: userId });
  if (error) throw error;
}

// ---- Body weight ----
export interface WeightLog { logged_on: string; weight_kg: number }

export async function listWeights(limit = 120): Promise<WeightLog[]> {
  const { data, error } = await supabase
    .from("weight_logs")
    .select("logged_on,weight_kg")
    .order("logged_on", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({ logged_on: r.logged_on, weight_kg: Number(r.weight_kg) }));
}

export async function logWeight(userId: string, kg: number, date = new Date().toISOString().slice(0, 10)) {
  const { error } = await supabase
    .from("weight_logs")
    .upsert({ user_id: userId, logged_on: date, weight_kg: kg }, { onConflict: "user_id,logged_on" });
  if (error) throw error;
  await supabase.from("profiles").update({ weight_kg: kg }).eq("id", userId);
}
