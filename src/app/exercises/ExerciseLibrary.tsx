"use client";

import Link from "next/link";
import { ExerciseThumb } from "@/components/ExerciseThumb";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Alert, Chip, Spinner, inputCls } from "@/components/ui";
import { EQUIPMENT_LABEL, GROUPS, PLACE_LABEL, groupOf, regionLabel, loadExercises, title, type Exercise, type Place } from "@/lib/exercises";

const PAGE = 36;

export function ExerciseLibrary() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [all, setAll] = useState<Exercise[] | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [shown, setShown] = useState(PAGE);
  const group = params.get("group") ?? "";
  const region = params.get("region") ?? "";
  const place = (params.get("place") ?? "") as Place | "";
  const equipment = params.get("equipment") ?? "";
  const level = params.get("level") ?? "";

  useEffect(() => { loadExercises().then(setAll, (e) => setError(e.message)); }, []);

  const setParam = (k: string, v: string) => setParams({ [k]: v });
  const setParams = (patch: Record<string, string>) => {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) { if (v) p.set(k, v); else p.delete(k); }
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    setShown(PAGE);
  };

  const list = useMemo(() => {
    if (!all) return [];
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return all.filter((e) =>
      (!group || groupOf(e.region) === group) &&
      (!region || e.region === region) &&
      (!place || e.places.includes(place)) &&
      (!equipment || e.equipment === equipment) &&
      (!level || e.level === level) &&
      words.every((w) => e.name.toLowerCase().includes(w)));
  }, [all, q, group, region, place, equipment, level]);

  const sections = useMemo(() => {
    const visible = list.slice(0, shown);
    return [
      ...GROUPS.map(({ key, label }) => ({
        key,
        label,
        exercises: visible.filter((e) => groupOf(e.region) === key),
      })),
      { key: "other", label: "Other", exercises: visible.filter((e) => !groupOf(e.region)) },
    ].filter((section) => section.exercises.length > 0);
  }, [list, shown]);

  const counts: Record<string, number> = {};
  for (const e of all ?? []) if ((!place || e.places.includes(place)) && ["strength", "powerlifting"].includes(e.category)) counts[e.region] = (counts[e.region] ?? 0) + 1;

  if (error) return <Alert>{error}</Alert>;
  if (!all) return <Spinner />;

  const select = "rounded-xl border border-line bg-bg px-3 py-2.5 text-sm";
  return (
    <div className="space-y-5">
      <input className={inputCls} type="search" placeholder="Search e.g. bench press, curl, squat…" value={q}
        onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} aria-label="Search exercises" />

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Muscle group</p>
        <div className="flex flex-wrap gap-2">
          <Chip active={!group} onClick={() => setParams({ group: "", region: "" })}>All</Chip>
          {GROUPS.map((g) => <Chip key={g.key} active={group === g.key} onClick={() => setParams({ group: g.key, region: "" })}>{g.label}</Chip>)}
        </div>
        {group && (GROUPS.find((g) => g.key === group)?.regions.length ?? 0) > 1 && (
          <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-surface p-2">
            <Chip active={!region} onClick={() => setParams({ region: "" })}>All {GROUPS.find((g) => g.key === group)?.label.toLowerCase()}</Chip>
            {GROUPS.find((g) => g.key === group)!.regions.map(([k, l]) => (
              <Chip key={k} active={region === k} onClick={() => setParams({ region: k })}>{l} <span className="opacity-60">({counts[k] ?? 0})</span></Chip>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip active={!place} onClick={() => setParam("place", "")}>Anywhere</Chip>
        {(Object.keys(PLACE_LABEL) as Place[]).map((p) => <Chip key={p} active={place === p} onClick={() => setParam("place", p)}>{PLACE_LABEL[p]}</Chip>)}
      </div>

      <div className="flex flex-wrap gap-2">
        <select className={select} value={equipment} onChange={(e) => setParam("equipment", e.target.value)} aria-label="Equipment">
          <option value="">All equipment</option>
          {Object.entries(EQUIPMENT_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select className={select} value={level} onChange={(e) => setParam("level", e.target.value)} aria-label="Level">
          <option value="">All levels</option>
          <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="expert">Expert</option>
        </select>
      </div>

      <p className="text-sm text-muted" aria-live="polite">{list.length} exercises</p>

      <div className="space-y-7">
        {sections.map((section) => (
          <section key={section.key} aria-labelledby={`muscle-${section.key}`}>
            <h2 id={`muscle-${section.key}`} className="mb-3 font-display text-xl uppercase tracking-wide">{section.label}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {section.exercises.map((e) => (
                <Link key={e.id} href={`/exercises/${e.id}/`} className="group overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-0.5 hover:border-accent">
                  <ExerciseThumb src={e.images[0]} hoverSrc={e.images[1]} />
                  <div className="p-3">
                    <p className="font-semibold leading-tight group-hover:text-accent">{e.name}</p>
                    <p className="mt-1 text-xs text-muted"><span className="font-semibold text-accent">{regionLabel(e.region)}</span> · {EQUIPMENT_LABEL[e.equipment] ?? title(e.equipment)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {shown < list.length && (
        <div className="text-center">
          <button type="button" onClick={() => setShown((s) => s + PAGE)} className="rounded-xl border border-line px-6 py-3 font-semibold hover:border-accent hover:text-accent">
            Show more ({list.length - shown} left)
          </button>
        </div>
      )}
    </div>
  );
}
