"use client";

import { Suspense, useState } from "react";
import { ExerciseThumb } from "@/components/ExerciseThumb";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ExerciseRow } from "@/components/ExerciseRow";
import { Alert, Button, Card, LinkButton, PageHeader, Spinner } from "@/components/ui";
import { usePlan } from "@/lib/usePlan";
import { PLACE_LABEL, title, type Place } from "@/lib/exercises";
import { alternatives, buildDay, generatePlan, prescription, todayKey, DAY_LABEL, SPLIT_LABEL, WEEK, type PlanDay, type PlannedExercise } from "@/lib/planner";

function PlanView() {
  const { all, plan, byId, error, update, input } = usePlan();
  const params = useSearchParams();
  const [swap, setSwap] = useState<{ day: PlanDay; ex: PlannedExercise } | null>(null);
  const [busy, setBusy] = useState(false);

  if (error) return <Alert>{error}</Alert>;
  if (!all || !plan || !input) return <Spinner label="Building your plan" />;

  const today = todayKey();
  const restDays = WEEK.filter((k) => !plan.days.some((d) => d.key === k));

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
        {plan.days.length} training days · tap any exercise for the demo, or swap it for another.
      </PageHeader>
      {params.get("new") && <div className="mb-6"><Alert kind="success">Your plan is ready! Start with today&apos;s workout or browse the week below.</Alert></div>}

      <div className="grid gap-5 lg:grid-cols-2">
        {plan.days.map((day) => (
          <Card key={day.key} className={day.key === today ? "ring-2 ring-accent" : ""}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{DAY_LABEL[day.key]}{day.key === today && " · Today"}</p>
                <h2 className="font-display text-2xl uppercase tracking-wide">{day.title}</h2>
                <p className="text-sm text-muted">{day.focus.map(title).join(" · ")}</p>
              </div>
              <label className="text-sm">
                <span className="sr-only">Where on {DAY_LABEL[day.key]}</span>
                <select
                  className="rounded-lg border border-line bg-bg px-3 py-2 text-sm"
                  value={day.place}
                  onChange={(e) => setDay(buildDay(all, input, day.key, day.type, e.target.value as Place))}
                >
                  {(["gym", "home", "outdoor"] as Place[]).map((p) => <option key={p} value={p}>{PLACE_LABEL[p]}</option>)}
                </select>
              </label>
            </div>
            <ol className="space-y-2">
              {day.exercises.map((p, i) => (
                <ExerciseRow key={p.id} ex={byId.get(p.id)} p={p} index={i}
                  action={p.muscle !== "cardio" && (
                    <button type="button" onClick={() => setSwap({ day, ex: p })} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted hover:border-accent hover:text-accent">
                      Swap
                    </button>
                  )} />
              ))}
            </ol>
            <LinkButton href={`/workout/${day.key}/`} className="mt-4 w-full">Start {DAY_LABEL[day.key]}&apos;s workout</LinkButton>
          </Card>
        ))}
      </div>

      {restDays.length > 0 && (
        <p className="mt-6 text-sm text-muted">Rest days: {restDays.map((k) => DAY_LABEL[k]).join(", ")}. Walk, stretch, sleep 7–9 hours — muscles grow while you recover.</p>
      )}

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
