import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import TrackerBar from '../components/TrackerBar'; // your progress bar

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
      if (saved) {
        setChecks(JSON.parse(saved));
      }
      const json = await AsyncStorage.getItem('weeklyPlan');
      if (json) {
        const plan = JSON.parse(json);
        if (plan[todayName]) {
          setTodayPlan(plan[todayName]);
          console.log('Loaded todayPlan:', todayName, plan[todayName]);
        }
      }
    };
  
    loadChecks(); // call it
  }, []);

  // 🔹 Daily goals from profile (Supabase)
  const cardioGoal = todayPlan?.cardio;
  const stepsGoal =  todayPlan?.steps;
  const workoutGoal = todayPlan?.type === 'Workout' ? 1 : 0;

  // 🔹 Progress values
  const cardioProgress = cardioGoal > 0 ? Math.min(checks.cardio / cardioGoal, 1) : 0;
  const stepsProgress = stepsGoal > 0 ? Math.min(checks.steps / stepsGoal, 1) : 0;
  const workoutProgress = workoutGoal > 0 ? (checks.gym ? 1 : 0) : 0;

  return (
    <View style={styles.card}>
      {/* Today's Title */}
      <Text style={styles.sectionTitle}>{todayName} Plan</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          {/* Cardio */}
          <Text style={styles.statValue}>
            Cardio: {checks.cardio} / {cardioGoal} mins
          </Text>
          <View style={styles.trackerWrap}>
            <TrackerBar progress={cardioProgress} />
          </View>

          {/* Steps */}
          <Text style={styles.statValue}>
            Steps: {checks.steps} / {profile.stepGoal}
          </Text>
          <View style={styles.trackerWrap}>
            <TrackerBar progress={stepsProgress} />
          </View>

     
      {/* Workout */}
      {workoutToday ? (
        <Text style={styles.statValue}>
          Workout: {checks.gym ? 1 : 0} / 1
        </Text>
      ) : (
        <Text style={[styles.statValue, styles.restDay]}>
          No Workouts Today 
        </Text>
      )}





        </View>
      </View>

      {/* Button to full plan */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('PlanYourWeekScreen')}
      >
        <Text style={styles.buttonText}>View Weekly Plan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 6,
  },
  trackerWrap: {
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
