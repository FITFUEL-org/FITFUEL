# FITFUEL and Supabase

The schema lives in `supabase/migrations/20261013000000_init.sql`. It creates `profiles`,
`weight_logs` and `meal_plans`. All three use RLS, so users can only touch their own rows.
A trigger creates an empty `profiles` row when a user signs up.

## Apply the migration

Option A, CLI:

```
supabase login            # or set SUPABASE_ACCESS_TOKEN in your OS environment
supabase link --project-ref xbyoaxsrotjljcxztavd
supabase db push
```

Option B: open the project's SQL editor, paste the migration file and run it.

Note: `.env.example` points at `hklsplxzamumwmtsxyxu.supabase.co`, but the ref above is
`xbyoaxsrotjljcxztavd`. Make sure the URL in `.env` and the linked project are the same project.

## Client config

1. Dashboard > Project Settings > API: copy the Project URL and the `anon` (publishable) key.
2. Put them in `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Add the dependency: `npm i @supabase/supabase-js`.

If the variables are missing, `src/lib/supabase.js` exports `null` and the app stays local-only.

## Enable email OTP

Dashboard > Authentication > Providers > Email: enable it. In Authentication > Email Templates
(Magic Link and Confirm signup), include `{{ .Token }}` so users get a 6-digit code instead of a
link. Set the Site URL and Redirect URLs under Authentication > URL Configuration (local dev URL
and production URL).

## Security notes

- The anon key is public by design; RLS is what protects the data. Never ship the `service_role` key.
- `SUPABASE_ACCESS_TOKEN` is a personal token. Keep it in the OS environment only. If it was ever
  written to a file or committed, revoke it and create a new one.
- Health data: only the boolean `has_health_condition` is stored. Do not add diagnosis fields.
- The banner image (`U.img`, a data URL) is not stored in any table. A private Storage bucket with
  per-user folder policies can be added later; store only the object path in `profiles`.
- Daily trackers (`U.dn` workouts done, `U.wt` water, `U.sl` sleep) are not in this schema yet.
- `handle_new_user` is `security definer` with an empty `search_path`, and execute is revoked from API roles.
