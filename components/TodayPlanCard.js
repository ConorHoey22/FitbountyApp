import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import ProgressRing from './ProgressRing';
import GlassButton from './GlassButton';

// Home buttons — bright blue with white text (tried: orange)
const BUTTON_BLUE = ['#2563EB', '#2563EB'];
const GLASS_BUTTON_TEXT = '#FFFFFF';
import UpdatePlanIndividualSelectionModal from './UpdatePlanIndividualSelectionModal';
import AddTodayPlanModal from './AddTodayPlanModal';
import XPRewardSuccessModal from './XPRewardSuccessModal';
import { getActivityDay, getWeeklyTotals } from '../utils/activityHistory';
import { font } from '../utils/fonts';


const { width } = Dimensions.get('window');



const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// ─── Palette — dark charcoal + soft lime (matches Home) ─────────
const TEXT = '#FFFFFF';          // headings / primary text
const STEPS_COLOR = '#06B6D4';   // cyan
const CARDIO_COLOR = '#F43F5E';  // rose
const WORKOUT_COLOR = '#F59E0B'; // amber
const DONE_COLOR = '#16A34A';    // green — goal reached
const ROW_BG = '#FFFFFF';        // inner rows — white, same as Home's Nutrition rows
const ROW_TEXT = '#000000';      // text on the white rows
const MUTED = '#9A9A9E';         // secondary text
const TODAY_GRADIENT = ['rgba(25,25,112,0.60)', 'rgba(25,25,112,0.60)']; // flat midnight blue, no gradient (was midnight blue gradient ['rgba(25,25,112,0.60)', 'rgba(15,23,72,0.35)', 'rgba(10,15,50,0.15)']; tried: orange → pink, teal → blue, green → teal, white → grey ['rgba(255,255,255,0.18)', 'rgba(200,200,205,0.07)', 'rgba(200,200,205,0)'])


export default function TodayPlanCard({ profile, onActivitySaved }) {
  const navigation = useNavigation();

  const [checks, setChecks] = useState({
    cardio: 0,
    steps: 0,
    gym: false,
  });

  const [todayPlan, setTodayPlan] = useState(null);

  // This week's totals, summed from daily_activity rows
  const [weeklyTotals, setWeeklyTotals] = useState({ steps: 0, cardio: 0, workouts: 0 });

  const [updateTodayPlanValuesModalVisible, SetUpdateTodayPlanValuesModalVisible] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  // New level to celebrate with the level-up popup (null = hidden)
  const [levelUp, setLevelUp] = useState(null);

  const todayName = daysOfWeek[new Date().getDay()];
  // A day can have a workout and cardio; older saved plans only have `type`
  const workoutToday = todayPlan?.workout ?? todayPlan?.type === 'Workout';

  const cardioGoal = todayPlan?.cardio || 0;
  const stepsGoal = todayPlan?.steps
    ? Math.round(todayPlan.steps / 7)
    : (profile.stepGoal || 0);
  const workoutGoal = workoutToday ? 1 : 0;

  // Has the user already hit their WEEKLY cardio goal (e.g. did it on a
  // rest day instead of their scheduled cardio day)? If so, today's
  // scheduled cardio target is no longer needed.
  const weeklyCardioTarget = profile.cardioGoal || 0;
  const weeklyCardioMet =
    weeklyCardioTarget > 0 &&
    weeklyTotals.cardio >= weeklyCardioTarget;

  // Same idea for workouts — if the weekly workout session goal is
  // already met, today's scheduled workout is no longer needed.
  const weeklyWorkoutTarget = profile.workoutSessionsGoal || 0;
  const weeklyWorkoutMet =
    weeklyWorkoutTarget > 0 &&
    weeklyTotals.workouts >= weeklyWorkoutTarget;

  // inside your Home screen component
const [updatePlanVisible, setUpdatePlanVisible] = useState(false);

  const cardioProgress = cardioGoal
    ? checks.cardio / cardioGoal
    : 0;

  // const safeSteps =
  //   typeof checks.steps === 'number'
  //     ? checks.steps
  //     : 0;


  const stepsProgress = stepsGoal
    ? checks.steps / stepsGoal
    : 0;

  const workoutProgress = workoutGoal
    ? checks.gym
      ? 1
      : 0
    : 0;

  const goals = [
    {
      title: 'Cardio',
      unitLabel: weeklyCardioMet ? 'Goal reached' : cardioGoal ? 'minutes' : 'Rest day',
      value: weeklyCardioMet
        ? '✓'
        : cardioGoal
          ? `${checks.cardio}/${cardioGoal}`
          : '—',
      progress: weeklyCardioMet ? 1 : cardioProgress,
      icon: weeklyCardioMet ? 'checkmark-circle' : 'heart',
      color: weeklyCardioMet || (cardioGoal && cardioProgress >= 1) ? DONE_COLOR : CARDIO_COLOR,
    },
    {
      title: 'Steps',
      unitLabel: 'Keep Moving!',
      value: `${checks.steps}/${stepsGoal}`, // exact numbers, no commas — matches This Week
      progress: stepsProgress,
      icon: 'footsteps',
      color: stepsGoal && stepsProgress >= 1 ? DONE_COLOR : STEPS_COLOR,
    },
    {
      title: 'Workout',
      unitLabel: weeklyWorkoutMet ? 'Goal reached' : workoutToday ? 'sessions' : 'Rest day',
      value: weeklyWorkoutMet
        ? '✓'
        : workoutToday
          ? `${checks.gym ? 1 : 0}/1`
          : '—',
      progress: weeklyWorkoutMet ? 1 : workoutProgress,
      icon: weeklyWorkoutMet ? 'checkmark-circle' : 'barbell',
      color: weeklyWorkoutMet || workoutProgress >= 1 ? DONE_COLOR : WORKOUT_COLOR,
    },
  ];

  useEffect(() => {
    const loadChecks = async () => {
      try {
        // Today's totals + this week's totals from daily_activity
        const [today, week] = await Promise.all([getActivityDay(), getWeeklyTotals()]);

        setChecks({
          cardio: today.cardio,
          steps: today.steps,
          gym: today.workouts > 0,
        });
        setWeeklyTotals(week);

        const json = await AsyncStorage.getItem('weeklyPlan');

        if (json) {
          const plan = JSON.parse(json);

          if (plan[todayName]) {
            setTodayPlan(plan[todayName]);
          }
        }
      } catch (error) {
        console.error('Error loading checks:', error);
      }
    };

    loadChecks();
  }, [todayName, refreshKey, profile]);

  return (
    <GlassCard style={styles.cardContainer} gradient={TODAY_GRADIENT}>

      {/* Header */}
      <View style={styles.cardHeader}>

        <View style={styles.cardHeaderLeft}>
          <View style={styles.cardHeaderIcon}>
            <Ionicons name="today" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.cardHeaderText}>Today's Plan</Text>
        </View>

        <GlassButton gradient={BUTTON_BLUE}
          style={styles.recordButton}
          onPress={() => SetUpdateTodayPlanValuesModalVisible(true)}
        >
          <Ionicons name="add" size={14} color={GLASS_BUTTON_TEXT} />
          <Text style={styles.recordButtonText}>Record Activity</Text>
        </GlassButton>

        </View>

      {/* Goals — one full-width row per metric */}
      <View style={styles.goalsList}>
        {goals.map((goal) => {
          const percent = Math.round(Math.min(goal.progress, 1) * 100);

          return (
            <View
              key={goal.title}
              style={[styles.goalRow, { borderColor: goal.color + '40' }]}
            >
              {/* Coloured icon circle (80% of the goal colour) */}
              <View style={[styles.goalRowIcon, { backgroundColor: goal.color + 'CC' }]}>
                <Ionicons name={goal.icon} size={18} color="#FFFFFF" />
              </View>

              <View style={styles.goalRowInfo}>
                <Text style={styles.goalRowTitle} numberOfLines={1}>{goal.title}</Text>
                <Text style={styles.goalRowUnit} numberOfLines={1}>
                  <Text style={[styles.goalRowValue, { color: ROW_TEXT }]}>{goal.value}</Text>
                  {'  ·  '}{goal.unitLabel}
                </Text>
              </View>

              <ProgressRing progress={percent / 100} color={goal.color} label={`${percent}%`} labelColor={ROW_TEXT} />
            </View>
          );
        })}
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>

        <GlassButton gradient={BUTTON_BLUE} style={styles.actionButtonOutline} onPress={() => setUpdatePlanVisible(true)}>
          <Ionicons name="options" size={16} color={GLASS_BUTTON_TEXT} style={styles.actionIcon} />
          <Text style={styles.actionTextOutline} numberOfLines={1} adjustsFontSizeToFit>
            Update Plan
          </Text>
        </GlassButton>

      </View>

      <AddTodayPlanModal
        visible={updateTodayPlanValuesModalVisible}
        onClose={() =>
          SetUpdateTodayPlanValuesModalVisible(false)
        }
        onSave={() => {
          setRefreshKey(prev => prev + 1); // refreshes TodayPlanCard locally
          if (onActivitySaved) onActivitySaved(); // refreshes Home
        }}
        onLevelUp={(level) => {
          // wait for the activity modal to finish closing — iOS can't present two modals at once
          setTimeout(() => setLevelUp(level), 500);
        }}
      />

      <XPRewardSuccessModal
        visible={levelUp !== null}
        level={levelUp}
        onClose={() => setLevelUp(null)}
      />

      <UpdatePlanIndividualSelectionModal
        visible={updatePlanVisible}
        onClose={() => setUpdatePlanVisible(false)}
        onSave={() => {
          setRefreshKey(prev => prev + 1); // refreshes TodayPlanCard locally
          if (onActivitySaved) onActivitySaved(); // refreshes Home
        }}
      />

    </GlassCard>
  );
}


const styles = StyleSheet.create({

  // ── Main Card ─────────────────────────────
  // Glass look + edge come from GlassCard
  cardContainer: {
    padding: 14,
  },

  // ── Header ────────────────────────────────
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  cardHeaderIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardHeaderText: {
    color: TEXT,
    fontSize: 17,
    ...font('700'),
    letterSpacing: 0.3,
  },

  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 4,
  },

  recordButtonText: {
    color: GLASS_BUTTON_TEXT,
    fontSize: 12,
    ...font('800'),
    letterSpacing: 0.3,
  },

  // ── Goals — one compact row per metric ──
  goalsList: {
    gap: 6,
    marginBottom: 12,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: ROW_BG,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  goalRowIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalRowInfo: {
    flex: 1,
    gap: 3,
  },
  goalRowTitle: {
    flexShrink: 1,
    color: ROW_TEXT,
    fontSize: 14,
    ...font('700'),
  },
  goalRowUnit: {
    color: ROW_TEXT,
    fontSize: 12,
    ...font('500'),
  },
  goalRowValue: {
    fontSize: 13,
    ...font('700'),
  },

  // ── Buttons ───────────────────────────────
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    paddingVertical: 9,
    paddingHorizontal: 8,
    gap: 5,
  },

  actionTextOutline: {
    color: GLASS_BUTTON_TEXT,
    fontSize: 12,
    ...font('800'),
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  actionIcon: {
    marginRight: 2,
  },
});