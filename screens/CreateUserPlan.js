import React, { useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function CreateUserPlan() {
  const navigation = useNavigation();
  const [step, setStep] = useState(0);
  const [validationError, setValidationError] = useState('');

  // Use a ref for the submitting guard — ref changes don't trigger re-renders
  // so it can't be accidentally reset by a state update mid-flight
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const [answers, setAnswers] = useState({
    name: '',
    goal: '',
    unit: '',
    weightKg: '',
    weightStone: '',
    weightLbs: '',
    weightPounds: '',
    workoutDays: '',
    steps: '',
    cardioMinutes: '',
  });

  const questions = [
    { key: 'name',          label: "What's your name?",                               required: true,  type: 'text' },
    { key: 'goal',          label: 'What is your goal?',                               required: true,  type: 'text' },
    { key: 'unit',          label: 'Which unit of measurement would you like to use?', required: true,  type: 'unit' },
    { key: 'weight',        label: 'What is your current weight?',                     required: false, type: 'weight' },
    { key: 'workoutDays',   label: 'How many days a week would you like to work out?', required: false, type: 'workoutDays' },
    { key: 'steps',         label: 'How many daily steps would you like to aim for?',  required: false, type: 'steps' },
    { key: 'cardioMinutes', label: 'How many minutes of cardio per week?',             required: false, type: 'cardioMinutes' },
  ];

  const LAST_STEP = questions.length - 1;
  const currentQ  = questions[step];
  const isLast    = step === LAST_STEP;
  const progress  = (step + 1) / questions.length;

  const handleChange = (key, value) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!currentQ.required) return true;
    // For 'unit' step, check answers.unit directly
    const val = currentQ.type === 'unit' ? answers.unit : answers[currentQ.key];
    if (!val || val.toString().trim() === '') {
      setValidationError('This field is required');
      return false;
    }
    setValidationError('');
    return true;
  };

  const advance = () => {
    // Never go past LAST_STEP — clamp defensively
    setStep((s) => Math.min(s + 1, LAST_STEP));
  };

  const handleNext = () => {
    if (submittingRef.current) return;
    if (!validate()) return;
    setValidationError('');
    if (isLast) {
      handleSubmit();
    } else {
      advance();
    }
  };

  const handleSkip = () => {
    if (submittingRef.current) return;
    setValidationError('');
    if (isLast) {
      handleSubmit();
    } else {
      advance();
    }
  };

  const handleSubmit = async () => {
    // Double-guard: ref (sync) + state (visual)
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Not authenticated');

      let weightInKg = null;
      if (answers.unit === 'KG') {
        weightInKg = parseFloat(answers.weightKg) || null;
      } else if (answers.unit === 'Stone') {
        const stone = parseInt(answers.weightStone, 10) || 0;
        const lbs   = parseInt(answers.weightLbs,   10) || 0;
        weightInKg  = stone * 6.35029 + lbs * 0.453592 || null;
      } else if (answers.unit === 'Pounds') {
        weightInKg = (parseFloat(answers.weightPounds) || 0) * 0.453592 || null;
      }

      const { error: updateError } = await supabase
        .from('userProfiles')
        .update({
          first_name:          answers.name,
          goal:                answers.goal,
          unitMeasurement:     answers.unit,
          startingWeight:      weightInKg,
          currentWeight:       weightInKg,
          workoutSessionsGoal: answers.workoutDays || null,
          stepGoal:            answers.steps       || null,
          cardioGoal:          answers.cardioMinutes || null,
          UserHasEnteredTheirProfileDataTrigger: true,
          UserHasWeeklyPlanSetup: false,
          lastupdate_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Navigate away — component unmounts, so no state cleanup needed
      navigation.reset({
        index: 0,
        routes: [{ name: 'AppTabs', state: { index: 0, routes: [{ name: 'Home' }] } }],
      });

    } catch (err) {
      console.error('Submit error:', err.message);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      // Only reset the guard on failure so the user can retry
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Meta row */}
        <View style={styles.meta}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SETUP</Text>
          </View>
          <Text style={styles.stepCount}>{step + 1} of {questions.length}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Question */}
        <Text style={styles.question}>{currentQ.label}</Text>

        {/* Validation error */}
        {validationError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={15} color="#FF4D6D" />
            <Text style={styles.errorText}>{validationError}</Text>
          </View>
        ) : null}

        {/* Unit selection */}
        {currentQ.type === 'unit' && (
          <View style={styles.optionGroup}>
            {['KG', 'Stone', 'Pounds'].map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.optionCard, answers.unit === u && styles.optionCardSelected]}
                onPress={() => handleChange('unit', u)}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionText, answers.unit === u && styles.optionTextSelected]}>
                  {u}
                </Text>
                {answers.unit === u && (
                  <Ionicons name="checkmark-circle" size={18} color={ACCENT} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Weight — no unit selected yet */}
        {currentQ.type === 'weight' && !answers.unit && (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color="#A0A0BC" />
            <Text style={styles.infoText}>Please go back and select a unit first.</Text>
          </View>
        )}

        {/* Weight — KG */}
        {currentQ.type === 'weight' && answers.unit === 'KG' && (
          <TextInput
            style={styles.input}
            placeholder="Enter weight in KG"
            placeholderTextColor="#4a4a5a"
            keyboardType="decimal-pad"
            value={answers.weightKg}
            onChangeText={(val) =>
              handleChange('weightKg', val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))
            }
          />
        )}

        {/* Weight — Stone */}
        {currentQ.type === 'weight' && answers.unit === 'Stone' && (
          <View style={styles.splitRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Stone"
              placeholderTextColor="#4a4a5a"
              keyboardType="decimal-pad"
              value={answers.weightStone}
              onChangeText={(val) =>
                handleChange('weightStone', val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))
              }
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 8 }]}
              placeholder="Lbs"
              placeholderTextColor="#4a4a5a"
              keyboardType="decimal-pad"
              value={answers.weightLbs}
              onChangeText={(val) =>
                handleChange('weightLbs', val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))
              }
            />
          </View>
        )}

        {/* Weight — Pounds */}
        {currentQ.type === 'weight' && answers.unit === 'Pounds' && (
          <TextInput
            style={styles.input}
            placeholder="Enter weight in pounds"
            placeholderTextColor="#4a4a5a"
            keyboardType="decimal-pad"
            value={answers.weightPounds}
            onChangeText={(val) =>
              handleChange('weightPounds', val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))
            }
          />
        )}

        {/* Workout days */}
        {currentQ.type === 'workoutDays' && (
          <TextInput
            style={styles.input}
            placeholder="1 – 7 days"
            placeholderTextColor="#4a4a5a"
            keyboardType="number-pad"
            value={answers.workoutDays}
            onChangeText={(val) => {
              const n = val.replace(/[^0-9]/g, '');
              if (n === '' || (+n >= 0 && +n <= 7)) handleChange('workoutDays', n);
            }}
          />
        )}

        {/* Steps */}
        {currentQ.type === 'steps' && (
          <TextInput
            style={styles.input}
            placeholder="e.g. 10000"
            placeholderTextColor="#4a4a5a"
            keyboardType="number-pad"
            value={answers.steps}
            onChangeText={(val) => handleChange('steps', val.replace(/[^0-9]/g, ''))}
          />
        )}

        {/* Cardio minutes */}
        {currentQ.type === 'cardioMinutes' && (
          <TextInput
            style={styles.input}
            placeholder="e.g. 150"
            placeholderTextColor="#4a4a5a"
            keyboardType="number-pad"
            value={answers.cardioMinutes}
            onChangeText={(val) => handleChange('cardioMinutes', val.replace(/[^0-9]/g, ''))}
          />
        )}

        {/* Default text */}
        {currentQ.type === 'text' && (
          <TextInput
            style={styles.input}
            placeholder="Type here…"
            placeholderTextColor="#4a4a5a"
            value={String(answers[currentQ.key])}
            onChangeText={(val) => handleChange(currentQ.key, val)}
          />
        )}

        {/* Next / Finish */}
        <TouchableOpacity
          style={[styles.nextButton, submitting && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={submitting}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>
            {submitting ? 'SAVING…' : isLast ? 'FINISH →' : 'NEXT →'}
          </Text>
        </TouchableOpacity>

        {/* Skip */}
        {!currentQ.required && !submitting && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.75}>
            <Text style={styles.skipButtonText}>Skip this step</Text>
          </TouchableOpacity>
        )}

        {/* Step dots */}
        <View style={styles.dots}>
          {questions.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === step  && styles.dotActive,
                i < step    && styles.dotDone,
              ]}
            />
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const ACCENT  = '#C6F135';
const BG      = '#0E0E12';
const SURFACE = '#22222E';
const BORDER  = '#42425A';

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: BG },
  blobTopRight:  { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: ACCENT, opacity: 0.05, top: -80, right: -80 },
  blobBottomLeft:{ position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: '#5B4FE8', opacity: 0.06, bottom: 60, left: -80 },

  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 60 },

  meta:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  badge:     { backgroundColor: ACCENT + '22', borderWidth: 1, borderColor: ACCENT + '55', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText: { color: ACCENT, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  stepCount: { color: '#A0A0BC', fontSize: 12, fontWeight: '600' },

  progressTrack: { height: 4, backgroundColor: SURFACE, borderRadius: 2, marginBottom: 32, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: ACCENT, borderRadius: 2 },

  question: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5, lineHeight: 32, marginBottom: 28 },

  errorBox:  { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#FF4D6D18', borderLeftWidth: 3, borderLeftColor: '#FF4D6D', borderRadius: 8, padding: 10, marginBottom: 16 },
  errorText: { color: '#FF4D6D', fontSize: 13, fontWeight: '600' },

  infoBox:  { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: SURFACE, borderRadius: 10, padding: 12, marginBottom: 20 },
  infoText: { color: '#A0A0BC', fontSize: 13 },

  input:    { backgroundColor: SURFACE, borderWidth: 1.5, borderColor: BORDER, borderRadius: 14, padding: 16, marginBottom: 24, color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
  splitRow: { flexDirection: 'row', marginBottom: 24 },

  optionGroup:         { gap: 10, marginBottom: 28 },
  optionCard:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: SURFACE, borderWidth: 1.5, borderColor: BORDER, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 18 },
  optionCardSelected:  { borderColor: ACCENT, backgroundColor: ACCENT + '14' },
  optionText:          { color: '#A0A0BC', fontSize: 16, fontWeight: '600' },
  optionTextSelected:  { color: '#FFFFFF', fontWeight: '700' },

  nextButton:         { backgroundColor: ACCENT, paddingVertical: 17, borderRadius: 14, alignItems: 'center', marginBottom: 12, shadowColor: ACCENT, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.32, shadowRadius: 16, elevation: 8 },
  nextButtonDisabled: { opacity: 0.5 },
  nextButtonText:     { color: '#0E0E12', fontSize: 14, fontWeight: '900', letterSpacing: 2 },

  skipButton:     { alignItems: 'center', paddingVertical: 13, borderRadius: 14, borderWidth: 1.5, borderColor: BORDER, marginBottom: 32 },
  skipButtonText: { color: '#A0A0BC', fontSize: 14, fontWeight: '600' },

  dots:      { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: BORDER },
  dotActive: { width: 18, backgroundColor: ACCENT },
  dotDone:   { backgroundColor: ACCENT + '55' },
});