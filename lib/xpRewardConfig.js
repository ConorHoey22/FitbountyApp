// lib/xpRewardConfig.js

export const REWARD_TYPES = {
    workout: { xp: 50 },
    cardio: { xp: 50 },
    steps: { xp: 20 },
    weeklyWorkoutGoalMet: { xp: 150 },
    weeklyCardioGoalMet: { xp: 150 },
    weeklyStepGoalMet: { xp: 150 },
  };
  
  // Uncapped leveling, linear growth — each level costs a flat amount more
  // than the last, so it never snowballs into an unreachable grind.
  const BASE_XP_FOR_LEVEL_2 = 100;
  const XP_INCREASE_PER_LEVEL = 50; // each level costs 50 XP more than the previous level
  
  export const getLevelForXP = (xp) => {
    let level = 1;
    let xpForNext = BASE_XP_FOR_LEVEL_2;
    let xpAccumulated = 0;
  
    while (xp >= xpAccumulated + xpForNext) {
      xpAccumulated += xpForNext;
      level += 1;
      xpForNext += XP_INCREASE_PER_LEVEL;
    }
  
    return level;
  };
  
  // Gives level + progress within that level — matches what XPBar expects
  // (currentXP, levelXP, level)
  export const getLevelProgress = (xp) => {
    let level = 1;
    let xpForNext = BASE_XP_FOR_LEVEL_2;
    let xpAccumulated = 0;
  
    while (xp >= xpAccumulated + xpForNext) {
      xpAccumulated += xpForNext;
      level += 1;
      xpForNext += XP_INCREASE_PER_LEVEL;
    }
  
    return {
      level,
      currentXP: xp - xpAccumulated, // XP earned within this level
      levelXP: xpForNext,            // XP needed to complete this level
    };
  };