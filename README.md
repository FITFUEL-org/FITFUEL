# FITFUEL

Muscle-building web app: users sign up, enter their health basics, and get a day-by-day weekly workout plan for the gym, home or outdoors — with animated demos for 870+ exercises and a gym machine guide.

Live: https://aayush.revseek.in

## Stack
- Next.js 16 (App Router, TypeScript, Tailwind v4), exported as a **static site** (`out/`) for Hostinger.
- Supabase for auth (email + password, reset links) and data. Row-level security limits every table to its owner.
- Exercise data: [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public domain); images load from jsDelivr.

## Setup
```bash
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm run dev                  # http://localhost:3000
npm test                     # planner unit tests
npm run build                # static export to out/
```

## Structure
| Path | What |
|---|---|
| `src/app/` | Pages: landing, auth (`login`, `signup`, `forgot-password`, `reset-password`, `auth/confirm`), `onboarding`, `dashboard`, `plan`, `workout/[day]`, `exercises`, `exercises/[id]`, `gym-guide`, `progress`, `profile` |
| `src/lib/planner.ts` | Pure weekly-plan generator (split choice, slot-based exercise picking, sets/reps by goal, limitations, swaps) |
| `src/lib/data.ts` | Supabase reads/writes (profiles, workout_plans, workout_sessions, weight_logs) |
| `src/components/` | Auth context, app shell/nav, exercise demo, profile form sections, UI primitives |
| `public/data/exercises.json` | Trimmed exercise library, built by `scripts/prepare-exercises.py` |
| `supabase/migrations/` | Database schema (apply in order) |

## Deploy
`npm run build`, zip the contents of `out/` (including `.htaccess`) and deploy to aayush.revseek.in on Hostinger.

FITFUEL gives general fitness guidance, not medical advice.
