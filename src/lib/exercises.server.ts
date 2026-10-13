import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Exercise } from "./exercises";

let all: Exercise[] | null = null;

/** Build-time access to the exercise library (used to prerender pages). */
export function getAllExercises(): Exercise[] {
  if (!all) all = JSON.parse(readFileSync(path.join(process.cwd(), "public/data/exercises.json"), "utf8"));
  return all!;
}

export const getExercise = (id: string) => getAllExercises().find((e) => e.id === id) ?? null;

/** Similar moves: same main muscle, different exercise, preferring shared equipment. */
export function similar(e: Exercise, n = 6): Exercise[] {
  return getAllExercises()
    .filter((x) => x.id !== e.id && x.primary[0] === e.primary[0] && x.category === e.category)
    .sort((a, b) => Number(b.region === e.region) * 2 + Number(b.equipment === e.equipment) - (Number(a.region === e.region) * 2 + Number(a.equipment === e.equipment)))
    .slice(0, n);
}

// Gym stations, matched by exercise name. Order = how they're shown in the guide.
export const MACHINES: { key: string; name: string; desc: string; match: RegExp; equipment?: string[] }[] = [
  { key: "smith", name: "Smith Machine", desc: "A barbell fixed on rails — safer for pressing and squatting without a spotter.", match: /smith/i },
  { key: "leg-press", name: "Leg Press & Hack Squat", desc: "Push a weighted sled with your legs. Great for quads and glutes.", match: /leg press|hack squat|lying machine squat/i },
  { key: "leg-ext-curl", name: "Leg Extension & Leg Curl", desc: "Isolate the front (quads) and back (hamstrings) of your thighs.", match: /leg extension|leg curl/i },
  { key: "cable", name: "Cable Station", desc: "Adjustable pulleys for rows, pushdowns, crossovers and more — constant tension.", match: /.*/, equipment: ["cable"] },
  { key: "chest-press", name: "Chest & Shoulder Press Machines", desc: "Guided pressing for chest and shoulders. Good for beginners.", match: /machine bench|chest press|shoulder press|military press|leverage (decline |incline )?chest/i, equipment: ["machine"] },
  { key: "fly", name: "Pec Deck / Butterfly", desc: "Squeeze the arms together to isolate the chest; reverse for rear delts.", match: /butterfly|reverse machine flyes|pec deck/i },
  { key: "row", name: "Row & Lever Machines", desc: "Supported rows for a thicker back without lower-back strain.", match: /leverage (high |iso )?row|t-bar|leverage deadlift|leverage shrug/i },
  { key: "arm", name: "Arm Machines", desc: "Guided curls, preacher curls and triceps extensions.", match: /machine (bicep|preacher|triceps)|dip machine/i },
  { key: "calf", name: "Calf Machines", desc: "Standing and seated calf raises for the lower legs.", match: /calf (press|raise)|calf-machine/i, equipment: ["machine"] },
  { key: "hip", name: "Hip Abductor / Adductor", desc: "Seated machines for outer and inner thighs.", match: /thigh (abductor|adductor)/i },
  { key: "core", name: "Ab & Back Machines", desc: "Ab crunch machine, glute-ham raise and reverse hyper.", match: /ab crunch machine|glute ham|reverse hyper/i },
  { key: "cardio", name: "Cardio Machines", desc: "Treadmill, bike, rower, elliptical and stair climber.", match: /treadmill|bicycling|recumbent|rowing, stationary|elliptical|stairmaster|step mill/i },
  { key: "barbell", name: "Barbell & Rack", desc: "The squat rack and bench — king of muscle-building lifts.", match: /^(barbell (squat|bench press - medium grip|deadlift|curl|shoulder press|incline bench press - medium grip|full squat|lunge|hip thrust|shrug|glute bridge)|bent over barbell row|romanian deadlift|close-grip barbell bench press|front barbell squat)/i },
  { key: "dumbbell", name: "Dumbbell Area", desc: "Free weights for presses, rows, curls and raises.", match: /.*/, equipment: ["dumbbell"] },
];

export function machineGroups() {
  const list = getAllExercises().filter((e) => ["strength", "powerlifting", "cardio"].includes(e.category));
  const seen = new Set<string>();
  return MACHINES.map((m) => {
    const items = list.filter((e) => !seen.has(e.id) && m.match.test(e.name) && (!m.equipment || m.equipment.includes(e.equipment)));
    const shown = items.slice(0, m.key === "cable" || m.key === "dumbbell" ? 18 : 24);
    shown.forEach((e) => seen.add(e.id));
    return { ...m, match: undefined, items: shown };
  }).filter((g) => g.items.length);
}
