import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import type { Exercise } from "../src/lib/exercises";
import { generatePlan, chooseSplit, prescription, alternatives, isAllowed, type PlanInput } from "../src/lib/planner";

const all: Exercise[] = JSON.parse(readFileSync("public/data/exercises.json", "utf8"));
const byId = new Map(all.map((e) => [e.id, e]));
const base: PlanInput = { goal: "muscle", experience: "int", place: "gym", equipment: [], days: ["mon", "wed", "fri"], minutes: 60, limitations: [], split: "auto", seed: "user-1" };

describe("planner", () => {
  it("picks a split from the number of days", () => {
    expect(chooseSplit("auto", 2, "int")).toBe("full");
    expect(chooseSplit("auto", 3, "beg")).toBe("full");
    expect(chooseSplit("auto", 3, "int")).toBe("ppl");
    expect(chooseSplit("auto", 4, "int")).toBe("upper_lower");
    expect(chooseSplit("bro", 4, "int")).toBe("bro");
  });

  it("builds one day per training day with the right exercise count, no duplicates in a day", () => {
    const p = generatePlan(all, base);
    expect(p.days.map((d) => d.key)).toEqual(["mon", "wed", "fri"]);
    for (const d of p.days) {
      expect(d.exercises).toHaveLength(6);
      expect(new Set(d.exercises.map((e) => e.id)).size).toBe(6);
      for (const e of d.exercises) expect(byId.has(e.id)).toBe(true);
    }
  });

  it("is deterministic for the same seed", () => {
    const a = generatePlan(all, base), b = generatePlan(all, base);
    expect(a.days).toEqual(b.days);
  });

  it("only uses home-friendly exercises at home with dumbbells", () => {
    const input = { ...base, place: "home" as const, equipment: ["dumbbell"], days: ["mon", "tue", "thu", "fri"] as PlanInput["days"] };
    const p = generatePlan(all, input);
    expect(p.split).toBe("upper_lower");
    for (const d of p.days) for (const x of d.exercises) {
      expect(["body only", "none", "dumbbell"]).toContain(byId.get(x.id)!.equipment);
    }
  });

  it("works outdoors with nothing but bodyweight", () => {
    const p = generatePlan(all, { ...base, place: "outdoor", experience: "beg", minutes: 30 });
    for (const d of p.days) {
      expect(d.exercises.length).toBeGreaterThanOrEqual(3);
      for (const x of d.exercises) expect(byId.get(x.id)!.places).toContain("outdoor");
    }
  });

  it("respects limitations", () => {
    const p = generatePlan(all, { ...base, limitations: ["knee", "lower_back"], days: ["mon", "tue", "wed", "thu", "fri", "sat"] });
    for (const d of p.days) for (const x of d.exercises) expect(byId.get(x.id)!.name).not.toMatch(/jump|lunge|deadlift|good morning/i);
  });

  it("keeps beginners away from expert lifts", () => {
    const p = generatePlan(all, { ...base, experience: "beg" });
    for (const d of p.days) for (const x of d.exercises) expect(byId.get(x.id)!.level).not.toBe("expert");
  });

  it("adds a cardio finisher for fat loss", () => {
    const p = generatePlan(all, { ...base, goal: "fat_loss" });
    for (const d of p.days) expect(d.exercises.at(-1)!.muscle).toBe("cardio");
  });

  it("sets reps by goal", () => {
    expect(prescription("strength", "compound", "int").reps).toBe("4–6");
    expect(prescription("muscle", "compound", "adv").sets).toBe(4);
    expect(prescription("fat_loss", "isolation", "beg").restSec).toBe(45);
  });

  it("offers swap alternatives that are allowed and not already in the day", () => {
    const p = generatePlan(all, base);
    const day = p.days[0];
    const alts = alternatives(all, base, day, day.exercises[0]);
    expect(alts.length).toBeGreaterThan(0);
    for (const a of alts) {
      expect(day.exercises.some((e) => e.id === a.id)).toBe(false);
      expect(isAllowed(a, base)).toBe(true);
    }
  });
});

describe("muscle regions", () => {
  it("push days hit upper and middle chest separately", () => {
    const p = generatePlan(all, { ...base, split: "ppl", days: ["mon", "wed", "fri"], minutes: 75 });
    const push = p.days.find((d) => d.type === "push")!;
    const regions = push.exercises.map((x) => byId.get(x.id)!.region);
    expect(regions).toContain("chest-upper");
    expect(regions).toContain("chest-middle");
    expect(regions).toContain("delts-side");
  });
  it("swaps stay in the same region", () => {
    const p = generatePlan(all, { ...base, split: "ppl" });
    const day = p.days[0];
    const ex = day.exercises.find((x) => x.muscle === "chest-upper")!;
    for (const a of alternatives(all, base, day, ex)) expect(a.region).toBe("chest-upper");
  });
});
