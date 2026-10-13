"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Alert, Chip, Spinner, inputCls } from "@/components/ui";
import { EQUIPMENT_LABEL, MUSCLES, PLACE_LABEL, imageUrl, loadExercises, title, type Exercise, type Place } from "@/lib/exercises";

const PAGE = 36;

export function ExerciseLibrary() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [all, setAll] = useState<Exercise[] | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [shown, setShown] = useState(PAGE);
  const muscle = params.get("muscle") ?? "";
  const place = (params.get("place") ?? "") as Place | "";
  const equipment = params.get("equipment") ?? "";
  const level = params.get("level") ?? "";

  useEffect(() => { loadExercises().then(setAll, (e) => setError(e.message)); }, []);

  const setParam = (k: string, v: string) => {
    const p = new URLSearchParams(params.toString());
    if (v) p.set(k, v); else p.delete(k);
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    setShown(PAGE);
  };

  const list = useMemo(() => {
    if (!all) return [];
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return all.filter((e) =>
      (!muscle || e.primary.includes(muscle)) &&
      (!place || e.places.includes(place)) &&
      (!equipment || e.equipment === equipment) &&
      (!level || e.level === level) &&
      words.every((w) => e.name.toLowerCase().includes(w)));
  }, [all, q, muscle, place, equipment, level]);

  if (error) return <Alert>{error}</Alert>;
  if (!all) return <Spinner />;

  const select = "rounded-xl border border-line bg-bg px-3 py-2.5 text-sm";
  return (
    <div className="space-y-5">
      <input className={inputCls} type="search" placeholder="Search e.g. bench press, curl, squat…" value={q}
        onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} aria-label="Search exercises" />

      <div className="flex flex-wrap gap-2">
        <Chip active={!place} onClick={() => setParam("place", "")}>Anywhere</Chip>
        {(Object.keys(PLACE_LABEL) as Place[]).map((p) => <Chip key={p} active={place === p} onClick={() => setParam("place", p)}>{PLACE_LABEL[p]}</Chip>)}
      </div>

      <div className="flex flex-wrap gap-2">
        <select className={select} value={muscle} onChange={(e) => setParam("muscle", e.target.value)} aria-label="Muscle">
          <option value="">All muscles</option>
          {MUSCLES.map((m) => <option key={m} value={m}>{title(m)}</option>)}
        </select>
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.slice(0, shown).map((e) => (
          <Link key={e.id} href={`/exercises/${e.id}/`} className="group overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-0.5 hover:border-accent">
            <div className="relative aspect-[4/3] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl(e.images[0])} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:opacity-0" />
              {e.images[1] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl(e.images[1])} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition group-hover:opacity-100" />
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold leading-tight group-hover:text-accent">{e.name}</p>
              <p className="mt-1 text-xs text-muted">{e.primary.map(title).join(", ")} · {EQUIPMENT_LABEL[e.equipment] ?? title(e.equipment)}</p>
            </div>
          </Link>
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
