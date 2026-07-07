import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// ─── Palette ─────────────────────────────────────────────────────
const ACCENT = '#C6F135';
const BG = '#0E0E12';
const CARD_BG = '#22222E';
const DAY_OUT = '#2C2C3C';
const DAY_IN = '#252532';
const BORDER = '#42425A';

export default function PlanYourWeekScreen({ navigation }) {

  const [step, setStep] = useState(0);

  const [maxGymDays, setMaxGymDays] = useState(0);
  const [cardioGoal, setCardioGoal] = useState(0);

  const [selectedGymDays, setSelectedGymDays] = useState([]);
  const [cardioPlan, setCardioPlan] = useState({});

  useEffect(() => {
    const loadProfile = async () => {

      const { data: { user } } = await supabase.auth.getUser();

      const { data } = await supabase
        .from('userProfiles')
        .select('workoutSessionsGoal, cardioGoal')
        .eq('id', user.id)
        .single();

      setMaxGymDays(data?.workoutSessionsGoal ?? 0);
      setCardioGoal(data?.cardioGoal ?? 0);
    };

    loadProfile();
  }, []);

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

    if (cardioPlan[day]) {

      const newPlan = { ...cardioPlan };

      delete newPlan[day];

      setCardioPlan(newPlan);

    } else {

      setCardioPlan({
        ...cardioPlan,
        [day]: 0,
      });
    }
  };

  const updateCardioMinutes = (day, minutes) => {

    setCardioPlan({
      ...cardioPlan,
      [day]: parseInt(minutes, 10) || 0,
    });
  };

  const totalCardioMinutes =
    Object.values(cardioPlan)
      .reduce((a, b) => a + b, 0);

  const savePlan = async () => {

    try {

      const weeklyPlan = {};

      selectedGymDays.forEach(day => {
        weeklyPlan[day] = {
          type: 'Workout',
          cardio: 0,
        };
      });

      Object.entries(cardioPlan).forEach(([day, minutes]) => {
        weeklyPlan[day] = {
          type: 'Cardio',
          cardio: minutes,
        };
      });

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

  return (

    <View style={styles.container}>

      <StatusBar barStyle="light-content" />

      {/* Background blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Header */}
          <View style={styles.header}>

            <Text style={styles.title}>
              Plan Your Week
            </Text>

            <Text style={styles.subtitle}>
              Build your perfect fitness routine
            </Text>

            {/* Progress */}
            <View style={styles.progressContainer}>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width:
                        step === 0
                          ? '50%'
                          : '100%',
                    },
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
                Step {step + 1} of 2
              </Text>

            </View>

          </View>

          {/* Main Card */}
          <View style={styles.cardContainer}>

            {/* Step Header */}
            <View style={styles.cardHeader}>

              <View style={styles.cardHeaderLeft}>
                <Ionicons
                  name={
                    step === 0
                      ? 'barbell-outline'
                      : 'heart-outline'
                  }
                  size={16}
                  color={ACCENT}
                />

                <Text style={styles.cardHeaderText}>
                  {step === 0
                    ? `Choose ${maxGymDays} Gym Days`
                    : `Cardio Plan`}
                </Text>
              </View>

              {step === 1 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cardioGoal} MIN GOAL
                  </Text>
                </View>
              )}

            </View>

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
                        styles.dayOuter,
                        selected &&
                        styles.dayOuterSelected,
                      ]}
                      onPress={() =>
                        toggleGymDay(day)
                      }
                    >

                      <View
                        style={[
                          styles.dayInner,
                          selected &&
                          styles.dayInnerSelected,
                        ]}
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

                      </View>

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
                      style={styles.cardioRow}
                    >

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.dayOuterSmall,
                          active &&
                          styles.dayOuterSelected,
                        ]}
                        onPress={() =>
                          toggleCardioDay(day)
                        }
                      >

                        <View
                          style={[
                            styles.dayInnerSmall,
                            active &&
                            styles.dayInnerSelected,
                          ]}
                        >

                          <Text
                            style={[
                              styles.dayText,
                              active &&
                              styles.dayTextSelected,
                            ]}
                          >
                            {day.slice(0, 3)}
                          </Text>

                        </View>

                      </TouchableOpacity>

                      {active && (

                        <TextInput
                          style={styles.minutesInput}
                          placeholder="Minutes"
                          placeholderTextColor="#7070A0"
                          keyboardType="numeric"
                          value={String(cardioPlan[day])}
                          onChangeText={(val) =>
                            updateCardioMinutes(day, val)
                          }
                        />
                      )}

                    </View>
                  );
                })}

                <View style={styles.summaryCard}>

                  <Text style={styles.summaryLabel}>
                    TOTAL CARDIO
                  </Text>

                  <Text style={styles.summaryValue}>
                    {totalCardioMinutes} / {cardioGoal} mins
                  </Text>

                </View>

              </View>
            )}

          </View>

        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>

          {step === 1 && (

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(0)}
            >

              <Ionicons
                name="arrow-back-outline"
                size={18}
                color={ACCENT}
              />

            </TouchableOpacity>
          )}

          {step === 0 && (

            <TouchableOpacity
              style={[
                styles.primaryButton,
                selectedGymDays.length !== maxGymDays &&
                styles.disabledButton,
              ]}
              disabled={
                selectedGymDays.length !== maxGymDays
              }
              onPress={() => setStep(1)}
            >

              <Text style={styles.primaryText}>
                Continue
              </Text>

            </TouchableOpacity>
          )}

          {step === 1 && (

            <TouchableOpacity
              style={[
                styles.primaryButton,
                totalCardioMinutes !== cardioGoal &&
                styles.disabledButton,
              ]}
              disabled={
                totalCardioMinutes !== cardioGoal
              }
              onPress={savePlan}
            >

              <Text style={styles.primaryText}>
                Save Plan
              </Text>

            </TouchableOpacity>
          )}

        </View>

      </KeyboardAvoidingView>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // ── Background ─────────────────────────
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

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 140,
  },

  // ── Header ─────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.7,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#A0A0BC',
    marginBottom: 24,
  },

  progressContainer: {
    width: '100%',
  },

  progressTrack: {
    height: 8,
    backgroundColor: '#252532',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },

  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 10,
  },

  progressText: {
    color: '#A0A0BC',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
  },

  // ── Main Card ──────────────────────────
  cardContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  cardHeaderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  badge: {
    backgroundColor: ACCENT + '22',
    borderWidth: 1,
    borderColor: ACCENT + '55',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badgeText: {
    color: ACCENT,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // ── Grid ───────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  dayOuter: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: DAY_OUT,
    borderWidth: 1.5,
    borderColor: BORDER,
    marginBottom: 14,
    overflow: 'hidden',
  },

  dayInner: {
    flex: 1,
    backgroundColor: DAY_IN,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },

  dayOuterSelected: {
    borderColor: ACCENT,
  },

  dayInnerSelected: {
    backgroundColor: ACCENT,
  },

  dayText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },

  dayTextSelected: {
    color: '#0E0E12',
  },

  // ── Cardio ─────────────────────────────
  cardioContainer: {
    gap: 12,
  },

  cardioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dayOuterSmall: {
    width: 78,
    height: 78,
    borderRadius: 18,
    backgroundColor: DAY_OUT,
    borderWidth: 1.5,
    borderColor: BORDER,
    overflow: 'hidden',
  },

  dayInnerSmall: {
    flex: 1,
    backgroundColor: DAY_IN,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },

  minutesInput: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: DAY_IN,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    color: '#FFFFFF',
    height: 56,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '700',
  },

  summaryCard: {
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: ACCENT + '12',
    borderWidth: 1,
    borderColor: ACCENT + '33',
    alignItems: 'center',
  },

  summaryLabel: {
    color: '#A0A0BC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 4,
  },

  summaryValue: {
    color: ACCENT,
    fontSize: 22,
    fontWeight: '900',
  },

  // ── Bottom Bar ─────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: 'row',
    gap: 10,

    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,

    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  backButton: {
    width: 56,
    height: 56,
    borderRadius: 16,

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1.5,
    borderColor: ACCENT + '55',
    backgroundColor: 'transparent',
  },

  primaryButton: {
    flex: 1,

    backgroundColor: ACCENT,

    paddingVertical: 16,
    borderRadius: 16,

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },

  disabledButton: {
    opacity: 0.35,
  },

  primaryText: {
    color: '#0E0E12',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});