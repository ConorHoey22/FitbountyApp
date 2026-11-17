import React, { useState, useEffect } from 'react';
import ScreenBackground from '../components/ScreenBackground';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import GlassCard from '../components/GlassCard';
import GlassButton, { GLASS_BUTTON_TEXT } from '../components/GlassButton';
import { font } from '../utils/fonts';
import { createCustomWorkout, getExerciseNames } from '../utils/customWorkouts';

// Create Workout — the user builds their own workout (name + exercises) and
// saves it to Supabase (utils/customWorkouts.js). Opened from the + button on
// the Workouts screen, which passes `takenNames` (template + custom workout
// names) so names stay unique.

const DEFAULT_REST = 120; // seconds, used when Rest is left empty

export default function CreateWorkoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const takenNames = (route.params?.takenNames ?? []).map((n) => n.toLowerCase());

  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([]);

  // Exercise being entered
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [rest, setRest] = useState('');

  const [focusedInput, setFocusedInput] = useState(null);
  const [saving, setSaving] = useState(false);

  // Existing exercise names for the dropdown (so PRs match up)
  const [knownExercises, setKnownExercises] = useState([]);
  useEffect(() => {
    getExerciseNames()
      .then(setKnownExercises)
      .catch((err) => console.error('Exercise names load error:', err.message));
  }, []);

  const search = exerciseName.trim().toLowerCase();
  const exerciseMatches = knownExercises.filter((n) => n.toLowerCase().includes(search));
  const showExerciseDropdown =
    focusedInput === 'exerciseName' &&
    exerciseMatches.length > 0 &&
    !(exerciseMatches.length === 1 && exerciseMatches[0].toLowerCase() === search); // hide once picked

  const handleAddExercise = () => {
    // Typed an existing exercise with different capitals/spaces? Use its exact name
    const typed = exerciseName.trim();
    const name = knownExercises.find((n) => n.toLowerCase() === typed.toLowerCase()) ?? typed;
    const setsNum = parseInt(sets, 10);
    const repsText = reps.trim();
    const restNum = rest.trim() === '' ? DEFAULT_REST : parseInt(rest, 10);

    if (!name) return Alert.alert('Missing exercise', 'Enter an exercise name.');
    if (!setsNum || setsNum < 1 || setsNum > 20) return Alert.alert('Sets', 'Enter between 1 and 20 sets.');
    if (!repsText) return Alert.alert('Reps', 'Enter the reps, e.g. 8 or 8-10.');
    if (isNaN(restNum) || restNum < 0 || restNum > 900) return Alert.alert('Rest', 'Enter a rest time between 0 and 900 seconds.');

    setExercises((prev) => [...prev, { exercise_name: name, sets: setsNum, reps: repsText, rest_timer: restNum }]);
    setExerciseName('');
    setSets('');
    setReps('');
    setRest('');
  };

  const handleRemoveExercise = (index) =>
    setExercises((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    const name = workoutName.trim();
    if (!name) return Alert.alert('Missing name', 'Give your workout a name.');
    if (takenNames.includes(name.toLowerCase())) {
      return Alert.alert('Name taken', 'There is already a workout with that name.');
    }
    if (exercises.length === 0) return Alert.alert('No exercises', 'Add at least one exercise.');

    try {
      setSaving(true);
      await createCustomWorkout(name, exercises);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save workout', err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputProps = (key) => ({
    placeholderTextColor: MUTED,
    onFocus: () => setFocusedInput(key),
    onBlur: () => setFocusedInput(null),
    style: [styles.input, focusedInput === key && styles.inputFocused],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenBackground />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <GlassButton style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color={WHITE} />
            </GlassButton>
            <Text style={styles.title}>Create Workout</Text>
          </View>

          {/* Workout name */}
          <Text style={styles.label}>WORKOUT NAME</Text>
          <TextInput
            {...inputProps('workoutName')}
            placeholder="e.g. Push Day"
            value={workoutName}
            onChangeText={setWorkoutName}
            maxLength={40}
          />

          {/* Add an exercise */}
          <GlassCard style={styles.card} gradient={CARD_GRADIENT}>
            <Text style={styles.cardTitle}>Add Exercise</Text>

            <Text style={styles.label}>EXERCISE NAME</Text>
            <TextInput
              {...inputProps('exerciseName')}
              placeholder="Search or type a new exercise"
              value={exerciseName}
              onChangeText={setExerciseName}
              maxLength={60}
              autoCorrect={false}
            />

            {/* Dropdown of existing exercises — filters as you type */}
            {showExerciseDropdown && (
              <View style={styles.dropdown}>
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {exerciseMatches.map((name) => (
                    <TouchableOpacity
                      key={name}
                      style={styles.dropdownItem}
                      onPress={() => setExerciseName(name)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="barbell-outline" size={16} color={MUTED} />
                      <Text style={styles.dropdownText}>{name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.label}>SETS</Text>
                <TextInput
                  {...inputProps('sets')}
                  placeholder="3"
                  keyboardType="number-pad"
                  value={sets}
                  onChangeText={setSets}
                  maxLength={2}
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.label}>REPS</Text>
                <TextInput
                  {...inputProps('reps')}
                  placeholder="8-10"
                  keyboardType="numbers-and-punctuation"
                  value={reps}
                  onChangeText={setReps}
                  maxLength={7}
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.label}>REST (S)</Text>
                <TextInput
                  {...inputProps('rest')}
                  placeholder={String(DEFAULT_REST)}
                  keyboardType="number-pad"
                  value={rest}
                  onChangeText={setRest}
                  maxLength={3}
                />
              </View>
            </View>

            <GlassButton style={styles.addButton} onPress={handleAddExercise}>
              <Ionicons name="add" size={18} color={GLASS_BUTTON_TEXT} />
              <Text style={styles.buttonText}>Add Exercise</Text>
            </GlassButton>
          </GlassCard>

          {/* Exercises added so far */}
          {exercises.length > 0 && (
            <>
              <Text style={[styles.label, { marginTop: 8 }]}>EXERCISES</Text>
              {exercises.map((ex, index) => (
                <GlassCard key={`${ex.exercise_name}-${index}`} style={styles.exerciseCard} gradient={CARD_GRADIENT}>
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberText}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName}>{ex.exercise_name}</Text>
                    <Text style={styles.exerciseMeta}>
                      {ex.sets} sets · {ex.reps} reps · {ex.rest_timer}s rest
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveExercise(index)} hitSlop={10}>
                    <Ionicons name="trash-outline" size={20} color={DANGER} />
                  </TouchableOpacity>
                </GlassCard>
              ))}
            </>
          )}

          {/* Save */}
          <GlassButton style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={WHITE} size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={18} color={GLASS_BUTTON_TEXT} />
                <Text style={styles.buttonText}>Save Workout</Text>
              </>
            )}
          </GlassButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Palette — matches Home ──────────────────────────────────────────────────
const CARD_GRADIENT = ['rgba(139,92,246,0.20)', 'rgba(37,99,235,0.06)', 'rgba(37,99,235,0)']; // purple → blue → clear
const WHITE = '#FFFFFF';
const MUTED = '#9A9A9E';
const ACCENT = '#F59E0B'; // amber — workout colour
const DANGER = '#EF4444';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: WHITE,
    fontSize: 28,
    ...font('800'),
    letterSpacing: -0.5,
  },

  // Inputs
  label: {
    color: WHITE,
    fontSize: 10,
    ...font('700'),
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: WHITE,
    fontSize: 15,
    ...font('500'),
    marginBottom: 14,
  },
  inputFocused: {
    borderColor: WHITE,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },

  // Exercise dropdown
  dropdown: {
    maxHeight: 220,
    marginTop: -8,
    marginBottom: 14,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  dropdownText: {
    color: WHITE,
    fontSize: 15,
    ...font('500'),
  },
  rowItem: {
    flex: 1,
  },

  // Add exercise card
  card: {
    padding: 16,
    marginTop: 6,
    marginBottom: 14,
  },
  cardTitle: {
    color: WHITE,
    fontSize: 18,
    ...font('700'),
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  buttonText: {
    color: GLASS_BUTTON_TEXT,
    fontSize: 15,
    ...font('700'),
  },

  // Added exercises
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginBottom: 10,
  },
  numberBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: ACCENT + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: WHITE,
    fontSize: 14,
    ...font('800'),
  },
  exerciseName: {
    color: WHITE,
    fontSize: 15,
    ...font('700'),
    marginBottom: 2,
  },
  exerciseMeta: {
    color: WHITE,
    fontSize: 12,
    ...font('500'),
  },

  // Save
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 10,
  },
});
