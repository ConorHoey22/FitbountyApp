import { supabase } from '../lib/supabase';
import { getISOWeekKey } from '../utils/weekUtils'; // your existing ISO week helper

export const syncWeeklyWorkoutStats = async (userId) => {
  const { data: profile, error } = await supabase
    .from('userProfiles')
    .select('weeklyFitBkey, weeklyCardioCount , weeklyWorkoutCount')
    .eq('id', userId)
    .single();

  if (error || !profile) return null;

  const currentWeekKey = getISOWeekKey(new Date());

  // Week is current — just return the existing count
  if (profile.weekly_workout_key === currentWeekKey) {
    return profile.weekly_workout_count;
  }

  // Week is stale — reset count and update the key
  const { error: updateError } = await supabase
    .from('userProfiles')
    .update({
      weeklyWorkoutCount: 0,
      weeklyCardioCount: 0, 
      // weekly_step_count
      weeklyFitBKey: currentWeekKey,
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Failed to reset weekly workout count:', updateError);
    return null;
  }

  return 0;
};