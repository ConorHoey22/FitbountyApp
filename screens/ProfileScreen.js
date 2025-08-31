import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import XPTrophyCount from '../components/XPTrophyCount';
import ContainerCard from '../components/ContainerCard';

const screenWidth = Dimensions.get('window').width;

export default function ProfileScreen() {



  const navigation = useNavigation();

  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [username] = useState('Conor');

  useEffect(() => {
    // Mock test data (replace with Supabase later)
    setWeeklyData([
      { date: '2025-08-18', steps: 8200 },
      { date: '2025-08-19', steps: 10200 },
      { date: '2025-08-20', steps: 6500 },
      { date: '2025-08-21', steps: 12000 },
      { date: '2025-08-22', steps: 7800 },
      { date: '2025-08-23', steps: 9500 },
      { date: '2025-08-24', steps: 5000 },
    ]);

    setMonthlyData([
      { month_start: '2025-05-01', total_steps: 280000 },
      { month_start: '2025-06-01', total_steps: 300000 },
      { month_start: '2025-07-01', total_steps: 325000 },
      { month_start: '2025-08-01', total_steps: 310000 },
    ]);
  }, []);

  return (
    <ScrollView style={styles.container}>
   
      {/* Profile Header */}

      <View style={styles.headerRow}>
      {/* Left column: Avatar + Greeting */}
      <View style={styles.leftColumn}>
        <View style={styles.circle}>
          <Ionicons name="person" size={30} color="#fff" />
        </View>
        <Text style={styles.greeting}>Hi {username}!</Text>
      </View>

      {/* Right column: XP */}
      <View style={styles.rightColumn}>
        <XPTrophyCount />
      </View>
    </View>
    

      

  

  <ContainerCard>
    <View style={styles.quickActions}>
     <TouchableOpacity style={styles.actionCard}>
      <Ionicons name="walk" size={24} color="#4CAF50" />
      <Text style={styles.actionText}>Update Steps</Text>
      </TouchableOpacity>

    <TouchableOpacity 
      style={styles.actionCard} 
      onPress={() => navigation.navigate('WeightTrackerScreen')}
    >
      <Ionicons name="fitness" size={24} color="#4CAF50" />
      <Text style={styles.actionText}>Track Weight</Text>
    </TouchableOpacity>
  </View>
</ContainerCard>

      {/* Weekly Steps Chart */}
      <Text style={styles.sectionTitle}>Steps This Week</Text>
      {weeklyData.length > 0 && (
        <BarChart
          data={{
            labels: weeklyData.map(d =>
              new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short' })
            ),
            datasets: [{ data: weeklyData.map(d => d.steps) }],
          }}
          width={screenWidth - 30}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      )}

      {/* Monthly Steps Chart */}
      <Text style={styles.sectionTitle}>Monthly Steps</Text>
      {monthlyData.length > 0 && (
        <LineChart
          data={{
            labels: monthlyData.map(m =>
              new Date(m.month_start).toLocaleDateString('en-GB', { month: 'short' })
            ),
            datasets: [{ data: monthlyData.map(m => m.total_steps) }],
          }}
          width={screenWidth - 30}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      )}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // green theme
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: '#4CAF50',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop:65,
    backgroundColor: '#f8f9fa',
  },
  
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  leftColumn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightColumn: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#f0fdf4', // light green background
    paddingVertical: 20,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  
});