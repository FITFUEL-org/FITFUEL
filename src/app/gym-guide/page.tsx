import Link from "next/link";
import { ExerciseThumb } from "@/components/ExerciseThumb";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui";
import { machineGroups } from "@/lib/exercises.server";
import { title } from "@/lib/exercises";

export const metadata = { title: "Gym machine guide", description: "What to do on every gym machine, with demos." };

export default function GymGuidePage() {
  const groups = machineGroups();
  return (
    <AppShell isPublic>
      <PageHeader kicker="Gym guide" title="What to do on each machine">
        New to the gym? Find the station, pick an exercise, and follow the demo.
      </PageHeader>
      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Machines">
        {groups.map((g) => (
          <a key={g.key} href={`#${g.key}`} className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent">{g.name}</a>
        ))}
      </nav>
      <div className="space-y-12">
        {groups.map((g) => (
          <section key={g.key} id={g.key} className="scroll-mt-20">
            <h2 className="font-display text-2xl uppercase tracking-wide">{g.name}</h2>
            <p className="mb-4 text-muted">{g.desc}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {g.items.map((e) => (
                <Link key={e.id} href={`/exercises/${e.id}/`} className="group overflow-hidden rounded-2xl border border-line bg-surface hover:border-accent">
                  <ExerciseThumb src={e.images[0]} hoverSrc={e.images[1]} />
                  <div className="p-3">
                    <p className="font-semibold leading-tight group-hover:text-accent">{e.name}</p>
                    <p className="mt-1 text-xs text-muted">{e.primary.map(title).join(", ")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
