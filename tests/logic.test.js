import { describe, it, expect } from "vitest";
import { calculateBmi, bmiTxt, ftin, dayKey, ageGroupOf, budgetTier, estimateCalories, portionMultiplier } from "../src/logic/body.js";
import { scaleItem, nutritionFor, getMealOptions, buildDayPlan, parseItems, parseBlockedFoods, veganize } from "../src/logic/meals.js";

describe("BMI", () => {
  it("computes weight / height^2", () => {
    expect(calculateBmi(70, 175)).toBeCloseTo(22.857, 3);
    expect(calculateBmi(68, 170)).toBeCloseTo(23.529, 3);
  });
  it("gives advice per range", () => {
    expect(bmiTxt(17)).toMatch(/^Underweight/);
    expect(bmiTxt(22)).toMatch(/great figure/);
    expect(bmiTxt(27)).toMatch(/little above/);
    expect(bmiTxt(32)).toMatch(/^Above/);
  });
  it("formats helpers", () => {
    expect(ftin(170)).toBe("5 ft 7 in");
    expect(dayKey(new Date(2026, 0, 5))).toBe("2026-1-5");
    expect(ageGroupOf(15)).toBe("teen");
    expect(ageGroupOf(30)).toBe("adult");
    expect(ageGroupOf(45)).toBe("mid");
    expect(ageGroupOf(65)).toBe("senior");
    expect(budgetTier(0)).toBe("med");
    expect(budgetTier(150)).toBe("low");
    expect(budgetTier(300)).toBe("med");
    expect(budgetTier(500)).toBe("high");
  });
});

describe("calorie target", () => {
  const base = { gender: "m", age: 30, weightKg: 68, heightCm: 170, activity: 1.55, goal: "maintain", trainingDays: 3, sessionMinutes: 45, workoutType: "Strength training" };
  it("matches the hand-calculated maintenance value", () => {
    // BMR 1597.5 * 1.55 = 2476.1 + training 93.7 = 2569.8 -> nearest 50 = 2550
    const r = estimateCalories(base);
    expect(r.calories).toBe(2550);
    expect(r.proteinRange).toEqual([1.4, 1.8]); // strength training >= 2 days
    expect(r.warnings).toEqual([]);
    expect(estimateCalories({ ...base, workoutType: "Cardio" }).proteinRange).toEqual([1.2, 1.6]);
  });
  it("applies goal adjustments", () => {
    expect(estimateCalories({ ...base, goal: "lose" }).calories).toBe(2250);
    expect(estimateCalories({ ...base, goal: "gain" }).calories).toBe(2800);
  });
  it("uses higher protein for strength training / fitness goal", () => {
    expect(estimateCalories({ ...base, goal: "fitness" }).proteinRange).toEqual([1.4, 1.8]);
  });
  it("never goes below the safe floor", () => {
    const r = estimateCalories({ ...base, gender: "f", weightKg: 40, heightCm: 150, age: 50, activity: 1.2, goal: "lose", trainingDays: 0 });
    expect(r.calories).toBe(1200);
  });
  it("blocks weight loss when underweight and warns", () => {
    const r = estimateCalories({ ...base, weightKg: 48, goal: "lose" });
    expect(r.warnings.some(w => /underweight/.test(w))).toBe(true);
    expect(r.calories).toBe(estimateCalories({ ...base, weightKg: 48, goal: "maintain" }).calories);
  });
  it("uses growth-friendly values for teens", () => {
    const r = estimateCalories({ ...base, age: 15, goal: "lose" });
    expect(r.warnings[0]).toMatch(/^Teen estimate/);
    expect(r.proteinRange).toEqual([1, 1.5]);
  });
  it("clamps the portion multiplier", () => {
    expect(portionMultiplier(2000, 1000)).toBe(1.6);
    expect(portionMultiplier(500, 1000)).toBe(.6);
    expect(portionMultiplier(1100, 1000)).toBeCloseTo(1.1);
  });
});

describe("portion scaling", () => {
  it("keeps quantities at m = 1 and recomputes nutrition", () => {
    // Oats 50 g @ Rs 8: 380 kcal and 13 g protein per 100 g
    expect(scaleItem(["Oats", 50, "g", 8], 1)).toEqual(["Oats", 50, "g", 8, 190, 6.5]);
  });
  it("rounds grams/ml to 5 and scales price proportionally", () => {
    const [name, qty, unit, price] = scaleItem(["Rice", 80, "g", 5], 1.3);
    expect([name, qty, unit]).toEqual(["Rice", 105, "g"]);
    expect(price).toBe(Math.round(5 * 105 / 80));
  });
  it("rounds pieces to whole numbers, minimum 1", () => {
    expect(scaleItem(["Eggs", 2, "pc", 14], 1.4)[1]).toBe(3);
    expect(scaleItem(["Banana", 1, "pc", 6], 0.6)[1]).toBe(1);
  });
  it("uses per-piece values for unit foods and zero for unknown foods", () => {
    expect(nutritionFor(["Eggs", 2, "pc"])).toEqual([150, 12.6]);
    expect(nutritionFor(["Mystery food", 100, "g"])).toEqual([0, 0]);
  });
});

describe("meal logic", () => {
  it("parses compact item strings", () => {
    expect(parseItems("Curd|150|g|12;Banana|1|pc|6")).toEqual([["Curd", 150, "g", 12], ["Banana", 1, "pc", 6]]);
  });
  it("veganizes dairy items", () => {
    expect(veganize(["Milk", 250, "ml", 15])).toEqual(["Soy milk", 250, "ml", 24]);
    expect(veganize(["Paneer", 100, "g", 38])[0]).toBe("Tofu");
  });
  it("expands allergy synonyms", () => {
    const blocked = parseBlockedFoods("lactose, peanuts", "avoid mushrooms");
    expect(blocked).toContain("curd");
    expect(blocked).toContain("peanut");
    expect(blocked).toContain("mushroom");
  });
  it("vegetarian options never include meat", () => {
    const opts = getMealOptions("veg", "med", "l");
    expect(opts).toHaveLength(2);
    expect(JSON.stringify(opts)).not.toMatch(/chicken|fish|salmon|prawn/i);
  });
  it("builds a day plan with totals matching its meals", () => {
    const settings = { bk: "med", dk: "veg", slots: [["b", "Breakfast", "7", 0], ["l", "Lunch", "1", 0], ["d", "Dinner", "8", 0]], bl: [], wm: "both", train: true };
    const plan = buildDayPlan(settings, 0, 1);
    expect(plan.meals).toHaveLength(3);
    expect(plan.extra).toHaveLength(2);
    const cost = [...plan.meals, ...plan.extra].reduce((s, m) => s + m.c, 0);
    expect(plan.total).toBe(cost);
    expect(plan.kcal).toBeGreaterThan(0);
    expect(buildDayPlan({ ...settings, train: false }, 0, 1).extra).toEqual([]);
  });
  it("removes blocked foods and reports them", () => {
    const settings = { bk: "med", dk: "veg", slots: [["l", "Lunch", "1", 0]], bl: ["paneer"], wm: "none", train: false };
    const plan = buildDayPlan(settings, 0, 1);
    expect(plan.removed.length).toBeGreaterThan(0);
    expect(JSON.stringify(plan.meals).toLowerCase()).not.toContain("paneer");
  });
});
