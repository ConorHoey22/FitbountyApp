import { supabase } from '../lib/supabase';

// The user's own workouts — Supabase tables `user_workouts` and
// `user_workout_exercises` (see supabase/custom_workouts.sql).
//
// Exercises are returned in the same shape as `tempWorkouts` rows
// ({ id, exercise_name, sets, reps, rest_timer }) so Workout Mode treats
// custom and template workouts the same. PRs match on exercise_name, so a
// custom "Bench Press" shares PRs with the template "Bench Press".

// Free limit — more will be a membership feature. Also enforced in the DB
// (trigger in supabase/custom_workouts.sql), so keep both in sync.
export const MAX_CUSTOM_WORKOUTS = 7;

// [{ id, workout_name, exercises: [{ id, exercise_name, sets, reps, rest_timer }] }], oldest first
export const getCustomWorkouts = async () => {
  const { data, error } = await supabase
    .from('user_workouts')
    .select('id, workout_name, created_at, user_workout_exercises(id, position, exercise_name, sets, reps, rest_timer)')
    .order('created_at');

  if (error) throw error;
  return (data || []).map((w) => ({
    id: w.id,
    workout_name: w.workout_name,
    exercises: [...(w.user_workout_exercises || [])]
      .sort((a, b) => a.position - b.position)
      .map(({ position, ...ex }) => ex),
  }));
};

// exercises: [{ exercise_name, sets, reps, rest_timer }] in order
export const createCustomWorkout = async (workoutName, exercises) => {
  const { data: workout, error } = await supabase
    .from('user_workouts')
    .insert({ workout_name: workoutName.trim() })
    .select('id')
    .single();

  if (error) {
    if (error.message?.includes('CUSTOM_WORKOUT_LIMIT')) {
      throw new Error(`You can save up to ${MAX_CUSTOM_WORKOUTS} custom workouts. Delete one to add another.`);
    }
    if (error.code === '23505') throw new Error('You already have a workout with that name.');
    throw error;
  }

  const rows = exercises.map((ex, i) => ({
    workout_id: workout.id,
    position: i,
    exercise_name: ex.exercise_name.trim(),
    sets: ex.sets,
    reps: String(ex.reps).trim(),
    rest_timer: ex.rest_timer,
  }));

  const { error: exError } = await supabase.from('user_workout_exercises').insert(rows);
  if (exError) {
    // Don't leave an empty workout behind
    await supabase.from('user_workouts').delete().eq('id', workout.id);
    throw exError;
  }

  return workout.id;
};

// Every exercise name already in use — template workouts (tempWorkouts) plus the
// user's custom workouts — sorted A–Z. Picking from these keeps names identical,
// so PRs (which match on exercise_name) carry over.
export const getExerciseNames = async () => {
  const [{ data: templates, error }, custom] = await Promise.all([
    supabase.from('tempWorkouts').select('exercise_name').not('exercise_name', 'is', null),
    getCustomWorkouts().catch(() => []),
  ]);
  if (error) throw error;

  const names = [
    ...(templates || []).map((r) => r.exercise_name),
    ...custom.flatMap((w) => w.exercises.map((ex) => ex.exercise_name)),
  ];

  // Unique, ignoring case/spaces — first spelling wins
  const byKey = new Map();
  names.forEach((n) => {
    const name = (n || '').trim();
    const key = name.toLowerCase();
    if (name && !byKey.has(key)) byKey.set(key, name);
  });
  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
};

// Deletes the workout and its exercises (logs and PRs are kept)
export const deleteCustomWorkout = async (workoutId) => {
  const { error } = await supabase.from('user_workouts').delete().eq('id', workoutId);
  if (error) throw error;
};
