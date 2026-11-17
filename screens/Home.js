import React, { useEffect, useState, useCallback } from 'react';
import { APP_BG_GRADIENT } from '../components/ScreenBackground';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  AppState,
} from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { supabase } from '../lib/supabase';
import { getProfile } from '../lib/GetProfile';
import { checkAndResetDailyMacros } from '../utils/dailyMacros';
import { getWeeklyTotals } from '../utils/activityHistory';
import { font } from '../utils/fonts';

import XPBarLevel from '../components/XPBarLevel';
import TodayPlanCard from '../components/TodayPlanCard';
import AddMacrosModal from '../components/AddMacrosModal';
import AddComingSoonModal from '../components/AddComingSoonModal';
import UpdatePlanIndividualSelectionModal from '../components/UpdatePlanIndividualSelectionModal';
import EditWeeklyActivityModal from '../components/EditWeeklyStatsModal';
import TopActionBar from '../components/TopActionBar';
import GlassCard from '../components/GlassCard';
import LoadingScreen from '../components/LoadingScreen';
import ProgressRing from '../components/ProgressRing';
import GlassButton from '../components/GlassButton';

// Home buttons — bright blue with white text (tried: orange)
const BUTTON_BLUE = ['#2563EB', '#2563EB'];
const GLASS_BUTTON_TEXT = '#FFFFFF';
const BLUE_BUTTON_TEXT = GLASS_BUTTON_TEXT;
import { BackgroundIcons, HOME_ICONS } from '../components/AuthBackground';
import useTabBarSpace from '../utils/useTabBarSpace';

export default function Home() {
  const tabSpace = useTabBarSpace(); // room for the floating tab bar

  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  // This week's totals, summed from daily_activity rows (weekly_activity view)
  const [weeklyTotals, setWeeklyTotals] = useState({ steps: 0, cardio: 0, workouts: 0 });

  // Show the exact number — never shortened (2999 stays 2999, not 3k)
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '—';
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

  // Modal
  const [macrosModalVisible, setMacrosModalVisible] = useState(false);
  const [comingSoonModalVisible, setComingSoonModalVisible] = useState(false);
  const [updatePlanVisible, setUpdatePlanVisible] = useState(false);
  const [editWeekVisible, setEditWeekVisible] = useState(false);

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
    loadWeeklyTotals();

    //Overall Goals
    SetCaloriesGoal(profileData.calories);
    SetProteinGoal(profileData.protein);
    SetCarbohydratesGoal(profileData.carbohydrates);
    SetFatsGoal(profileData.fats);

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

const loadWeeklyTotals = async () => {
  try {
    setWeeklyTotals(await getWeeklyTotals());
  } catch (err) {
    console.error('Weekly totals load error:', err.message);
  }
};

// Weekly totals — reloaded whenever Home is focused (activity can be logged from other screens)
useFocusEffect(
  useCallback(() => {
    loadWeeklyTotals();
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

  if (loading && !profile) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return (
      <LinearGradient colors={BG_GRADIENT} style={styles.center}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.emptyText}>No profile found</Text>
      </LinearGradient>
    );
  }

const nutritionRows = [
  {
    key: 'calories',
    label: 'Calories',
    icon: 'flame',
    consumed: caloriesConsumed,
    goal: caloriesGoal,
    unit: 'kcal',
    color: CALORIES_COLOR,
  },
  {
    key: 'protein',
    label: 'Protein',
    icon: 'food-drumstick',
    iconSet: 'mci', // MaterialCommunityIcons — Ionicons has no meat icon
    consumed: proteinConsumed,
    goal: proteinGoal,
    unit: 'grams',
    color: PROTEIN_COLOR,
  },
  {
    key: 'carbs',
    label: 'Carbs',
    icon: 'nutrition',
    consumed: carbohydratesConsumed,
    goal: carbohydratesGoal,
    unit: 'grams',
    color: CARBS_COLOR,
  },
  {
    key: 'fat',
    label: 'Fat',
    icon: 'cheese',
    iconSet: 'mci', // MaterialCommunityIcons
    consumed: fatsConsumed,
    goal: fatsGoal,
    unit: 'grams',
    color: FAT_COLOR,
  },
];

const weeklyRows = [
  {
    key: 'cardio',
    label: 'Cardio',
    icon: 'heart',
    consumed: weeklyTotals.cardio,
    goal:  profile.cardioGoal,
    unit: 'minutes',
    color: CARDIO_COLOR,
  },
  {
    key: 'steps',
    label: 'Steps',
    icon: 'footsteps',
    consumed: weeklyTotals.steps,
    goal: (profile.stepGoal || 0) * 7,   // stepGoal is daily
    unit: 'Keep Moving!',
    color: STEPS_COLOR,
  },
  {
    key: 'workouts',
    label: 'Workouts',
    icon: 'barbell',
    consumed: weeklyTotals.workouts,
    goal: profile.workoutSessionsGoal,
    unit: 'sessions',
    color: WORKOUT_COLOR,
  },
];

  // Compact one-line-per-metric rows (matches TodayPlanCard) — Nutrition + This Week
  // light: white rows with black text (used for the Nutrition rows)
  const renderRows = (rows, light = false) => (
    <View style={styles.goalsList}>
      {rows.map((item) => {
        const pct = item.goal ? Math.min(item.consumed / item.goal, 1) : 0;
        const color = item.goal && pct >= 1 ? DONE_COLOR : item.color;

        return (
          <View key={item.key} style={[styles.goalRow, { borderColor: color + '40' }, light && styles.goalRowLight]}>
            {/* Coloured icon circle (80% of the goal colour) */}
            <View style={[styles.goalRowIcon, { backgroundColor: color + 'CC' }]}>
              {item.iconSet === 'mci' ? (
                <MaterialCommunityIcons name={item.icon} size={18} color={WHITE} />
              ) : (
                <Ionicons name={item.icon} size={18} color={WHITE} />
              )}
            </View>

            <View style={styles.goalRowInfo}>
              <Text style={[styles.goalRowTitle, light && styles.textBlack]} numberOfLines={1}>{item.label}</Text>
              <Text style={[styles.goalRowUnit, light && styles.textBlack]} numberOfLines={1}>
                <Text style={[styles.goalRowValue, { color: light ? BLACK : color }]}>
                  {formatNumber(item.consumed)}/{formatNumber(item.goal)}
                </Text>
                {'  ·  '}{item.unit}
              </Text>
            </View>

            <ProgressRing progress={pct} color={color} label={`${Math.round(pct * 100)}%`} labelColor={light ? BLACK : WHITE} />
          </View>
        );
      })}
    </View>
  );

  return (
    <LinearGradient colors={BG_GRADIENT} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + tabSpace }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >


        {/* ── Header ── */}
        <View style={styles.padded}>
          <TopActionBar
            navigation={navigation}
            name={profile.first_name}
            left={<XPBarLevel refreshKey={refreshKey} />}
          />
        </View>

             {/* ── Coming soon ── */}
        <View style={[styles.padded, styles.sectionGap, styles.buttonRow]}>
          <GlassButton gradient={BUTTON_BLUE}
            style={styles.secondaryButton}
            onPress={() => setComingSoonModalVisible(true)}
          >
            <Ionicons name="person" size={14} color={BLUE_BUTTON_TEXT} />
            <Text style={styles.secondaryButtonText}>Find a Coach</Text>
          </GlassButton>

          <GlassButton gradient={BUTTON_BLUE}
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('PRScreen')}
          >
            <Ionicons name="trophy" size={14} color={BLUE_BUTTON_TEXT} />
            <Text style={styles.secondaryButtonText}>My PRs</Text>
          </GlassButton>
        </View>

           {/* ── Today's Plan ── */}
        <View style={[styles.padded, styles.sectionGap]}>
          <TodayPlanCard
            profile={profile}
            onActivitySaved={() => {
              loadProfile();
              setRefreshKey((prev) => prev + 1);
            }}
          />
        </View>
          
   


           {/* ── Nutrition Card ── */}
        <View style={[styles.padded, styles.sectionGap]}>
          <GlassCard style={styles.planCard} gradient={NUTRITION_GRADIENT}>
            {/* Header */}
            <View style={styles.planCardHeader}>
              <View style={styles.planCardHeaderLeft}>
                <View style={styles.planCardHeaderIcon}>
                  <Ionicons name="restaurant" size={14} color={WHITE} />
                </View>
                <Text style={styles.planCardHeaderText}>Nutrition Plan</Text>
              </View>

              <GlassButton gradient={BUTTON_BLUE}
                style={styles.pillButton}
                onPress={() => setMacrosModalVisible(true)}
              >
                <Ionicons name="add" size={14} color={GLASS_BUTTON_TEXT} />
                <Text style={styles.pillButtonText}>Add Food</Text>
              </GlassButton>
            </View>

            {renderRows(nutritionRows, true)}

            <GlassButton gradient={BUTTON_BLUE}
              style={styles.compactOutlineButton}
              onPress={() => navigation.navigate('UpdateMacrosPlan')}
            >
              <Ionicons name="options" size={16} color={GLASS_BUTTON_TEXT} />
              <Text style={styles.compactOutlineButtonText}>Edit Macros</Text>
            </GlassButton>
          </GlassCard>
        </View>

        {/* ── Weekly Fitness Card ── */}
        <View style={[styles.padded, styles.sectionGap]}>
          <GlassCard style={styles.planCard} gradient={WEEK_GRADIENT}>
            {/* Header */}
            <View style={styles.planCardHeader}>
              <View style={styles.planCardHeaderLeft}>
                <View style={styles.planCardHeaderIcon}>
                  <Ionicons name="calendar" size={14} color={WHITE} />
                </View>
                <Text style={styles.planCardHeaderText}>This Week</Text>
              </View>

              <GlassButton gradient={BUTTON_BLUE} style={styles.actionButtonOutline} onPress={() => setEditWeekVisible(true)}>
                <Ionicons name="create" size={16} color={GLASS_BUTTON_TEXT} style={styles.actionIcon} />
                <Text style={styles.actionTextOutline} numberOfLines={1} adjustsFontSizeToFit>
                  Edit Week
                </Text>
              </GlassButton>
            </View>

            {renderRows(weeklyRows, true)}

            <GlassButton gradient={BUTTON_BLUE}
              style={styles.compactOutlineButton}
              onPress={() => setUpdatePlanVisible(true)}
            >
              <Ionicons name="options" size={16} color={GLASS_BUTTON_TEXT} />
              <Text style={styles.compactOutlineButtonText}>Update Plan</Text>
            </GlassButton>
          </GlassCard>
        </View>

      </ScrollView>

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

      {/* Update Plan (This Week) — same modal as TodayPlanCard's Update Plan */}
      <UpdatePlanIndividualSelectionModal
        visible={updatePlanVisible}
        onClose={() => setUpdatePlanVisible(false)}
        onSave={() => {
          loadProfile();
          setRefreshKey((prev) => prev + 1);
        }}
      />

      {/* Edit Week (This Week) — moved from TodayPlanCard */}
      <EditWeeklyActivityModal
        visible={editWeekVisible}
        onClose={() => setEditWeekVisible(false)}
        onSave={() => {
          loadProfile();
          setRefreshKey((prev) => prev + 1);
        }}
      />
    </LinearGradient>
  );
}

// ─── Palette (black & white) ──────────────────────────────────────────────────
// Dark charcoal + soft lime scheme
const TEXT    = '#FFFFFF';   // headings / primary text
const WHITE   = '#FFFFFF';
const BLACK   = '#000000';
const MUTED   = '#9A9A9E';   // secondary text
const ROW_BG  = 'rgba(255,255,255,0.06)';      // inner rows — translucent so the glass card shows through
const CALORIES_COLOR = '#EF4444'; // red
const PROTEIN_COLOR = '#06B6D4';  // cyan
const CARBS_COLOR = '#16A34A';    // green
const FAT_COLOR = '#F59E0B';      // amber
const CARDIO_COLOR = '#F43F5E';   // rose
const STEPS_COLOR = '#06B6D4';    // cyan
const WORKOUT_COLOR = '#F59E0B';  // amber
const DONE_COLOR = '#16A34A';     // green — goal reached
const BG_GRADIENT = APP_BG_GRADIENT; // shared — components/ScreenBackground.js

// Colour wash over each glass card (translucent, top-left → bottom-right)
const NUTRITION_GRADIENT = ['rgba(25,25,112,0.60)', 'rgba(25,25,112,0.60)']; // flat midnight blue, no gradient (was midnight blue gradient ['rgba(25,25,112,0.60)', 'rgba(15,23,72,0.35)', 'rgba(10,15,50,0.15)']; tried: orange → pink, teal → blue, green → teal, white → grey ['rgba(255,255,255,0.18)', 'rgba(200,200,205,0.07)', 'rgba(200,200,205,0)'])
const WEEK_GRADIENT      = ['rgba(25,25,112,0.60)', 'rgba(25,25,112,0.60)']; // flat midnight blue, no gradient (was midnight blue gradient ['rgba(25,25,112,0.60)', 'rgba(15,23,72,0.35)', 'rgba(10,15,50,0.15)']; tried: orange → pink, teal → blue, green → teal, white → grey ['rgba(255,255,255,0.18)', 'rgba(200,200,205,0.07)', 'rgba(200,200,205,0)'])

const cardShadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.3,
  shadowRadius: 14,
  elevation: 2,
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: WHITE,
    fontSize: 15,
    ...font('400'),
  },
  scrollContent: {
    paddingTop: 64,
    paddingBottom: 40,
  },
  padded: {
    paddingHorizontal: 20,
  },
  sectionGap: {
    marginTop: 20,
  },

  // ── Plan cards (Nutrition, This Week) — match TodayPlanCard ──
  // Glass look + edge come from GlassCard
  planCard: {
    padding: 14,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planCardHeaderIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCardHeaderText: {
    color: TEXT,
    fontSize: 17,
    ...font('700'),
    letterSpacing: 0.3,
  },
  // Update Plan / Edit Week buttons — match TodayPlanCard's
  actionButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    gap: 5,
  },
  actionIcon: {
    marginRight: 2,
  },
  actionTextOutline: {
    color: GLASS_BUTTON_TEXT,
    fontSize: 12,
    ...font('800'),
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 4,
  },
  pillButtonText: {
    color: GLASS_BUTTON_TEXT,
    fontSize: 12,
    ...font('800'),
    letterSpacing: 0.3,
  },
  goalsList: {
    gap: 6,
    marginBottom: 12,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: ROW_BG,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  goalRowLight: {
    backgroundColor: WHITE,
  },
  textBlack: {
    color: BLACK,
  },
  goalRowIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalRowInfo: {
    flex: 1,
    gap: 3,
  },
  goalRowTitle: {
    flexShrink: 1,
    color: TEXT,
    fontSize: 14,
    ...font('700'),
  },
  goalRowUnit: {
    color: MUTED,
    fontSize: 12,
    ...font('500'),
  },
  goalRowValue: {
    fontSize: 13,
    ...font('700'),
  },
  compactOutlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
  },
  compactOutlineButtonText: {
    color: GLASS_BUTTON_TEXT,
    fontSize: 12,
    ...font('800'),
    letterSpacing: 0.2,
  },

  // ── Buttons ──
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: BLUE_BUTTON_TEXT,
    fontSize: 12,
    ...font('700'),
  },
});
