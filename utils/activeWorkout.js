import AsyncStorage from '@react-native-async-storage/async-storage';

// The workout in progress — kept in AsyncStorage so the user can leave
// Workout Mode (switch tabs, or even close the app) and come back to the
// same sets, reps, weights and timer. Cleared when the workout is saved.
//
// { workoutName, exercises, completedSets, enteredWeight, enteredReps, startedAt }
const ACTIVE_WORKOUT_KEY = 'activeWorkoutSession';

export const getActiveWorkout = async () => {
  const json = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);
  return json ? JSON.parse(json) : null;
};

export const saveActiveWorkout = (session) =>
  AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(session));

export const clearActiveWorkout = () => AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
