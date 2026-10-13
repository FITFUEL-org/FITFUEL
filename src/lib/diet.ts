// Nutrition targets + a rotating Indian meal plan. Pure functions (unit tested).
import type { Goal, Experience, DayKey } from "./planner";
import { WEEK } from "./planner";

export type DietType = "veg" | "egg" | "nv" | "vegan";
export type Allergy = "dairy" | "nuts" | "gluten" | "soy";

export const DIET_LABEL: Record<DietType, string> = { veg: "Vegetarian", egg: "Eggetarian", nv: "Non-vegetarian", vegan: "Vegan" };
export const ALLERGY_LABEL: Record<Allergy, string> = { dairy: "Lactose / dairy", nuts: "Nuts & peanuts", gluten: "Gluten / wheat", soy: "Soy" };

export interface NutritionInput {
  gender: "m" | "f" | "x" | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: Goal | null;
  level: Experience | null;
  trainingDays: number;
}

export interface Targets {
  bmr: number;
  maintenance: number;
  kcal: number;
  protein: number; // g
  carbs: number;   // g
  fat: number;     // g
  waterL: number;
  note: string;
}

const round = (n: number, step = 1) => Math.round(n / step) * step;

/** Mifflin-St Jeor BMR × activity, adjusted for the goal. */
export function targets(p: NutritionInput): Targets | null {
  if (!p.weight_kg || !p.height_cm || !p.age) return null;
  const w = p.weight_kg, sexAdj = p.gender === "m" ? 5 : p.gender === "f" ? -161 : -78;
  const bmr = 10 * w + 6.25 * p.height_cm - 5 * p.age + sexAdj;
  const activity = p.trainingDays <= 2 ? 1.375 : p.trainingDays <= 4 ? 1.55 : 1.725;
  const maintenance = bmr * activity;
  const teen = p.age < 18;
  const goal = p.goal ?? "general";

  let kcal = maintenance, note = "Eat at maintenance to support training.";
  if (goal === "muscle") { kcal += p.level === "adv" ? 200 : 300; note = "A small surplus (~250–300 kcal) to build muscle with minimal fat gain."; }
  if (goal === "strength") { kcal += 200; note = "A slight surplus to fuel heavy lifting."; }
  if (goal === "fat_loss" && !teen) {
    kcal = Math.max(kcal - 450, p.gender === "m" ? 1500 : 1200, bmr);
    note = "A moderate deficit (~450 kcal) — aim to lose 0.25–0.5 kg per week while keeping protein high.";
  }
  if (teen) note = "Teens are still growing — eat to maintenance or above; don't diet without a doctor's advice.";

  const proteinPerKg = { muscle: 1.8, strength: 1.8, fat_loss: 2.0, general: 1.4 }[goal];
  const protein = w * proteinPerKg;
  const fat = Math.max(w * 0.8, (kcal * 0.25) / 9);
  const carbs = Math.max(0, (kcal - protein * 4 - fat * 9) / 4);
  const waterL = (w * 35 + p.trainingDays * 70) / 1000;

  return {
    bmr: round(bmr, 10), maintenance: round(maintenance, 10), kcal: round(kcal, 10),
    protein: round(protein, 5), carbs: round(carbs, 5), fat: round(fat, 5), waterL: Math.round(waterL * 10) / 10, note,
  };
}

// ---- Foods (approximate values per serving) ----
type Unit = "g" | "ml" | "pc" | "cup" | "katori" | "plate" | "tbsp" | "scoop" | "glass" | "bowl";
// rs = approximate home-cooked cost per serving in ₹ (Indian city prices, 2026)
interface Food { name: string; qty: number; unit: Unit; kcal: number; p: number; c: number; f: number; rs: number; tags?: Allergy[]; whole?: boolean }

const F = {
  roti: { name: "Roti / chapati", qty: 1, unit: "pc", kcal: 110, p: 3, c: 20, f: 2.5, rs: 4, tags: ["gluten"], whole: true },
  rice: { name: "Cooked rice", qty: 1, unit: "cup", kcal: 195, p: 4, c: 43, f: 0.4, rs: 8 },
  dal: { name: "Dal (cooked)", qty: 1, unit: "katori", kcal: 165, p: 9, c: 24, f: 3, rs: 12 },
  rajma: { name: "Rajma (cooked)", qty: 1, unit: "katori", kcal: 210, p: 11, c: 32, f: 4, rs: 15 },
  chole: { name: "Chole (cooked)", qty: 1, unit: "katori", kcal: 220, p: 11, c: 32, f: 5, rs: 14 },
  paneer: { name: "Paneer (sabzi/bhurji)", qty: 100, unit: "g", kcal: 265, p: 18, c: 6, f: 20, rs: 45, tags: ["dairy"] },
  tofu: { name: "Tofu (bhurji/sabzi)", qty: 150, unit: "g", kcal: 215, p: 22, c: 5, f: 12, rs: 50, tags: ["soy"] },
  soya: { name: "Soya chunks curry (dry wt)", qty: 50, unit: "g", kcal: 170, p: 26, c: 16, f: 0.5, rs: 10, tags: ["soy"] },
  curd: { name: "Curd / dahi", qty: 1, unit: "cup", kcal: 120, p: 7, c: 9, f: 6, rs: 15, tags: ["dairy"] },
  greek: { name: "Greek yogurt / hung curd", qty: 150, unit: "g", kcal: 130, p: 15, c: 6, f: 5, rs: 40, tags: ["dairy"] },
  milk: { name: "Milk (toned)", qty: 250, unit: "ml", kcal: 150, p: 8, c: 12, f: 8, rs: 16, tags: ["dairy"] },
  soymilk: { name: "Soy milk", qty: 250, unit: "ml", kcal: 100, p: 7, c: 6, f: 4, rs: 35, tags: ["soy"] },
  whey: { name: "Whey protein", qty: 1, unit: "scoop", kcal: 120, p: 24, c: 3, f: 1.5, rs: 70, tags: ["dairy"], whole: true },
  egg: { name: "Whole eggs", qty: 1, unit: "pc", kcal: 72, p: 6, c: 0.4, f: 5, rs: 7, whole: true },
  eggwhite: { name: "Egg whites", qty: 1, unit: "pc", kcal: 17, p: 3.6, c: 0.2, f: 0, rs: 7, whole: true },
  chicken: { name: "Chicken breast (curry/grilled)", qty: 150, unit: "g", kcal: 250, p: 45, c: 2, f: 6, rs: 60 },
  fish: { name: "Fish (curry/grilled)", qty: 150, unit: "g", kcal: 210, p: 33, c: 0, f: 8, rs: 60 },
  oats: { name: "Oats (dry)", qty: 50, unit: "g", kcal: 190, p: 7, c: 33, f: 3.5, rs: 10, tags: ["gluten"] },
  poha: { name: "Poha", qty: 1, unit: "plate", kcal: 250, p: 5, c: 45, f: 6, rs: 15 },
  upma: { name: "Upma", qty: 1, unit: "plate", kcal: 250, p: 6, c: 40, f: 7, rs: 15, tags: ["gluten"] },
  idli: { name: "Idli", qty: 1, unit: "pc", kcal: 40, p: 1.5, c: 8, f: 0.2, rs: 5, whole: true },
  sambar: { name: "Sambar", qty: 1, unit: "katori", kcal: 110, p: 5, c: 15, f: 3, rs: 12 },
  chilla: { name: "Besan / moong chilla", qty: 1, unit: "pc", kcal: 120, p: 6, c: 14, f: 4.5, rs: 8, whole: true },
  sprouts: { name: "Moong sprouts chaat", qty: 1, unit: "cup", kcal: 105, p: 8, c: 18, f: 0.5, rs: 12 },
  banana: { name: "Banana", qty: 1, unit: "pc", kcal: 105, p: 1.3, c: 27, f: 0.4, rs: 6, whole: true },
  apple: { name: "Apple / seasonal fruit", qty: 1, unit: "pc", kcal: 95, p: 0.5, c: 25, f: 0.3, rs: 25, whole: true },
  pb: { name: "Peanut butter", qty: 1, unit: "tbsp", kcal: 95, p: 4, c: 3, f: 8, rs: 8, tags: ["nuts"] },
  peanuts: { name: "Roasted peanuts", qty: 30, unit: "g", kcal: 170, p: 7, c: 5, f: 14, rs: 5, tags: ["nuts"] },
  almonds: { name: "Almonds", qty: 20, unit: "g", kcal: 115, p: 4, c: 4, f: 10, rs: 25, tags: ["nuts"] },
  sabzi: { name: "Mixed veg sabzi", qty: 1, unit: "katori", kcal: 120, p: 3, c: 12, f: 7, rs: 15 },
  salad: { name: "Salad (cucumber, onion, tomato)", qty: 1, unit: "bowl", kcal: 40, p: 2, c: 8, f: 0.2, rs: 10 },
  bread: { name: "Whole-wheat bread", qty: 1, unit: "pc", kcal: 70, p: 3, c: 12, f: 1, rs: 4, tags: ["gluten"], whole: true },
  chana: { name: "Roasted chana", qty: 40, unit: "g", kcal: 150, p: 8, c: 24, f: 2.5, rs: 6 },
  makhana: { name: "Roasted makhana", qty: 30, unit: "g", kcal: 105, p: 3, c: 23, f: 0.2, rs: 30 },
  sattu: { name: "Sattu drink", qty: 40, unit: "g", kcal: 160, p: 8, c: 26, f: 2.5, rs: 6 },
  buttermilk: { name: "Chaas / buttermilk", qty: 1, unit: "glass", kcal: 60, p: 3, c: 5, f: 2, rs: 10, tags: ["dairy"] },
} satisfies Record<string, Food>;

type K = keyof typeof F;
type Item = [K, number]; // food, servings
type Meal = { name: string; items: Item[] };

// Meal ideas per slot. `diets` lists who can eat it.
const IDEAS: Record<Slot, { diets: DietType[]; meal: Meal }[]> = {
  breakfast: [
    { diets: ["veg", "egg", "nv"], meal: { name: "Oats with milk, banana & almonds", items: [["oats", 1.2], ["milk", 1], ["banana", 1], ["almonds", 1]] } },
    { diets: ["veg", "egg", "nv"], meal: { name: "Besan chilla with curd", items: [["chilla", 2], ["curd", 1]] } },
    { diets: ["veg", "egg", "nv", "vegan"], meal: { name: "Poha with sprouts", items: [["poha", 1], ["sprouts", 1]] } },
    { diets: ["veg", "egg", "nv"], meal: { name: "Paneer bhurji with roti", items: [["paneer", 0.75], ["roti", 2]] } },
    { diets: ["veg", "egg", "nv", "vegan"], meal: { name: "Idli sambar", items: [["idli", 4], ["sambar", 1.5]] } },
    { diets: ["egg", "nv"], meal: { name: "Egg omelette, toast & milk", items: [["egg", 2], ["eggwhite", 2], ["bread", 2], ["milk", 1]] } },
    { diets: ["egg", "nv"], meal: { name: "Boiled eggs, upma & fruit", items: [["egg", 3], ["upma", 0.8], ["apple", 1]] } },
    { diets: ["vegan"], meal: { name: "Oats with soy milk, banana & peanut butter", items: [["oats", 1.2], ["soymilk", 1], ["banana", 1], ["pb", 1]] } },
    { diets: ["vegan"], meal: { name: "Tofu bhurji with roti", items: [["tofu", 1], ["roti", 2]] } },
    { diets: ["vegan"], meal: { name: "Moong chilla with peanut chutney", items: [["chilla", 3], ["peanuts", 0.5]] } },
  ],
  lunch: [
    { diets: ["veg", "egg", "nv"], meal: { name: "Roti, dal, paneer sabzi, salad & curd", items: [["roti", 3], ["dal", 1], ["paneer", 0.75], ["salad", 1], ["curd", 1]] } },
    { diets: ["veg", "egg", "nv", "vegan"], meal: { name: "Rajma chawal with salad", items: [["rice", 1.5], ["rajma", 1.5], ["salad", 1]] } },
    { diets: ["veg", "egg", "nv", "vegan"], meal: { name: "Dal rice with soya chunks & sabzi", items: [["rice", 1.25], ["dal", 1], ["soya", 1], ["sabzi", 1]] } },
    { diets: ["veg", "egg", "nv", "vegan"], meal: { name: "Chole with roti & salad", items: [["roti", 3], ["chole", 1.5], ["salad", 1]] } },
    { diets: ["egg", "nv"], meal: { name: "Egg curry with rice & dal", items: [["egg", 3], ["rice", 1.25], ["dal", 1], ["salad", 1]] } },
    { diets: ["nv"], meal: { name: "Chicken curry with rice & salad", items: [["chicken", 1], ["rice", 1.5], ["salad", 1], ["curd", 1]] } },
    { diets: ["nv"], meal: { name: "Fish curry with roti & sabzi", items: [["fish", 1], ["roti", 3], ["sabzi", 1]] } },
    { diets: ["vegan"], meal: { name: "Tofu sabzi, dal & rice", items: [["tofu", 1], ["dal", 1], ["rice", 1.25]] } },
  ],
  snack: [
    { diets: ["veg", "egg", "nv"], meal: { name: "Whey shake with banana", items: [["whey", 1], ["banana", 1]] } },
    { diets: ["veg", "egg", "nv"], meal: { name: "Greek yogurt with fruit", items: [["greek", 1], ["apple", 1]] } },
    { diets: ["veg", "egg", "nv", "vegan"], meal: { name: "Roasted chana & makhana", items: [["chana", 1], ["makhana", 1]] } },
    { diets: ["veg", "egg", "nv", "vegan"], meal: { name: "Sprouts chaat with fruit", items: [["sprouts", 1.5], ["apple", 1]] } },
    { diets: ["egg", "nv"], meal: { name: "Boiled eggs with fruit", items: [["egg", 3], ["banana", 1]] } },
    { diets: ["vegan"], meal: { name: "Sattu drink with banana", items: [["sattu", 1], ["banana", 1]] } },
    { diets: ["vegan", "veg", "egg", "nv"], meal: { name: "Peanuts with fruit", items: [["peanuts", 1], ["apple", 1]] } },
  ],
  dinner: [
    { diets: ["veg", "egg", "nv"], meal: { name: "Roti with paneer sabzi & salad", items: [["roti", 2], ["paneer", 1], ["sabzi", 1], ["salad", 1]] } },
    { diets: ["veg", "egg", "nv", "vegan"], meal: { name: "Dal, rice & sabzi", items: [["dal", 1.5], ["rice", 1], ["sabzi", 1], ["salad", 1]] } },
    { diets: ["veg", "egg", "nv"], meal: { name: "Moong chilla with curd", items: [["chilla", 3], ["curd", 1]] } },
    { diets: ["egg", "nv"], meal: { name: "Egg bhurji with roti & sabzi", items: [["egg", 3], ["roti", 2], ["sabzi", 1]] } },
    { diets: ["nv"], meal: { name: "Grilled chicken with roti & salad", items: [["chicken", 1], ["roti", 2], ["salad", 1]] } },
    { diets: ["nv"], meal: { name: "Fish with rice & sabzi", items: [["fish", 1], ["rice", 1], ["sabzi", 1]] } },
    { diets: ["vegan"], meal: { name: "Tofu with roti & sabzi", items: [["tofu", 1], ["roti", 2], ["sabzi", 1]] } },
    { diets: ["vegan"], meal: { name: "Soya chunks curry with rice", items: [["soya", 1], ["rice", 1], ["salad", 1]] } },
  ],
  bedtime: [
    { diets: ["veg", "egg", "nv"], meal: { name: "Warm milk with almonds", items: [["milk", 1], ["almonds", 1]] } },
    { diets: ["veg", "egg", "nv"], meal: { name: "Curd with fruit", items: [["curd", 1], ["apple", 1]] } },
    { diets: ["vegan"], meal: { name: "Soy milk with peanuts", items: [["soymilk", 1], ["peanuts", 0.5]] } },
    { diets: ["vegan", "veg", "egg", "nv"], meal: { name: "Roasted makhana", items: [["makhana", 1]] } },
  ],
};

export type Slot = "breakfast" | "lunch" | "snack" | "dinner" | "bedtime";
export const SLOT_LABEL: Record<Slot, string> = {
  breakfast: "Breakfast", lunch: "Lunch", snack: "Pre/post-workout snack", dinner: "Dinner", bedtime: "Before bed",
};

const SPLITS: Record<number, [Slot, number][]> = {
  3: [["breakfast", 0.3], ["lunch", 0.4], ["dinner", 0.3]],
  4: [["breakfast", 0.25], ["lunch", 0.35], ["snack", 0.15], ["dinner", 0.25]],
  5: [["breakfast", 0.22], ["lunch", 0.3], ["snack", 0.15], ["dinner", 0.23], ["bedtime", 0.1]],
};

export interface PlannedFood { name: string; amount: string; kcal: number; protein: number; carbs: number; fat: number; rs: number }
export interface PlannedMeal { slot: Slot; name: string; foods: PlannedFood[]; kcal: number; protein: number; carbs: number; fat: number; rs: number; options: number; option: number }
export interface DayMeals { meals: PlannedMeal[]; kcal: number; protein: number; carbs: number; fat: number; rs: number }

function amount(f: Food, servings: number): string {
  const q = f.qty * servings;
  if (f.unit === "g" || f.unit === "ml") return `${round(q, 10)} ${f.unit}`;
  const n = f.whole ? Math.max(1, Math.round(q)) : Math.max(0.5, round(q, 0.5));
  const plural: Partial<Record<Unit, string>> = { cup: "cups", plate: "plates", scoop: "scoops", glass: "glasses", bowl: "bowls" };
  const unit = f.unit === "pc" ? "" : ` ${n > 1 ? plural[f.unit] ?? f.unit : f.unit}`;
  return `${n}${unit}`;
}

/** Actual servings after rounding (so macros match what's shown). */
function servingsShown(f: Food, servings: number): number {
  const q = f.qty * servings;
  if (f.unit === "g" || f.unit === "ml") return round(q, 10) / f.qty;
  return (f.whole ? Math.max(1, Math.round(q)) : Math.max(0.5, round(q, 0.5))) / f.qty;
}

export function mealOptions(slot: Slot, diet: DietType, allergies: Allergy[]): Meal[] {
  const ok = IDEAS[slot].filter((x) => x.diets.includes(diet)).map((x) => x.meal);
  const safe = ok.filter((m) => m.items.every(([k]) => !((F[k] as Food).tags ?? []).some((t) => allergies.includes(t))));
  return safe.length ? safe : ok;
}

/** Scale one meal to roughly `kcalTarget`. */
export function buildMeal(slot: Slot, meal: Meal, kcalTarget: number | null, option: number, options: number): PlannedMeal {
  const base = meal.items.reduce((s, [k, n]) => s + F[k].kcal * n, 0);
  const scale = kcalTarget ? Math.min(1.9, Math.max(0.6, kcalTarget / base)) : 1;
  const foods = meal.items.map(([k, n]) => {
    const f = F[k] as Food;
    const s = servingsShown(f, n * scale);
    return { name: f.name, amount: amount(f, n * scale), kcal: Math.round(f.kcal * s), protein: Math.round(f.p * s), carbs: Math.round(f.c * s), fat: Math.round(f.f * s), rs: Math.max(1, Math.round(f.rs * s)) };
  });
  const sum = (key: "kcal" | "protein" | "carbs" | "fat" | "rs") => foods.reduce((a, x) => a + x[key], 0);
  return { slot, name: meal.name, foods, kcal: sum("kcal"), protein: sum("protein"), carbs: sum("carbs"), fat: sum("fat"), rs: sum("rs"), option, options };
}

/** A full day. `day` rotates meals through the week; `swaps` bumps a slot to another idea. */
export function dayMeals(day: DayKey, diet: DietType, mealsPerDay: number, allergies: Allergy[], kcal: number | null, swaps: Partial<Record<Slot, number>> = {}): DayMeals {
  const split = SPLITS[Math.min(5, Math.max(3, mealsPerDay))];
  const d = WEEK.indexOf(day);
  const meals = split.map(([slot, share]) => {
    const opts = mealOptions(slot, diet, allergies);
    const option = (d + (swaps[slot] ?? 0)) % opts.length;
    return buildMeal(slot, opts[option], kcal ? kcal * share : null, option, opts.length);
  });
  const sum = (key: "kcal" | "protein" | "carbs" | "fat" | "rs") => meals.reduce((a, m) => a + m[key], 0);
  return { meals, kcal: sum("kcal"), protein: sum("protein"), carbs: sum("carbs"), fat: sum("fat"), rs: sum("rs") };
}
