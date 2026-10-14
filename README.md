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

## Deploy to Hostinger
The GitHub Actions workflow in `.github/workflows/deploy-hostinger.yml` runs lint, tests and a static export for pull requests and pushes to `main`. A successful push to `main` (or a manual run on `main`) also deploys `out/` to Hostinger over FTPS. Pull requests and other branches are never deployed.

Configure these in the GitHub repository under **Settings → Secrets and variables → Actions**:

**Repository variables** (the Supabase URL and publishable key are public build-time values):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `HOSTINGER_FTP_SERVER_DIR` — the website's document-root directory as seen by the FTP account, ending in `/`. Use `./` if logging into FTP opens the website root directly; use `public_html/` only if you first need to open a `public_html` folder.

**Repository secrets**:
- `HOSTINGER_FTP_SERVER` — the FTP host from Hostinger
- `HOSTINGER_FTP_USERNAME`
- `HOSTINGER_FTP_PASSWORD`

Create an FTP account in Hostinger if needed and make sure it has access to the configured website directory. Once the settings are saved, merge or push changes to `main`; deployment runs only after all checks and the static build succeed. To deploy manually, use **Actions → Build and deploy to Hostinger → Run workflow** on `main`.

FITFUEL gives general fitness guidance, not medical advice.
