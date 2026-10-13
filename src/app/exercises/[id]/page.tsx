import Link from "next/link";
import { ExerciseThumb } from "@/components/ExerciseThumb";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ExerciseDemo } from "@/components/ExerciseDemo";
import { Card } from "@/components/ui";
import { getAllExercises, getExercise, similar } from "@/lib/exercises.server";
import { PLACE_LABEL, title, EQUIPMENT_LABEL, regionLabel, groupOf, GROUPS } from "@/lib/exercises";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllExercises().map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const e = getExercise((await params).id);
  return e ? { title: `${e.name} — how to do it`, description: `${e.name}: step-by-step form, target muscles (${e.primary.join(", ")}) and demo.` } : {};
}

const LEVEL_COLOR = { beginner: "bg-lime text-black", intermediate: "bg-amber-400 text-black", expert: "bg-red-500 text-white" };

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const e = getExercise((await params).id);
  if (!e) notFound();
  const more = similar(e);

  return (
    <AppShell isPublic>
      <nav className="mb-4 text-sm text-muted">
        <Link href="/exercises/" className="hover:text-accent">Exercises</Link>
        {groupOf(e.region) && <> / <Link href={`/exercises/?group=${groupOf(e.region)}`} className="hover:text-accent">{GROUPS.find((g) => g.key === groupOf(e.region))?.label}</Link></>}
        {" / "}<Link href={`/exercises/?group=${groupOf(e.region)}&region=${e.region}`} className="hover:text-accent">{regionLabel(e.region)}</Link>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <ExerciseDemo images={e.images} name={e.name} />
          <p className="mt-2 text-xs text-muted">Tap the demo to pause. It alternates between the start and finish positions.</p>
        </div>
        <div className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Targets: {regionLabel(e.region)}</p>
            <h1 className="font-display text-4xl uppercase leading-tight tracking-wide">{e.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase">
              <span className={`rounded-full px-3 py-1 ${LEVEL_COLOR[e.level]}`}>{e.level}</span>
              <span className="rounded-full border border-line px-3 py-1">{EQUIPMENT_LABEL[e.equipment] ?? title(e.equipment)}</span>
              {e.mechanic && <span className="rounded-full border border-line px-3 py-1">{e.mechanic}</span>}
              {e.places.map((p) => <span key={p} className="rounded-full border border-accent/50 px-3 py-1 text-accent">{PLACE_LABEL[p]}</span>)}
            </div>
          </div>
          <Card>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-muted">Muscles worked</h2>
            <p><b className="text-accent">Primary:</b> {e.primary.map(title).join(", ")}</p>
            {e.secondary.length > 0 && <p className="mt-1 text-muted"><b className="text-fg">Secondary:</b> {e.secondary.map(title).join(", ")}</p>}
          </Card>
          <Card>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted">How to do it</h2>
            <ol className="space-y-3">
              {e.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-black">{i + 1}</span>
                  <span className="text-fg/90">{s}</span>
                </li>
              ))}
            </ol>
          </Card>
          <p className="text-sm text-muted">Start with a light weight to learn the movement. Stop if you feel sharp pain.</p>
        </div>
      </div>

      {more.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-2xl uppercase tracking-wide">Similar exercises</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {more.map((x) => (
              <Link key={x.id} href={`/exercises/${x.id}/`} className="group overflow-hidden rounded-2xl border border-line bg-surface hover:border-accent">
                <ExerciseThumb src={x.images[0]} hoverSrc={x.images[1]} className="aspect-square" />
                <p className="p-2 text-sm font-semibold group-hover:text-accent">{x.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
