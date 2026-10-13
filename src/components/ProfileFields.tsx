"use client";

import type { Profile } from "@/lib/data";
import type { DayKey, Experience, Goal, Limitation, Split } from "@/lib/planner";
import { WEEK, DAY_LABEL } from "@/lib/planner";
import { useState } from "react";
import { ALLERGY_LABEL, type Allergy, type DietType } from "@/lib/diet";
import { Chip, Field, inputCls } from "./ui";

export type Draft = Partial<Profile>;
type P = { d: Draft; set: (patch: Draft) => void };

function Option({ active, onClick, title, desc, icon }: { active: boolean; onClick: () => void; title: string; desc?: string; icon?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-accent bg-accent/10" : "border-line bg-surface hover:border-accent/50"}`}>
      {icon && <span className="text-2xl" aria-hidden>{icon}</span>}
      <span>
        <span className="block font-semibold text-fg">{title}</span>
        {desc && <span className="mt-0.5 block text-sm text-muted">{desc}</span>}
      </span>
    </button>
  );
}

const num = (v: string) => (v === "" ? null : Number(v));

export function AboutFields({ d, set }: P) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Name"><input className={inputCls} maxLength={80} value={d.name ?? ""} onChange={(e) => set({ name: e.target.value })} /></Field>
      <Field label="Age (years)"><input className={inputCls} type="number" inputMode="numeric" min={13} max={100} value={d.age ?? ""} onChange={(e) => set({ age: num(e.target.value) })} /></Field>
      <div className="sm:col-span-2">
        <span className="mb-2 block text-sm font-medium">Gender</span>
        <div className="flex flex-wrap gap-2">
          {([["m", "Male"], ["f", "Female"], ["x", "Prefer not to say"]] as const).map(([k, l]) => (
            <Chip key={k} active={d.gender === k} onClick={() => set({ gender: k })}>{l}</Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

const CM_PER_IN = 2.54;
const toFtIn = (cm: number | null) => {
  if (!cm) return { ft: "", inch: "" };
  const total = Math.round(cm / CM_PER_IN);
  return { ft: String(Math.floor(total / 12)), inch: String(total % 12) };
};

/** Height in cm, or feet + inches for people who don't know their cm. Always stored as cm. */
function HeightInput({ cm, onChange }: { cm: number | null; onChange: (cm: number | null) => void }) {
  const [unit, setUnit] = useState<"cm" | "ft">("ft");
  const [fi, setFi] = useState(() => toFtIn(cm));

  function setFeet(next: { ft: string; inch: string }) {
    setFi(next);
    const ft = Number(next.ft || 0), inch = Number(next.inch || 0);
    onChange(next.ft === "" && next.inch === "" ? null : Math.round((ft * 12 + inch) * CM_PER_IN * 10) / 10);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Height</span>
        <div className="flex rounded-lg border border-line p-0.5 text-xs font-semibold" role="group" aria-label="Height unit">
          {(["ft", "cm"] as const).map((u) => (
            <button key={u} type="button" aria-pressed={unit === u}
              onClick={() => { setUnit(u); if (u === "ft") setFi(toFtIn(cm)); }}
              className={`rounded-md px-2.5 py-1 ${unit === u ? "bg-accent text-black" : "text-muted"}`}>
              {u === "ft" ? "ft + in" : "cm"}
            </button>
          ))}
        </div>
      </div>
      {unit === "cm" ? (
        <input className={inputCls} type="number" inputMode="decimal" min={100} max={250} aria-label="Height in cm"
          value={cm ?? ""} onChange={(e) => onChange(num(e.target.value))} />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <input className={inputCls} type="number" inputMode="numeric" min={3} max={8} placeholder="ft" aria-label="Feet"
            value={fi.ft} onChange={(e) => setFeet({ ...fi, ft: e.target.value })} />
          <input className={inputCls} type="number" inputMode="numeric" min={0} max={11} placeholder="in" aria-label="Inches"
            value={fi.inch} onChange={(e) => setFeet({ ...fi, inch: e.target.value })} />
        </div>
      )}
      {cm ? <span className="block text-xs text-muted">{unit === "ft" ? `= ${Math.round(cm)} cm` : `= ${toFtIn(cm).ft}′ ${toFtIn(cm).inch}″`}</span> : null}
    </div>
  );
}

export function BodyFields({ d, set }: P) {
  const bmi = d.height_cm && d.weight_kg ? d.weight_kg / (d.height_cm / 100) ** 2 : null;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <HeightInput cm={d.height_cm ?? null} onChange={(cm) => set({ height_cm: cm })} />
        <Field label="Weight (kg)"><input className={inputCls} type="number" inputMode="decimal" min={30} max={300} step="0.1" value={d.weight_kg ?? ""} onChange={(e) => set({ weight_kg: num(e.target.value) })} /></Field>
        <Field label="Target weight (kg)" hint="Optional"><input className={inputCls} type="number" inputMode="decimal" min={30} max={300} step="0.1" value={d.target_weight_kg ?? ""} onChange={(e) => set({ target_weight_kg: num(e.target.value) })} /></Field>
      </div>
      {bmi && (
        <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">
          BMI <b className="text-fg">{bmi.toFixed(1)}</b> — {bmi < 18.5 ? "underweight: focus on eating enough and building muscle." : bmi < 25 ? "healthy range." : bmi < 30 ? "overweight range." : "obese range: start gently and check with a doctor."}
        </p>
      )}
    </div>
  );
}

export const GOALS: [Goal, string, string, string][] = [
  ["muscle", "💪", "Build muscle", "Hypertrophy: 8–12 reps, more volume"],
  ["strength", "🏋️", "Get stronger", "Heavy compound lifts, 4–6 reps"],
  ["fat_loss", "🔥", "Lose fat & tone", "Higher reps, short rest, cardio finishers"],
  ["general", "⚡", "General fitness", "Balanced training for health"],
];

export function GoalFields({ d, set }: P) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {GOALS.map(([k, i, t, desc]) => <Option key={k} icon={i} title={t} desc={desc} active={d.goal === k} onClick={() => set({ goal: k })} />)}
    </div>
  );
}

export const LEVELS: [Experience, string, string][] = [
  ["beg", "Beginner", "New to lifting or under 6 months"],
  ["int", "Intermediate", "6 months – 2 years of regular training"],
  ["adv", "Advanced", "2+ years, comfortable with heavy compound lifts"],
];

export function LevelFields({ d, set }: P) {
  return (
    <div className="grid gap-3">
      {LEVELS.map(([k, t, desc]) => <Option key={k} title={t} desc={desc} active={d.level === k} onClick={() => set({ level: k })} />)}
    </div>
  );
}

const HOME_GEAR: [string, string][] = [
  ["dumbbell", "Dumbbells"], ["kettlebells", "Kettlebells"], ["bands", "Resistance bands"],
  ["barbell", "Barbell"], ["exercise ball", "Swiss ball"], ["medicine ball", "Medicine ball"], ["foam roll", "Foam roller"],
];

export function PlaceFields({ d, set }: P) {
  const eq = d.equipment ?? [];
  const toggle = (k: string) => set({ equipment: eq.includes(k) ? eq.filter((x) => x !== k) : [...eq, k] });
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Option icon="🏢" title="Gym" desc="Full access to machines and weights" active={d.place === "gym"} onClick={() => set({ place: "gym" })} />
        <Option icon="🏠" title="Home" desc="Bodyweight + whatever gear you own" active={d.place === "home"} onClick={() => set({ place: "home" })} />
        <Option icon="🌳" title="Outdoor" desc="Park, terrace or ground" active={d.place === "out"} onClick={() => set({ place: "out" })} />
      </div>
      {d.place && d.place !== "gym" && (
        <div>
          <p className="mb-2 text-sm font-medium">Equipment you have <span className="text-muted">(bodyweight is always included)</span></p>
          <div className="flex flex-wrap gap-2">
            {HOME_GEAR.map(([k, l]) => <Chip key={k} active={eq.includes(k)} onClick={() => toggle(k)}>{l}</Chip>)}
          </div>
        </div>
      )}
    </div>
  );
}

export function ScheduleFields({ d, set }: P) {
  const days = d.training_days ?? [];
  const toggle = (k: DayKey) => set({ training_days: days.includes(k) ? days.filter((x) => x !== k) : WEEK.filter((w) => w === k || days.includes(w)) });
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium">Which days will you train? <span className="text-muted">({days.length} selected — 3 to 5 is ideal)</span></p>
        <div className="flex flex-wrap gap-2">
          {WEEK.map((k) => <Chip key={k} active={days.includes(k)} onClick={() => toggle(k)}>{DAY_LABEL[k].slice(0, 3)}</Chip>)}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">How long is each session?</p>
        <div className="flex flex-wrap gap-2">
          {[30, 45, 60, 75, 90].map((m) => <Chip key={m} active={d.workout_minutes === m} onClick={() => set({ workout_minutes: m })}>{m} min</Chip>)}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Training split</p>
        <div className="flex flex-wrap gap-2">
          {([["auto", "Pick for me"], ["full", "Full body"], ["upper_lower", "Upper / Lower"], ["ppl", "Push / Pull / Legs"], ["bro", "Body-part split"]] as [Split, string][]).map(([k, l]) => (
            <Chip key={k} active={(d.preferred_split ?? "auto") === k} onClick={() => set({ preferred_split: k })}>{l}</Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

const LIMITS: [Limitation, string][] = [["knee", "Knee pain"], ["lower_back", "Lower-back pain"], ["shoulder", "Shoulder pain"], ["wrist", "Wrist pain"]];

export function HealthFields({ d, set }: P) {
  const lim = d.limitations ?? [];
  const toggle = (k: Limitation) => set({ limitations: lim.includes(k) ? lim.filter((x) => x !== k) : [...lim, k] });
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium">Any pain or injuries? <span className="text-muted">We&apos;ll avoid exercises that stress these areas.</span></p>
        <div className="flex flex-wrap gap-2">
          {LIMITS.map(([k, l]) => <Chip key={k} active={lim.includes(k)} onClick={() => toggle(k)}>{l}</Chip>)}
        </div>
      </div>
      <label className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
        <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--accent)]" checked={!!d.has_health_condition} onChange={(e) => set({ has_health_condition: e.target.checked })} />
        <span className="text-sm">
          <b className="block text-fg">I have a medical condition, am pregnant, or take medication that affects exercise.</b>
          <span className="text-muted">Don&apos;t enter details. We&apos;ll remind you to get a doctor&apos;s OK before training.</span>
        </span>
      </label>
    </div>
  );
}

/** Returns an error message for the given step's fields, or "" when valid. */
export function validate(step: string, d: Draft): string {
  switch (step) {
    case "about": return !d.name?.trim() ? "Enter your name." : !d.age || d.age < 13 || d.age > 100 ? "Age must be between 13 and 100." : !d.gender ? "Choose an option." : "";
    case "body": return !d.height_cm || d.height_cm < 100 || d.height_cm > 250 ? "Enter a height between 3′3″ and 8′2″ (100–250 cm)." : !d.weight_kg || d.weight_kg < 30 || d.weight_kg > 300 ? "Weight must be 30–300 kg." : d.target_weight_kg && (d.target_weight_kg < 30 || d.target_weight_kg > 300) ? "Target must be 30–300 kg." : "";
    case "goal": return d.goal ? "" : "Pick a goal.";
    case "level": return d.level ? "" : "Pick your experience level.";
    case "place": return d.place ? "" : "Pick where you train.";
    case "diet": return d.diet ? "" : "Pick your food preference.";
    case "schedule": return !d.training_days?.length ? "Pick at least one training day." : !d.workout_minutes ? "Pick a session length." : "";
    default: return "";
  }
}

export function DietFields({ d, set }: P) {
  const al = (d.allergies ?? []) as Allergy[];
  const toggle = (k: Allergy) => set({ allergies: al.includes(k) ? al.filter((x) => x !== k) : [...al, k] });
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {([["veg", "🥗", "Vegetarian", "Dal, paneer, curd, sprouts"], ["egg", "🥚", "Eggetarian", "Vegetarian + eggs"], ["nv", "🍗", "Non-vegetarian", "Chicken, fish, eggs"], ["vegan", "🌱", "Vegan", "No dairy or eggs — tofu, soya, dal"]] as [DietType, string, string, string][]).map(([k, i, t, desc]) => (
          <Option key={k} icon={i} title={t} desc={desc} active={d.diet === k} onClick={() => set({ diet: k })} />
        ))}
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Meals per day</p>
        <div className="flex flex-wrap gap-2">
          {[3, 4, 5].map((n) => <Chip key={n} active={(d.meals_per_day ?? 4) === n} onClick={() => set({ meals_per_day: n })}>{n} meals</Chip>)}
        </div>
      </div>
      <div>
        <Field label="Daily food budget (₹)" hint="Optional — we'll show if a day's meals go over it.">
          <input className={inputCls} type="number" inputMode="numeric" min={0} max={5000} placeholder="e.g. 250"
            value={d.daily_budget_inr ?? ""} onChange={(e) => set({ daily_budget_inr: e.target.value === "" ? null : Number(e.target.value) })} />
        </Field>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Allergies or foods you avoid</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ALLERGY_LABEL) as Allergy[]).map((k) => <Chip key={k} active={al.includes(k)} onClick={() => toggle(k)}>{ALLERGY_LABEL[k]}</Chip>)}
        </div>
      </div>
    </div>
  );
}
