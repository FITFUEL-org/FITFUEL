"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { loadExercises, type Exercise } from "./exercises";
import { getPlan, savePlan, planInput } from "./data";
import { generatePlan, type WeekPlan } from "./planner";

/** Loads the exercise library and the user's plan (creating one if missing). */
export function usePlan() {
  const { user, profile } = useAuth();
  const [all, setAll] = useState<Exercise[] | null>(null);
  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !profile) return;
    let alive = true;
    (async () => {
      try {
        const [lib, saved] = await Promise.all([loadExercises(), getPlan(user.id)]);
        let p = saved;
        if (!p) {
          p = generatePlan(lib, planInput(profile));
          await savePlan(user.id, p);
        }
        if (alive) { setAll(lib); setPlan(p); }
      } catch (e) {
        if (alive) setError((e as Error).message || "Could not load your plan");
      }
    })();
    return () => { alive = false; };
  }, [user, profile]);

  const byId = useMemo(() => new Map((all ?? []).map((e) => [e.id, e])), [all]);

  const update = useCallback(async (next: WeekPlan) => {
    setPlan(next);
    if (user) await savePlan(user.id, next);
  }, [user]);

  return { all, plan, byId, error, update, input: profile ? planInput(profile) : null };
}
