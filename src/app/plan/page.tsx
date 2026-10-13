"use client";

import { Suspense, useState } from "react";
import { ExerciseThumb } from "@/components/ExerciseThumb";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ExerciseRow } from "@/components/ExerciseRow";
import { Alert, Button, Card, LinkButton, PageHeader, Spinner } from "@/components/ui";
import { usePlan } from "@/lib/usePlan";
import { PLACE_LABEL, title, type Place } from "@/lib/exercises";
import { alternatives, buildDay, generatePlan, prescription, todayKey, DAY_LABEL, SPLIT_LABEL, WEEK, type DayKey, type DayType, type PlanDay, type PlannedExercise } from "@/lib/planner";
import { DayTabs } from "@/components/DayTabs";

const SHORT: Partial<Record<DayType, string>> = { push: "Push", pull: "Pull", legs: "Legs", upper: "Upper", lower: "Lower", full_a: "Full", full_b: "Full", full_c: "Full", chest: "Chest", back: "Back", shoulders: "Delts", arms: "Arms", conditioning: "Cardio" };

function PlanView() {
  const { all, plan, byId, error, update, input } = usePlan();
  const params = useSearchParams();
  const [swap, setSwap] = useState<{ day: PlanDay; ex: PlannedExercise } | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<DayKey>(todayKey());

  if (error) return <Alert>{error}</Alert>;
  if (!all || !plan || !input) return <Spinner label="Building your plan" />;

  const today = todayKey();
  const current = plan.days.find((d) => d.key === selected);

  const setDay = (day: PlanDay) => update({ ...plan, days: plan.days.map((d) => (d.key === day.key ? day : d)) });

  async function regenerate() {
    if (!confirmReset()) return;
    setBusy(true);
    await update(generatePlan(all!, { ...input!, seed: input!.seed + Date.now() }));
    setBusy(false);
  }

  return (
    <>
      <PageHeader kicker={SPLIT_LABEL[plan.split]} title="Your weekly plan">
        {plan.days.length} training days a week. Pick a day to see its exercises — tap one for the demo, or swap it.
      </PageHeader>
      {params.get("new") && <div className="mb-6"><Alert kind="success">Your plan is ready! Start with today&apos;s workout or pick another day below.</Alert></div>}

      <DayTabs value={selected} onChange={setSelected} days={WEEK}
        mark={(k) => { const d = plan.days.find((x) => x.key === k); return d ? <span className="text-[11px] font-semibold">{SHORT[d.type] ?? "Train"}</span> : "😴"; }} />

      <div className="mt-4">
        {current ? (
          <Card className={current.key === today ? "border-accent/60" : ""}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{DAY_LABEL[current.key]}{current.key === today && " · Today"}</p>
                <h2 className="font-display text-2xl uppercase tracking-wide">{current.title}</h2>
                <p className="text-sm text-muted">{current.exercises.length} exercises · {current.focus.map(title).join(" · ")}</p>
              </div>
              <label className="text-sm">
                <span className="sr-only">Where on {DAY_LABEL[current.key]}</span>
                <select
                  className="rounded-lg border border-line bg-bg px-3 py-2 text-sm"
                  value={current.place}
                  onChange={(e) => setDay(buildDay(all, input, current.key, current.type, e.target.value as Place))}
                >
                  {(["gym", "home", "outdoor"] as Place[]).map((p) => <option key={p} value={p}>{PLACE_LABEL[p]}</option>)}
                </select>
              </label>
            </div>
            <ol className="grid gap-2 lg:grid-cols-2">
              {current.exercises.map((p, i) => (
                <ExerciseRow key={p.id} ex={byId.get(p.id)} p={p} index={i}
                  action={p.muscle !== "cardio" && (
                    <button type="button" onClick={() => setSwap({ day: current, ex: p })} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted hover:border-accent hover:text-accent">
                      Swap
                    </button>
                  )} />
              ))}
            </ol>
            <LinkButton href={`/workout/${current.key}/`} className="mt-4 w-full sm:w-auto">Start {DAY_LABEL[current.key]}&apos;s workout</LinkButton>
          </Card>
        ) : (
          <Card className="text-center">
            <p className="font-display text-2xl uppercase">{DAY_LABEL[selected]} — rest day</p>
            <p className="mt-2 text-muted">Walk, stretch and sleep 7–9 hours. Muscles grow while you recover.</p>
          </Card>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="outline" onClick={regenerate} busy={busy}>Generate a fresh plan</Button>
        <LinkButton href="/profile/" variant="ghost">Change days, goal or equipment</LinkButton>
      </div>

      {swap && (
        <SwapSheet
          options={alternatives(all, input, swap.day, swap.ex)}
          current={byId.get(swap.ex.id)?.name ?? swap.ex.id}
          onClose={() => setSwap(null)}
          onPick={(id) => {
            const e = byId.get(id)!;
            setDay({ ...swap.day, exercises: swap.day.exercises.map((x) => (x.id === swap.ex.id ? { ...x, id, ...prescription(plan.goal, e.mechanic, input.experience) } : x)) });
            setSwap(null);
          }}
        />
      )}
    </>
  );
}

function confirmReset() {
  return window.confirm("Replace your whole plan, including any swaps you made?");
}

function SwapSheet({ options, current, onPick, onClose }: { options: ReturnType<typeof alternatives>; current: string; onPick: (id: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Swap ${current}`} onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-surface p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl uppercase">Swap {current}</h2>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-1 text-muted hover:text-fg" aria-label="Close">✕</button>
        </div>
        {options.length === 0 ? <p className="text-muted">No alternatives for your equipment.</p> : (
          <ul className="space-y-2">
            {options.map((e) => (
              <li key={e.id}>
                <button type="button" onClick={() => onPick(e.id)} className="flex w-full items-center gap-3 rounded-2xl border border-line p-2 text-left hover:border-accent">
                  <ExerciseThumb src={e.images[0]} className="h-14 w-14 shrink-0 rounded-xl" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{e.name}</span>
                    <span className="block text-xs text-muted">{title(e.equipment)} · {title(e.level)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function PlanPage() {
  return <AppShell><Suspense fallback={<Spinner />}><PlanView /></Suspense></AppShell>;
}
