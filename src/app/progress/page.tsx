"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { Alert, Button, Card, PageHeader, Spinner, inputCls } from "@/components/ui";
import { listSessions, listWeights, logWeight, type Session, type WeightLog } from "@/lib/data";
import { friendlyError } from "@/lib/supabase";

function WeightChart({ data, target }: { data: WeightLog[]; target: number | null }) {
  if (data.length < 2) return <p className="text-sm text-muted">Log your weight on a few different days to see a trend.</p>;
  const W = 600, H = 200, pad = 28;
  const ys = data.map((d) => d.weight_kg).concat(target ? [target] : []);
  const min = Math.min(...ys) - 1, max = Math.max(...ys) + 1;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (data.length - 1);
  const y = (v: number) => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
  const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.weight_kg).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Weight from ${data[0].weight_kg} kg to ${data[data.length - 1].weight_kg} kg`}>
      {target && <line x1={pad} x2={W - pad} y1={y(target)} y2={y(target)} stroke="var(--lime)" strokeDasharray="6 6" opacity=".6" />}
      {target && <text x={W - pad} y={y(target) - 6} textAnchor="end" fontSize="12" fill="var(--lime)">target {target} kg</text>}
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => <circle key={d.logged_on} cx={x(i)} cy={y(d.weight_kg)} r="4" fill="var(--accent)"><title>{`${d.logged_on}: ${d.weight_kg} kg`}</title></circle>)}
      <text x={pad} y={H - 6} fontSize="12" fill="var(--muted)">{data[0].logged_on}</text>
      <text x={W - pad} y={H - 6} fontSize="12" fill="var(--muted)" textAnchor="end">{data[data.length - 1].logged_on}</text>
    </svg>
  );
}

function Progress() {
  const { user, profile, refreshProfile } = useAuth();
  const params = useSearchParams();
  const [weights, setWeights] = useState<WeightLog[] | null>(null);
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [kg, setKg] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listWeights().then(setWeights, (e) => setError(friendlyError(e)));
    listSessions().then(setSessions, (e) => setError(friendlyError(e)));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(kg);
    if (!(v >= 30 && v <= 300)) return setError("Enter a weight between 30 and 300 kg.");
    setBusy(true);
    setError("");
    try {
      await logWeight(user!.id, v);
      setWeights(await listWeights());
      await refreshProfile();
      setKg("");
    } catch (err) { setError(friendlyError(err)); }
    setBusy(false);
  }

  if (!weights || !sessions) return error ? <Alert>{error}</Alert> : <Spinner />;
  const first = weights[0]?.weight_kg, last = weights[weights.length - 1]?.weight_kg;

  return (
    <>
      <PageHeader kicker="Progress" title="Your progress" />
      {params.get("saved") && <div className="mb-6"><Alert kind="success">Workout saved. Great work! 💪</Alert></div>}
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Card>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl uppercase">Body weight</h2>
            {first && last && <p className="text-sm text-muted">{last} kg · {last - first >= 0 ? "+" : ""}{(last - first).toFixed(1)} kg since start</p>}
          </div>
          <WeightChart data={weights} target={profile?.target_weight_kg ?? null} />
        </Card>
        <Card>
          <h2 className="mb-3 font-display text-xl uppercase">Log today&apos;s weight</h2>
          <form onSubmit={save} className="space-y-3">
            <input className={inputCls} type="number" step="0.1" inputMode="decimal" placeholder="kg" aria-label="Weight in kg" value={kg} onChange={(e) => setKg(e.target.value)} />
            <Button type="submit" busy={busy} className="w-full" disabled={!kg}>Save weight</Button>
          </form>
          <p className="mt-3 text-xs text-muted">Weigh yourself at the same time each day, ideally in the morning.</p>
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-2xl uppercase tracking-wide">Workout history</h2>
        {sessions.length === 0 ? <p className="text-muted">No workouts logged yet.</p> : (
          <ul className="space-y-3">
            {sessions.map((s) => {
              const sets = s.exercises.reduce((n, e) => n + e.sets.filter((x) => x.done).length, 0);
              const vol = s.exercises.reduce((n, e) => n + e.sets.reduce((a, x) => a + (x.done && x.kg && x.reps ? x.kg * x.reps : 0), 0), 0);
              return (
                <li key={s.id}>
                  <Card className="p-4">
                    <details>
                      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">{s.title ?? s.day_key}</span>
                        <span className="text-sm text-muted">{s.performed_on} · {sets} sets{vol ? ` · ${Math.round(vol)} kg` : ""}{s.duration_min ? ` · ${s.duration_min} min` : ""}</span>
                      </summary>
                      <ul className="mt-3 space-y-1 text-sm">
                        {s.exercises.map((e) => (
                          <li key={e.id} className="flex justify-between gap-3">
                            <span>{e.name}</span>
                            <span className="text-muted">{e.sets.filter((x) => x.done).map((x) => `${x.kg ?? 0}×${x.reps ?? 0}`).join(", ") || "—"}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

export default function ProgressPage() {
  return <AppShell><Suspense fallback={<Spinner />}><Progress /></Suspense></AppShell>;
}
