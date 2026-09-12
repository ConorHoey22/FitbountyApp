import React, { useState } from 'react';
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

// This is used to update the users Macros Plan 

export default function UpdateMacrosPlan() {
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
    { key: 'healthWarning', label: 'What are Macros', type: 'info' },
    { key: 'calories', label: 'Set your Calories intake', required: true, type: 'text', icon: 'flame-outline' },
    { key: 'protein', label: 'Set your Protein intake', required: true, type: 'text', icon: 'fish-outline' },
    { key: 'carbohydrates', label: 'Set your Carbohydrates intake', required: true, type: 'text', icon: 'nutrition-outline' },
    { key: 'fats', label: 'Set your Fats intake', required: true, type: 'text', icon: 'water-outline' },
  ];

  const [validationError, setValidationError] = useState('');

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background blobs — matches Home screen */}
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

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${((step + 1) / questions.length) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>
                Step {step + 1} of {questions.length}
              </Text>
            </View>

            {/* Card Container */}
            <View style={styles.cardOuter}>
              <View style={styles.cardInner}>

                {/* Icon */}
                {currentQ.icon && (
                  <View style={styles.iconContainer}>
                    <Ionicons name={currentQ.icon} size={36} color={ACCENT} />
                  </View>
                )}

                {/* Question */}
                <Text style={styles.question}>{currentQ.label}</Text>

                {/* Health Warning */}
                {currentQ.key === 'healthWarning' && (
                  <View style={styles.infoContainer}>
                    <View style={styles.warningBox}>
                      <Ionicons name="warning-outline" size={22} color="#ef4444" />
                      <Text style={styles.healthWarningText}>
                        Before setting your Macros, we recommend that you contact your Doctor for advice or speak to a Professional.
                      </Text>
                    </View>
                    
                    <View style={styles.infoBox}>
                      <Ionicons name="information-circle-outline" size={22} color={ACCENT} />
                      <Text style={styles.infoText}>
                        Macros (macronutrients) are protein, carbohydrates, and fats - the building blocks of your nutrition plan.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Calories Input */}
                {currentQ.key === 'calories' && (
                  <View style={styles.inputSection}>
                    <View style={styles.descriptionBox}>
                      <Text style={styles.descriptionText}>
                        Calories are units of energy that fuel your body and affect weight change.
                      </Text>
                    </View>

                    <View style={styles.tipBox}>
                      <Ionicons name="bulb-outline" size={16} color={ACCENT} />
                      <Text style={styles.tipText}>
                        Tip: Research Calorie Deficit or Surplus
                      </Text>
                    </View>

                    <View style={styles.inputWrapper}>
                      <Ionicons name="flame-outline" size={20} color={ACCENT} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter here .. "
                        placeholderTextColor="#ffffff"
                        keyboardType="decimal-pad"
                        value={answers.calories}
                        onChangeText={(val) => {
                          const numeric = val
                            .replace(/[^0-9.]/g, '')
                            .replace(/(\..*)\./g, '$1');
                          handleChange('calories', numeric);
                        }}
                      />
                      <Text style={styles.inputUnit}>kcal</Text>
                    </View>
                  </View>
                )}

                {/* Protein Input */}
                {currentQ.key === 'protein' && (
                  <View style={styles.inputSection}>
                    <View style={styles.descriptionBox}>
                      <Text style={styles.descriptionText}>
                        Protein builds and repairs muscle, helping you get stronger and recover faster.
                      </Text>
                    </View>

                    <View style={styles.inputWrapper}>
                      <Ionicons name="fish-outline" size={20} color={ACCENT} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter here ... "
                        placeholderTextColor="#ffffff"
                        keyboardType="decimal-pad"
                        value={answers.protein}
                        onChangeText={(val) => {
                          const numeric = val
                            .replace(/[^0-9.]/g, '')
                            .replace(/(\..*)\./g, '$1');
                          handleChange('protein', numeric);
                        }}
                      />
                      <Text style={styles.inputUnit}>grams</Text>
                    </View>
                  </View>
                )}

                {/* Carbohydrates Input */}
                {currentQ.key === 'carbohydrates' && (
                  <View style={styles.inputSection}>
                    <View style={styles.descriptionBox}>
                      <Text style={styles.descriptionText}>
                        Carbohydrates provide energy for workouts and daily activity, fueling performance and recovery.
                      </Text>
                    </View>

                    <View style={styles.inputWrapper}>
                      <Ionicons name="nutrition-outline" size={20} color={ACCENT} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter here .. "
                        placeholderTextColor="#ffffff"
                        keyboardType="decimal-pad"
                        value={answers.carbohydrates}
                        onChangeText={(val) => {
                          const numeric = val
                            .replace(/[^0-9.]/g, '')
                            .replace(/(\..*)\./g, '$1');
                          handleChange('carbohydrates', numeric);
                        }}
                      />
                      <Text style={styles.inputUnit}>grams</Text>
                    </View>
                  </View>
                )}

                {/* Fats Input */}
                {currentQ.key === 'fats' && (
                  <View style={styles.inputSection}>
                    <View style={styles.descriptionBox}>
                      <Text style={styles.descriptionText}>
                        Support hormones, brain function, joint health, and help absorb vitamins.
                      </Text>
                    </View>

                    <View style={styles.inputWrapper}>
                      <Ionicons name="water-outline" size={20} color={ACCENT} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter here .."
                        placeholderTextColor="#ffffff"
                        keyboardType="decimal-pad"
                        value={answers.fats}
                        onChangeText={(val) => {
                          const numeric = val
                            .replace(/[^0-9.]/g, '')
                            .replace(/(\..*)\./g, '$1');
                          handleChange('fats', numeric);
                        }}
                      />
                      <Text style={styles.inputUnit}>grams</Text>
                    </View>
                  </View>
                )}

                {/* Validation Error */}
                {validationError ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
                    <Text style={styles.errorText}>{validationError}</Text>
                  </View>
                ) : null}

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  {step > 0 && (
                    <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
                      <Ionicons name="arrow-back-outline" size={20} color={ACCENT} />
                      <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={[styles.nextButton, step === 0 && styles.nextButtonFull]} 
                    onPress={handleNext}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.nextButtonText}>
                      {step === questions.length - 1 ? 'Finish' : 'Next'}
                    </Text>
                    <Ionicons name={step === questions.length - 1 ? 'checkmark-outline' : 'arrow-forward-outline'} size={20} color="#0E0E12" />
                  </TouchableOpacity>
                </View>

              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Palette — matches Home screen ──────────────────────────────
const ACCENT    = '#C6F135';   // electric lime
const BG        = '#0E0E12';   // page background
const CARD_BG   = '#22222E';   // outer card
const INPUT_BG  = '#252532';   // input / inner surface
const BORDER    = '#42425A';   // brighter border for visibility

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
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

  // Blobs — matches Home
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

  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2C2C3C',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 3,
  },
  progressText: {
    color: '#A0A0BC',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  cardOuter: {
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  cardInner: {
    borderRadius: 18,
    padding: 24,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    minHeight: 400,
  },

  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: ACCENT + '1A',
    borderWidth: 1,
    borderColor: ACCENT + '40',
  },

  question: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  infoContainer: {
    gap: 14,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    padding: 16,
    borderRadius: 13,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    gap: 12,
  },
  healthWarningText: {
    flex: 1,
    color: '#fca5a5',
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 19,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: ACCENT + '14',
    padding: 16,
    borderRadius: 13,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#D8F79A',
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 19,
  },

  inputSection: {
    gap: 14,
  },
  descriptionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 14,
    borderRadius: 12,
  },
  descriptionText: {
    color: '#ffffff',
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  tipText: {
    color: ACCENT,
    fontSize: 12.5,
    fontStyle: 'italic',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inputUnit: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
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
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: ACCENT + '66',
  },
  backButtonText: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: '700',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    color: '#0E0E12',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});