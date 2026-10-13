-- Workout planning and logging for the muscle-building app.

-- Extra onboarding fields on the existing profiles table.
alter table public.profiles
  add column if not exists training_days   text[] not null default '{}',  -- e.g. {mon,wed,fri}
  add column if not exists limitations     text[] not null default '{}',  -- e.g. {knee,lower_back}
  add column if not exists preferred_split text check (preferred_split in ('auto','full','upper_lower','ppl','bro')),
  add column if not exists favorite_exercises text[] not null default '{}';

alter table public.profiles drop constraint if exists profiles_goal_check;
alter table public.profiles add constraint profiles_goal_check check (goal in
  ('str','mus','lean','red','hea','spo','maintain','lose','gain','fitness','muscle','strength','fat_loss','general'));

-- One active plan per user; `plan` holds the generated week plus the user's swaps.
create table if not exists public.workout_plans (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  plan       jsonb not null,
  updated_at timestamptz not null default now()
);

-- A completed (or partly completed) session.
create table if not exists public.workout_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  performed_on date not null default current_date,
  day_key      text not null check (char_length(day_key) <= 10),
  title        text check (char_length(title) <= 80),
  exercises    jsonb not null default '[]',   -- [{id, name, sets:[{reps, kg, done}]}]
  duration_min smallint check (duration_min between 0 and 600),
  created_at   timestamptz not null default now()
);
create index if not exists workout_sessions_user_date_idx on public.workout_sessions (user_id, performed_on desc);

alter table public.workout_plans    enable row level security;
alter table public.workout_sessions enable row level security;

do $$
declare t text;
begin
  foreach t in array array['workout_plans','workout_sessions'] loop
    execute format('drop policy if exists "%1$s_select_own" on public.%1$s', t);
    execute format('drop policy if exists "%1$s_insert_own" on public.%1$s', t);
    execute format('drop policy if exists "%1$s_update_own" on public.%1$s', t);
    execute format('drop policy if exists "%1$s_delete_own" on public.%1$s', t);
    execute format('create policy "%1$s_select_own" on public.%1$s for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('create policy "%1$s_insert_own" on public.%1$s for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "%1$s_update_own" on public.%1$s for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "%1$s_delete_own" on public.%1$s for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end $$;
