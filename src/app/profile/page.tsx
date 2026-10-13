"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { Alert, Button, Card, PageHeader } from "@/components/ui";
import { AboutFields, BodyFields, GoalFields, LevelFields, PlaceFields, ScheduleFields, HealthFields, validate, type Draft } from "@/components/ProfileFields";
import { saveProfile, savePlan, planInput } from "@/lib/data";
import { loadExercises } from "@/lib/exercises";
import { generatePlan } from "@/lib/planner";
import { supabase, friendlyError } from "@/lib/supabase";

const SECTIONS = [
  ["about", "About you", AboutFields], ["body", "Body", BodyFields], ["goal", "Goal", GoalFields],
  ["level", "Experience", LevelFields], ["place", "Where you train", PlaceFields],
  ["schedule", "Schedule & split", ScheduleFields], ["health", "Health", HealthFields],
] as const;

// Fields that change the generated plan.
const PLAN_KEYS = ["goal", "level", "place", "equipment", "training_days", "workout_minutes", "limitations", "preferred_split"] as const;

function ProfileForm() {
  const { user, profile, setProfile } = useAuth();
  const router = useRouter();
  // AppShell only renders this once the profile has loaded.
  const [d, setD] = useState<Draft>(() => profile ?? {});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function save() {
    for (const [k] of SECTIONS) {
      const err = validate(k, d);
      if (err) return setMsg({ kind: "error", text: err });
    }
    setBusy(true);
    setMsg(null);
    try {
      const changedPlan = PLAN_KEYS.some((k) => JSON.stringify(d[k]) !== JSON.stringify(profile![k]));
      const { id: _id, ...patch } = d;
      void _id;
      const p = await saveProfile(user!.id, patch);
      setProfile(p);
      if (changedPlan) await savePlan(user!.id, generatePlan(await loadExercises(), planInput(p)));
      setMsg({ kind: "success", text: changedPlan ? "Saved — your plan was rebuilt to match." : "Saved." });
    } catch (e) {
      setMsg({ kind: "error", text: friendlyError(e) });
    }
    setBusy(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login/");
  }

  const set = (patch: Draft) => setD((x) => ({ ...x, ...patch }));

  return (
    <>
      <PageHeader kicker="Profile" title={profile?.name || "Your profile"}>{user?.email}</PageHeader>
      <div className="space-y-5">
        {SECTIONS.map(([k, t, C]) => (
          <Card key={k}>
            <h2 className="mb-4 font-display text-xl uppercase tracking-wide">{t}</h2>
            <C d={d} set={set} />
          </Card>
        ))}
      </div>
      <div className="sticky bottom-20 z-10 mt-6 space-y-3 bg-bg/90 py-3 backdrop-blur md:bottom-0">
        {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
        <div className="flex flex-wrap gap-3">
          <Button onClick={save} busy={busy} className="flex-1">Save changes</Button>
          <Button variant="outline" onClick={signOut}>Log out</Button>
        </div>
      </div>
    </>
  );
}

export default function ProfilePage() {
  return <AppShell><ProfileForm /></AppShell>;
}
