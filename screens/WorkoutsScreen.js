import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function WorkoutsScreen() {
  const workouts = [
    { id: 1, name: 'Morning Cardio', duration: '30 min', calories: 250 },
    { id: 2, name: 'Strength Training', duration: '45 min', calories: 300 },
    { id: 3, name: 'Yoga Session', duration: '20 min', calories: 120 },
    { id: 4, name: 'HIIT Workout', duration: '25 min', calories: 280 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workouts</Text>
      <Text style={styles.subtitle}>Track your fitness activities</Text>
      
      <ScrollView style={styles.workoutList} showsVerticalScrollIndicator={false}>
        {workouts.map((workout) => (
          <TouchableOpacity key={workout.id} style={styles.workoutCard}>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutDetails}>
                {workout.duration} • {workout.calories} cal
              </Text>
            </View>
            <View style={styles.workoutButton}>
              <Text style={styles.workoutButtonText}>Start</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  workoutList: {
    flex: 1,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  workoutDetails: {
    fontSize: 14,
    color: '#666',
  },
  workoutButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  workoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});