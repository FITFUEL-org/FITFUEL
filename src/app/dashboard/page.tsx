"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { ExerciseRow } from "@/components/ExerciseRow";
import { Alert, Card, LinkButton, Spinner } from "@/components/ui";
import { usePlan } from "@/lib/usePlan";
import { listSessions, type Session } from "@/lib/data";
import { DAY_LABEL, WEEK, todayKey, SPLIT_LABEL, type DayKey } from "@/lib/planner";
import { title } from "@/lib/exercises";
import { targets } from "@/lib/diet";

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Dates of this week (Mon..Sun) keyed by day. */
function thisWeek(): Record<DayKey, string> {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return Object.fromEntries(WEEK.map((k, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return [k, iso(d)]; })) as Record<DayKey, string>;
}

/** Consecutive weeks (ending this week or last) with at least one session. */
function weekStreak(sessions: Session[]): number {
  const weeks = new Set(sessions.map((s) => {
    const d = new Date(s.performed_on + "T00:00:00");
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return iso(d);
  }));
  let n = 0;
  const cur = new Date(thisWeek().mon + "T00:00:00");
  if (!weeks.has(iso(cur))) cur.setDate(cur.getDate() - 7);
  while (weeks.has(iso(cur))) { n++; cur.setDate(cur.getDate() - 7); }
  return n;
}

function Dashboard() {
  const { profile } = useAuth();
  const { plan, byId, error } = usePlan();
  const [sessions, setSessions] = useState<Session[] | null>(null);

  useEffect(() => { listSessions(100).then(setSessions, () => setSessions([])); }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!plan || !profile || !sessions) return <Spinner />;

  const tk = todayKey();
  const today = plan.days.find((d) => d.key === tk);
  const week = thisWeek();
  const doneDates = new Set(sessions.map((s) => s.performed_on));
  const doneThisWeek = plan.days.filter((d) => doneDates.has(week[d.key])).length;
  const next = plan.days.find((d) => WEEK.indexOf(d.key) > WEEK.indexOf(tk)) ?? plan.days[0];
  const nut = targets({ gender: profile.gender, age: profile.age, height_cm: profile.height_cm, weight_kg: profile.weight_kg, goal: profile.goal, level: profile.level, trainingDays: profile.training_days?.length ?? 3 });
  const bmi = profile.height_cm && profile.weight_kg ? profile.weight_kg / (profile.height_cm / 100) ** 2 : null;
  const volume = sessions.filter((s) => s.performed_on >= week.mon)
    .reduce((t, s) => t + s.exercises.reduce((a, e) => a + e.sets.reduce((b, x) => b + (x.done && x.kg && x.reps ? x.kg * x.reps : 0), 0), 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{DAY_LABEL[tk]}</p>
        <h1 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">Hey {profile.name?.split(" ")[0] || "athlete"} 👊</h1>
      </div>

      {profile.has_health_condition && <Alert kind="info">You noted a health condition — make sure your doctor has OK&apos;d this training.</Alert>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["This week", `${doneThisWeek}/${plan.days.length}`, "workouts"],
          ["Streak", String(weekStreak(sessions)), "weeks"],
          ["Volume", volume >= 1000 ? `${(volume / 1000).toFixed(1)}t` : `${Math.round(volume)}kg`, "lifted this week"],
          ["BMI", bmi ? bmi.toFixed(1) : "—", profile.weight_kg ? `${profile.weight_kg} kg` : ""],
        ].map(([l, v, s]) => (
          <Card key={l} className="p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">{l}</p>
            <p className="font-display text-3xl text-fg">{v}</p>
            <p className="text-xs text-muted">{s}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="This week">
        {WEEK.map((k) => {
          const d = plan.days.find((x) => x.key === k);
          const done = doneDates.has(week[k]);
          return (
            <Link key={k} href={d ? `/workout/${k}/` : "/plan/"}
              className={`min-w-[4.5rem] flex-1 rounded-2xl border p-3 text-center ${k === tk ? "border-accent" : "border-line"} ${done ? "bg-lime/15" : "bg-surface"}`}>
              <p className="text-xs font-bold uppercase text-muted">{DAY_LABEL[k].slice(0, 3)}</p>
              <p className="mt-1 text-lg" aria-label={done ? "done" : d ? "training" : "rest"}>{done ? "✅" : d ? "🏋️" : "😴"}</p>
            </Link>
          );
        })}
      </div>

      {today ? (
        <Card className="border-accent/60">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">Today&apos;s workout · {SPLIT_LABEL[plan.split]}</p>
              <h2 className="font-display text-2xl uppercase tracking-wide">{today.title}</h2>
              <p className="text-sm text-muted">{today.exercises.length} exercises · {title(today.place)} · ~{profile.workout_minutes ?? 45} min</p>
            </div>
            <LinkButton href={`/workout/${tk}/`}>{doneDates.has(week[tk]) ? "Train again" : "Start workout"}</LinkButton>
          </div>
          <ol className="grid gap-2 lg:grid-cols-3">
            {today.exercises.slice(0, 3).map((p, i) => <ExerciseRow key={p.id} ex={byId.get(p.id)} p={p} index={i} />)}
          </ol>
          {today.exercises.length > 3 && (
            <Link href="/plan/" className="mt-3 inline-block text-sm font-semibold text-accent">+{today.exercises.length - 3} more exercises →</Link>
          )}
        </Card>
      ) : (
        <Card>
          <h2 className="font-display text-2xl uppercase">Rest day</h2>
          <p className="mt-1 text-muted">Recover today. Next up: <b className="text-fg">{DAY_LABEL[next.key]} — {next.title}</b>.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <LinkButton href="/plan/" variant="outline">See full week</LinkButton>
            <LinkButton href="/exercises/" variant="ghost">Browse exercises</LinkButton>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="font-display text-xl uppercase">Today&apos;s nutrition</h3>
          {nut && !profile.has_health_condition ? (
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              {[["Calories", `${nut.kcal}`, "kcal"], ["Protein", `${nut.protein}g`, "a day"], ["Water", `${nut.waterL} L`, "a day"]].map(([l, v, u]) => (
                <div key={l} className="rounded-xl bg-surface-2 p-3">
                  <p className="text-xs text-muted">{l}</p>
                  <p className="font-display text-2xl">{v}</p>
                  <p className="text-[11px] text-muted">{u}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">See meal ideas for today. Ask your doctor or dietitian for exact targets.</p>
          )}
          <Link href="/diet/" className="mt-3 inline-block text-sm font-semibold text-accent">See today&apos;s meals →</Link>
        </Card>
        <Card>
          <h3 className="font-display text-xl uppercase">Recent workouts</h3>
          {sessions.length === 0 ? <p className="mt-2 text-sm text-muted">No workouts logged yet. Your first one is waiting!</p> : (
            <ul className="mt-2 space-y-2 text-sm">
              {sessions.slice(0, 4).map((s) => (
                <li key={s.id} className="flex justify-between gap-2"><span>{s.title ?? s.day_key}</span><span className="text-muted">{s.performed_on}</span></li>
              ))}
            </ul>
          )}
          <Link href="/progress/" className="mt-3 inline-block text-sm font-semibold text-accent">View progress →</Link>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <AppShell><Dashboard /></AppShell>;
}
