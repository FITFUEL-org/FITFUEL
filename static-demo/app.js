"use strict";

const STORAGE_KEY = "fitfuel.plain-demo.v1";
const EXERCISES_URL = "../public/data/exercises.json";
const TITLES = { overview: "Your overview", workout: "Your workout plan", diet: "Your daily diet", exercises: "Exercise library", profile: "Your preferences" };
const DEFAULTS = { name: "", place: "home", diet: "veg", dailyBudget: 250, mealsPerDay: 4 };
const BUDGET_MIN = 20;
const BUDGET_MAX = 100000;
const HOME_EQUIPMENT = new Set(["body only", "none", "dumbbell", "kettlebells", "bands", "medicine ball", "exercise ball", "foam roll"]);
const MUSCLE_GROUPS = [
  { label: "Chest", matches: ["chest", "pectorals"] },
  { label: "Back", matches: ["back", "lats", "traps"] },
  { label: "Shoulders", matches: ["shoulders", "deltoids"] },
  { label: "Arms", matches: ["biceps", "triceps", "forearms"] },
  { label: "Legs", matches: ["quadriceps", "hamstrings", "glutes", "calves"] },
  { label: "Core", matches: ["abdominals", "abs"] },
];
const DIETS = [
  {
    slot: "Breakfast",
    options: {
      veg: [
        { name: "Poha with sprouts", details: "Poha, moong sprouts, lemon", calories: 320, cost: 27 },
        { name: "Besan chilla & curd", details: "Two chillas with a side of curd", calories: 350, cost: 32 },
        { name: "Oats, milk & banana", details: "Oats, toned milk, one banana", calories: 370, cost: 33 },
        { name: "Idli & sambar", details: "Four idlis with sambar", calories: 340, cost: 25 },
      ],
      egg: [
        { name: "Egg bhurji & roti", details: "Two eggs, two rotis", calories: 390, cost: 32 },
        { name: "Oats, milk & banana", details: "Oats, toned milk, one banana", calories: 370, cost: 33 },
        { name: "Egg omelette & toast", details: "Two eggs, whole-wheat toast", calories: 350, cost: 30 },
      ],
      nv: [
        { name: "Egg bhurji & roti", details: "Two eggs, two rotis", calories: 390, cost: 32 },
        { name: "Oats, milk & banana", details: "Oats, toned milk, one banana", calories: 370, cost: 33 },
        { name: "Egg omelette & toast", details: "Two eggs, whole-wheat toast", calories: 350, cost: 30 },
      ],
      vegan: [
        { name: "Poha with sprouts", details: "Poha, moong sprouts, lemon", calories: 320, cost: 27 },
        { name: "Soya upma", details: "Upma with soya chunks", calories: 350, cost: 31 },
        { name: "Sattu & banana", details: "Sattu drink with a banana", calories: 320, cost: 25 },
      ],
    },
  },
  {
    slot: "Lunch",
    options: {
      veg: [
        { name: "Dal, rice & seasonal sabzi", details: "One bowl dal, rice, mixed vegetables", calories: 570, cost: 45 },
        { name: "Rajma chawal", details: "Rajma, rice, fresh salad", calories: 590, cost: 48 },
        { name: "Soya curry & roti", details: "Soya chunks curry, two rotis", calories: 540, cost: 38 },
      ],
      egg: [
        { name: "Egg curry & rice", details: "Two eggs, rice, seasonal sabzi", calories: 580, cost: 50 },
        { name: "Dal, rice & seasonal sabzi", details: "One bowl dal, rice, mixed vegetables", calories: 570, cost: 45 },
        { name: "Rajma chawal", details: "Rajma, rice, fresh salad", calories: 590, cost: 48 },
      ],
      nv: [
        { name: "Chicken, rice & salad", details: "Grilled chicken, rice, fresh salad", calories: 610, cost: 78 },
        { name: "Egg curry & rice", details: "Two eggs, rice, seasonal sabzi", calories: 580, cost: 50 },
        { name: "Dal, rice & seasonal sabzi", details: "One bowl dal, rice, mixed vegetables", calories: 570, cost: 45 },
      ],
      vegan: [
        { name: "Soya curry & rice", details: "Soya chunks curry, rice, salad", calories: 560, cost: 38 },
        { name: "Rajma chawal", details: "Rajma, rice, fresh salad", calories: 590, cost: 48 },
        { name: "Dal, rice & seasonal sabzi", details: "One bowl dal, rice, mixed vegetables", calories: 570, cost: 45 },
      ],
    },
  },
  {
    slot: "Snack",
    options: {
      veg: [
        { name: "Roasted chana & fruit", details: "Roasted chana with seasonal fruit", calories: 220, cost: 22 },
        { name: "Sprouts chaat", details: "Moong sprouts, tomato, lemon", calories: 180, cost: 15 },
        { name: "Banana & roasted peanuts", details: "One banana, a small handful of peanuts", calories: 260, cost: 14 },
      ],
      egg: [
        { name: "Boiled eggs & fruit", details: "Two boiled eggs with seasonal fruit", calories: 230, cost: 30 },
        { name: "Roasted chana & fruit", details: "Roasted chana with seasonal fruit", calories: 220, cost: 22 },
        { name: "Sprouts chaat", details: "Moong sprouts, tomato, lemon", calories: 180, cost: 15 },
      ],
      nv: [
        { name: "Boiled eggs & fruit", details: "Two boiled eggs with seasonal fruit", calories: 230, cost: 30 },
        { name: "Roasted chana & fruit", details: "Roasted chana with seasonal fruit", calories: 220, cost: 22 },
        { name: "Sprouts chaat", details: "Moong sprouts, tomato, lemon", calories: 180, cost: 15 },
      ],
      vegan: [
        { name: "Roasted chana & fruit", details: "Roasted chana with seasonal fruit", calories: 220, cost: 22 },
        { name: "Sprouts chaat", details: "Moong sprouts, tomato, lemon", calories: 180, cost: 15 },
        { name: "Sattu drink", details: "Sattu, water, lemon", calories: 160, cost: 10 },
      ],
    },
  },
  {
    slot: "Dinner",
    options: {
      veg: [
        { name: "Soya pulao & raita", details: "Rice, soya chunks, curd", calories: 520, cost: 40 },
        { name: "Chole & roti", details: "Chole, two rotis, fresh salad", calories: 550, cost: 40 },
        { name: "Paneer bhurji & roti", details: "Paneer bhurji with two rotis", calories: 560, cost: 67 },
      ],
      egg: [
        { name: "Egg curry & roti", details: "Two eggs, curry, two rotis", calories: 520, cost: 42 },
        { name: "Soya pulao & raita", details: "Rice, soya chunks, curd", calories: 520, cost: 40 },
        { name: "Chole & roti", details: "Chole, two rotis, fresh salad", calories: 550, cost: 40 },
      ],
      nv: [
        { name: "Chicken & roti", details: "Chicken curry, two rotis, salad", calories: 560, cost: 75 },
        { name: "Egg curry & roti", details: "Two eggs, curry, two rotis", calories: 520, cost: 42 },
        { name: "Soya pulao & raita", details: "Rice, soya chunks, curd", calories: 520, cost: 40 },
      ],
      vegan: [
        { name: "Soya pulao", details: "Rice, soya chunks, fresh salad", calories: 500, cost: 32 },
        { name: "Chole & roti", details: "Chole, two rotis, fresh salad", calories: 550, cost: 40 },
        { name: "Dal, rice & seasonal sabzi", details: "One bowl dal, rice, mixed vegetables", calories: 570, cost: 45 },
      ],
    },
  },
];
const MUSCLE_LABELS = { chest: "Chest", back: "Back", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps", forearms: "Forearms", abdominals: "Core", quadriceps: "Quads", hamstrings: "Hamstrings", glutes: "Glutes", calves: "Calves", lats: "Back", traps: "Back" };
const EQUIPMENT_LABELS = { "body only": "Bodyweight", none: "No equipment", dumbbell: "Dumbbells", kettlebells: "Kettlebell", bands: "Resistance bands", "medicine ball": "Medicine ball", "exercise ball": "Exercise ball", "foam roll": "Foam roller", barbell: "Barbell", cable: "Cable machine", machine: "Machine", "e-z curl bar": "EZ curl bar" };

let preferences = loadPreferences();
let exercises = [];
let currentView = "overview";
let searchQuery = "";

function loadPreferences() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { ...DEFAULTS };
  try {
    const parsed = JSON.parse(stored);
    const budget = Number(parsed.dailyBudget);
    return {
      ...DEFAULTS,
      ...parsed,
      place: parsed.place === "gym" ? "gym" : "home",
      diet: ["veg", "egg", "nv", "vegan"].includes(parsed.diet) ? parsed.diet : DEFAULTS.diet,
      dailyBudget: Number.isFinite(budget) ? Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, budget)) : DEFAULTS.dailyBudget,
      mealsPerDay: 4,
    };
  } catch (error) {
    console.warn("Could not read saved FITFUEL preferences; using defaults.", error);
    return { ...DEFAULTS };
  }
}

function savePreferences() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  updateBudgetBadge();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function money(amount) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function dietName() {
  return { veg: "Vegetarian", egg: "Eggetarian", nv: "Non-vegetarian", vegan: "Vegan" }[preferences.diet];
}

function placeName() {
  return preferences.place === "home" ? "At home" : "At the gym";
}

function budgetMealPlan() {
  const mealSlots = preferences.mealsPerDay === 3 ? [0, 1, 3] : [0, 1, 2, 3];
  const options = mealSlots.map((index) => DIETS[index].options[preferences.diet]);
  const cheapestCost = options.reduce((total, meals) => total + Math.min(...meals.map((meal) => meal.cost)), 0);
  if (cheapestCost > preferences.dailyBudget) return null;

  const targetCalories = 1900;
  let bestPlan = null;
  let bestScore = Number.POSITIVE_INFINITY;
  function choose(slot, selected) {
    if (slot === options.length) {
      const totalCost = selected.reduce((total, meal) => total + meal.cost, 0);
      if (totalCost > preferences.dailyBudget) return;
      const totalCalories = selected.reduce((total, meal) => total + meal.calories, 0);
      const distinctMeals = new Set(selected.map((meal) => meal.name)).size;
      const score = Math.abs(targetCalories - totalCalories) + (selected.length - distinctMeals) * 25;
      if (score < bestScore) {
        bestPlan = [...selected];
        bestScore = score;
      }
      return;
    }
    for (const meal of options[slot]) choose(slot + 1, [...selected, meal]);
  }
  choose(0, []);
  return bestPlan ? {
    meals: bestPlan.map((meal, index) => ({ ...meal, slot: DIETS[mealSlots[index]].slot })),
    total: bestPlan.reduce((sum, meal) => sum + meal.cost, 0),
    calories: bestPlan.reduce((sum, meal) => sum + meal.calories, 0),
  } : null;
}

function updateBudgetBadge() {
  const badge = document.querySelector("[data-budget-badge]");
  if (badge) badge.textContent = `Budget ${money(preferences.dailyBudget)} / day`;
}

function dietOptions() {
  return [["veg", "Vegetarian"], ["egg", "Eggetarian"], ["nv", "Non-vegetarian"], ["vegan", "Vegan"]]
    .map(([key, label]) => `<option value="${key}" ${preferences.diet === key ? "selected" : ""}>${label}</option>`)
    .join("");
}

function renderOverview() {
  const plan = budgetMealPlan();
  const message = plan ? "Meals planned within your daily budget." : "Increase your budget to fit a complete day's meals.";
  return `
    <section class="hero"><div class="hero-copy">
      <span class="eyebrow">YOUR PLAN, BUILT AROUND YOU</span>
      <h2>Small steps.<br><span class="accent">Stronger every day.</span></h2>
      <p>Your ${escapeHtml(placeName().toLowerCase())} workout and ${escapeHtml(dietName().toLowerCase())} meals, made to fit your daily budget.</p>
      <div class="action-row"><button class="btn btn-primary" data-view="workout">See workout <span aria-hidden="true">↗</span></button><button class="btn" data-view="diet">View today's meals</button></div>
    </div></section>
    <div class="section-head"><div><h2>Your daily check-in</h2><p>Current settings saved in this browser.</p></div><button class="btn btn-small" data-view="profile">Edit preferences</button></div>
    <div class="grid grid-3">
      <article class="stat-card"><div class="stat-label">TRAINING PLACE</div><div class="stat-value">${escapeHtml(placeName())}</div><div class="stat-foot">Exercises matched to your setup</div></article>
      <article class="stat-card"><div class="stat-label">FOOD BUDGET</div><div class="stat-value">${money(preferences.dailyBudget)} <small>/ day</small></div><div class="stat-foot">Daily maximum for your meal plan</div></article>
      <article class="stat-card"><div class="stat-label">TODAY'S MEALS</div><div class="stat-value">${plan ? money(plan.total) : "—"} <small>${plan ? "estimated total" : "no complete plan"}</small></div><div class="stat-foot">${escapeHtml(message)}</div></article>
    </div>
    <div class="section-head"><div><h2>One plan. Your choice.</h2><p>Switch training place any time.</p></div><div class="segmented" role="group" aria-label="Choose training place"><button class="segment ${preferences.place === "home" ? "selected" : ""}" data-place="home">Home</button><button class="segment ${preferences.place === "gym" ? "selected" : ""}" data-place="gym">Gym</button></div></div>
    <div class="panel panel-heading"><div><h2>${exercises.length ? `${exercises.length}+ exercises ready` : "Loading exercise library"}</h2><p>Pick home or gym to see exercises that match your selected place.</p></div><button class="btn btn-primary" data-view="workout">Open my plan <span aria-hidden="true">↗</span></button></div>`;
}

function isExerciseAllowed(exercise, place) {
  if (!exercise.places.includes(place)) return false;
  if (!["strength", "powerlifting", "plyometrics", "cardio"].includes(exercise.category)) return false;
  return place !== "home" || HOME_EQUIPMENT.has(exercise.equipment);
}

function exerciseMatchesMuscle(exercise, matches) {
  return [...exercise.primary, ...exercise.secondary].some((muscle) => matches.includes(muscle.toLowerCase()));
}

function pickPlanExercises(place) {
  const candidates = exercises.filter((exercise) => isExerciseAllowed(exercise, place));
  const selected = [];
  for (const group of MUSCLE_GROUPS) {
    const inGroup = candidates.filter((exercise) => exerciseMatchesMuscle(exercise, group.matches));
    inGroup.sort((a, b) => {
      const score = (item) => {
        const gymEquipment = ["barbell", "cable", "machine", "e-z curl bar"].includes(item.equipment);
        const homeEquipment = item.equipment === "body only" || item.equipment === "none";
        const placeFit = place === "gym" ? (gymEquipment ? 6 : 0) : (homeEquipment ? 3 : 0);
        return placeFit + (item.level === "beginner" ? 2 : 0) + (item.category === "strength" ? 1 : 0);
      };
      return score(b) - score(a) || a.name.localeCompare(b.name);
    });
    const next = inGroup.find((exercise) => !selected.some((item) => item.id === exercise.id));
    if (next) selected.push({ ...next, group: group.label });
  }
  return selected;
}

function exerciseCard(exercise) {
  const image = exercise.images && exercise.images[0]
    ? `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${encodeURI(exercise.images[0])}`
    : "";
  const muscle = MUSCLE_LABELS[exercise.primary[0]] || exercise.primary[0] || "Full body";
  const equipment = EQUIPMENT_LABELS[exercise.equipment] || exercise.equipment;
  return `<article class="exercise-card">
    <div class="exercise-image">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(exercise.name)} demonstration" loading="lazy">` : "Exercise demo"}</div>
    <div class="exercise-copy"><div class="exercise-title">${escapeHtml(exercise.name)}</div>
      <div class="exercise-meta"><span class="equipment">${escapeHtml(equipment)}</span><span>${escapeHtml(exercise.level)}</span><span>${escapeHtml(muscle)}</span></div>
    </div>
  </article>`;
}

function renderWorkout() {
  if (!exercises.length) return `<section class="panel"><div class="spinner" aria-label="Loading exercises"></div><p>Loading your workout library…</p></section>`;
  const selected = pickPlanExercises(preferences.place);
  return `
    <div class="section-head"><div><h2>A routine that fits your space</h2><p>${escapeHtml(placeName())} · six movement groups · equipment-aware picks</p></div><div class="segmented" role="group" aria-label="Choose training place"><button class="segment ${preferences.place === "home" ? "selected" : ""}" data-place="home">Home</button><button class="segment ${preferences.place === "gym" ? "selected" : ""}" data-place="gym">Gym</button></div></div>
    <div class="notice">${preferences.place === "home" ? "Home plan: bodyweight and home-friendly equipment only." : "Gym plan: exercises available at the gym, including machine and barbell options."} Select a place to rebuild your exercise list.</div>
    <div class="section-head"><div><h2>${selected.length} exercises</h2><p>${selected.map((exercise) => escapeHtml(exercise.group)).join(" · ")}</p></div><span class="pill pill-green">${escapeHtml(preferences.place.toUpperCase())} PLAN</span></div>
    ${selected.length ? `<div class="exercise-grid">${selected.map(exerciseCard).join("")}</div>` : `<div class="empty">No matching exercises found for this place.</div>`}
    <p class="small-note">Choose a different place to view its exercise list. Picks come from the included exercise library.</p>`;
}

function renderDiet() {
  const plan = budgetMealPlan();
  const meals = plan ? plan.meals.slice(0, preferences.mealsPerDay) : [];
  const total = meals.reduce((sum, meal) => sum + meal.cost, 0);
  const calories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  return `
    <div class="section-head"><div><h2>Meals that respect your budget</h2><p>Approximate home-cooked meal costs · ${escapeHtml(dietName())}</p></div><span class="pill pill-green" data-budget-badge>Budget ${money(preferences.dailyBudget)} / day</span></div>
    <div class="diet-layout">
      <section class="panel"><div class="panel-heading"><h2>Today's meal plan</h2>${plan ? `<span class="pill">${money(total)} estimated</span>` : ""}</div>
        ${plan ? `<div class="meal-list">${meals.map((meal) => `<article class="meal-card"><div><div class="meal-name">${escapeHtml(meal.slot)} · ${escapeHtml(meal.name)}</div><div class="meal-detail">${escapeHtml(meal.details)} · about ${meal.calories} kcal</div></div><div class="meal-price">${money(meal.cost)}</div></article>`).join("")}</div>
          <div class="split-line"></div><div class="range-line"><span>Estimated daily spend</span><strong class="meal-price">${money(total)} / ${money(preferences.dailyBudget)}</strong></div><div class="range-line" style="margin-top:9px"><span>Estimated meal calories</span><strong>${calories.toLocaleString("en-IN")} kcal</strong></div>
          <p class="small-note">Costs are estimates and vary by location. No over-budget plan is shown.</p>`
          : `<div class="notice error" style="margin-top:16px">A complete meal plan does not fit this budget. Increase your daily budget to see meals; no over-budget meals are shown.</div>`}
      </section>
      <aside class="panel"><h2>Daily food budget</h2><p>Change the amount to update and save your meal plan in this browser.</p>
        <div class="budget-control"><label class="field" for="diet-budget">Maximum spend per day (₹)<input class="input" id="diet-budget" type="number" min="${BUDGET_MIN}" max="${BUDGET_MAX}" step="10" value="${preferences.dailyBudget}"></label>
          <div class="range-line"><span>Minimum ${money(BUDGET_MIN)}</span><span>Maximum ${money(BUDGET_MAX)}</span></div>
          <label class="field" for="diet-type">Food preference<select class="select" id="diet-type">${dietOptions()}</select></label>
          <label class="field" for="meal-count">Meals per day<select class="select" id="meal-count">${[3, 4].map((count) => `<option value="${count}" ${count === preferences.mealsPerDay ? "selected" : ""}>${count} meals</option>`).join("")}</select></label>
          <div id="diet-status" class="small-note" aria-live="polite">Changes save automatically.</div>
        </div>
      </aside>
    </div>`;
}

function renderExercises() {
  const place = preferences.place;
  const search = searchQuery.trim().toLowerCase();
  const available = exercises.filter((exercise) => isExerciseAllowed(exercise, place));
  const results = available
    .filter((exercise) => !search || `${exercise.name} ${exercise.primary.join(" ")} ${exercise.equipment}`.toLowerCase().includes(search))
    .slice(0, 48);
  return `
    <div class="section-head"><div><h2>Find your next move</h2><p>Only exercises you can do ${escapeHtml(placeName().toLowerCase())} are shown.</p></div><div class="segmented" role="group" aria-label="Filter by place"><button class="segment ${place === "home" ? "selected" : ""}" data-place="home">Home</button><button class="segment ${place === "gym" ? "selected" : ""}" data-place="gym">Gym</button></div></div>
    <div class="filter-row"><input class="input" id="exercise-search" type="search" placeholder="Search exercises or muscle groups…" value="${escapeHtml(searchQuery)}" aria-label="Search exercises"><span class="pill">${results.length} shown · ${available.length} available</span></div>
    <div style="height:14px"></div>
    ${results.length ? `<div class="exercise-grid">${results.map(exerciseCard).join("")}</div>` : `<div class="empty">${exercises.length ? "No exercises match your search." : "Exercise library is loading."}</div>`}
    <p class="small-note">Exercise demonstrations load from the included public exercise library.</p>`;
}

function renderProfile() {
  return `
    <div class="section-head"><div><h2>Make your plan yours</h2><p>Saved in this browser. No account or server required.</p></div><span class="pill pill-green">LOCAL SAVE</span></div>
    <section class="panel"><form id="preferences-form" class="profile-form">
      <label class="field" for="profile-name">Your name<input class="input" id="profile-name" name="name" type="text" maxlength="60" value="${escapeHtml(preferences.name)}" placeholder="e.g. Aayush"></label>
      <label class="field" for="profile-place">Where do you train?<select class="select" id="profile-place" name="place"><option value="home" ${preferences.place === "home" ? "selected" : ""}>At home</option><option value="gym" ${preferences.place === "gym" ? "selected" : ""}>At the gym</option></select></label>
      <label class="field" for="profile-budget">Maximum food budget per day (₹)<input class="input" id="profile-budget" name="dailyBudget" type="number" min="${BUDGET_MIN}" max="${BUDGET_MAX}" step="10" value="${preferences.dailyBudget}" required></label>
      <label class="field" for="profile-diet">Food preference<select class="select" id="profile-diet" name="diet">${dietOptions()}</select></label>
      <div class="full action-row"><button class="btn btn-primary" type="submit">Save preferences</button><span id="profile-status" class="small-note" aria-live="polite"></span></div>
    </form><div class="split-line"></div><p class="small-note">This static demo stores settings in this browser only. It does not connect to Supabase, sync across devices, or save an account.</p></section>`;
}

function updateNavigation() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    const active = button.dataset.view === currentView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  document.getElementById("page-title").textContent = TITLES[currentView];
}

function render() {
  updateNavigation();
  const templates = { overview: renderOverview, workout: renderWorkout, diet: renderDiet, exercises: renderExercises, profile: renderProfile };
  document.getElementById("app-view").innerHTML = templates[currentView]();
  updateBudgetBadge();
}

function setPlace(place) {
  if (place !== "home" && place !== "gym") return;
  preferences.place = place;
  savePreferences();
  render();
}

function updateBudget(input, statusId) {
  const value = Number(input.value);
  if (!Number.isFinite(value) || value < BUDGET_MIN || value > BUDGET_MAX) {
    input.setAttribute("aria-invalid", "true");
    const status = document.getElementById(statusId);
    if (status) status.textContent = `Enter an amount from ${money(BUDGET_MIN)} to ${money(BUDGET_MAX)}.`;
    return false;
  }
  input.removeAttribute("aria-invalid");
  preferences.dailyBudget = Math.round(value);
  savePreferences();
  return true;
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.view) {
    currentView = button.dataset.view;
    searchQuery = "";
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (button.dataset.place) {
    setPlace(button.dataset.place);
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.id === "diet-budget") {
    if (updateBudget(target, "diet-status")) {
      const position = target.selectionStart;
      render();
      const replacement = document.getElementById("diet-budget");
      replacement.focus();
      replacement.setSelectionRange(position, position);
    }
  } else if (target.id === "exercise-search") {
    searchQuery = target.value;
    const position = target.selectionStart;
    render();
    const replacement = document.getElementById("exercise-search");
    replacement.focus();
    replacement.setSelectionRange(position, position);
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target.id === "diet-type") {
    preferences.diet = target.value;
    savePreferences();
    render();
  } else if (target.id === "meal-count") {
    preferences.mealsPerDay = Number(target.value);
    savePreferences();
    render();
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "preferences-form") return;
  event.preventDefault();
  const form = event.target;
  const budgetInput = form.elements.namedItem("dailyBudget");
  if (!updateBudget(budgetInput, "profile-status")) return;
  preferences.name = form.elements.namedItem("name").value.trim();
  preferences.place = form.elements.namedItem("place").value;
  preferences.diet = form.elements.namedItem("diet").value;
  savePreferences();
  render();
  const status = document.getElementById("profile-status");
  if (status) status.textContent = "Saved. Your workout and meal plan are updated.";
});

async function loadExercises() {
  const error = document.getElementById("load-error");
  try {
    const response = await fetch(EXERCISES_URL);
    if (!response.ok) throw new Error(`Exercise library returned HTTP ${response.status}.`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Exercise library has an unexpected format.");
    exercises = data;
    render();
  } catch (loadError) {
    console.error("Could not load exercise library.", loadError);
    error.textContent = "Could not load the exercise library. Start the demo with a local web server (see README) and reload this page.";
    error.classList.remove("hidden");
    render();
  }
}

render();
loadExercises();
