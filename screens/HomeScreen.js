import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar ,ActivityIndicator } from 'react-native';
import XPBar from '../components/XPBarLevel';
import { Ionicons } from '@expo/vector-icons';
import TrackerBar from '../components/TrackerBar';
import { supabase } from '../lib/supabase';

const testUser = {
  nutrition: 2000,
  calories:2000,
  protein:130,
  carbs:100,
  fats:40
}

const theme = {
  // Dim hybrid palette
  bg: '#111827',            // slate-900 (dark, not black)
  surface: '#1E293B',       // slate-800 (mid card)
  surfaceAlt: '#0F172A',    // slate-900/indigo tint (header/alt)
  surfaceLight: '#F1F5F9',  // slate-100 (light card to break up darkness)
  border: '#334155',        // slate-700
  text: '#E5E7EB',          // light text on dark
  textMuted: '#9CA3AF',     // muted on dark
  textOnLight: '#0F172A',   // dark text on light cards
  primary: '#3B82F6',       // blue
  success: '#22C55E',       // green
  warning: '#F59E0B',       // amber
};

export default function HomeScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {

    const getProfile = async () => {
      try {
        setLoading(true);

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Fetch user profile row
        const { data: profileData, error } = await supabase
          .from('userProfiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // If profile exists but trigger is false → redirect
        if (profileData && !profileData.UserHasEnteredTheirProfileDataTrigger) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'CreateUserPlan' }],
          });
          return; // don’t set profile → avoid flashing wrong screen
        }

        setProfile(profileData);
      } catch (err) {
        console.error('Profile check error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigation]);



  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>No profile found</Text>
      </View>
    );
  }

    return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        <Text style={styles.title}>Welcome to FitBounty, {profile.first_name || 'Friend'} </Text>
        <Text style={styles.subtitle}>Your fitness journey starts here</Text>

        {/* Level Progress (mid-tone card) */}

          <XPBar
            currentXP={350}
            levelXP={500}
            level={3}
         />
        

    <View style={styles.nutritionContainer}>
  
     <Text style={styles.sectionTitle}>My Fitness Goals</Text> 
    </View>
        {/* Cardio */}
        <View style={styles.statsContainer}>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>Cardio : 0 / {profile.cardioGoal || 0} Minutes</Text>
              <View style={styles.trackerWrap}>
                
                <TrackerBar
                />
              </View>

          {/* Steps */}
              <Text style={styles.statValue}>Steps : 0 / {profile.stepGoal || 0}</Text>
              <View style={styles.trackerWrap}>
                <TrackerBar
                />
              </View>

          {/* Workouts */}
              <Text style={styles.statValue}>Workouts : 0 / {profile.workoutSessionsGoal || 0} </Text>
              <View style={styles.trackerWrap}>
                <TrackerBar
                />
      
              </View>

            </View>
        </View>


        {/* Nutrition (light card to add contrast) */}
        <View style={styles.nutritionContainer}>
          <Text style={styles.sectionTitle}>Nutrition Overview</Text>

          <View style={styles.nutritionCardLight}>
            <Text style={styles.caloriesValueLight}>{testUser.calories}</Text>
            <Text style={styles.caloriesLabelLight}>Calories</Text>
          </View>

          <View style={styles.macrosRow}>

            <TouchableOpacity style={styles.macroCard} onPress={() => navigation.navigate('RewardSystemScreen')}>
              <Text style={[styles.macroValue, { color: theme.primary }]}>{testUser.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
              <View style={styles.trackerWrap}>
                <TrackerBar/>       
                <Ionicons name="add-circle-outline" size={24} color="white"  onPress={() => navigation.navigate('RewardSystemScreen')} ></Ionicons>
              </View>
           
            </TouchableOpacity>

            <TouchableOpacity style={styles.macroCard} onPress={() => navigation.navigate('RewardSystemScreen')}>
              <Text style={[styles.macroValue, { color: '#38BDF8' }]}>{testUser.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
              <View style={styles.trackerWrap}>
                <TrackerBar/>
                <Ionicons name="add-circle-outline" size={24} color="white"  onPress={() => navigation.navigate('RewardSystemScreen')} ></Ionicons>
              </View>
            </TouchableOpacity>

            <View style={styles.macroCard} >
              <Text style={[styles.macroValue, { color: '#A78BFA' }]}>{testUser.fats}g</Text>
              <Text style={styles.macroLabel}>Fats</Text>
              <View style={styles.trackerWrap}>
                <TrackerBar/>
              <Ionicons name="add-circle-outline" size={24} color="white"  onPress={() => navigation.navigate('RewardSystemScreen')} ></Ionicons>
              </View>

 
       
            </View>


          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('RewardSystemScreen')}>
            <Text style={styles.actionButtonText}>Reward System</Text>
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
  // Base
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    padding: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    color: theme.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.textMuted,
    marginBottom: 22,
    textAlign: 'center',
  },

  // Cards
  cardPadded: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: theme.border,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    paddingTop:20,
    padding: 7,
    alignItems: 'flex-start', 
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: theme.border,
  },
  trackerWrap: {
    width: '100%',
    marginTop: -10,
  },

  // Text
  statValue: {
    fontSize: 14,
    fontWeight: '350',
    color: theme.text,
    alignItems: 'flex-start', 
  },
  statUnit: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: theme.text,
    textAlign: 'center',
  },

  // Nutrition (light card for contrast)
  nutritionContainer: {
    marginTop: 6,
    marginBottom: 16,
  },
  nutritionCardLight: {
    backgroundColor: theme.surfaceLight,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0', // slate-200 for light edge
  },
  caloriesValueLight: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.warning,
  },
  caloriesLabelLight: {
    fontSize: 12,
    color: theme.textOnLight,
    opacity: 0.7,
    marginTop: 2,
  },

  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: theme.border,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  macroLabel: {
    fontSize: 12,
    color: theme.textMuted,
  },
  macroLabelSmall: {
    fontSize: 12,
 
    color: theme.textMuted,
  },
  macroLabelMedium: {
    fontSize: 15,

    color: theme.textMuted,
  },
  macroLabelLarge: {
    fontSize: 25,

    color: theme.textMuted,
  },

  // Buttons
  quickActions: {
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#E2E8F0',   // light button for contrast
    borderWidth: 0,
  },
  secondaryButtonText: {
    color: theme.textOnLight,
    fontSize: 16,
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 10,
  },
});
 
