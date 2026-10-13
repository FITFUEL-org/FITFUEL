"use client";

import Link from "next/link";
import { imageUrl, title, type Exercise } from "@/lib/exercises";
import type { PlannedExercise } from "@/lib/planner";

/** Compact exercise line: thumbnail, name, target muscles and the sets × reps prescription. */
export function ExerciseRow({ ex, p, index, action }: { ex?: Exercise; p: PlannedExercise; index: number; action?: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-line bg-bg/60 p-2.5">
      <Link href={`/exercises/${p.id}/`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
        {ex?.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element -- remote CDN image in a static export
          <img src={imageUrl(ex.images[0])} alt="" loading="lazy" className="h-full w-full object-cover" />
        )}
        <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 text-[10px] font-bold text-white">{index + 1}</span>
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/exercises/${p.id}/`} className="block truncate font-semibold hover:text-accent">{ex?.name ?? p.id}</Link>
        <p className="truncate text-xs text-muted">{ex ? ex.primary.map(title).join(", ") : p.muscle} · {ex ? title(ex.equipment) : ""}</p>
        <p className="mt-1 text-sm">
          <b className="text-lime">{p.sets} × {p.reps}</b>
          {p.restSec > 0 && <span className="text-muted"> · rest {p.restSec >= 120 ? `${p.restSec / 60} min` : `${p.restSec}s`}</span>}
        </p>
      </div>
      {action}
    </li>
  );
}
