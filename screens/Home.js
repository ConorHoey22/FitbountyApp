import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Dimensions,
  Image,
  AppState,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { getISOWeekKey } from '../utils/weeklyKeyCreate';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { getProfile } from '../lib/GetProfile';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

import { checkAndResetDailyMacros } from '../utils/dailyMacros';

import XPBarLevel from '../components/XPBarLevel';
import TrackerBar from '../components/TrackerBar';
import TodayPlanCard from '../components/TodayPlanCard';
import Card from '../lib/assets/Card';
import Divider from '../components/Divider';
import AddMacrosModal from '../components/AddMacrosModal';
import AddComingSoonModal from '../components/AddComingSoonModal';
import AddTodayPlanModal from '../components/AddTodayPlanModal';
import XPRewardSuccessModal from '../components/XPRewardSuccessModal';
import TopActionBar from '../components/TopActionBar';

export default function Home() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [profile, setProfile] = useState(null);


  // Add this helper frontend helper 
const formatCompactNumber = (num) => {
  if (num === undefined || num === null) return '—';
  if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
  return String(num);
};

  // Macros Goals
  const [caloriesGoal, SetCaloriesGoal] = useState();
  const [proteinGoal, SetProteinGoal] = useState();
  const [carbohydratesGoal, SetCarbohydratesGoal] = useState();
  const [fatsGoal, SetFatsGoal] = useState();

  // Consumed amounts
  const [caloriesConsumed, SetCaloriesConsumed] = useState(0);
  const [proteinConsumed, SetProteinConsumed] = useState(0);
  const [carbohydratesConsumed, SetCarbohydratesConsumed] = useState(0);
  const [fatsConsumed, SetFatsConsumed] = useState(0);

  // Fitness Goals
  const [cardioGoal, SetCardioGoal] = useState();
  const [stepsGoal, SetStepsGoal] = useState();
  const [workoutSessionsGoal, SetWorkoutSessionsGoal] = useState();

  // Weekly Fitness Goal
  const [weeklyWorkoutCount, setWeeklyWorkoutCount] = useState(0);
  const [weeklyCardioCount, setWeeklyCardioCount] = useState(0);
  const [dailyStepCount, setDailyStepCount] = useState(0);


  //Reward System Checks 
  const [isCardioRewarded, setIsCardioRewarded] = useState();
  const [isWorkoutRewarded, setIsWorkoutRewarded] = useState();
  const [isDailyStepsRewarded, setIsDailyStepsRewarded] = useState();

  // Reward System - Success Modal 
  const [rewardNotficationModalVisible, setRewardNotificationModalVisible] = useState(false);
  const [rewardNotficationType, SetRewardNotficationType] = useState(false);

  // Modal
  const [macrosModalVisible, setMacrosModalVisible] = useState(false);
  const [comingSoonModalVisible, setComingSoonModalVisible] = useState(false);


  const images = [require('../lib/assets/FBLogo.png')];

const [refreshKey, setRefreshKey] = useState(0);


const loadProfile = async () => {
  try {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }

    const profileData = await getProfile(session.user.id);

    // Trigger User Plan Setup , Set Steps, Workouts to populate metrics 
    if (!profileData) {
      navigation.reset({ index: 0, routes: [{ name: 'CreateUserPlan' }] });
      return;
    }
    if (!profileData.UserHasEnteredTheirProfileDataTrigger) { // This check whether the Profile has data for metrics,Flag for debugging
      navigation.reset({ index: 0, routes: [{ name: 'CreateUserPlan' }] });
      return;
    }
    if (!profileData.UserHasWeeklyPlanSetup) { // Ensure the User Plans their week , this is puts the same plan each week until the user updates it using the home screen or Navigation 
      navigation.reset({ index: 0, routes: [{ name: 'PlanYourWeekScreen' }] });
      return;
    }
    if (profileData.UserHasEnteredTheirProfileDataTrigger && !profileData.UserHasMacros) { // Set Macros if they are not set already, ProfileData must be set first this is ( Workouts ) - THIS ensure the FLOW of the prompts 
      navigation.reset({ index: 0, routes: [{ name: 'UpdateMacrosPlan' }] });
      return;
    }

    setProfile(profileData);

    //Overall Goals 
    SetCaloriesGoal(profileData.calories);
    SetProteinGoal(profileData.protein);
    SetCarbohydratesGoal(profileData.carbohydrates);
    SetFatsGoal(profileData.fats);
    SetCardioGoal(profileData.cardioGoal);
    SetStepsGoal(profileData.stepGoal);  
    SetWorkoutSessionsGoal(profileData.workoutSessionsGoal);

    checkWeeklySetupTrigger(); // Run Function to check if the Weekly plan is setup 

  } catch (err) {
    console.error('Home Screen load error:', err.message);
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  let isMounted = true;
  let midnightTimer;

  // Load profile and goals
  loadProfile();

  // Check and restore/reset today's consumed macros
  const checkDailyMacros = async () => {
    try {
      await checkAndResetDailyMacros({
        setCaloriesConsumed: (value) => {
          if (isMounted) SetCaloriesConsumed(value);
        },
        setProteinConsumed: (value) => {
          if (isMounted) SetProteinConsumed(value);
        },
        setCarbohydratesConsumed: (value) => {
          if (isMounted) SetCarbohydratesConsumed(value);
        },
        setFatsConsumed: (value) => {
          if (isMounted) SetFatsConsumed(value);
        },
      });
    } catch (err) {
      console.error('Daily macro check failed:', err.message);
    }
  };

  // Schedule the next midnight check
  const scheduleMidnightCheck = () => {
    clearTimeout(midnightTimer);

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);

    midnightTimer = setTimeout(async () => {
      await checkDailyMacros();

      if (isMounted) {
        scheduleMidnightCheck();
      }
    }, nextMidnight.getTime() - now.getTime());
  };

  // Initial daily check
  checkDailyMacros();
  scheduleMidnightCheck();

  // Check again when the app becomes active
  const subscription = AppState.addEventListener(
    'change',
    (nextAppState) => {
      if (nextAppState === 'active') {
        checkDailyMacros();
        scheduleMidnightCheck();
      } else {
        clearTimeout(midnightTimer);
      }
    }
  );

  return () => {
    isMounted = false;
    clearTimeout(midnightTimer);
    subscription.remove();
  };
}, []);

const triggerReward = async () => {
  try {
    // Keep your existing reward logic here.
  } catch (err) {
    console.error('Trigger Reward error:', err.message);
  }
};

const syncWeeklyStats = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: profile, error } = await supabase
      .from('userProfiles')
      .select('weeklyFitBKey, weeklyWorkoutCount, weeklyCardioCount')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) return;

    const currentWeekKey = getISOWeekKey(new Date());

    // Keep your existing weekly sync logic here.
  } catch (err) {
    console.error('Weekly sync error:', err.message);
  }
};

// Weekly workout sync — still runs whenever Home is focused
useFocusEffect(
  useCallback(() => {
    syncWeeklyStats();
  }, [])
);

// useEffect(() => {
//   loadProfile();
// }, []);

//   const triggerReward  = async () => { 
//     try
//     {   
   
//         // Modal ( Cardio )
//         const [rewardNotficationModalVisible, setRewardNotificationModalVisible] = useState(true,rewardNotficationType);

//     }
//     catch (err) {
//       console.error('Trigger Reward error:', err.message);
//     }

//   }; 

//   const syncWeeklyStats = async () => {
//     try {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!session?.user) return;

//       const { data: profile, error } = await supabase
//         .from('userProfiles')
//         .select('weeklyFitBKey, weeklyWorkoutCount , weeklyCardioCount')
//         .eq('id', session.user.id)
//         .single();

//       if (error || !profile) return;

//       const currentWeekKey = getISOWeekKey(new Date());

  
//     } catch (err) {
//       console.error('Weekly sync error:', err.message);
//     }
//   };

    
//   // ── Weekly workout sync — runs every time screen is focused ──
//   useFocusEffect(
//     useCallback(() => {
     
//       syncWeeklyStats();
//     }, [])
//   );



  



  const checkWeeklySetupTrigger = async () => {
    try {
      const profileData = await getProfile();
      if (!profileData.UserHasWeeklyPlanSetup) {
        navigation.reset({ index: 0, routes: [{ name: 'PlanYourWeekScreen' }] });
        return;
      }

    } catch (err) {
      console.error('Weekly setup check error:', err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No profile found</Text>
      </View>
    );
  }

  // Helper data arrays so the two cards can render as compact rows

 // ─── Palette additions (place with your other consts) ──
const MACRO_PROTEIN = '#C6F135'; // lime
const MACRO_CARBS = '#2563EB';   // blue
const MACRO_FAT = '#F97316';     // orange
const MACRO_CALORIES = '#EC4899'; // pink, if you track calories separately

const nutritionRows = [
  {
    key: 'protein',
    label: 'Protein',
    icon: 'flame-outline',
    consumed: proteinConsumed,
    goal: proteinGoal,
    unit: 'grams',
    color: MACRO_PROTEIN,
  },
  {
    key: 'carbs',
    label: 'Carbs',
    icon: 'nutrition-outline',
    consumed: carbohydratesConsumed,
    goal: carbohydratesGoal,
    unit: 'grams',
    color: MACRO_CARBS,
  },
  {
    key: 'fat',
    label: 'Fat',
    icon: 'fish-outline',
    consumed: fatsConsumed,
    goal: fatsGoal,
    unit: 'grams',
    color: MACRO_FAT,
  },
];





  // ─── Weekly palette additions ──
const WEEKLY_CARDIO = '#F97316';   // orange
const WEEKLY_STEPS = '#2563EB';    // blue
const WEEKLY_WORKOUTS = '#C6F135'; // lime

// ─── weeklyRows — add a `color` field per item ──
const weeklyRows = [
  {
    key: 'cardio',
    label: 'Cardio',
    icon: 'heart-outline',
    consumed: profile.weeklyCardioCount,
    goal:  profile.cardioGoal,
    unit: 'minutes',
    color: WEEKLY_CARDIO,
  },
  {
    key: 'steps',
    label: 'Steps',
    icon: 'footsteps-outline',
    consumed: profile.stepGoal,
    goal: profile.weeklyStepCount ,
    unit: 'steps',
    color: WEEKLY_STEPS,
  },
  {
    key: 'workouts',
    label: 'Workouts',
    icon: 'barbell-outline',
    consumed: profile.weeklyWorkoutCount,
    goal: profile.workoutSessionsGoal,
    unit: 'sessions',
    color: WEEKLY_WORKOUTS,
  },
];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>

            {/* ── Header ── */}
            <TopActionBar/>
           

            <View style={styles.XPheader}>
              <XPBarLevel refreshKey={refreshKey} />
            </View>

            <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.actionButton3}
                    onPress={() => setComingSoonModalVisible(true)}
                  >
                    <Ionicons name="person" size={18} color="#ffffff" />
                    <Text style={styles.actionText2}>FIND A COACH</Text>
                  </TouchableOpacity>


                  <TouchableOpacity
                    style={styles.actionButton2}
                    onPress={() => setComingSoonModalVisible(true)}
                  >
                    <Ionicons name="heart" size={18} color="#ffffff" />
                    <Text style={styles.actionText2}>MY HEALTH</Text>
                  </TouchableOpacity>
            </View>


            <View style={styles.cardSeparation}>

            </View>

            
            <TodayPlanCard profile={profile} onActivitySaved={loadProfile} />

            {/* <View style={styles.cardSeparation}>

            </View>
         */}

              {/* ── Nutrition Card ── */}
             <View style={styles.cardContainer}>

              {/* Card header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Ionicons name="nutrition-outline" size={16} color={ACCENT} />
                  <Text style={styles.cardHeaderText}>Nutrition Plan</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>TODAY</Text>
                </View>
              </View>

              {/* Calories — horizontal bar across the top */}
              <View style={styles.caloriesBar}>
                <View style={styles.caloriesBarTop}>
                  <View style={styles.caloriesBarLeft}>
                    <View style={[styles.caloriesBarIconWrap, { backgroundColor: MACRO_CALORIES + '22' }]}>
                      <Ionicons name="flame" size={16} color={MACRO_CALORIES} />
                    </View>
                    <Text style={styles.caloriesBarLabel}>Calories</Text>
                  </View>
                  <Text
                    style={[styles.caloriesBarValue, { color: MACRO_CALORIES }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {formatCompactNumber(caloriesConsumed)}/{formatCompactNumber(caloriesGoal)} kcal
                  </Text>
                </View>

                <View style={styles.caloriesBarTrack}>
                  <View
                    style={[
                      styles.caloriesBarTrackFill,
                      {
                        width: `${caloriesGoal ? Math.min(caloriesConsumed / caloriesGoal, 1) * 100 : 0}%`,
                        backgroundColor: MACRO_CALORIES,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.macroGrid}>
                {nutritionRows.map((item) => {
                  const pct = item.goal ? Math.min(item.consumed / item.goal, 1) : 0;
                  return (
                    <View key={item.key} style={styles.macroTile}>
                      <View style={[styles.macroTileIconWrap, { backgroundColor: item.color + '22' }]}>
                        <Ionicons name={item.icon} size={18} color={item.color} />
                      </View>

                      <Text style={styles.macroTileTitle}>{item.label}</Text>
                      <Text
                        style={[styles.macroTileValue, { color: item.color }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                      >
                        {formatCompactNumber(item.consumed)}/{formatCompactNumber(item.goal)}
                      </Text>
                      <Text style={styles.macroTileUnit}>{item.unit}</Text>

                      <View style={styles.macroTileTrack}>
                        <View
                          style={[
                            styles.macroTileTrackFill,
                            { width: `${pct * 100}%`, backgroundColor: item.color },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setMacrosModalVisible(true)}
                >
                  <Ionicons name="add-outline" size={18} color="#0E0E12" />
                  <Text style={styles.actionText}>Add</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButtonOutline}
                  onPress={() => navigation.navigate('UpdateMacrosPlan')}
                >
                  <Ionicons name="options-outline" size={18} color={ACCENT} />
                  <Text style={styles.actionTextOutline}>Edit Macros</Text>
                </TouchableOpacity>
              </View>

            </View>

            <View style={styles.cardSeparation}>

          </View>


            {/* ── Weekly Fitness Card ── */}
            <View style={styles.cardContainerAltColor}>

              {/* Card header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Ionicons name="calendar-outline" size={16} color={ACCENT} />
                  <Text style={styles.cardHeaderText}>Weekly Fitness Plan</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>WEEKLY</Text>
                </View>
              </View>

              <View style={styles.macroGrid}>
                {weeklyRows.map((item) => {
                  const pct = item.goal ? Math.min(item.consumed / item.goal, 1) : 0;
                  return (
                    <View key={item.key} style={styles.macroTile}>
                      <View style={[styles.macroTileIconWrap, { backgroundColor: item.color + '22' }]}>
                        <Ionicons name={item.icon} size={18} color={item.color} />
                      </View>

                      <Text style={styles.macroTileTitle}>{item.label}</Text>
                      <Text
                        style={[styles.macroTileValue, { color: item.color }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                      >
                        {formatCompactNumber(item.consumed)}/{formatCompactNumber(item.goal)}
                      </Text>
                      <Text style={styles.macroTileUnit}>{item.unit}</Text>

                      <View style={styles.macroTileTrack}>
                        <View
                          style={[
                            styles.macroTileTrackFill,
                            { width: `${pct * 100}%`, backgroundColor: item.color },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('UpdateMacrosPlan')}
                >
                  <Ionicons name="options-outline" size={18} color= '#0E0E12' />
                  <Text style={styles.actionText}>Edit Plan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButtonOutline}
                  onPress={() => navigation.navigate('RewardSystemScreen')}
                >
                  <Ionicons name="options-outline" size={18} color={ACCENT} />
                  <Text style={styles.actionTextOutline}>Reward</Text>
                </TouchableOpacity>
              </View>

            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AddMacrosModal
        visible={macrosModalVisible}
        caloriesConsumed={caloriesConsumed}
        proteinConsumed={proteinConsumed}
        carbohydratesConsumed={carbohydratesConsumed}
        fatsConsumed={fatsConsumed}
        setCaloriesConsumed={SetCaloriesConsumed}
        setProteinConsumed={SetProteinConsumed}
        setCarbohydratesConsumed={SetCarbohydratesConsumed}
        setFatsConsumed={SetFatsConsumed}
        onClose={() => setMacrosModalVisible(false)}
      />



      <AddComingSoonModal
        visible={comingSoonModalVisible}
        onClose={() => setComingSoonModalVisible(false)}
      />


      
    </View>
  );
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const ACCENT    = '#C6F135';   // electric lime
const ACCENT2 = '#22C55E'; 
const ACCENT3 = '#E11D48';   // red 

const BG        = '#0E0E12';   // page background
const CARD_BG   = '#22222E';   // outer card
const MACRO_OUT = '#2C2C3C';   // macro card outer
const MACRO_IN  = '#252532';   // macro card inner
const BORDER    = '#42425A';   // brighter border for visibility
const STAT_BG  = '#2C2C3C';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
  },
  emptyText: {
    color: '#B0B0C8',   // readable on dark bg
    fontSize: 15,
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

  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 70,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  
  sideContainer: {
    width: 55, // same width on both sides
    alignItems: 'center',
  },
  
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
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

  XPheader: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
    
  image: {
    width: 550,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    margin:-100

  },
  
  profileImageContainer: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerCenter: {
    flex: 1,
    marginHorizontal: 15,
  },
  
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  
  macroLabelSM: {
    fontSize: 12,
    color: '#aaa',
    letterSpacing: 1,
    marginTop: 2,
  },
  
  title: {
    fontSize: 24,           // bigger — was 20
    fontWeight: '900',
    color: '#FFFFFF',       // pure white
    marginBottom: 6,
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0BC',       // lighter grey — was #FFFFFF
    marginBottom: 14,
    fontWeight: '500',
  },

  // ── Nutrition card ──
  cardContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    width: width * 0.95,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    // shadowColor: ACCENT2,
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 50,
  },
  cardContainerAltColor: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    width: width * 0.95,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    // shadowColor: ACCENT3,
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  cardHeaderText: {
    color: '#FFFFFF',       // pure white header
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  badge: {
    backgroundColor: ACCENT + '22',
    borderWidth: 1,
    borderColor: ACCENT + '66',
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

  // ── Macro grid — icon-chip tiles (replaces the compact rows) ──
  macroGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  macroTile: {
    flex: 1,
    backgroundColor: MACRO_IN,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  macroTileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  macroTileTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  macroTileValue: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  macroTileUnit: {
    color: '#A0A0BC',
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 6,
  },
  macroTileTrack: {
    width: '100%',
    height: 4,
    borderRadius: 3,
    backgroundColor: '#1A1A22',
    overflow: 'hidden',
  },
  macroTileTrackFill: {
    height: '100%',
    borderRadius: 3,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
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

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  
  actionButton3: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  
    backgroundColor: ACCENT2,
  
    height: 32,
    borderRadius: 14,
  
    gap: 7,
  

  
    shadowColor: ACCENT2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  cardSeparation: {

   
    marginTop:40
  },
  actionButton2: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  
    backgroundColor: ACCENT3,
  
    height: 32,
    borderRadius: 14,
  
    gap: 7,
  

  
    shadowColor: ACCENT3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  
  actionText2: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  caloriesBar: {
    backgroundColor: MACRO_IN,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 10,
  },
  caloriesBarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  caloriesBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  caloriesBarIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesBarLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  caloriesBarValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  caloriesBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A1A22',
    overflow: 'hidden',
  },
  caloriesBarTrackFill: {
    height: '100%',
    borderRadius: 3,
  },
});