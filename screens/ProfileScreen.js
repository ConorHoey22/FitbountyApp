import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity,
  StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import XPTrophyCount from '../components/XPTrophyCount';

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Natural Gradient Background */}
      <LinearGradient
        colors={['#1e3a8a', '#0f766e', '#065f46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Profile Header */}
          <View style={styles.headerRow}>
            {/* Left column: Avatar + Greeting */}
            <View style={styles.leftColumn}>
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.circle}
              >
                <Ionicons name="person" size={32} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={styles.greeting}>Hi {username}!</Text>
                <Text style={styles.subGreeting}>Level 3 • 350 XP</Text>
              </View>
            </View>

            {/* Right column: XP */}
            <View style={styles.rightColumn}>
              <XPTrophyCount />
            </View>
          </View>

          {/* Quick Actions Card */}
          <LinearGradient
            colors={['#1E293B', '#1E293B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardOuter}
          >
            <LinearGradient
              colors={['#0F172A', '#0F172A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardInner}
            >
              <Text style={styles.cardTitle}>Quick Actions</Text>
              
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.actionCard}>
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="walk" size={28} color="#fff" />
                    <Text style={styles.actionText}>Update Steps</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('WeightTrackerScreen')}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="fitness" size={28} color="#fff" />
                    <Text style={styles.actionText}>Track Weight</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </LinearGradient>

                {/* Stats Summary */}
                <LinearGradient
            colors={['#1E293B', '#1E293B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardOuter}
          >
            <LinearGradient
              colors={['#0F172A', '#0F172A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardInner}
            >
              <Text style={styles.cardTitle}>This Week's Summary</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons name="footsteps-outline" size={24} color="#10b981" />
                  <Text style={styles.statValue}>59,200</Text>
                  <Text style={styles.statLabel}>Total Steps</Text>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="flame-outline" size={24} color="#f59e0b" />
                  <Text style={styles.statValue}>3</Text>
                  <Text style={styles.statLabel}>Workouts Complete</Text>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="trophy-outline" size={24} color="#14b8a6" />
                  <Text style={styles.statValue}>5/7</Text>
                  <Text style={styles.statLabel}>Goals Hit</Text>
                </View>
              </View>
            </LinearGradient>
          </LinearGradient>

          {/* Weekly Steps Chart */}
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Ionicons name="bar-chart-outline" size={24} color="#10b981" />
              <Text style={styles.sectionTitle}>Steps This Week</Text>
            </View>
            
            {weeklyData.length > 0 && (
              <LinearGradient
                colors={['#1E293B', '#1E293B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.chartCardOuter}
              >
                <LinearGradient
                  colors={['#0F172A', '#0F172A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.chartCardInner}
                >
                  <BarChart
                    data={{
                      labels: weeklyData.map(d =>
                        new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short' })
                      ),
                      datasets: [{ data: weeklyData.map(d => d.steps) }],
                    }}
                    width={screenWidth - 80}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
                  />
                </LinearGradient>
              </LinearGradient>
            )}
          </View>

          {/* Monthly Steps Chart */}
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Ionicons name="trending-up-outline" size={24} color="#14b8a6" />
              <Text style={styles.sectionTitle}>Monthly Steps</Text>
            </View>
            
            {monthlyData.length > 0 && (
              <LinearGradient
                colors={['#1E293B', '#1E293B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.chartCardOuter}
              >
                <LinearGradient
                  colors={['#0F172A', '#0F172A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.chartCardInner}
                >
                  <LineChart
                    data={{
                      labels: monthlyData.map(m =>
                        new Date(m.month_start).toLocaleDateString('en-GB', { month: 'short' })
                      ),
                      datasets: [{ data: monthlyData.map(m => m.total_steps) }],
                    }}
                    width={screenWidth - 80}
                    height={220}
                    chartConfig={monthlyChartConfig}
                    style={styles.chart}
                    bezier
                  />
                </LinearGradient>
              </LinearGradient>
            )}
          </View>

    

        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const chartConfig = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: '#0F172A',
  backgroundGradientTo: '#0F172A',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#10b981',
  },
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: '#1E293B',
    strokeDasharray: '0',
  },
};

const monthlyChartConfig = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: '#0F172A',
  backgroundGradientTo: '#0F172A',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(20, 184, 166, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: '#14b8a6',
  },
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: '#1E293B',
    strokeDasharray: '0',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 65,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  leftColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightColumn: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  cardOuter: {
    borderRadius: 20,
    padding: 2,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardInner: {
    borderRadius: 18,
    padding: 20,
    backgroundColor: '#0F172A',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
  },
  actionGradient: {
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chartSection: {
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chartCardOuter: {
    borderRadius: 16,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  chartCardInner: {
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1C1F26',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#A0A3A8',
    marginTop: 4,
    textAlign: 'center',
  },
});