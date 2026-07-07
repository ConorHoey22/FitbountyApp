import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import AddTodayPlanModal from './AddTodayPlanModal';
import TrackerBar from '../components/TrackerBar';
import EditWeeklyActivityModal from './EditWeeklyStatsModal';

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

// ─── Palette ─────────────────────────────────────────────────────
const ACCENT = '#C6F135';
const CARD_BG = '#22222E';
const GOAL_OUT = '#2C2C3C';
const GOAL_IN = '#252532';
const BORDER = '#42425A';

export default function TodayPlanCard({ profile, onActivitySaved }) {
  const navigation = useNavigation();

  const [checks, setChecks] = useState({
    cardio: 0,
    steps: 0,
    gym: false,
  });

  const [todayPlan, setTodayPlan] = useState(null);

  const [updateTodayPlanValuesModalVisible, SetUpdateTodayPlanValuesModalVisible] = useState(false);
  const [editWeeklyActivityValuesModalVisible, SetEditWeeklyActivityValuesModalVisible] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const todayName = daysOfWeek[new Date().getDay()];
  const workoutToday = todayPlan?.type === 'Workout';

  const cardioGoal = todayPlan?.cardio || 0;
  const stepsGoal = todayPlan?.steps || profile.stepGoal;
  const workoutGoal = workoutToday ? 1 : 0;

  const cardioProgress = cardioGoal
    ? checks.cardio / cardioGoal
    : 0;

  const safeSteps =
    typeof checks.steps === 'number'
      ? checks.steps
      : 0;

  const stepsProgress = stepsGoal
    ? safeSteps / stepsGoal
    : 0;

  const workoutProgress = workoutGoal
    ? checks.gym
      ? 1
      : 0
    : 0;

  const goals = [
    {
      title: 'CARDIO',
      value: cardioGoal
        ? `${checks.cardio}/${cardioGoal} min`
        : 'Rest',
      progress: cardioProgress,
      icon: 'heart-outline',
    },
    {
      title: 'STEPS',
      value: `${safeSteps.toLocaleString()}/${stepsGoal.toLocaleString()}`,
      progress: stepsProgress,
      icon: 'footsteps-outline',
    },
    {
      title: 'WORKOUT',
      value: workoutToday
        ? `${checks.gym ? 1 : 0}/1`
        : 'Rest',
      progress: workoutProgress,
      icon: 'barbell-outline',
    },
  ];

  useEffect(() => {
    const loadChecks = async () => {
      try {
        const saved = await AsyncStorage.getItem('todayChecks');

        if (saved) {
          const parsed = JSON.parse(saved);

          setChecks({
            cardio: Number(parsed.cardio) || 0,
            steps: Number(parsed.steps) || 0,
            gym: Boolean(parsed.gym),
          });
        }

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
  }, [todayName, refreshKey]);

  return (
    <View style={styles.cardContainer}>

      {/* Header */}
      <View style={styles.cardHeader}>

        <View style={styles.cardHeaderLeft}>
          <Ionicons name="today-outline" size={16} color={ACCENT} />
          <Text style={styles.cardHeaderText}>Today's Plan</Text>
        </View>

        <TouchableOpacity
          style={styles.recordButton}
          onPress={() => SetUpdateTodayPlanValuesModalVisible(true)}
        >
          <Ionicons name="add-outline" size={14} color="#0E0E12" />
          <Text style={styles.recordButtonText}>Record Activity</Text>
        </TouchableOpacity>

        </View>

      {/* Goals */}
      <View style={styles.goalsRow}>
        {goals.map((goal, index) => (
          <View key={index} style={styles.goalOuter}>
            <View style={styles.goalInner}>

              <View style={styles.goalIcon}>
                <Ionicons
                  name={goal.icon}
                  size={18}
                  color={ACCENT}
                />
              </View>

              <Text style={styles.goalTitle}>
                {goal.title}
              </Text>

              <Text style={styles.goalValue}>
                {goal.value}
              </Text>

              <TrackerBar
                size={52}
                strokeWidth={5}
                currentAmount={goal.progress}
                totalAmount={1}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
    
    <TouchableOpacity
      style={styles.actionButton}
      onPress={() => navigation.navigate('PlanYourWeekScreen')}>

      <View style={styles.actionContent}>
        <Ionicons name="options-outline" size={18} color={CARD_BG} style={styles.actionIcon} />
        <Text style={styles.actionText}>Update Plan</Text>
      </View>

    </TouchableOpacity>


        <TouchableOpacity
          style={styles.actionButtonOutline}
          onPress={() => SetEditWeeklyActivityValuesModalVisible(true)}
        >
        <Ionicons name="create-outline" size={18} color={ACCENT} />
        <Text style={styles.actionTextOutline}>Edit Week</Text>
      </TouchableOpacity>

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
      />


      <EditWeeklyActivityModal
        visible={editWeeklyActivityValuesModalVisible}
        onClose={() =>
          SetEditWeeklyActivityValuesModalVisible(false)
        }
        onSave={() => {
          setRefreshKey(prev => prev + 1);
          if (onActivitySaved) onActivitySaved();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({

  // ── Main Card ─────────────────────────────
  cardContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    width: width * 0.95,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 10,
  },

  // ── Header ────────────────────────────────
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  cardHeaderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  addButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
  
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  
  recordButtonText: {
    color: '#0E0E12',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── Goals ─────────────────────────────────
  goalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  goalOuter: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 14,
    backgroundColor: GOAL_OUT,
    borderWidth: 1.5,
    borderColor: BORDER,
    overflow: 'hidden',
  },

  goalInner: {
    backgroundColor: GOAL_IN,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },

  goalIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: ACCENT + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  goalTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  goalValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },

  // ── Buttons ───────────────────────────────
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: ACCENT,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 5,

    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },

  actionText: {
    color: '#0E0E12',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ACCENT + '66',
    gap: 5,
  },

  actionTextOutline: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // remove if you want left-aligned
  },
  actionIcon: {
    marginRight: 6,
  },
});