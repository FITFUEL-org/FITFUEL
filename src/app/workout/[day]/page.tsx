import { WEEK, DAY_LABEL, type DayKey } from "@/lib/planner";
import { WorkoutSession } from "./WorkoutSession";

export function generateStaticParams() {
  return WEEK.map((day) => ({ day }));
}

export async function generateMetadata({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  return { title: `${DAY_LABEL[day as DayKey] ?? "Workout"} workout` };
}

export default async function WorkoutPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  return <WorkoutSession day={day as DayKey} />;
}
