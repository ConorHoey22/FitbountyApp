-- Custom workouts — run once in the Supabase SQL editor.
--
-- user_workouts           one row per custom workout
-- user_workout_exercises  the exercises in it (deleted with the workout)
--
-- PRs and logs are NOT linked to these tables (they match on exercise_name),
-- so deleting a custom workout keeps all of its exercise_logs / personal_records.

create table if not exists public.user_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  workout_name text not null check (length(trim(workout_name)) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (user_id, workout_name)
);

create table if not exists public.user_workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.user_workouts(id) on delete cascade,
  position int not null,
  exercise_name text not null check (length(trim(exercise_name)) between 1 and 60),
  sets int not null check (sets between 1 and 20),
  reps text not null,
  rest_timer int not null default 120 check (rest_timer between 0 and 900)
);

create index if not exists user_workout_exercises_workout_id_idx
  on public.user_workout_exercises (workout_id);

-- ── Row level security: users only see / change their own ───────────────────
alter table public.user_workouts enable row level security;
alter table public.user_workout_exercises enable row level security;

drop policy if exists "own workouts" on public.user_workouts;
create policy "own workouts" on public.user_workouts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own workout exercises" on public.user_workout_exercises;
create policy "own workout exercises" on public.user_workout_exercises
  for all
  using (exists (select 1 from public.user_workouts w where w.id = workout_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.user_workouts w where w.id = workout_id and w.user_id = auth.uid()));

-- ── Cap: 7 custom workouts per user ──────────────────────────────────────────
-- Matches MAX_CUSTOM_WORKOUTS in utils/customWorkouts.js. When membership is
-- added, raise the limit here for members (e.g. look up their plan).
create or replace function public.enforce_custom_workout_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.user_workouts where user_id = new.user_id) >= 7 then
    raise exception 'CUSTOM_WORKOUT_LIMIT';
  end if;
  return new;
end;
$$;

drop trigger if exists custom_workout_limit on public.user_workouts;
create trigger custom_workout_limit
  before insert on public.user_workouts
  for each row execute function public.enforce_custom_workout_limit();
