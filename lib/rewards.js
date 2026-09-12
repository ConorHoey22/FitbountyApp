// lib/rewards.js
import { supabase } from './supabase';
import { REWARD_TYPES, getLevelForXP } from './xpRewardConfig';

const adjustTotalXP = async (delta) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: profile, error: fetchError } = await supabase
    .from('userProfiles')
    .select('totalXP')
    .eq('id', session.user.id)
    .single();

  if (fetchError) {
    console.error('adjustTotalXP fetch error:', fetchError.message);
    return null;
  }

  const previousXP = profile?.totalXP || 0;
  const newXP = Math.max(0, previousXP + delta);

  const { error: updateError } = await supabase
    .from('userProfiles')
    .update({ totalXP: newXP })
    .eq('id', session.user.id);

  if (updateError) {
    console.error('adjustTotalXP update error:', updateError.message);
    return null;
  }

  return { previousXP, newXP };
};

// Adds XP for a given activity type — e.g. awardXP('workout')
export const awardXP = async (type) => {
  const config = REWARD_TYPES[type];
  if (!config) {
    console.error(`Unknown reward type: ${type}`);
    return { success: false };
  }

  const result = await adjustTotalXP(config.xp);
  if (!result) return { success: false };

  const previousLevel = getLevelForXP(result.previousXP);
  const newLevel = getLevelForXP(result.newXP);

  return {
    success: true,
    xpChanged: config.xp,
    newXP: result.newXP,
    leveledUp: newLevel > previousLevel,
    newLevel,
  };
};

// Reverses XP for a given activity type — e.g. removeXP('workout') if a
// logged workout gets deleted or was added by mistake
export const removeXP = async (type) => {
  const config = REWARD_TYPES[type];
  if (!config) {
    console.error(`Unknown reward type: ${type}`);
    return { success: false };
  }

  const result = await adjustTotalXP(-config.xp);
  if (!result) return { success: false };

  return {
    success: true,
    xpChanged: -config.xp,
    newXP: result.newXP,
  };
};

// For reward redemption — spends a raw XP amount, not tied to a type
export const spendXP = async (amount) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { success: false };

  const { data: profile, error: fetchError } = await supabase
    .from('userProfiles')
    .select('totalXP')
    .eq('id', session.user.id)
    .single();

  if (fetchError) {
    console.error('spendXP fetch error:', fetchError.message);
    return { success: false };
  }

  const currentXP = profile?.totalXP || 0;
  if (currentXP < amount) {
    return { success: false, reason: 'insufficient_xp' };
  }

  const newXP = currentXP - amount;

  const { error: updateError } = await supabase
    .from('userProfiles')
    .update({ totalXP: newXP })
    .eq('id', session.user.id);

  if (updateError) {
    console.error('spendXP update error:', updateError.message);
    return { success: false };
  }

  return { success: true, newXP };
};