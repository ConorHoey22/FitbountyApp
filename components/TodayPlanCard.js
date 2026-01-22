import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import TrackerBar from '../components/TrackerBar'; // your CIRCLE tracker

const daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function TodayPlanCard({ profile }) {
  const navigation = useNavigation();
  const [checks, setChecks] = useState({ cardio: 0, steps: 0, gym: false });
  const [todayPlan, setTodayPlan] = useState(null);

  const todayName = daysOfWeek[new Date().getDay()];
  const workoutToday = todayPlan?.type === 'Workout';

  useEffect(() => {
    const loadChecks = async () => {
      const saved = await AsyncStorage.getItem(`checks_${todayName}`);
      if (saved) setChecks(JSON.parse(saved));

      const json = await AsyncStorage.getItem('weeklyPlan');
      if (json) {
        const plan = JSON.parse(json);
        if (plan[todayName]) setTodayPlan(plan[todayName]);
      }
    };
  
    loadChecks();
  }, []);

  const cardioGoal = todayPlan?.cardio || 0;
  const stepsGoal = todayPlan?.steps || profile.stepGoal;
  const workoutGoal = workoutToday ? 1 : 0;

  const cardioProgress = cardioGoal ? checks.cardio / cardioGoal : 0;
  const stepsProgress = stepsGoal ? checks.steps / stepsGoal : 0;
  const workoutProgress = workoutGoal ? (checks.gym ? 1 : 0) : 0;

  return (
    <View style={styles.cardContainer}>

      {/* CARDIO */}
      <View style={styles.rowCard}>
        <View style={styles.leftSide}>
          <Text style={styles.goalTitle}>Cardio</Text>
          <Text style={styles.goalValue}>
            {cardioGoal ? `${checks.cardio} / ${cardioGoal} mins` : 'Rest Day'}
          </Text>
        </View>

        <TrackerBar
          size={45}
          strokeWidth={5}
          currentAmount={cardioProgress}
          totalAmount={cardioGoal}
        />
      </View>

      {/* STEPS */}
      <View style={styles.rowCard}>
        <View style={styles.leftSide}>
          <Text style={styles.goalTitle}>Steps</Text>
          <Text style={styles.goalValue}>
            {checks.steps} / {stepsGoal}
          </Text>
        </View>

        <TrackerBar
          size={45}
          strokeWidth={5}
          currentAmount={stepsProgress}
          totalAmount={stepsGoal}
        />
      </View>

      {/* WORKOUT */}
      <View style={styles.rowCard}>
        <View style={styles.leftSide}>
          <Text style={styles.goalTitle}>Workout</Text>
          <Text style={styles.goalValue}>
            {workoutToday ? `${checks.gym ? 1 : 0} / 1` : 'Rest Day'}
          </Text>
        </View>

        <TrackerBar
          size={45}
          strokeWidth={5}
          currentAmount={workoutProgress}
          totalAmount={workoutGoal}
          
        />
      </View>

      {/* BUTTONS */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('PlanYourWeekScreen')}
      >
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.actionText}>Update Plan</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('PlanYourWeekScreen')}
      >
        <Ionicons name="calendar-outline" size={20} color="#fff" />
        <Text style={styles.actionText}>View Weekly Plan</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  rowCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftSide: {
    flexDirection: 'column',
  },

  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },

  goalValue: {
    fontSize: 14,
    color: '#CBD5E1',
    marginTop: 2,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 6,
  },

  actionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
