"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { Alert, Card, PageHeader } from "@/components/ui";
import { DayTabs } from "@/components/DayTabs";
import { dayMeals, targets, DIET_LABEL, SLOT_LABEL, type Allergy, type DietType, type Slot } from "@/lib/diet";
import { todayKey, WEEK, type DayKey } from "@/lib/planner";

function Macro({ label, value, target, unit, color }: { label: string; value: number; target?: number; unit: string; color: string }) {
  const pct = target ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-muted"><b className="text-fg">{value}</b>{target ? ` / ${target}` : ""} {unit}</span>
      </div>
      {target ? <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div> : null}
    </div>
  );
}

function Diet() {
  const { profile } = useAuth();
  const [day, setDay] = useState<DayKey>(todayKey());
  // Per-day meal swaps: { mon: { lunch: 1 } } — kept for this visit only.
  const [swaps, setSwaps] = useState<Partial<Record<DayKey, Partial<Record<Slot, number>>>>>({});
  const p = profile!;
  const diet = (p.diet ?? "veg") as DietType;
  const hide = p.has_health_condition; // no calorie targets with a medical condition

  const t = useMemo(() => targets({
    gender: p.gender, age: p.age, height_cm: p.height_cm, weight_kg: p.weight_kg,
    goal: p.goal, level: p.level, trainingDays: p.training_days?.length ?? 3,
  }), [p]);

  const kcalTarget = hide ? null : t?.kcal ?? null;
  const plan = useMemo(
    () => dayMeals(day, diet, p.meals_per_day ?? 4, (p.allergies ?? []) as Allergy[], kcalTarget, swaps[day], p.daily_budget_inr),
    [day, diet, p.meals_per_day, p.allergies, kcalTarget, p.daily_budget_inr, swaps],
  );

  const budget = p.daily_budget_inr;
  const weekCost = useMemo(
    () => {
      const days = WEEK.map((k) => dayMeals(k, diet, p.meals_per_day ?? 4, (p.allergies ?? []) as Allergy[], kcalTarget, swaps[k], budget));
      return days.every((d) => d.withinBudget) ? days.reduce((sum, d) => sum + d.rs, 0) : null;
    },
    [diet, p.meals_per_day, p.allergies, kcalTarget, budget, swaps],
  );
  const swap = (slot: Slot) => setSwaps((s) => ({ ...s, [day]: { ...s[day], [slot]: ((s[day]?.[slot] ?? 0) + 1) } }));

  return (
    <>
      <PageHeader kicker={`${DIET_LABEL[diet]} · ${p.meals_per_day ?? 4} meals`} title="Your diet plan">
        Indian meals sized to your goal. Tap <b className="text-fg">Swap</b> for a different option. <Link href="/profile/" className="text-accent">Change preferences</Link>
      </PageHeader>

      {!p.diet && <div className="mb-4"><Alert kind="info">Showing vegetarian meals. Set your food preference in <Link href="/profile/" className="font-semibold underline">Profile</Link>.</Alert></div>}
      {hide && <div className="mb-4"><Alert kind="info">You noted a health condition, so we don&apos;t show calorie targets. Use these as meal ideas and ask a doctor or dietitian for your exact needs.</Alert></div>}
      {!plan.withinBudget && <div className="mb-4"><Alert kind="info">No complete meal plan fits this budget with your current food preferences. Increase your daily budget or update your diet settings.</Alert></div>}

      {!hide && t && (
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1.3fr]">
          <Card>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Daily target</p>
            <p className="font-display text-5xl text-accent">{t.kcal}<span className="ml-1 text-xl text-muted">kcal</span></p>
            <p className="mt-1 text-sm text-muted">Maintenance ≈ {t.maintenance} kcal · BMR {t.bmr}</p>
            <p className="mt-3 text-sm">{t.note}</p>
            <p className="mt-3 text-sm">💧 Water: <b>{t.waterL} L</b> a day</p>
          </Card>
          {plan.withinBudget && (
            <Card className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">This day vs target</p>
              <Macro label="Calories" value={plan.kcal} target={t.kcal} unit="kcal" color="bg-accent" />
              <Macro label="Protein" value={plan.protein} target={t.protein} unit="g" color="bg-lime" />
              <Macro label="Carbs" value={plan.carbs} target={t.carbs} unit="g" color="bg-sky-400" />
              <Macro label="Fat" value={plan.fat} target={t.fat} unit="g" color="bg-amber-400" />
            </Card>
          )}
        </div>
      )}
      {!hide && !t && <div className="mb-4"><Alert kind="info">Add your age, height and weight in Profile to get calorie targets.</Alert></div>}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Cost this day</p>
          <p className="font-display text-3xl text-lime">{plan.withinBudget ? `₹${plan.rs}` : "—"}</p>
          {budget != null ? <p className="text-xs text-muted">{plan.withinBudget ? `Within your ₹${budget} budget` : "No plan shown outside your budget"}</p> : <p className="text-xs text-muted">Set a daily budget in Profile</p>}
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">This week</p>
          <p className="font-display text-3xl">{weekCost == null ? "—" : `₹${weekCost}`}</p>
          <p className="text-xs text-muted">{weekCost == null ? "Not available within your daily budget" : `≈ ₹${Math.round((weekCost * 30) / 7 / 100) * 100} a month`}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Cost per gram protein</p>
          <p className="font-display text-3xl">{plan.withinBudget && plan.protein ? `₹${(plan.rs / plan.protein).toFixed(1)}` : "—"}</p>
          <p className="text-xs text-muted">Home-cooked estimate; prices vary by city</p>
        </Card>
      </div>

      <DayTabs value={day} onChange={setDay} days={WEEK} mark={(k) => ((p.training_days ?? []).includes(k) ? "🏋️" : "😴")} />

      {plan.withinBudget && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {plan.meals.map((m) => (
            <Card key={m.slot}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{SLOT_LABEL[m.slot]}</p>
                  <h3 className="text-lg font-bold leading-tight">{m.name}</h3>
                </div>
                {m.options > 1 && (
                  <button type="button" onClick={() => swap(m.slot)} className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:border-accent hover:text-accent">
                    Swap
                  </button>
                )}
              </div>
              <ul className="divide-y divide-line text-sm">
                {m.foods.map((f) => (
                  <li key={f.name} className="flex justify-between gap-3 py-1.5">
                    <span>{f.name}</span>
                    <span className="shrink-0 text-right text-muted"><b className="text-fg">{f.amount}</b>{!hide && ` · ${f.kcal} kcal`} · <span className="text-lime">₹{f.rs}</span></span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted">
                <span>{!hide && `${m.kcal} kcal · P ${m.protein}g · C ${m.carbs}g · F ${m.fat}g`}</span>
                <span className="font-bold text-lime">≈ ₹{m.rs}</span>
              </p>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-muted">
        Values are approximate. Cook with 1–2 tsp oil per meal, and adjust portions by ±10% if your weight isn&apos;t moving after 2 weeks.
      </p>
    </>
  );
}

export default function DietPage() {
  return <AppShell><Diet /></AppShell>;
}
