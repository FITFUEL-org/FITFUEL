# FITFUEL

A fitness and Indian diet planner that runs entirely in the browser. A short
onboarding wizard collects your profile, then the app builds:

- a daily calorie and protein target (with safety guard rails for teens, low BMI and health conditions),
- two alternating budget-aware Indian meal plans (Plan A / Plan B) scaled to your target, with allergy filtering and veg / vegan / egg / non-veg variants,
- an exercise list by body part and place (home, gym, outdoor) with start/end stick-figure poses,
- a dashboard with activity, water, sleep, BMI and weight tracking.

Your data stays in this browser (`localStorage`, key `fitfuel.v2`). Backup and restore are available from the Me tab.

## Setup

Requires Node 20+.

```
npm install
npm run dev       # start the Vite dev server
npm run build     # production build into dist/
npm run preview   # serve the production build
npm test          # run the vitest unit tests
```

Copy `.env.example` to `.env.local` if you use the Supabase pieces (see `docs/supabase.md`).

## Structure

```
index.html            page shell: head + body markup, loads /src/main.js
src/main.js           start-up (same order as the original script)
src/state.js          shared mutable state: U (profile), S (plan settings), ui, IMG
src/storage.js        localStorage save/load, backup and restore parsing
src/styles/main.css   all styles
src/data/             static tables: meals, nutrition, exercises, wizard steps
src/logic/            pure calculations: BMI, calorie target, portion scaling, day plans
src/ui/               DOM code: dom helpers, diet form, exercises, wizard, tabs
tests/                vitest unit tests for src/logic
legacy/               the original single-file app, kept for reference
```

`U`, `S` and `ui` in `src/state.js` are stable objects that are mutated in place
(never reassigned), so every module shares the same reference.
`FITFUEL DIET CODE` is a separate app and is not part of this build.
