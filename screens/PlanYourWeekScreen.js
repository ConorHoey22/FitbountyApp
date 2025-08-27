import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import XPBar from '../components/XPBar'; // adjust path if needed

export default function PlanYourWeekScreen() {

  const navigation = useNavigation();

  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday ...

  const days = [
    { id: 1, name: 'Monday', description: 'Workout', cardio: 10, stepCount: 10000, icon: 'barbell' },
    { id: 2, name: 'Tuesday', description: 'Busy Day (Rest)', cardio: 30, stepCount: 300, icon: 'bed' },
    { id: 3, name: 'Wednesday', description: 'Golf', cardio: 10, stepCount: 11000, icon: 'flag-outline' },
    { id: 4, name: 'Thursday', description: 'Workout', cardio: 10, stepCount: 2820, icon: 'barbell' },
    { id: 5, name: 'Friday', description: 'Workout', cardio: 40, stepCount: 2810, icon: 'barbell' },
    { id: 6, name: 'Saturday', description: 'Workout', cardio: 10, stepCount: 2820, icon: 'barbell' },
    { id: 0, name: 'Sunday', description: 'Visiting a Friend', cardio: 10, stepCount: 2820, icon: 'people' },
  ];

  // weekly summary
  const totalSteps = days.reduce((acc, d) => acc + d.stepCount, 0);
  const totalCardio = days.reduce((acc, d) => acc + d.cardio, 0);
  const workoutDays = days.filter(d => d.description.includes('Workout')).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Plan</Text>
      <Text style={styles.subtitle}>Fail to plan, plan to fail!</Text>
      
        <TouchableOpacity style={styles.daysButton} onPress={() => navigation.navigate('CreateMyPlan')}>
          <Text style={styles.recordButtonText}>Plan your Week</Text>
        </TouchableOpacity>


      {/* Weekly Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Total Steps: {totalSteps.toLocaleString()}</Text>
        <Text style={styles.summaryText}>Cardio Minutes: {totalCardio}</Text>
        <Text style={styles.summaryText}>Workout Days: {workoutDays}</Text>
      </View>

      {/* XP Progress at Top */}
      <XPBar currentXP={350} levelXP={500} level={3} />

      <ScrollView style={styles.daysList} showsVerticalScrollIndicator={false}>
        {days.map((day) => {
          const isToday = today === day.id;

          return (
            <TouchableOpacity
              key={day.id}
              style={[styles.daysCard, isToday && styles.todayHighlight]}
            >
              <View style={styles.iconWrapper}>
                <Ionicons name={day.icon} size={28} color="#4CAF50" />
              </View>

              <View style={styles.daysInfo}>
                <Text style={styles.daysName}>{day.name}</Text>
                <Text style={styles.daysDetails}>
                  {day.description} - {day.cardio} mins
                </Text>
                <Text style={styles.progressText}>
                  Steps: {day.stepCount.toLocaleString()}
                </Text>
              </View>

              <View style={styles.daysButton}>
                <Text style={styles.daysButtonText}>View</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  daysList: {
    flex: 1,
  },
  daysCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  todayHighlight: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  iconWrapper: {
    marginRight: 15,
  },
  daysInfo: {
    flex: 1,
  },
  daysName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  daysDetails: {
    fontSize: 14,
    color: '#666',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  daysButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  daysButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});