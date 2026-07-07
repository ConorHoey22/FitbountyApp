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
  Image
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { getISOWeekKey } from '../utils/weeklyKeyCreate';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { getProfile } from '../lib/GetProfile';
import { Ionicons } from '@expo/vector-icons';

// In Home.js — add a refresh state

const { width } = Dimensions.get('window');

import XPBar from '../components/XPBarLevel';
import TrackerBar from '../components/TrackerBar';
import TodayPlanCard from '../components/TodayPlanCard';
import Card from '../lib/assets/Card';
import Divider from '../components/Divider';
import AddMacrosModal from '../components/AddMacrosModal';
import AddComingSoonModal from '../components/AddComingSoonModal';
import AddTodayPlanModal from '../components/AddTodayPlanModal';
import XPRewardSuccessModal from '../components/XPRewardSuccessModal';

export default function Home() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [profile, setProfile] = useState(null);

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
  const [workoutSessionsGoal, SetWorkoutSesssionsGoal] = useState();

  // Weekly Fitness Goal
  const [weeklyWorkoutCount, setWeeklyWorkoutCount] = useState(0);
  const [weeklyCardioCount, setWeeklyCardioCount] = useState(0);

  const [dailystepCount, setDailyStepCount] = useState(0);


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


  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          return;
        }

        const profileData = await getProfile(session.user.id);

        if (!profileData) {
          navigation.reset({ index: 0, routes: [{ name: 'CreateUserPlan' }] });
          return;
        }
        if (!profileData.UserHasEnteredTheirProfileDataTrigger) {
          navigation.reset({ index: 0, routes: [{ name: 'CreateUserPlan' }] });
          return;
        }
        if (!profileData.UserHasWeeklyPlanSetup) {
          navigation.reset({ index: 0, routes: [{ name: 'PlanYourWeekScreen' }] });
          return;
        }
        if (profileData.UserHasEnteredTheirProfileDataTrigger && !profileData.UserHasMacros) {
          console.log('User does not have macros');
          navigation.reset({ index: 0, routes: [{ name: 'AddMacros' }] });
          return;
        }

        setProfile(profileData);
        SetCaloriesGoal(profileData.calories);
        SetProteinGoal(profileData.protein);
        SetCarbohydratesGoal(profileData.carbohydrates);
        SetFatsGoal(profileData.fats);
        SetCardioGoal(profileData.cardioGoal);
        SetStepsGoal(profileData.stepGoal);
        SetWorkoutSesssionsGoal(profileData.workoutSessionsGoal);

        checkWeeklySetupTrigger();

      } catch (err) {
        console.error('Home Screen load error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const triggerReward  = async () => { 
    try
    {   
   
        // Modal ( Cardio )
        const [rewardNotficationModalVisible, setRewardNotificationModalVisible] = useState(true,rewardNotficationType);

    }
    catch (err) {
      console.error('Trigger Reward error:', err.message);
    }

  }; 

  const syncWeeklyStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile, error } = await supabase
        .from('userProfiles')
        .select('weeklyFitBKey, weeklyWorkoutCount , weeklyCardioCount')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) return;

      const currentWeekKey = getISOWeekKey(new Date());

      if (profile.weeklyFitBKey === currentWeekKey) {
        // Same week — just display the count
        setWeeklyWorkoutCount(profile.weeklyWorkoutCount);
        setWeeklyCardioCount(profile.weeklyCardioCount);


        // Check if user has reached Goal Trackers , if so XP added to user Account 
        // -- Need to consider that they can only get rewarded once so if they get 180 mins of cardio in 2 days and then log back in again it should not add more XP Rewards 


        // Check Cardio Goal
        if (weeklyCardioCount >= cardioGoal && !isCardioRewarded) 
        {
                // Notification Modal appearing showing that you have acheive it and Trigger XP reward 
                triggerReward('CARDIO');
                setIsCardioRewarded(true); // Locks the reward out

          // TODO: Make an API/DB call here to save `isCardioRewarded: true` and add XP to user profile
          await supabase
          .from('userProfiles')
              .update({isCardioRewarded : true})
              .eq('id', session.user.id);


           // Async Value as well just incase the user is OFFLINE
        }

        // Check Workout Goal
        if (weeklyWorkoutCount >= workoutSessionsGoal && !isWorkoutRewarded) 
        {
                // Notification Modal appearing showing that you have acheive it and Trigger XP reward 
                triggerReward('WORKOUT');
                setIsWorkoutRewarded(true); // Locks the reward out
          // TODO: Make an API/DB call here to save `isWorkoutRewarded: true` and add XP to user profile
        }

        // Check Workout Goal
        if (dailystepCount >= stepsGoal && !isDailyStepsRewarded) 
        {
            // Notification Modal appearing showing that you have acheive it and Trigger XP reward 
            triggerReward('DAILYSTEPS');
            setIsDailyStepsRewarded(true); // Locks the reward out
        // TODO: Make an API/DB call here to save `isWorkoutRewarded: true` and add XP to user profile
        }


      } else {
        // New week — reset to 0
        await supabase
          .from('userProfiles')
          .update({ weeklyCardioCount: 0,weeklyWorkoutCount: 0, weeklyFitBKey: currentWeekKey })
          .eq('id', session.user.id);
        setWeeklyWorkoutCount(0);
        setWeeklyCardioCount(0);
      }
    } catch (err) {
      console.error('Weekly sync error:', err.message);
    }
  };

    
  // ── Weekly workout sync — runs every time screen is focused ──
  useFocusEffect(
    useCallback(() => {
     
      syncWeeklyStats();
    }, [])
  );


  



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
            <View style={styles.header}>
              <View style={styles.sideContainer}>
                <TouchableOpacity style={styles.profileImageContainer}>
                  <Ionicons name="person" size={30} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.headerCenter}>
              <Image
              source={require('../lib/assets/FBLogo.png')}
              style={styles.image}
            />


              </View>

              <View style={styles.sideContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')} >
                  <Ionicons name="settings-outline" size={26} color={ACCENT} />
                </TouchableOpacity>
              </View>
            </View>


            <View style={styles.XPheader}>
              <XPBar currentXP={350} levelXP={500} level={3} /> 
            </View>

            <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setComingSoonModalVisible(true)}
                  >
                    <Ionicons name="add-outline" size={18} color="#0E0E12" />
                    <Text style={styles.actionText}>FIND A COACH</Text>
                  </TouchableOpacity>


                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setComingSoonModalVisible(true)}
                  >
                    <Ionicons name="heart" size={18} color="#0E0E12" />
                    <Text style={styles.actionText}>MY HEALTH</Text>
                  </TouchableOpacity>
            </View>

            <XPRewardSuccessModal
              profile={profile}
             />
           

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

              <View style={styles.macrosContainer}>

                {/* Row 1 */}
                <View style={styles.row}>
                  <View style={styles.gradientCardOuter}>
                    <View style={styles.gradientCardInner}>
                      <Text style={styles.macroLabel}>CALORIES</Text>
                      <Text style={styles.macroConsumed}>{caloriesConsumed}</Text>
                      <Text style={styles.macroGoal}>/ {caloriesGoal}</Text>
                      <TrackerBar
                        currentAmount={caloriesConsumed}
                        totalAmount={caloriesGoal}
                        size={40}
                        strokeWidth={4}
                      />
                    </View>
                  </View>

                  <View style={styles.gradientCardOuter}>
                    <View style={styles.gradientCardInner}>
                      <Text style={styles.macroLabel}>PROTEIN</Text>
                      <Text style={styles.macroConsumed}>{proteinConsumed}</Text>
                      <Text style={styles.macroGoal}>/ {proteinGoal}</Text>
                      <TrackerBar
                        currentAmount={proteinConsumed}
                        totalAmount={proteinGoal}
                        size={40}
                        strokeWidth={4}
                      />
                    </View>
                  </View>
                </View>

                {/* Row 2 */}
                <View style={styles.row}>
                  <View style={styles.gradientCardOuter}>
                    <View style={styles.gradientCardInner}>
                      <Text style={styles.macroLabel}>CARBS</Text>
                      <Text style={styles.macroConsumed}>{carbohydratesConsumed}</Text>
                      <Text style={styles.macroGoal}>/ {carbohydratesGoal}</Text>
                      <TrackerBar
                        currentAmount={carbohydratesConsumed}
                        totalAmount={carbohydratesGoal}
                        size={40}
                        strokeWidth={4}
                      />
                    </View>
                  </View>

                  <View style={styles.gradientCardOuter}>
                    <View style={styles.gradientCardInner}>
                      <Text style={styles.macroLabel}>FATS</Text>
                      <Text style={styles.macroConsumed}>{fatsConsumed}</Text>
                      <Text style={styles.macroGoal}>/ {fatsGoal}</Text>
                      <TrackerBar
                        currentAmount={fatsConsumed}
                        totalAmount={fatsGoal}
                        size={40}
                        strokeWidth={4}
                      />
                    </View>
                  </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setMacrosModalVisible(true)}
                  >
                    <Ionicons name="add-outline" size={18} color="#0E0E12" />
                    <Text style={styles.actionText}>Add Food</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButtonOutline}
                    onPress={() => navigation.navigate('UpdateMacrosPlan')}
                  >
                    <Ionicons name="options-outline" size={18} color={ACCENT} />
                    <Text style={styles.actionTextOutline}>Edit Plan</Text>
                  </TouchableOpacity>

              
                </View>

              </View>
            </View>


  {/* ── Nutrition Card ── */}
  <View style={styles.cardContainer}>

{/* Card header */}
<View style={styles.cardHeader}>
  <View style={styles.cardHeaderLeft}>
    <Ionicons name="nutrition-outline" size={16} color={ACCENT} />
    <Text style={styles.cardHeaderText}>Weekly Fitness Plan</Text>
  </View>
  <View style={styles.badge}>
    <Text style={styles.badgeText}>WEEKLY</Text>
  </View>
</View>

<View style={styles.macrosContainer}>

  {/* Row 1 */}
  <View style={styles.row}>
    <View style={styles.gradientCardOuter}>
      <View style={styles.gradientCardInner}>
        <Text style={styles.macroLabel}>WORKOUTS</Text>
        <Text style={styles.macroConsumed}>{weeklyWorkoutCount}</Text>
        <Text style={styles.macroGoal}>/ {workoutSessionsGoal}</Text>
        <TrackerBar
          currentAmount={weeklyWorkoutCount}
          totalAmount={workoutSessionsGoal}
          size={40}
          strokeWidth={4}
        />
      </View>
    </View>

    <View style={styles.gradientCardOuter}>
      <View style={styles.gradientCardInner}>
        <Text style={styles.macroLabel}>CARDIO</Text>
        <Text style={styles.macroConsumed}>{cardioGoal}</Text>
        <Text style={styles.macroGoal}>/ {weeklyCardioCount}</Text>
        <TrackerBar
          currentAmount={weeklyCardioCount}
          totalAmount={cardioGoal}
          size={40}
          strokeWidth={4}
        />
      </View>
    </View>
  </View>

  {/* Row 2 */}
  <View style={styles.row}>
    <View style={styles.gradientCardOuter}>
      <View style={styles.gradientCardInner}>
        <Text style={styles.macroLabel}>STEPS (DAILY)</Text>
        <Text style={styles.macroConsumed}>{dailystepCount}</Text>
        <Text style={styles.macroGoal}>/ {stepsGoal}</Text>
        <TrackerBar
          currentAmount={dailystepCount}
          totalAmount={stepsGoal}
          size={40}
          strokeWidth={4}
        />
      </View>
    </View>

    <View style={styles.gradientCardOuter}>
     
    </View>
  </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
            

              <TouchableOpacity
                style={styles.actionButtonOutline}
                onPress={() => navigation.navigate('UpdateMacrosPlan')}
              >
                <Ionicons name="options-outline" size={18} color={ACCENT} />
                <Text style={styles.actionTextOutline}>Edit Plan</Text>
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


      <XPRewardSuccessModal
          profile={profile}
          rewardNotficationType={rewardNotficationType}
          onClose={() =>
            setRewardNotificationModalVisible(false)
          }
      />
           
    </View>
  );
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const ACCENT    = '#C6F135';   // electric lime
const BG        = '#0E0E12';   // page background
const CARD_BG   = '#22222E';   // outer card
const MACRO_OUT = '#2C2C3C';   // macro card outer
const MACRO_IN  = '#252532';   // macro card inner
const BORDER    = '#42425A';   // brighter border for visibility

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

  XPheader: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
    
  image: {
    width: 250,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',

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
    color: '#A0A0BC',       // lighter grey — was #7B7B90
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
    shadowColor: '#000',
    shadowOpacity: 0.25,
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

  macrosContainer: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  // Macro cards
  gradientCardOuter: {
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: MACRO_OUT,
    flex: 1,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  gradientCardInner: {
    backgroundColor: MACRO_IN,
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 2,
  },

  // Text inside macro cards — completely reworked for readability
  macroLabel: {
    fontSize: 10,
    fontWeight: '700',
    // color: '#A0A0BC',       // clear medium-grey label
    color: '#ffffff',       // clear medium-grey label
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  macroLabelSM: {
    fontSize: 14,
    fontWeight: '700',
    // color: '#A0A0BC',       // clear medium-grey label
    color: '#ffffff',       // clear medium-grey label
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  macroConsumed: {
    fontSize: 20,           // big and bold — the main number
    fontWeight: '800',
    color: '#FFFFFF',       // pure white
    letterSpacing: -0.5,
  },
  macroGoal: {
    fontSize: 12,
    fontWeight: '500',
    // color: '#7070A0',       // clearly dimmer than consumed
    color: '#ffffff',       // clear medium-grey label
    marginBottom: 6,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
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
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
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
});

