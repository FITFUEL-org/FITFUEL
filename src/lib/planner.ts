// Weekly workout plan generator. Pure functions: same profile + seed => same plan.
import type { Exercise, Place, Level } from "./exercises";
import { regionLabel } from "./exercises";

export type Goal = "muscle" | "strength" | "fat_loss" | "general";
export type Experience = "beg" | "int" | "adv";
export type Split = "auto" | "full" | "upper_lower" | "ppl" | "bro";
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type Limitation = "knee" | "lower_back" | "shoulder" | "wrist";

export const WEEK: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_LABEL: Record<DayKey, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday",
};

export interface PlanInput {
  goal: Goal;
  experience: Experience;
  place: Place;
  equipment: string[];      // dataset equipment names the user has (home/outdoor); ignored at the gym
  days: DayKey[];
  minutes: number;
  limitations: Limitation[];
  split: Split;
  seed: string;             // e.g. the user id, so plans differ between users but are stable
}

export interface PlannedExercise {
  id: string;
  muscle: string;           // slot muscle, used to suggest swaps
  sets: number;
  reps: string;
  restSec: number;
}

export interface PlanDay {
  key: DayKey;
  type: DayType;
  title: string;
  focus: string[];
  place: Place;
  exercises: PlannedExercise[];
}

export interface WeekPlan {
  version: 1;
  split: Exclude<Split, "auto">;
  goal: Goal;
  generatedAt: string;
  days: PlanDay[];          // training days only, Monday first
}

export type DayType = "push" | "pull" | "legs" | "upper" | "lower" | "full_a" | "full_b" | "full_c"
  | "chest" | "back" | "shoulders" | "arms" | "conditioning";

type Slot = [muscle: string, mechanic: "compound" | "isolation" | "any"];

const DAY_TITLE: Record<DayType, string> = {
  push: "Push — Chest, Shoulders, Triceps", pull: "Pull — Back & Biceps", legs: "Legs & Core",
  upper: "Upper Body", lower: "Lower Body", full_a: "Full Body A", full_b: "Full Body B", full_c: "Full Body C",
  chest: "Chest Day", back: "Back Day", shoulders: "Shoulders & Traps", arms: "Arms — Biceps & Triceps",
  conditioning: "Conditioning & Core",
};

// Slots in priority order; the session length decides how many are used.
const SLOTS: Record<DayType, Slot[]> = {
  push: [["chest-middle", "compound"], ["delts-front", "compound"], ["chest-upper", "any"], ["triceps", "isolation"], ["delts-side", "isolation"], ["chest-lower", "any"], ["triceps", "any"]],
  pull: [["back-lats", "compound"], ["back-upper", "compound"], ["back-lats", "any"], ["biceps", "isolation"], ["delts-rear", "any"], ["biceps", "any"], ["back-lower", "any"]],
  legs: [["legs-quads", "compound"], ["legs-hamstrings", "compound"], ["legs-glutes", "any"], ["legs-quads", "isolation"], ["legs-calves", "any"], ["abs-lower", "any"], ["abs-obliques", "any"]],
  upper: [["chest-middle", "compound"], ["back-lats", "compound"], ["delts-front", "compound"], ["back-upper", "compound"], ["chest-upper", "any"], ["biceps", "isolation"], ["triceps", "isolation"]],
  lower: [["legs-quads", "compound"], ["legs-hamstrings", "compound"], ["legs-glutes", "any"], ["legs-quads", "isolation"], ["legs-calves", "any"], ["abs-upper", "any"], ["abs-lower", "any"]],
  full_a: [["legs-quads", "compound"], ["chest-middle", "compound"], ["back-lats", "compound"], ["delts-side", "any"], ["legs-hamstrings", "any"], ["abs-upper", "any"], ["biceps", "isolation"]],
  full_b: [["legs-hamstrings", "compound"], ["delts-front", "compound"], ["back-upper", "compound"], ["chest-upper", "any"], ["legs-quads", "any"], ["abs-lower", "any"], ["triceps", "isolation"]],
  full_c: [["legs-glutes", "compound"], ["chest-middle", "compound"], ["back-lats", "any"], ["delts-rear", "any"], ["legs-quads", "isolation"], ["legs-calves", "any"], ["abs-obliques", "any"]],
  chest: [["chest-middle", "compound"], ["chest-upper", "compound"], ["chest-lower", "any"], ["chest-upper", "isolation"], ["chest-middle", "isolation"], ["triceps", "any"], ["abs-upper", "any"]],
  back: [["back-lats", "compound"], ["back-upper", "compound"], ["back-lats", "any"], ["back-upper", "any"], ["back-lower", "any"], ["delts-rear", "any"], ["back-lats", "isolation"]],
  shoulders: [["delts-front", "compound"], ["delts-side", "isolation"], ["delts-rear", "any"], ["back-upper", "any"], ["delts-side", "any"], ["delts-front", "isolation"], ["abs-obliques", "any"]],
  arms: [["biceps", "any"], ["triceps", "compound"], ["biceps", "isolation"], ["triceps", "isolation"], ["forearms", "any"], ["biceps", "isolation"], ["triceps", "any"]],
  conditioning: [["legs-quads", "compound"], ["abs-upper", "any"], ["legs-glutes", "any"], ["delts-front", "any"], ["abs-obliques", "any"], ["legs-calves", "any"], ["back-lats", "any"]],
};

const SEQUENCE: Record<Exclude<Split, "auto">, DayType[]> = {
  full: ["full_a", "full_b", "full_c", "full_a", "full_b", "full_c", "conditioning"],
  upper_lower: ["upper", "lower", "upper", "lower", "upper", "lower", "conditioning"],
  ppl: ["push", "pull", "legs", "push", "pull", "legs", "conditioning"],
  bro: ["chest", "back", "legs", "shoulders", "arms", "legs", "conditioning"],
};

const FOCUS: Record<DayType, string[]> = Object.fromEntries(
  Object.entries(SLOTS).map(([k, s]) => [k, [...new Set(s.map(([m]) => regionLabel(m)))].slice(0, 5)]),
) as Record<DayType, string[]>;

/** Pick a split from the number of training days (and experience) when the user chose "auto". */
export function chooseSplit(split: Split, dayCount: number, experience: Experience): Exclude<Split, "auto"> {
  if (split !== "auto") return split;
  if (dayCount <= 2) return "full";
  if (dayCount === 3) return experience === "beg" ? "full" : "ppl";
  if (dayCount === 4) return "upper_lower";
  return "ppl";
}

/** Sets / reps / rest for a goal. Compound lifts get lower reps for strength. */
export function prescription(goal: Goal, mechanic: string | null, experience: Experience) {
  const extra = experience === "adv" ? 1 : 0;
  const compound = mechanic === "compound";
  switch (goal) {
    case "strength": return compound ? { sets: 4 + extra, reps: "4–6", restSec: 150 } : { sets: 3, reps: "8–10", restSec: 90 };
    case "fat_loss": return { sets: 3, reps: "12–15", restSec: 45 };
    case "general": return { sets: 3, reps: "10–12", restSec: 60 };
    default: return compound ? { sets: 3 + extra, reps: "8–12", restSec: 90 } : { sets: 3, reps: "10–15", restSec: 60 };
  }
}

/** Exercises per session from the time available. */
export const exerciseCount = (minutes: number) => (minutes <= 30 ? 4 : minutes <= 45 ? 5 : minutes <= 60 ? 6 : 7);

const LEVEL_RANK: Record<Level, number> = { beginner: 0, intermediate: 1, expert: 2 };
const EXP_RANK: Record<Experience, number> = { beg: 0, int: 1, adv: 2 };

const AVOID: Record<Limitation, RegExp> = {
  knee: /jump|plyo|box|lunge|pistol|sissy|bound|skater|split squat/i,
  lower_back: /deadlift|good morning|bent[- ]over|hyperextension|superman|clean|snatch/i,
  shoulder: /behind the neck|upright row|dip|handstand|snatch|overhead squat/i,
  wrist: /front squat|clean|push-?up|handstand|wrist/i,
};

// Well-known staples rank first so plans look like what a coach would write.
const STAPLE = /^(barbell (bench press - medium grip|squat|deadlift|curl|shoulder press|incline bench press - medium grip)|pullups|chin-up|pushups|dumbbell (bench press|flyes|shoulder press|lunges|bicep curl|rows?)|one-arm dumbbell row|bent over barbell row|romanian deadlift|leg press|lying leg curls|leg extensions|seated cable rows|wide-grip lat pulldown|cable crossover|triceps pushdown|side lateral raise|standing calf raises|plank|crunches|goblet squat|hip thrust|barbell hip thrust|dips - (chest|triceps) version|face pull|hammer curls|close-grip barbell bench press|incline dumbbell press|kettlebell (swing|goblet squat)|bodyweight squat|glute bridge|walking lunge|mountain climbers|burpee|bench dips|inverted row)/i;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Can this exercise be done with the user's place, equipment, level and limitations? */
export function isAllowed(e: Exercise, input: Pick<PlanInput, "place" | "equipment" | "experience" | "limitations">, place: Place = input.place): boolean {
  if (!e.places.includes(place)) return false;
  if (!["strength", "powerlifting", "plyometrics", "cardio"].includes(e.category)) return false;
  if (e.category === "powerlifting" && input.experience === "beg") return false;
  if (place !== "gym" && !["body only", "none", ...input.equipment].includes(e.equipment)) return false;
  if (LEVEL_RANK[e.level] > EXP_RANK[input.experience] + (e.level === "intermediate" ? 1 : 0)) return false;
  return !input.limitations.some((l) => AVOID[l].test(e.name));
}

/** Does an exercise train this slot? Slots name a region ("chest-upper"); older plans used whole muscles ("chest"). */
export const targets = (e: Exercise, key: string) => e.region === key || (!key.includes("-") && e.primary.includes(key));

/** Ranked candidates for one slot (best first). */
export function candidates(all: Exercise[], input: PlanInput, slot: Slot, place: Place, salt: string): Exercise[] {
  const [muscle, mech] = slot;
  return all
    .filter((e) => targets(e, muscle) && isAllowed(e, input, place) && e.category !== "cardio")
    .map((e) => {
      let score = hash(input.seed + salt + e.id) % 1000;
      if (STAPLE.test(e.name)) score += 3000;
      if (mech !== "any" && e.mechanic === mech) score += 2000;
      if (e.category === "plyometrics") score -= input.goal === "fat_loss" ? 0 : 2500;
      if (place === "gym" && ["barbell", "dumbbell", "cable", "machine"].includes(e.equipment)) score += 500;
      return { e, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.e);
}

/** Build a full week. */
export function generatePlan(all: Exercise[], input: PlanInput): WeekPlan {
  const days = WEEK.filter((d) => input.days.includes(d));
  const split = chooseSplit(input.split, days.length, input.experience);
  const seq = SEQUENCE[split];
  const used = new Set<string>();
  const n = exerciseCount(input.minutes);

  const planDays = days.map((key, i) => buildDay(all, input, key, seq[i % seq.length], input.place, used, n));
  return { version: 1, split, goal: input.goal, generatedAt: new Date().toISOString(), days: planDays };
}

/** Build one training day. `used` steers away from repeating exercises across the week. */
export function buildDay(all: Exercise[], input: PlanInput, key: DayKey, type: DayType, place: Place,
  used = new Set<string>(), n = exerciseCount(input.minutes)): PlanDay {
  const picked: PlannedExercise[] = [];
  for (const slot of SLOTS[type]) {
    if (picked.length >= n) break;
    const list = candidates(all, input, slot, place, `${key}:${slot[0]}:${picked.length}`)
      .filter((e) => !picked.some((p) => p.id === e.id));
    const e = list.find((x) => !used.has(x.id)) ?? list[0];
    if (!e) continue;
    used.add(e.id);
    picked.push({ id: e.id, muscle: slot[0], ...prescription(input.goal, e.mechanic, input.experience) });
  }
  if (input.goal === "fat_loss") {
    const ok = (e: Exercise) => isAllowed(e, input, place) && (e.category === "cardio" || e.category === "plyometrics") && !picked.some((p) => p.id === e.id);
    const fin = all.find((e) => ok(e) && hash(input.seed + key + e.id) % 3 === 0) ?? all.find(ok);
    if (fin) picked.push({ id: fin.id, muscle: "cardio", sets: 1, reps: "10 min", restSec: 0 });
  }
  return { key, type, title: DAY_TITLE[type], focus: FOCUS[type], place, exercises: picked };
}

/** Alternatives for swapping one exercise in a day. */
export function alternatives(all: Exercise[], input: PlanInput, day: PlanDay, ex: PlannedExercise, limit = 8): Exercise[] {
  const inDay = new Set(day.exercises.map((x) => x.id));
  return candidates(all, input, [ex.muscle, "any"], day.place, "swap")
    .filter((e) => !inDay.has(e.id))
    .slice(0, limit);
}

/** Today's key in the plan's Monday-first week. */
export const todayKey = (d = new Date()): DayKey => WEEK[(d.getDay() + 6) % 7];

export const SPLIT_LABEL: Record<Exclude<Split, "auto">, string> = {
  full: "Full body", upper_lower: "Upper / Lower", ppl: "Push / Pull / Legs", bro: "Body-part split",
};
