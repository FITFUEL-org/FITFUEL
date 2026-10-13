// Exercise data from free-exercise-db (public domain). Prepared by scripts/prepare-exercises.py.

export type Place = "gym" | "home" | "outdoor";
export type Level = "beginner" | "intermediate" | "expert";

export interface Exercise {
  id: string;
  name: string;
  level: Level;
  mechanic: "compound" | "isolation" | null;
  force: "push" | "pull" | "static" | null;
  equipment: string;
  category: string;
  primary: string[];
  secondary: string[];
  steps: string[];
  images: string[];
  places: Place[];
}

const IMG_BASE = "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/";
export const imageUrl = (path: string) => IMG_BASE + path;

let cache: Promise<Exercise[]> | null = null;

/** Load the full library in the browser (cached after the first call). */
export function loadExercises(): Promise<Exercise[]> {
  if (!cache) {
    cache = fetch("/data/exercises.json")
      .then((r) => {
        if (!r.ok) throw new Error("Could not load exercises");
        return r.json();
      })
      .catch((e) => {
        cache = null;
        throw e;
      });
  }
  return cache;
}

export const MUSCLES = [
  "chest", "lats", "middle back", "lower back", "traps", "shoulders", "biceps", "triceps",
  "forearms", "abdominals", "quadriceps", "hamstrings", "glutes", "calves", "adductors", "abductors", "neck",
] as const;

export const EQUIPMENT_LABEL: Record<string, string> = {
  barbell: "Barbell", dumbbell: "Dumbbells", cable: "Cable machine", machine: "Machines",
  kettlebells: "Kettlebells", bands: "Resistance bands", "body only": "Bodyweight", "e-z curl bar": "EZ curl bar",
  "medicine ball": "Medicine ball", "exercise ball": "Swiss ball", "foam roll": "Foam roller", other: "Other", none: "No equipment",
};

export const PLACE_LABEL: Record<Place, string> = { gym: "Gym", home: "Home", outdoor: "Outdoor" };

export const title = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());
