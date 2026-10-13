import { WORKOUT_KCAL_RATE } from "../data/nutrition.js";

// Pure body / calorie calculations (no DOM, no global state).

// Body Mass Index from weight (kg) and height (cm).
export const calculateBmi = (weightKg, heightCm) => weightKg / ((heightCm / 100) ** 2);

// Short advice text for an adult BMI value.
export const bmiTxt = bmi => bmi < 18.5 ? "Underweight. Focus on eating enough and building strength." : bmi < 25 ? "You've got a great figure! Keep it up!" : bmi < 30 ? "A little above the healthy range. Steady habits will help." : "Above the healthy range. A doctor or dietitian can guide you.";

// Centimetres -> "5 ft 7 in".
export const ftin = cm => { const totalInches = Math.round(cm / 2.54); return Math.floor(totalInches / 12) + " ft " + totalInches % 12 + " in"; };

// Local-date key like "2026-10-13" (month and day are not zero-padded, as originally stored).
export const dayKey = (date = new Date()) => date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

// Age group key used for tips: teen, adult, mid or senior.
export const ageGroupOf = age => age < 18 ? "teen" : age < 40 ? "adult" : age < 60 ? "mid" : "senior";

// Budget tier (low/med/high) from a daily food budget in INR; med when no budget given.
export const budgetTier = budget => budget ? (budget < 190 ? "low" : budget < 450 ? "med" : "high") : "med";

// Portion multiplier so a plan's average kcal matches the target (clamped to 0.6-1.6).
export const portionMultiplier = (targetKcal, baseKcal) => Math.min(1.6, Math.max(.6, targetKcal / baseKcal));

/**
 * Estimate daily calories (Mifflin-St Jeor BMR x activity + training + goal adjustment)
 * and a protein range in g per kg body weight. Not for gender "x" (caller skips it).
 * Returns { calories, proteinRange: [lowPerKg, highPerKg], warnings: string[] }.
 */
export function estimateCalories({ gender, age, weightKg, heightCm, activity, goal, trainingDays, sessionMinutes, workoutType }) {
  const warnings = [];
  const adult = age >= 18;
  const bmi = calculateBmi(weightKg, heightCm);
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (gender == "m" ? 5 : -161);
  // Extra kcal/day from planned training, capped at 500.
  const trainingKcal = Math.min(500, (trainingDays / 7) * sessionMinutes * (WORKOUT_KCAL_RATE[workoutType] || 5) * (weightKg / 70));
  let adjustment = goal == "lose" ? -300 : goal == "gain" ? 250 : 0;
  if (age >= 60) adjustment = goal == "lose" ? -200 : goal == "gain" ? 200 : 0;
  if (!adult) {
    adjustment = goal == "gain" ? 150 : 0;
    warnings.push("Teen estimate: calories support growth, school and sport, with no weight-loss deficit. Protein is shown as a range per kg of body weight. A doctor or dietitian can fine-tune these numbers.");
  }
  if (goal == "lose" && bmi < 18.5) {
    adjustment = 0;
    warnings.push("Your BMI is in the underweight range, so weight loss is not advised. Calories are kept at maintenance. Consider the Maintain or Gain goal.");
  }
  if (goal == "gain" && bmi >= 30) warnings.push("Your BMI is in the obese range. Gaining weight may not be healthy for you. Please talk to a doctor or dietitian first.");
  // Floor on calories by age group and gender, rounded to the nearest 50.
  const floor = adult ? (gender == "m" ? 1500 : 1200) : (gender == "m" ? 1800 : 1600);
  const calories = Math.round(Math.max(floor, bmr * activity + trainingKcal + adjustment) / 50) * 50;
  const strong = goal == "fitness" || (/Strength|Mixed/.test(workoutType) && trainingDays >= 2);
  const proteinRange = !adult ? (strong ? [1, 1.5] : [.9, 1.3]) : age >= 60 ? [1.2, 1.5] : strong ? [1.4, 1.8] : [1.2, 1.6];
  return { calories, proteinRange, warnings };
}
