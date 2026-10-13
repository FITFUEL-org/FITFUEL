import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Spinner } from "@/components/ui";
import { ExerciseLibrary } from "./ExerciseLibrary";

export const metadata = { title: "Exercise library", description: "870+ exercises with demos for gym, home and outdoor workouts." };

export default function ExercisesPage() {
  return (
    <AppShell isPublic>
      <PageHeader kicker="Library" title="Exercise demos">
        Filter by muscle, place and equipment. Tap any exercise to see how it&apos;s done.
      </PageHeader>
      <Suspense fallback={<Spinner />}><ExerciseLibrary /></Suspense>
    </AppShell>
  );
}
