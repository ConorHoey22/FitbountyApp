import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';


import TopActionBar from '../components/TopActionBar';


import { getProfile } from '../lib/GetProfile';
import XPTrophyCount from '../components/XPTrophyCount';


const screenWidth = Dimensions.get('window').width;

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [username, setUsername ]= useState("");

  useEffect( () => {

    const load = async () => {
      try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      const profileData = await getProfile(session.user.id);

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



    //GetProfile Data 
      setUsername(profileData.first_name);

    //Get Weekly Step Data 

    //Get Monthly Steps Data 

    } catch (err) {
      console.error('Home Screen load error:', err.message);
    } finally {
      setLoading(false);
    }
  };
  load();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

      {/* ── Header ── */}
      <TopActionBar/>
        {/* ── Profile Header ── */}
        {/* <View style={styles.headerRow}> */}
          <View style={styles.leftColumn}>
            {/* <View style={styles.avatarRing}>
              <Text style={styles.avatarText}>
    
              </Text>
            </View> */}
            {/* <View>
              <Text style={styles.greeting}>Hi {username}!</Text>
              <View style={styles.levelPill}>
                <Ionicons name="flash" size={11} color={ACCENT} />
                <Text style={styles.levelText}>Level 3 · 350 XP</Text>
              </View>
            </View>
          </View> */}

          {/* <View style={styles.rightColumn}>
            <XPTrophyCount />
          </View> */}
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
              <View style={[styles.actionIconRing, { borderColor: ACCENT + '55' }]}>
                <Ionicons name="walk" size={24} color={ACCENT} />
              </View>
              <Text style={styles.actionText}>Update Steps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('WeightTrackerScreen')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconRing, { borderColor: '#7C6FFF55' }]}>
                <Ionicons name="fitness" size={24} color="#A49BFF" />
              </View>
              <Text style={styles.actionText}>Track Weight</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── This Week's Summary ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>This Week's Summary</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>WEEK</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="footsteps-outline" size={22} color={ACCENT} />
              <Text style={styles.statValue}>59,200</Text>
              <Text style={styles.statLabel}>Total Steps</Text>
            </View>

            <View style={[styles.statItem, styles.statItemMiddle]}>
              <Ionicons name="flame-outline" size={22} color="#FFA940" />
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Workouts Done</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="trophy-outline" size={22} color="#A49BFF" />
              <Text style={styles.statValue}>5/7</Text>
              <Text style={styles.statLabel}>Goals Hit</Text>
            </View>
          </View>
        </View>

        {/* ── Weekly Steps Chart ── */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Ionicons name="bar-chart-outline" size={18} color={ACCENT} />
            <Text style={styles.sectionTitle}>Steps This Week</Text>
          </View>

          {weeklyData.length > 0 && (
            <View style={styles.chartCard}>
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
            </View>
          )}
        </View>

        {/* ── Monthly Steps Chart ── */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Ionicons name="trending-up-outline" size={18} color="#A49BFF" />
            <Text style={styles.sectionTitle}>Monthly Steps</Text>
          </View>

          {monthlyData.length > 0 && (
            <View style={styles.chartCard}>
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
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const ACCENT   = '#C6F135';
const BG       = '#0E0E12';
const CARD     = '#22222E';
const STAT_BG  = '#2C2C3C';
const BORDER   = '#3A3A4E';
const CHART_BG = '#1A1A26';

// ─── Chart configs ────────────────────────────────────────────────────────────
const chartConfig = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: CHART_BG,
  backgroundGradientTo: CHART_BG,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(198, 241, 53, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(180, 180, 200, ${opacity})`,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: ACCENT,
  },
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: '#2E2E3E',
    strokeDasharray: '0',
  },
};

const monthlyChartConfig = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: CHART_BG,
  backgroundGradientTo: CHART_BG,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(164, 155, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(180, 180, 200, ${opacity})`,
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: '#A49BFF',
  },
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: '#2E2E3E',
    strokeDasharray: '0',
  },
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // Blobs
  blobTopRight: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: ACCENT,
    opacity: 0.05,
    top: -80,
    right: -80,
  },
  blobBottomLeft: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#5B4FE8',
    opacity: 0.06,
    bottom: 60,
    left: -80,
  },

  scrollView: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingTop: 65,
    paddingBottom: 40,
    gap: 16,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: ACCENT,
    backgroundColor: ACCENT + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: ACCENT,
    fontSize: 22,
    fontWeight: '900',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  levelText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Cards
  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  badge: {
    backgroundColor: ACCENT + '22',
    borderWidth: 1,
    borderColor: ACCENT + '55',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: ACCENT,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: STAT_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 10,
  },
  actionIconRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DDDDF0',
    letterSpacing: 0.2,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: STAT_BG,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 4,
  },
  statItemMiddle: {
    borderColor: '#FFA94033',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Charts
  chartSection: {
    gap: 10,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  chartCard: {
    backgroundColor: CHART_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    alignItems: 'center',
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 10,
  },
});