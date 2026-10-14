import { describe, it, expect } from "vitest";
import { targets, dayMeals, mealOptions } from "../src/lib/diet";
import { WEEK } from "../src/lib/planner";

const man = { gender: "m" as const, age: 25, height_cm: 175, weight_kg: 70, goal: "muscle" as const, level: "beg" as const, trainingDays: 4 };

describe("nutrition targets", () => {
  it("uses Mifflin-St Jeor with a surplus for muscle gain", () => {
    const t = targets(man)!;
    expect(t.bmr).toBe(1670);                 // 10*70 + 6.25*175 - 5*25 + 5 = 1673.75
    expect(t.kcal).toBe(Math.round((1673.75 * 1.55 + 300) / 10) * 10);
    expect(t.protein).toBe(125);              // 1.8 g/kg
  });
  it("applies a floored deficit for fat loss, but never for teens", () => {
    const loss = targets({ ...man, goal: "fat_loss" })!;
    expect(loss.kcal).toBeLessThan(loss.maintenance);
    const teen = targets({ ...man, age: 16, goal: "fat_loss" })!;
    expect(teen.kcal).toBe(teen.maintenance);
    const small = targets({ ...man, gender: "f", weight_kg: 42, height_cm: 150, age: 40, goal: "fat_loss", trainingDays: 1 })!;
    expect(small.kcal).toBeGreaterThanOrEqual(1200);
  });
  it("returns null without body stats", () => {
    expect(targets({ ...man, weight_kg: null })).toBeNull();
  });
});

describe("meal plan", () => {
  it("lands near the calorie target for every day and diet", () => {
    for (const diet of ["veg", "egg", "nv", "vegan"] as const) for (const day of WEEK) {
      const d = dayMeals(day, diet, 4, [], 2500);
      expect(d.meals).toHaveLength(4);
      expect(Math.abs(d.kcal - 2500) / 2500).toBeLessThan(0.15);
    }
  });
  it("keeps vegans away from dairy and eggs", () => {
    const names = WEEK.flatMap((day) => dayMeals(day, "vegan", 5, [], 2200).meals.flatMap((m) => m.foods.map((f) => f.name)));
    expect(names.join(" ")).not.toMatch(/milk \(toned\)|curd|paneer|whey|egg|greek/i);
  });
  it("respects allergies when alternatives exist", () => {
    for (const m of mealOptions("breakfast", "veg", ["dairy", "nuts"])) {
      expect(m.items.map(([k]) => k)).not.toContain("milk");
    }
  });
  it("swaps a slot to a different idea", () => {
    const a = dayMeals("mon", "veg", 4, [], 2200);
    const b = dayMeals("mon", "veg", 4, [], 2200, { lunch: 1 });
    expect(b.meals[1].name).not.toBe(a.meals[1].name);
  });
});

describe("meal costs", () => {
  it("prices every food and sums meals and days", () => {
    const d = dayMeals("wed", "nv", 4, [], 2400);
    for (const m of d.meals) {
      for (const f of m.foods) expect(f.rs).toBeGreaterThan(0);
      expect(m.rs).toBe(m.foods.reduce((a, f) => a + f.rs, 0));
    }
    expect(d.rs).toBe(d.meals.reduce((a, m) => a + m.rs, 0));
    expect(d.rs).toBeGreaterThan(60);
    expect(d.rs).toBeLessThan(600);
  });

  it("chooses affordable meal options without exceeding the daily budget", () => {
    const d = dayMeals("mon", "veg", 4, [], 2200, {}, 250);
    expect(d.withinBudget).toBe(true);
    expect(d.meals).toHaveLength(4);
    expect(d.rs).toBeLessThanOrEqual(250);
  });

  it("does not return meals when no complete plan fits the budget", () => {
    const d = dayMeals("mon", "veg", 4, [], 2200, {}, 1);
    expect(d.withinBudget).toBe(false);
    expect(d.meals).toHaveLength(0);
  });
});
