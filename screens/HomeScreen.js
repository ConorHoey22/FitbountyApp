import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import XPBar from '../components/XPBar';

export default function HomeScreen() {
  
  
  const navigation = useNavigation();

  const testuser = { 
    stepsGoal: 10000,
    cardioGoal: 220,
    workoutGoal: 4

  };

  const stats = [
    { label: 'Steps' , value: '8,432', unit: 'steps' },
    { label: 'Active Minutes', value: '45', unit: 'min' },
  ];

  // Nutrition targets (intake, not burned)
  const nutrition = {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fats: 70,
  };



  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Welcome to FitBounty!</Text>
        <Text style={styles.subtitle}>Your fitness journey starts here</Text>
        
          {/* XP Bar Component */}
          <XPBar currentXP={350} levelXP={500} level={3} />

          <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>0 / {testuser.cardioGoal}</Text>
                <Text style={styles.statUnit}>Minutes</Text>
                <Text style={styles.statLabel}>Cardio</Text>
              </View>
          </View>

          <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>0 / {testuser.stepsGoal}</Text>
                <Text style={styles.statUnit}>Steps</Text>
              </View>
          </View>



          <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>0 / {testuser.workoutGoal}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
          </View>
        

        {/* Nutrition Overview */}
        <View style={styles.nutritionContainer}>
          <Text style={styles.sectionTitle}>Nutrition Overview</Text>
          
          <View style={styles.nutritionCard}>
            <Text style={styles.caloriesValue}>{nutrition.calories}</Text>
            <Text style={styles.caloriesLabel}>Calories</Text>
          </View>

          <View style={styles.macrosRow}>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{nutrition.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{nutrition.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{nutrition.fats}g</Text>
              <Text style={styles.macroLabel}>Fats</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CreateMyPlan')}>
            <Text style={styles.actionButtonText}>Start Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={() => navigation.navigate('WeightTrackerScreen')}>
            <Text style={styles.secondaryButtonText}>View Progress</Text>
          </TouchableOpacity>
        </View>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statUnit: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  nutritionContainer: {
    marginBottom: 30,
  },
  nutritionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  caloriesValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#666',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 1,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
  },
  macroLabel: {
    fontSize: 12,
    color: '#333',
  },
  quickActions: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
});