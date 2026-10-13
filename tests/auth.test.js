import { describe, it, expect, vi } from "vitest";
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({}) }));
import { cleanOtp, isValidOtp, isValidEmail, validateSignUp, signUpOutcome, planAfterSignIn, friendlyAuthError } from "../src/logic/auth.js";
import { profileToRow, rowToProfile } from "../src/lib/supabase.js";
import { tabFromPath, ROUTES } from "../src/router.js";

describe("auth helpers", () => {
  it("validates email and codes", () => {
    expect(isValidEmail(" A@b.co ")).toBe(true);
    expect(isValidEmail("nope")).toBe(false);
    expect(cleanOtp("123 456")).toBe("123456");
    expect(isValidOtp("123456")).toBe(true);
    expect(isValidOtp("12345")).toBe(false);
  });
  it("validates sign up", () => {
    expect(validateSignUp("a@b.co", "short", "short")).toMatch(/at least/);
    expect(validateSignUp("a@b.co", "longenough", "different")).toMatch(/match/);
    expect(validateSignUp("a@b.co", "longenough", "longenough")).toBe("");
  });
  it("reads sign-up outcomes", () => {
    expect(signUpOutcome({ session: {} })).toBe("signed-in");
    expect(signUpOutcome({ user: { identities: [] } })).toBe("exists");
    expect(signUpOutcome({ user: { identities: [{}] } })).toBe("confirm");
  });
  it("plans after sign-in", () => {
    expect(planAfterSignIn({ done: 1 }, { done: 1 })).toBe("use-remote");
    expect(planAfterSignIn(null, { done: 1 })).toBe("push-local");
    expect(planAfterSignIn(null, {})).toBe("wizard");
  });
  it("maps errors to friendly text", () => {
    expect(friendlyAuthError({ message: "Invalid login credentials" })).toBe("Wrong email or password.");
  });
});

describe("profile mapping", () => {
  it("round-trips a profile and drops the photo", () => {
    const U = { name: "Asha", age: 30, gender: "f", height: 165, weight: 60, target: 56, goal: "red", lv: "beg",
      days: 4, wk: "Monday", place: "home", foc: ["legs", "core"], fk: "legs", diet: "veg", budget: 250,
      equip: ["none"], health: "no", done: 1, img: "data:image/jpeg;base64,xx" };
    const row = profileToRow(U);
    expect(row.img).toBeUndefined();
    expect(row.onboarded).toBe(true);
    const back = rowToProfile(row);
    const { img, ...rest } = U;
    expect(back).toEqual(rest);
  });
});

describe("router", () => {
  it("maps paths to tabs", () => {
    expect(tabFromPath("/")).toBe("home");
    expect(tabFromPath("/diet/")).toBe("diet");
    expect(tabFromPath("/report")).toBe("rep");
    expect(tabFromPath("/login")).toBe(null);
    for (const [k, p] of Object.entries(ROUTES)) expect(tabFromPath(p)).toBe(k);
  });
});
