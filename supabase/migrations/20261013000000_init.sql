-- FITFUEL initial schema: profiles, weight_logs, meal_plans (all RLS-protected).
-- Health data policy: only a boolean flag is stored; no diagnoses or notes.
-- Banner image (U.img data URL) is intentionally NOT stored here; use Storage later.

-- ---------- shared updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles ----------
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  name                text check (char_length(name) <= 80),
  profession          text check (char_length(profession) <= 80),
  age                 smallint check (age between 13 and 100),
  gender              text check (gender in ('m', 'f', 'x')),
  height_cm           numeric(5,1) check (height_cm between 50 and 260),
  weight_kg           numeric(5,1) check (weight_kg between 20 and 400),
  target_weight_kg    numeric(5,1) check (target_weight_kg between 20 and 400),
  start_weight_kg     numeric(5,1) check (start_weight_kg between 20 and 400),
  height_unit         text not null default 'cm' check (height_unit in ('cm', 'ft')),
  weight_unit         text not null default 'kg' check (weight_unit in ('kg', 'lbs')),
  goal                text check (goal in ('str', 'mus', 'lean', 'red', 'hea', 'spo', 'maintain', 'lose', 'gain', 'fitness')),
  activity_multiplier numeric(3,2) check (activity_multiplier between 1 and 2.5),
  level               text check (level in ('beg', 'int', 'adv')),
  workout_type        text check (char_length(workout_type) <= 40),
  days_per_week       smallint check (days_per_week between 1 and 7),
  week_start          text check (char_length(week_start) <= 20),
  workout_minutes     smallint check (workout_minutes between 5 and 300),
  workout_time        text check (char_length(workout_time) <= 20),
  place               text check (place in ('home', 'gym', 'out')),
  equipment           text[] not null default '{}',
  focus               text[] not null default '{}',              -- U.foc
  focus_key           text check (char_length(focus_key) <= 20), -- U.fk
  sub_focus           text check (char_length(sub_focus) <= 60), -- U.sub
  diet                text check (diet in ('veg', 'vegan', 'egg', 'nv')),
  daily_budget_inr    integer check (daily_budget_inr between 0 and 100000),
  meals_per_day       smallint check (meals_per_day between 1 and 8),
  cook_time           text check (char_length(cook_time) <= 20),
  allergies           text[] not null default '{}',
  liked_foods         text[] not null default '{}',
  has_health_condition boolean not null default false,           -- flag only, no details
  theme               text check (theme in ('light', 'dark')),
  onboarded           boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "profiles_delete_own" on public.profiles
  for delete to authenticated using (id = (select auth.uid()));

-- Auto-create an empty profile row for each new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- weight_logs ----------
create table public.weight_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  logged_on  date not null default current_date,
  weight_kg  numeric(5,1) not null check (weight_kg between 20 and 400),
  created_at timestamptz not null default now(),
  unique (user_id, logged_on)  -- also serves as the user_id FK index
);

alter table public.weight_logs enable row level security;

create policy "weight_logs_select_own" on public.weight_logs
  for select to authenticated using (user_id = (select auth.uid()));
create policy "weight_logs_insert_own" on public.weight_logs
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "weight_logs_update_own" on public.weight_logs
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "weight_logs_delete_own" on public.weight_logs
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------- meal_plans ----------
create table public.meal_plans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  plan       jsonb not null,
  created_at timestamptz not null default now()
);
create index meal_plans_user_id_created_at_idx
  on public.meal_plans (user_id, created_at desc);

alter table public.meal_plans enable row level security;

create policy "meal_plans_select_own" on public.meal_plans
  for select to authenticated using (user_id = (select auth.uid()));
create policy "meal_plans_insert_own" on public.meal_plans
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "meal_plans_update_own" on public.meal_plans
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "meal_plans_delete_own" on public.meal_plans
  for delete to authenticated using (user_id = (select auth.uid()));
