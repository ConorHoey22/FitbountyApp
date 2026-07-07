


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

// ── Icon / colour helpers ─────────────────────────────────────────────────────
const WORKOUT_STYLES = [
  { icon: 'bicycle-outline',  color: '#C6F135' },   // lime
  { icon: 'barbell-outline',  color: '#A49BFF' },   // lavender
  { icon: 'body-outline',     color: '#FFA940' },   // amber
  { icon: 'flash-outline',    color: '#C6F135' },   // lime
  { icon: 'walk-outline',     color: '#A49BFF' },   // lavender
  { icon: 'fitness-outline',  color: '#FF4D6D' },   // red
];

const styleFor = (index) => WORKOUT_STYLES[index % WORKOUT_STYLES.length];

export default function WorkoutsScreen() {
  const navigation = useNavigation();

  const [workoutNames, setWorkoutNames]     = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [exercises, setExercises]           = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);

  useEffect(() => { fetchWorkoutNames(); }, []);

  async function fetchWorkoutNames() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('tempWorkouts')
        .select('workout_name')
        .not('workout_name', 'is', null);
      if (sbError) throw sbError;
      setWorkoutNames([...new Set(data.map((r) => r.workout_name))]);
    } catch (e) {
      setError('Failed to load workouts.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function selectWorkout(name) {
    setSelectedWorkout(name);
    setExercises([]);
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('tempWorkouts')
        .select('id, exercise_name, sets, reps, rest_timer')
        .eq('workout_name', name)
        .not('exercise_name', 'is', null);
      if (sbError) throw sbError;
      setExercises(data);
    } catch (e) {
      setError('Failed to load exercises.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setSelectedWorkout(null);
    setExercises([]);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <View style={styles.content}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            {selectedWorkout ? (
              <>
                <TouchableOpacity onPress={goBack} style={styles.backRow}>
                  <Ionicons name="chevron-back-outline" size={16} color={ACCENT} />
                  <Text style={styles.backText}>All Workouts</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{selectedWorkout}</Text>
                <Text style={styles.subtitle}>
                  {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
                </Text>
              </>
            ) : (
              <>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>FITBOUNTY</Text>
                </View>
                <Text style={styles.title}>Workouts</Text>
                <Text style={styles.subtitle}>Choose a workout to begin</Text>
              </>
            )}
          </View>

          {!selectedWorkout && (
            <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
              <Ionicons name="add-outline" size={22} color="#0E0E12" />
            </TouchableOpacity>
          )}
        </View>

        {/* Loading */}
        {loading && (
          <ActivityIndicator size="large" color={ACCENT} style={{ marginTop: 40 }} />
        )}

        {/* Error */}
        {!loading && error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#FF4D6D" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Workout List ── */}
        {!loading && !selectedWorkout && (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {workoutNames.map((name, index) => {
              const { icon, color } = styleFor(index);
              return (
                <TouchableOpacity
                  key={name}
                  onPress={() => selectWorkout(name)}
                  activeOpacity={0.75}
                >
                  <View style={styles.card}>
                    <View style={[styles.iconContainer, { borderColor: color + '44', backgroundColor: color + '14' }]}>
                      <Ionicons name={icon} size={24} color={color} />
                    </View>

                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>{name}</Text>
                      <Text style={styles.cardSub}>Tap to view exercises</Text>
                    </View>

                    <View style={styles.chevronWrap}>
                      <Ionicons name="chevron-forward-outline" size={18} color={ACCENT} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {workoutNames.length === 0 && (
              <Text style={styles.emptyText}>No workouts found.</Text>
            )}
          </ScrollView>
        )}

        {/* ── Exercise List ── */}
        {!loading && selectedWorkout && (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {exercises.map((ex, index) => (
              <View key={ex.id} style={styles.card}>
                {/* Number badge */}
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>

                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseName}>{ex.exercise_name}</Text>

                  <View style={styles.exerciseMeta}>
                    {ex.sets && (
                      <View style={styles.metaPill}>
                        <Ionicons name="layers-outline" size={11} color={ACCENT} />
                        <Text style={styles.metaText}>{ex.sets} sets</Text>
                      </View>
                    )}
                    {ex.reps && (
                      <View style={styles.metaPill}>
                        <Ionicons name="repeat-outline" size={11} color="#A49BFF" />
                        <Text style={styles.metaText}>{ex.reps} reps</Text>
                      </View>
                    )}
                    {ex.rest_timer != null && (
                      <View style={styles.metaPill}>
                        <Ionicons name="timer-outline" size={11} color="#FFA940" />
                        <Text style={styles.metaText}>{ex.rest_timer}s rest</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {exercises.length > 0 && (
              <TouchableOpacity
                style={styles.startButton}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('WorkoutModeScreen', {
                    workoutName: selectedWorkout,
                    exercises,
                  })
                }
              >
                <Ionicons name="play-outline" size={20} color="#0E0E12" />
                <Text style={styles.startButtonText}>START WORKOUT</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

      </View>
    </View>
  );
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const ACCENT   = '#C6F135';
const BG       = '#0E0E12';
const CARD     = '#22222E';
const SURFACE2 = '#2C2C3C';
const BORDER   = '#42425A';

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

  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 64,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 28,
  },
  headerTextContainer: {
    flex: 1,
    gap: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: ACCENT + '22',
    borderWidth: 1,
    borderColor: ACCENT + '55',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: ACCENT,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0BC',
    fontWeight: '500',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 8,
  },
  backText: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: '700',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },

  // Lists
  list: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  // Error / empty
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF4D6D18',
    borderLeftWidth: 3,
    borderLeftColor: '#FF4D6D',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  errorText: {
    color: '#FF4D6D',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    color: '#A0A0BC',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },

  // ── Cards (shared by both workout list + exercise list) ──
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  // Workout list
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  cardSub: {
    fontSize: 12,
    color: '#A0A0BC',
    fontWeight: '500',
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: SURFACE2,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Exercise list
  numberBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: ACCENT + '22',
    borderWidth: 1.5,
    borderColor: ACCENT + '55',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  numberText: {
    color: ACCENT,
    fontWeight: '800',
    fontSize: 14,
  },
  exerciseDetails: { flex: 1 },
  exerciseName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE2,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#DDDDF0',
    fontWeight: '600',
  },

  // Start button
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 30,
    gap: 8,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonText: {
    color: '#0E0E12',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});