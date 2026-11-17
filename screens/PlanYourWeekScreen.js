import React, { useState, useEffect, useCallback } from 'react';
import { APP_BG_GRADIENT } from '../components/ScreenBackground';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import AuthBackground from '../components/AuthBackground';
import GlassCard from '../components/GlassCard';
import GlassButton, { GLASS_BUTTON_TEXT } from '../components/GlassButton';
import { font } from '../utils/fonts';
import { REPLAN_MODE_KEY } from '../utils/replanMode';
import useTabBarSpace from '../utils/useTabBarSpace';

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// ─── Palette — matches Login / Home (navy, white, black) ─────────
// Black + glass card + soft lime (matches Home)
const BG_GRADIENT = APP_BG_GRADIENT; // shared — components/ScreenBackground.js
const CARD_GRADIENT = ['rgba(139,92,246,0.20)', 'rgba(37,99,235,0.06)', 'rgba(37,99,235,0)']; // purple → blue → clear (same as Home cards)
const TEXT = '#FFFFFF';
const WHITE = '#FFFFFF';
const MUTED = '#9A9A9E';        // secondary text
const PLACEHOLDER = '#6E6E73';
const TILE_BG = 'rgba(255,255,255,0.06)';      // unselected days / rows
const TILE_BORDER = 'rgba(255,255,255,0.10)';
const TILE_ACTIVE_BG = 'rgba(255,255,255,0.09)';
const ACCENT = '#E4F15F';       // soft lime — selected days, badge, focus
const ON_ACCENT = '#1A1A1C';    // text on lime
const WORKOUT_COLOR = '#F59E0B'; // same as Home
const CARDIO_COLOR = '#F43F5E';  // same as Home
const DONE_COLOR = '#4ADE80';    // cardio total reached

// weeklyPlan[day] = { workout: boolean, cardio: minutes, type } — a day can have
// both a workout and cardio. `type` is kept for older readers ('Workout' if the
// day has a workout, otherwise 'Cardio'). Older saves only have `type`.
const isWorkoutDay = (entry) => entry?.workout ?? entry?.type === 'Workout';
const isCardioDay = (entry) =>
  entry?.workout !== undefined ? Number(entry.cardio) > 0 : entry?.type === 'Cardio';

// How far the Done bar sits below the top of the keyboard.
// Increase to move it down/closer to the keyboard, decrease to move it up.
const DONE_BAR_OFFSET = 60;

export default function PlanYourWeekScreen({ navigation }) {
  const tabSpace = useTabBarSpace(); // room for the floating tab bar


  // 'full' | 'cardio' | 'workouts' — see REPLAN_MODE_KEY
  const [mode, setMode] = useState('full');
  const cardioOnly = mode === 'cardio';
  const workoutsOnly = mode === 'workouts';

  const [step, setStep] = useState(0);

  const [maxGymDays, setMaxGymDays] = useState(0);
  const [cardioGoal, setCardioGoal] = useState(0);

  const [selectedGymDays, setSelectedGymDays] = useState([]);
  const [cardioPlan, setCardioPlan] = useState({});

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
      setKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // This screen is also a tab, so it can stay mounted between visits —
  // reload goals, mode and saved plan every time it comes into focus.
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();

          const [{ data }, savedMode, savedPlanJson] = await Promise.all([
            supabase
              .from('userProfiles')
              .select('workoutSessionsGoal, cardioGoal')
              .eq('id', user.id)
              .single(),
            AsyncStorage.getItem(REPLAN_MODE_KEY),
            AsyncStorage.getItem('weeklyPlan'),
          ]);

          if (!isActive) return;

          const nextMode = savedMode === 'cardio' || savedMode === 'workouts' ? savedMode : 'full';
          const savedPlan = savedPlanJson ? JSON.parse(savedPlanJson) : {};

          setMaxGymDays(data?.workoutSessionsGoal ?? 0);
          setCardioGoal(data?.cardioGoal ?? 0);
          setMode(nextMode);
          setStep(nextMode === 'cardio' ? 1 : 0);

          // Keep the activity that isn't being re-planned, since savePlan rebuilds the whole plan
          setSelectedGymDays(
            nextMode === 'cardio'
              ? Object.keys(savedPlan).filter((day) => isWorkoutDay(savedPlan[day]))
              : []
          );
          setCardioPlan(
            nextMode === 'workouts'
              ? Object.fromEntries(
                  Object.entries(savedPlan)
                    .filter(([, entry]) => isCardioDay(entry))
                    .map(([day, entry]) => [day, Number(entry.cardio) || 0])
                )
              : {}
          );
        } catch (err) {
          console.error('Plan Your Week load error:', err.message);
        }
      };

      load();
      return () => { isActive = false; };
    }, [])
  );

  const toggleGymDay = (day) => {

    if (selectedGymDays.includes(day)) {
      setSelectedGymDays(
        selectedGymDays.filter(d => d !== day)
      );

    } else if (selectedGymDays.length < maxGymDays) {
      setSelectedGymDays([
        ...selectedGymDays,
        day
      ]);
    }
  };

  const toggleCardioDay = (day) => {
    if (cardioPlan[day] !== undefined) {
      const newPlan = { ...cardioPlan };
      delete newPlan[day];
      setCardioPlan(newPlan);
    } else {
      setCardioPlan({ ...cardioPlan, [day]: '' });
    }
  };

  const updateCardioMinutes = (day, minutes) => {

    // allow the field to be fully cleared while typing —
    // only coerce to a number once there's actually a digit
    if (minutes === '') {
      setCardioPlan({ ...cardioPlan, [day]: '' });
      return;
    }

    const parsed = parseInt(minutes, 10);

    setCardioPlan({
      ...cardioPlan,
      [day]: Number.isNaN(parsed) ? '' : parsed,
    });
  };

  const totalCardioMinutes =
    Object.values(cardioPlan)
      .reduce((a, b) => a + (Number(b) || 0), 0);

  const savePlan = async () => {

    try {

      // A day can have a workout, cardio, or both
      const weeklyPlan = {};

      daysOfWeek.forEach(day => {
        const workout = selectedGymDays.includes(day);
        const cardio = Number(cardioPlan[day]) || 0;

        if (!workout && cardio === 0) return;

        weeklyPlan[day] = {
          type: workout ? 'Workout' : 'Cardio',
          workout,
          cardio,
        };
      });

      // Store Weekly Plan - Which days that the user plans todo cardio or their workouts  (STORED LOCALLY)
      await AsyncStorage.setItem(
        'weeklyPlan',
        JSON.stringify(weeklyPlan)
      );

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('userProfiles')
        .update({
          UserHasWeeklyPlanSetup: true,
          lastupdate_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      await AsyncStorage.removeItem(REPLAN_MODE_KEY);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });

    } catch (err) {
      console.error(
        'Save plan error:',
        err.message
      );
    }
  };

  const gymDaysComplete = selectedGymDays.length === maxGymDays;
  const cardioComplete = totalCardioMinutes === cardioGoal;
  const stepColor = step === 0 ? WORKOUT_COLOR : CARDIO_COLOR;

  return (

    <View style={styles.container}>

      <StatusBar barStyle="light-content" />

      {/* Background — matches Login / Home */}
      <AuthBackground colors={BG_GRADIENT} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 + tabSpace }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Header */}
          <View style={styles.header}>

            <Text style={styles.headerEyebrow}>WEEKLY PLAN</Text>

            <Text style={styles.title}>
              Plan Your Week
            </Text>

            <Text style={styles.subtitle}>
              Fail to Plan, Plan to Fail
            </Text>

            {/* Progress — one segment per step (cardio-only has a single step) */}
            <View style={styles.progressContainer}>

              <View style={styles.progressRow}>
                {(mode === 'full' ? [0, 1] : [step]).map((i) => (
                  <View
                    key={i}
                    style={[styles.progressSegment, i <= step && styles.progressSegmentDone]}
                  />
                ))}
              </View>

              <Text style={styles.progressText}>
                {cardioOnly
                  ? 'Update your cardio days'
                  : workoutsOnly
                    ? 'Update your workout days'
                    : `Step ${step + 1} of 2`}
              </Text>

            </View>

          </View>

          {/* Main Card */}
          <GlassCard style={styles.cardContainer} gradient={CARD_GRADIENT}>

            {/* Step Header */}
            <View style={styles.cardHeader}>

              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: stepColor }]}>
                  <Ionicons
                    name={
                      step === 0
                        ? 'barbell-outline'
                        : 'heart-outline'
                    }
                    size={16}
                    color={WHITE}
                  />
                </View>

                <Text style={styles.cardHeaderText}>
                  {step === 0
                    ? `Select ${maxGymDays} Workout Days`
                    : `Plan your Cardio Days`}
                </Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {step === 0
                    ? `${selectedGymDays.length} / ${maxGymDays}`
                    : `${cardioGoal} MIN`}
                </Text>
              </View>

            </View>

            <Text style={styles.cardSubtitle}>
              {step === 0
                ? 'Tap the days you plan to train.'
                : 'Tap a day to add cardio, then enter the minutes.'}
            </Text>

            {/* Gym Days */}
            {step === 0 && (

              <View style={styles.grid}>

                {daysOfWeek.map((day) => {

                  const selected =
                    selectedGymDays.includes(day);

                  return (

                    <TouchableOpacity
                      key={day}
                      activeOpacity={0.8}
                      style={[
                        styles.dayTile,
                        selected &&
                        styles.dayTileSelected,
                      ]}
                      onPress={() =>
                        toggleGymDay(day)
                      }
                    >

                      <Text
                        style={[
                          styles.dayText,
                          selected &&
                          styles.dayTextSelected,
                        ]}
                      >
                        {day.slice(0, 3)}
                      </Text>

                      <Ionicons
                        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={18}
                        color={selected ? ON_ACCENT : PLACEHOLDER}
                      />

                    </TouchableOpacity>
                  );
                })}

              </View>
            )}

            {/* Cardio */}
            {step === 1 && (

              <View style={styles.cardioContainer}>

                {daysOfWeek.map((day) => {

                  const active =
                    cardioPlan[day] !== undefined;

                  return (

                    <View
                      key={day}
                      style={[styles.cardioRow, active && styles.cardioRowActive]}
                    >

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.dayChip,
                          active &&
                          styles.dayTileSelected,
                        ]}
                        onPress={() =>
                          toggleCardioDay(day)
                        }
                      >

                        <Text
                          style={[
                            styles.dayTextSmall,
                            active &&
                            styles.dayTextSelected,
                          ]}
                        >
                          {day.slice(0, 3)}
                        </Text>

                      </TouchableOpacity>

                      {active ? (

                        <View style={styles.minutesInputWrap}>

                          <TextInput
                            style={styles.minutesInput}
                            placeholder="0"
                            placeholderTextColor={PLACEHOLDER}
                            keyboardType="number-pad"
                            value={String(cardioPlan[day])}
                            onChangeText={(val) =>
                              updateCardioMinutes(day, val)
                            }
                          />

                          <Text style={styles.minutesUnit}>
                            min
                          </Text>

                        </View>

                      ) : (

                        <Text style={styles.inactiveLabel}>
                          Not scheduled
                        </Text>

                      )}

                    </View>
                  );
                })}

                <View style={styles.summaryCard}>

                  <Text style={styles.summaryLabel}>
                    TOTAL CARDIO
                  </Text>

                  <Text style={[styles.summaryValue, cardioComplete && styles.summaryValueDone]}>
                    {totalCardioMinutes} / {cardioGoal} Minutes
                  </Text>

                </View>

              </View>
            )}

          </GlassCard>

        </ScrollView>

        {/* Bottom Bar */}
        <View style={[styles.bottomBar, { bottom: tabSpace }]}>

          {step === 1 && !cardioOnly && (

            <GlassButton
              style={styles.backButton}
              onPress={() => setStep(0)}
            >

              <Ionicons
                name="arrow-back-outline"
                size={20}
                color={GLASS_BUTTON_TEXT}
              />

            </GlassButton>
          )}

          {step === 0 && (

            <GlassButton
              style={[
                styles.primaryButton,
                !gymDaysComplete &&
                styles.disabledButton,
              ]}
              disabled={!gymDaysComplete}
              onPress={() => (workoutsOnly ? savePlan() : setStep(1))}
            >

              <Text style={styles.primaryText}>
                {workoutsOnly ? 'Save Plan' : 'Continue'}
              </Text>
              <Ionicons
                name={workoutsOnly ? 'checkmark-outline' : 'arrow-forward-outline'}
                size={18}
                color={GLASS_BUTTON_TEXT}
              />

            </GlassButton>
          )}

          {step === 1 && (

            <GlassButton
              style={[
                styles.primaryButton,
                !cardioComplete &&
                styles.disabledButton,
              ]}
              disabled={!cardioComplete}
              onPress={savePlan}
            >

              <Text style={styles.primaryText}>
                Save Plan
              </Text>
              <Ionicons name="checkmark-outline" size={18} color={GLASS_BUTTON_TEXT} />

            </GlassButton>
          )}

        </View>

      </KeyboardAvoidingView>

      {/* Numeric keypad Done bar — floats above keyboard via Keyboard listener */}
      {Platform.OS === 'ios' && keyboardVisible && step === 1 && (
       <View
       style={[
         styles.accessoryBar,
         { bottom: keyboardHeight - DONE_BAR_OFFSET },
       ]}
     >
          <TouchableOpacity
            onPress={() => Keyboard.dismiss()}
            style={styles.accessoryDoneButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.accessoryDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 140,
  },

  // ── Header ─────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },

  headerEyebrow: {
    color: WHITE,
    opacity: 0.8,
    fontSize: 11,
    ...font('700'),
    letterSpacing: 2,
    marginBottom: 4,
  },

  title: {
    fontSize: 28,
    ...font('900'),
    color: WHITE,
    letterSpacing: -0.7,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    ...font('400'),
    color: WHITE,
    opacity: 0.8,
    marginBottom: 20,
  },

  progressContainer: {
    width: '100%',
  },

  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },

  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF4D',
  },

  progressSegmentDone: {
    backgroundColor: WHITE,
  },

  progressText: {
    color: WHITE,
    fontSize: 13,
    ...font('600'),
    textAlign: 'center',
  },

  // ── Main Card ──────────────────────────
  // Glass look + edge come from GlassCard
  cardContainer: {
    padding: 20,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },

  cardHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardHeaderText: {
    color: TEXT,
    fontSize: 17,
    ...font('800'),
    letterSpacing: -0.3,
    flexShrink: 1,
  },

  cardSubtitle: {
    color: MUTED,
    fontSize: 13,
    ...font('400'),
    marginBottom: 16,
  },

  badge: {
    backgroundColor: ACCENT,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },

  badgeText: {
    color: ON_ACCENT,
    fontSize: 11,
    ...font('800'),
    letterSpacing: 0.5,
  },

  // ── Workout day grid ───────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  dayTile: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: TILE_BG,
    borderWidth: 1.5,
    borderColor: TILE_BORDER,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  dayTileSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },

  dayText: {
    color: TEXT,
    fontSize: 16,
    ...font('800'),
    letterSpacing: 0.5,
  },

  dayTextSelected: {
    color: ON_ACCENT,
  },


  // ── Cardio rows ────────────────────────
  cardioContainer: {
    gap: 8,
  },

  cardioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: TILE_BG,
    borderRadius: 14,
    padding: 6,
    paddingRight: 8,
  },

  cardioRowActive: {
    backgroundColor: TILE_ACTIVE_BG,
    borderWidth: 1.5,
    borderColor: ACCENT,
    padding: 4.5,
    paddingRight: 6.5,
  },

  dayChip: {
    width: 52,
    height: 40,
    borderRadius: 10,
    backgroundColor: TILE_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dayTextSmall: {
    color: TEXT,
    fontSize: 13,
    ...font('800'),
    letterSpacing: 0.5,
  },

  minutesInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 40,
    minWidth: 100,
    justifyContent: 'flex-end',
    gap: 6,
  },

  minutesInput: {
    color: TEXT,
    fontSize: 18,
    ...font('800'),
    textAlign: 'right',
    minWidth: 40,
    padding: 0,
  },

  minutesUnit: {
    color: MUTED,
    fontSize: 12,
    ...font('600'),
  },

  inactiveLabel: {
    color: MUTED,
    fontSize: 12,
    ...font('600'),
    paddingRight: 8,
  },

  summaryCard: {
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: TILE_BG,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    alignItems: 'center',
  },

  summaryLabel: {
    color: WHITE,
    opacity: 0.7,
    fontSize: 11,
    ...font('700'),
    letterSpacing: 1.4,
    marginBottom: 4,
  },

  summaryValue: {
    color: WHITE,
    fontSize: 22,
    ...font('900'),
  },

  summaryValueDone: {
    color: DONE_COLOR,
  },

  // ── Floating Done Bar (above keyboard) ─
  accessoryBar: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#2C2C2F',
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  accessoryDoneButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  accessoryDoneText: {
    color: WHITE,
    fontSize: 16,
    ...font('700'),
  },

  // ── Bottom Bar ─────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: 'row',
    gap: 10,

    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,

    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },

  // Glass look comes from GlassButton
  backButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Glass look comes from GlassButton
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.3,
  },

  primaryText: {
    color: GLASS_BUTTON_TEXT,
    fontSize: 15,
    ...font('800'),
    letterSpacing: 0.3,
  },
});
