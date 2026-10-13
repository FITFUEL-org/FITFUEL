"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Logo } from "@/components/Logo";
import { Alert, Button, Spinner } from "@/components/ui";
import { AboutFields, BodyFields, GoalFields, LevelFields, PlaceFields, ScheduleFields, DietFields, HealthFields, validate, type Draft } from "@/components/ProfileFields";
import { saveProfile, savePlan, planInput, logWeight } from "@/lib/data";
import { loadExercises } from "@/lib/exercises";
import { generatePlan } from "@/lib/planner";
import { friendlyError } from "@/lib/supabase";

const STEPS = [
  { k: "about", t: "Let's get to know you", s: "This helps us set the right intensity.", C: AboutFields },
  { k: "body", t: "Your body today", s: "Used for BMI and to track progress.", C: BodyFields },
  { k: "goal", t: "What's your main goal?", s: "Sets your reps, rest and volume.", C: GoalFields },
  { k: "level", t: "Training experience", s: "We'll match exercise difficulty.", C: LevelFields },
  { k: "place", t: "Where will you train?", s: "You can change this for any day later.", C: PlaceFields },
  { k: "schedule", t: "Your weekly schedule", s: "We'll build a split around your days.", C: ScheduleFields },
  { k: "diet", t: "Your food preference", s: "We'll build an Indian meal plan around it.", C: DietFields },
  { k: "health", t: "Health & safety", s: "Last step.", C: HealthFields },
] as const;

export default function OnboardingPage() {
  const { ready, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login/?next=/onboarding/");
  }, [ready, user, router]);

  if (!ready || !user) return <Spinner />;
  return <Wizard />;
}

function Wizard() {
  const { user, profile, setProfile } = useAuth();
  const router = useRouter();
  const [i, setI] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // Start from whatever is already saved (e.g. name from sign-up).
  const [d, setD] = useState<Draft>(() => ({
    name: (user?.user_metadata?.name as string) || "",
    training_days: ["mon", "wed", "fri"], workout_minutes: 45, preferred_split: "auto", equipment: [], limitations: [], meals_per_day: 4, allergies: [],
    ...Object.fromEntries(Object.entries(profile ?? {}).filter(([, v]) => v !== null && !(Array.isArray(v) && !v.length))),
  }));

  const step = STEPS[i];
  const set = (patch: Draft) => { setD((x) => ({ ...x, ...patch })); setError(""); };

  async function next() {
    const err = validate(step.k, d);
    if (err) return setError(err);
    if (i < STEPS.length - 1) { setI(i + 1); scrollTo(0, 0); return; }
    setBusy(true);
    try {
      const p = await saveProfile(user!.id, {
        name: d.name?.trim(), age: d.age, gender: d.gender, height_cm: d.height_cm, weight_kg: d.weight_kg,
        target_weight_kg: d.target_weight_kg ?? null, start_weight_kg: profile?.start_weight_kg ?? d.weight_kg,
        goal: d.goal, level: d.level, place: d.place, equipment: d.equipment ?? [], training_days: d.training_days,
        workout_minutes: d.workout_minutes, limitations: d.limitations ?? [], preferred_split: d.preferred_split ?? "auto",
        has_health_condition: !!d.has_health_condition, onboarded: true,
        diet: d.diet, meals_per_day: d.meals_per_day ?? 4, allergies: d.allergies ?? [], daily_budget_inr: d.daily_budget_inr ?? null,
      });
      const plan = generatePlan(await loadExercises(), planInput(p));
      await savePlan(user!.id, plan);
      if (p.weight_kg) await logWeight(user!.id, p.weight_kg).catch(() => {});
      setProfile(p);
      router.replace("/plan/?new=1");
    } catch (e) {
      setError(friendlyError(e));
      setBusy(false);
    }
  }

  const C = step.C;
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <Logo />
        <span className="text-sm text-muted">Step {i + 1} of {STEPS.length}</span>
      </div>
      <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={i + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} />
      </div>
      <h1 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">{step.t}</h1>
      <p className="mb-6 mt-1 text-muted">{step.s}</p>
      <div className="flex-1 space-y-4">
        <C d={d} set={set} />
        {error && <Alert>{error}</Alert>}
        {step.k === "health" && d.has_health_condition && (
          <Alert kind="info">Please get your doctor&apos;s OK before starting. Your plan will still be created — start light and stop if anything hurts.</Alert>
        )}
      </div>
      <div className="sticky bottom-0 mt-8 flex gap-3 bg-bg py-4">
        {i > 0 && <Button variant="outline" onClick={() => setI(i - 1)} disabled={busy}>Back</Button>}
        <Button className="flex-1" onClick={next} busy={busy}>{i === STEPS.length - 1 ? "Build my plan" : "Continue"}</Button>
      </div>
    </div>
  );
}
