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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

// This is used to update the users Macros Plan 

export default function UpdateMacrosPlan() {
  const navigation = useNavigation();
  const [step, setStep] = useState(0);

  const [answers, setAnswers] = useState({
    calories: '',
    protein: '',       
    carbohydrates: '',
    fats: '',
  });

  const questions = [
    { key: 'healthWarning', label: 'What are Macros', type: 'info' },
    { key: 'calories', label: 'Set your Calories intake', required: true, type: 'text', icon: 'flame-outline', color: '#f59e0b' },
    { key: 'protein', label: 'Set your Protein intake', required: true, type: 'text', icon: 'fish-outline', color: '#10b981' },
    { key: 'carbohydrates', label: 'Set your Carbohydrates intake', required: true, type: 'text', icon: 'nutrition-outline', color: '#14b8a6' },
    { key: 'fats', label: 'Set your Fats intake', required: true, type: 'text', icon: 'water-outline', color: '#3b82f6' },
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

    // clear error if valid
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
      
      {/* Natural Gradient Background */}
      <LinearGradient
        colors={['#1e3a8a', '#0f766e', '#065f46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
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
              <LinearGradient
                colors={['#1E293B', '#1E293B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardOuter}
              >
                <LinearGradient
                  colors={['#0F172A', '#0F172A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardInner}
                >
                  {/* Icon */}
                  {currentQ.icon && (
                    <View style={[styles.iconContainer, { backgroundColor: currentQ.color + '20' }]}>
                      <Ionicons name={currentQ.icon} size={40} color={currentQ.color} />
                    </View>
                  )}

                  {/* Question */}
                  <Text style={styles.question}>{currentQ.label}</Text>

                  {/* Health Warning */}
                  {currentQ.key === 'healthWarning' && (
                    <View style={styles.infoContainer}>
                      <View style={styles.warningBox}>
                        <Ionicons name="warning-outline" size={24} color="#ef4444" />
                        <Text style={styles.healthWarningText}>
                          Before setting your Macros, we recommend that you contact your Doctor for advice or speak to a Professional.
                        </Text>
                      </View>
                      
                      <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={24} color="#10b981" />
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
                        <Ionicons name="bulb-outline" size={18} color="#f59e0b" />
                        <Text style={styles.tipText}>
                          Tip: Research Calorie Deficit or Surplus
                        </Text>
                      </View>

                      <View style={styles.inputWrapper}>
                        <Ionicons name="flame-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter calories (e.g. 2000)"
                          placeholderTextColor="#6B7280"
                          keyboardType="decimal-pad"
                          value={answers.calories}
                          onChangeText={(val) => {
                            const numeric = val
                              .replace(/[^0-9.]/g, '')
                              .replace(/(\..*)\./g, '$1');
                            handleChange('calories', numeric);
                          }}
                        />
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
                        <Ionicons name="fish-outline" size={20} color="#10b981" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter protein in grams (e.g. 150)"
                          placeholderTextColor="#6B7280"
                          keyboardType="decimal-pad"
                          value={answers.protein}
                          onChangeText={(val) => {
                            const numeric = val
                              .replace(/[^0-9.]/g, '')
                              .replace(/(\..*)\./g, '$1');
                            handleChange('protein', numeric);
                          }}
                        />
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
                        <Ionicons name="nutrition-outline" size={20} color="#14b8a6" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter carbs in grams (e.g 200)"
                          placeholderTextColor="#6B7280"
                          keyboardType="decimal-pad"
                          value={answers.carbohydrates}
                          onChangeText={(val) => {
                            const numeric = val
                              .replace(/[^0-9.]/g, '')
                              .replace(/(\..*)\./g, '$1');
                            handleChange('carbohydrates', numeric);
                          }}
                        />
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
                        <Ionicons name="water-outline" size={20} color="#3b82f6" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter fats in grams (e.g. 60)"
                          placeholderTextColor="#6B7280"
                          keyboardType="decimal-pad"
                          value={answers.fats}
                          onChangeText={(val) => {
                            const numeric = val
                              .replace(/[^0-9.]/g, '')
                              .replace(/(\..*)\./g, '$1');
                            handleChange('fats', numeric);
                          }}
                        />
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
                      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.backButtonText}>Back</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                      style={[styles.nextButton, step === 0 && styles.nextButtonFull]} 
                      onPress={handleNext}
                    >
                      <LinearGradient
                        colors={['#10b981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.nextButtonGradient}
                      >
                        <Text style={styles.nextButtonText}>
                          {step === questions.length - 1 ? 'Finish' : 'Next'}
                        </Text>
                        <Ionicons name="arrow-forward-outline" size={20} color="#FFFFFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                </LinearGradient>
              </LinearGradient>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
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
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardOuter: {
    borderRadius: 24,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  cardInner: {
    borderRadius: 22,
    padding: 28,
    backgroundColor: '#0F172A',
    minHeight: 400,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    gap: 16,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    gap: 12,
  },
  healthWarningText: {
    flex: 1,
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#6ee7b7',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  inputSection: {
    gap: 16,
  },
  descriptionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    borderRadius: 10,
  },
  descriptionText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  tipText: {
    color: '#fcd34d',
    fontSize: 13,
    fontStyle: 'italic',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1F26',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
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
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});