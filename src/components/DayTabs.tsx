"use client";

import { DAY_LABEL, todayKey, type DayKey } from "@/lib/planner";

/** Horizontal Mon–Sun selector. `mark` adds a small icon/label under each day. */
export function DayTabs({ value, onChange, days, mark }: { value: DayKey; onChange: (d: DayKey) => void; days: DayKey[]; mark?: (d: DayKey) => React.ReactNode }) {
  const today = todayKey();
  return (
    <div className="-mx-4 overflow-x-auto px-4" role="tablist" aria-label="Day of the week">
      <div className="flex min-w-max gap-2">
        {days.map((k) => (
          <button key={k} type="button" role="tab" aria-selected={value === k} onClick={() => onChange(k)}
            className={`min-w-[4.25rem] rounded-2xl border px-3 py-2 text-center transition ${value === k ? "border-accent bg-accent text-black" : "border-line bg-surface hover:border-accent/60"}`}>
            <span className="block text-xs font-bold uppercase">{DAY_LABEL[k].slice(0, 3)}</span>
            {mark && <span className="block text-sm">{mark(k)}</span>}
            {k === today && <span className={`block text-[10px] font-semibold ${value === k ? "text-black/70" : "text-accent"}`}>Today</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
