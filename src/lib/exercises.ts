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
  region: string;   // specific target area, e.g. "chest-upper" (see REGIONS)
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

// Specific muscle regions, grouped for browsing. Inferred from exercise names (scripts/regions.py).
export const GROUPS: { key: string; label: string; regions: [string, string][] }[] = [
  { key: "chest", label: "Chest", regions: [["chest-upper", "Upper chest"], ["chest-middle", "Middle chest"], ["chest-lower", "Lower chest"]] },
  { key: "shoulders", label: "Shoulders", regions: [["delts-front", "Front delts"], ["delts-side", "Side delts"], ["delts-rear", "Rear delts"]] },
  { key: "back", label: "Back", regions: [["back-lats", "Lats (width)"], ["back-upper", "Upper back & traps"], ["back-lower", "Lower back"]] },
  { key: "arms", label: "Arms", regions: [["biceps", "Biceps"], ["triceps", "Triceps"], ["forearms", "Forearms"]] },
  { key: "abs", label: "Abs & core", regions: [["abs-upper", "Upper abs"], ["abs-lower", "Lower abs"], ["abs-obliques", "Obliques"]] },
  { key: "legs", label: "Legs", regions: [["legs-quads", "Quads"], ["legs-hamstrings", "Hamstrings"], ["legs-glutes", "Glutes"], ["legs-calves", "Calves"], ["legs-inner", "Inner thigh"], ["legs-outer", "Outer thigh"]] },
  { key: "neck", label: "Neck", regions: [["neck", "Neck"]] },
];

export const REGION_LABEL: Record<string, string> = Object.fromEntries(GROUPS.flatMap((g) => g.regions));
export const regionLabel = (r: string) => REGION_LABEL[r] ?? title(r.replace(/-/g, " "));
export const groupOf = (r: string) => GROUPS.find((g) => g.regions.some(([k]) => k === r))?.key ?? "";
