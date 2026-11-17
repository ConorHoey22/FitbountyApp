import React, { useState } from 'react';
import { APP_BG_GRADIENT } from '../components/ScreenBackground';
import { useNavigation } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import AuthBackground from '../components/AuthBackground';
import useTabBarSpace from '../utils/useTabBarSpace';

// This is used to update the users Macros Plan 

export default function UpdateMacrosPlan() {
  const tabSpace = useTabBarSpace(); // room for the floating tab bar

  const navigation = useNavigation();
  const [step, setStep] = useState(0);

    const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [answers, setAnswers] = useState({
    calories: '',
    protein: '',       
    carbohydrates: '',
    fats: '',
  });

  const questions = [
    { key: 'healthWarning', label: 'What are Macros', type: 'info', icon: 'restaurant-outline', color: NAVY },
    {
      key: 'calories', label: 'Set your Calories intake', required: true, type: 'text',
      icon: 'flame-outline', color: CALORIES_COLOR, unit: 'kcal',
      description: 'Calories are units of energy that fuel your body and affect weight change.',
      tip: 'Tip: Research Calorie Deficit or Surplus',
    },
    {
      key: 'protein', label: 'Set your Protein intake', required: true, type: 'text',
      icon: 'fish-outline', color: PROTEIN_COLOR, unit: 'grams',
      description: 'Protein builds and repairs muscle, helping you get stronger and recover faster.',
    },
    {
      key: 'carbohydrates', label: 'Set your Carbohydrates intake', required: true, type: 'text',
      icon: 'nutrition-outline', color: CARBS_COLOR, unit: 'grams',
      description: 'Carbohydrates provide energy for workouts and daily activity, fueling performance and recovery.',
    },
    {
      key: 'fats', label: 'Set your Fats intake', required: true, type: 'text',
      icon: 'water-outline', color: FAT_COLOR, unit: 'grams',
      description: 'Support hormones, brain function, joint health, and help absorb vitamins.',
    },
  ];

  const [validationError, setValidationError] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const currentQ = questions[step];

  const handleNext = () => {
    const key = currentQ.key;
    const value = answers[key];

    if (currentQ.required) {
      if (!value || value.toString().trim() === '') {
        setValidationError('This field is required');
        return;
      }
    }

    setValidationError('');

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setValidationError('');
    }
  };

  const handleChange = (key, value) => {
    setAnswers({ ...answers, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('userProfiles')
        .update({
          calories: answers.calories,
          protein: answers.protein,
          carbohydrates: answers.carbohydrates,
          fats: answers.fats,
          UserHasMacros: true,
          lastupdate_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'AppTabs',
            state: {
              index: 0,
              routes: [{ name: 'Home' }],
            },
          },
        ],
      });
    } catch (err) {
      console.error('Submit error:', err.message);
      setValidationError('Failed to save. Please try again.');
    }
  };

  const isLast = step === questions.length - 1;
  const accent = currentQ.color;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background — matches Login / Home */}
      <AuthBackground colors={BG_GRADIENT} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + tabSpace }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerEyebrow}>MACROS PLAN</Text>
              <Text style={styles.headerTitle}>Fuel your goals</Text>
            </View>

            {/* Progress — one segment per step */}
            <View style={styles.progressContainer}>
              <View style={styles.progressRow}>
                {questions.map((q, i) => (
                  <View
                    key={q.key}
                    style={[styles.progressSegment, i <= step && styles.progressSegmentDone]}
                  />
                ))}
              </View>
              <Text style={styles.progressText}>
                Step {step + 1} of {questions.length}
              </Text>
            </View>

            {/* Card */}
            <View style={styles.card}>

              {/* Icon */}
              <View style={[styles.iconContainer, { backgroundColor: accent + '1A' }]}>
                <Ionicons name={currentQ.icon} size={34} color={accent} />
              </View>

              {/* Question */}
              <Text style={styles.question}>{currentQ.label}</Text>

              {/* Health Warning */}
              {currentQ.key === 'healthWarning' && (
                <View style={styles.infoContainer}>
                  <View style={styles.warningBox}>
                    <Ionicons name="warning-outline" size={22} color={DANGER} />
                    <Text style={styles.healthWarningText}>
                      Before setting your Macros, we recommend that you contact your Doctor for advice or speak to a Professional.
                    </Text>
                  </View>

                  <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={22} color={NAVY} />
                    <Text style={styles.infoText}>
                      Macros (macronutrients) are protein, carbohydrates, and fats - the building blocks of your nutrition plan.
                    </Text>
                  </View>
                </View>
              )}

              {/* Macro Input */}
              {currentQ.type === 'text' && (
                <View style={styles.inputSection}>
                  <Text style={styles.descriptionText}>{currentQ.description}</Text>

                  {currentQ.tip && (
                    <View style={styles.tipBox}>
                      <Ionicons name="bulb-outline" size={16} color={WORKOUT_COLOR} />
                      <Text style={styles.tipText}>{currentQ.tip}</Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.inputWrapper,
                      inputFocused && { borderColor: accent, backgroundColor: WHITE },
                      validationError && styles.inputError,
                    ]}
                  >
                    <TextInput
                      key={currentQ.key}
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={PLACEHOLDER}
                      keyboardType="decimal-pad"
                      value={answers[currentQ.key]}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      onChangeText={(val) => {
                        const numeric = val
                          .replace(/[^0-9.]/g, '')
                          .replace(/(\..*)\./g, '$1');
                        handleChange(currentQ.key, numeric);
                      }}
                    />
                    <View style={[styles.unitPill, { backgroundColor: accent + '1A' }]}>
                      <Text style={[styles.inputUnit, { color: accent }]}>{currentQ.unit}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Validation Error */}
              {validationError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={18} color={DANGER} />
                  <Text style={styles.errorText}>{validationError}</Text>
                </View>
              ) : null}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {step > 0 && (
                  <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
                    <Ionicons name="arrow-back-outline" size={20} color={INK} />
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNext}
                  activeOpacity={0.85}
                >
                  <Text style={styles.nextButtonText}>{isLast ? 'Finish' : 'Next'}</Text>
                  <Ionicons name={isLast ? 'checkmark-outline' : 'arrow-forward-outline'} size={20} color={WHITE} />
                </TouchableOpacity>
              </View>

            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Palette — matches Login / Home ─────────────────────────────
const NAVY        = '#0B1F4D';   // page background
const BG_GRADIENT = APP_BG_GRADIENT; // shared — components/ScreenBackground.js
const INK         = '#111111';   // primary text / buttons
const WHITE       = '#FFFFFF';
const CARD        = '#FFFFFF';   // cards
const SURFACE     = '#F2F2F2';   // inner panels / inputs
const BORDER      = '#ECECEC';
const MUTED       = '#8C8C8C';   // secondary text
const PLACEHOLDER = '#C4C4C4';
const DANGER      = '#EF4444';
const CALORIES_COLOR = '#EF4444';
const PROTEIN_COLOR  = '#5669FF';
const CARBS_COLOR    = '#16A34A';
const FAT_COLOR      = '#8B5CF6';
const WORKOUT_COLOR  = '#F59E0B';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerEyebrow: {
    color: WHITE,
    opacity: 0.8,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  progressContainer: {
    marginBottom: 20,
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
    fontWeight: '600',
    textAlign: 'center',
  },

  card: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    minHeight: 400,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },

  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },

  question: {
    fontSize: 22,
    fontWeight: '800',
    color: INK,
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: -0.4,
  },

  infoContainer: {
    gap: 12,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: DANGER + '12',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  healthWarningText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 19,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: NAVY + '12',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: NAVY,
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 19,
  },

  inputSection: {
    gap: 14,
  },
  descriptionText: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: WORKOUT_COLOR + '14',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tipText: {
    color: '#B45309',
    fontSize: 12.5,
    fontWeight: '600',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: SURFACE,
    paddingLeft: 20,
    paddingRight: 10,
    marginTop: 4,
  },
  inputError: {
    borderColor: DANGER,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 30,
    color: INK,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  unitPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  inputUnit: {
    fontSize: 13,
    fontWeight: '700',
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DANGER + '12',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  errorText: {
    color: DANGER,
    fontSize: 14,
    fontWeight: '500',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: INK,
  },
  backButtonText: {
    color: INK,
    fontSize: 15,
    fontWeight: '700',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: INK,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
