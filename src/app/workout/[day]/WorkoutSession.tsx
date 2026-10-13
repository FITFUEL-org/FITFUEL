"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { ExerciseDemo } from "@/components/ExerciseDemo";
import { Alert, Button, Card, PageHeader, Spinner, inputCls } from "@/components/ui";
import { usePlan } from "@/lib/usePlan";
import { addSession, type LoggedExercise } from "@/lib/data";
import { title, type Exercise } from "@/lib/exercises";
import { DAY_LABEL, type DayKey, type PlanDay } from "@/lib/planner";
import { friendlyError } from "@/lib/supabase";

const firstNum = (reps: string) => { const n = parseInt(reps, 10); return Number.isFinite(n) ? n : null; };
const today = () => new Date().toISOString().slice(0, 10);

function Session({ day }: { day: DayKey }) {
  const { plan, byId, error } = usePlan();
  const planDay = plan?.days.find((d) => d.key === day);

  if (error) return <Alert>{error}</Alert>;
  if (!plan) return <Spinner />;
  if (!planDay) {
    return (
      <Card className="text-center">
        <p className="font-display text-2xl uppercase">{DAY_LABEL[day]} is a rest day</p>
        <p className="mt-2 text-muted">Recovery is when muscle grows. Walk, stretch and hydrate.</p>
        <Link href="/plan/" className="mt-4 inline-block font-semibold text-accent">See your week</Link>
      </Card>
    );
  }
  return <Tracker day={day} planDay={planDay} byId={byId} />;
}

function Tracker({ day, planDay, byId }: { day: DayKey; planDay: PlanDay; byId: Map<string, Exercise> }) {
  const { user } = useAuth();
  const router = useRouter();
  const draftKey = `fitfuel.session.${day}.${today()}`;

  // Restore an unfinished session from today, else start fresh from the plan.
  const [log, setLog] = useState<LoggedExercise[]>(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) || "null");
      if (Array.isArray(draft)) return draft;
    } catch {}
    return planDay.exercises.map((p) => ({
      id: p.id, name: byId.get(p.id)?.name ?? p.id,
      sets: Array.from({ length: p.sets }, () => ({ reps: firstNum(p.reps), kg: null, done: false })),
    }));
  });
  const [open, setOpen] = useState<string | null>(planDay.exercises[0]?.id ?? null);
  const [rest, setRest] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    try { localStorage.setItem(draftKey, JSON.stringify(log)); } catch {}
  }, [log, draftKey]);

  useEffect(() => {
    if (rest <= 0) return;
    const t = setTimeout(() => setRest((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [rest]);

  const done = useMemo(() => log.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0), [log]);
  const total = useMemo(() => log.reduce((n, e) => n + e.sets.length, 0), [log]);

  const patchSet = (ei: number, si: number, patch: Partial<LoggedExercise["sets"][number]>) =>
    setLog((l) => l.map((e, i) => (i !== ei ? e : { ...e, sets: e.sets.map((s, j) => (j !== si ? s : { ...s, ...patch })) })));

  function toggleDone(ei: number, si: number) {
    const s = log[ei].sets[si];
    patchSet(ei, si, { done: !s.done });
    if (!s.done) setRest(planDay.exercises[ei]?.restSec || 60);
  }

  async function finish() {
    if (!user) return;
    setSaving(true);
    setSaveErr("");
    try {
      await addSession(user.id, {
        performed_on: today(), day_key: day, title: planDay.title, exercises: log,
        duration_min: Math.min(600, Math.round((Date.now() - startedAt) / 60000)),
      });
      localStorage.removeItem(draftKey);
      router.replace("/progress/?saved=1");
    } catch (e) {
      setSaveErr(friendlyError(e));
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader kicker={`${DAY_LABEL[day]} · ${title(planDay.place)}`} title={planDay.title}>
        {done} of {total} sets done
      </PageHeader>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-lime transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>

      <ol className="space-y-3">
        {log.map((e, ei) => {
          const ex = byId.get(e.id);
          const p = planDay.exercises[ei];
          const isOpen = open === e.id;
          const allDone = e.sets.every((s) => s.done);
          return (
            <li key={e.id}>
              <Card className={allDone ? "border-lime/50" : ""}>
                <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setOpen(isOpen ? null : e.id)} aria-expanded={isOpen}>
                  <span>
                    <span className="block font-semibold">{ei + 1}. {e.name}</span>
                    <span className="text-sm text-muted">{p ? `${p.sets} × ${p.reps}` : ""} · {ex?.primary.map(title).join(", ")}</span>
                  </span>
                  <span className={`text-sm font-bold ${allDone ? "text-lime" : "text-muted"}`}>{e.sets.filter((s) => s.done).length}/{e.sets.length}</span>
                </button>
                {isOpen && (
                  <div className="mt-4 grid gap-4 md:grid-cols-[260px_1fr]">
                    <div>
                      {ex && <ExerciseDemo images={ex.images} name={ex.name} />}
                      <Link href={`/exercises/${e.id}/`} className="mt-2 inline-block text-sm font-semibold text-accent">How to do it →</Link>
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-[2.5rem_1fr_1fr_3.5rem] gap-2 px-1 text-xs font-bold uppercase text-muted">
                        <span>Set</span><span>Kg</span><span>Reps</span><span className="text-center">Done</span>
                      </div>
                      {e.sets.map((s, si) => (
                        <div key={si} className={`grid grid-cols-[2.5rem_1fr_1fr_3.5rem] items-center gap-2 rounded-xl p-1 ${s.done ? "bg-lime/10" : ""}`}>
                          <span className="text-center font-bold">{si + 1}</span>
                          <input aria-label={`Set ${si + 1} weight in kg`} className={`${inputCls} py-2`} type="number" inputMode="decimal" step="0.5" min={0}
                            value={s.kg ?? ""} placeholder="—" onChange={(ev) => patchSet(ei, si, { kg: ev.target.value === "" ? null : Number(ev.target.value) })} />
                          <input aria-label={`Set ${si + 1} reps`} className={`${inputCls} py-2`} type="number" inputMode="numeric" min={0}
                            value={s.reps ?? ""} onChange={(ev) => patchSet(ei, si, { reps: ev.target.value === "" ? null : Number(ev.target.value) })} />
                          <button type="button" onClick={() => toggleDone(ei, si)} aria-pressed={s.done} aria-label={`Mark set ${si + 1} done`}
                            className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl border-2 font-bold ${s.done ? "border-lime bg-lime text-black" : "border-line text-muted"}`}>✓</button>
                        </div>
                      ))}
                      <button type="button" className="text-sm font-semibold text-muted hover:text-accent"
                        onClick={() => setLog((l) => l.map((x, i) => (i !== ei ? x : { ...x, sets: [...x.sets, { ...x.sets[x.sets.length - 1], done: false }] })))}>
                        + Add set
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ol>

      {saveErr && <div className="mt-4"><Alert>{saveErr}</Alert></div>}
      <div className="sticky bottom-20 mt-6 flex items-center gap-3 md:bottom-4">
        {rest > 0 && (
          <button type="button" onClick={() => setRest(0)} className="rounded-xl bg-surface-2 px-4 py-3 font-display text-xl tabular-nums text-lime" aria-live="polite">
            Rest {Math.floor(rest / 60)}:{String(rest % 60).padStart(2, "0")} ✕
          </button>
        )}
        <Button className="flex-1" onClick={finish} busy={saving} disabled={done === 0}>Finish workout</Button>
      </div>
    </>
  );
}

export function WorkoutSession({ day }: { day: DayKey }) {
  return <AppShell><Session day={day} /></AppShell>;
}
