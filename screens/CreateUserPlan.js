import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { supabase } from '../lib/supabase';

const theme = {
  bg: '#111827',
  text: '#E5E7EB',
  textMuted: '#9CA3AF',
  primary: '#3B82F6',
  border: '#334155',
};

export default function CreateUserPlan() {
  const navigation = useNavigation();
  const [step, setStep] = useState(0);

  const [answers, setAnswers] = useState({
    name: '',
    goal: '',
    unit: '',       
    weightKg: '',
    weightStone: '',
    weightLbs: '',
    workoutDays: '',
    steps: '',
    cardioMinutes: '',
  });

  const questions = [
    { key: 'name', label: 'What is your name?', required: true, type: 'text' },
    { key: 'goal', label: 'What is your goal?', required: true, type: 'text' },
    { key: 'unit', label: 'Which unit would you like to use? (KG, Stone, Lb)', required: true, type: 'unit' },
    { key: 'weight', label: 'What is your current weight?', required: false, type: 'weight' },
    { key: 'workoutDays', label: 'How many days a week would you like to work out?', required: false, type: 'text' },
    { key: 'steps', label: 'What is your daily step count?', required: false, type: 'text' },
    { key: 'cardioMinutes', label: 'How many minutes of cardio do you do per week?', required: false, type: 'text' },
  ];

  const currentQ = questions[step];

  const handleNext = () => {
    if (step < questions.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const handleSkip = () => {
    if (step < questions.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const handleChange = (key, value) => {
    setAnswers({ ...answers, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Convert weight based on chosen unit
      let weightInKg = null;
      if (answers.unit === 'KG') {
        weightInKg = parseFloat(answers.weightKg) || 0;
      } else if (answers.unit === 'Stone') {
        const stone = parseInt(answers.weightStone, 10) || 0;
        const lbs = parseInt(answers.weightLbs, 10) || 0;
        weightInKg = stone * 6.35029 + lbs * 0.453592;
      } else if (answers.unit === 'Lb') {
        weightInKg = (parseFloat(answers.weightLbs) || 0) * 0.453592;
      }

      const { error } = await supabase
        .from('userProfiles')
        .update({
          first_name: answers.name,
          goal: answers.goal,
          unitMeasurement: answers.unit,
          startingWeight: weightInKg,
          currentWeight: weightInKg,
          workoutSessionsGoal: answers.workoutDays,
          stepGoal: (parseInt(answers.steps, 10) || 0) + 2000,
          cardioGoal: answers.cardioMinutes,
          UserHasEnteredTheirProfileDataTrigger: true,
          UserHasWeeklyPlanSetup:false,
          lastupdate_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      navigation.replace('Home');
    } catch (err) {
      console.error('Submit error:', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <Text style={styles.question}>{currentQ.label}</Text>

      {/* Unit selection */}
      {currentQ.type === 'unit' && (
        <View>
          {['KG', 'Stone', 'Lb'].map((u) => (
            <TouchableOpacity
              key={u}
              style={[
                styles.button,
                answers.unit === u && { backgroundColor: '#22C55E' },
              ]}
              onPress={() => handleChange('unit', u)}
            >
              <Text style={styles.buttonText}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Weight input depending on unit */}
      {currentQ.type === 'weight' && answers.unit === 'KG' && (
        <TextInput
          style={styles.input}
          placeholder="Enter weight in KG"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          value={answers.weightKg}
          onChangeText={(val) => handleChange('weightKg', val)}
        />
      )}

      {currentQ.type === 'weight' && answers.unit === 'Stone' && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 5 }]}
            placeholder="Stone"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
            value={answers.weightStone}
            onChangeText={(val) => handleChange('weightStone', val)}
          />
          <TextInput
            style={[styles.input, { flex: 1, marginLeft: 5 }]}
            placeholder="Lbs"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
            value={answers.weightLbs}
            onChangeText={(val) => handleChange('weightLbs', val)}
          />
        </View>
      )}

      {currentQ.type === 'weight' && answers.unit === 'Lb' && (
        <TextInput
          style={styles.input}
          placeholder="Enter weight in Lbs"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          value={answers.weightLbs}
          onChangeText={(val) => handleChange('weightLbs', val)}
        />
      )}

      {/* Default text input */}
      {currentQ.type === 'text' && (
        <TextInput
          style={styles.input}
          placeholder="Type here..."
          placeholderTextColor={theme.textMuted}
          value={String(answers[currentQ.key])}
          onChangeText={(val) => handleChange(currentQ.key, val)}
        />
      )}

      {/* Next / Submit button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {step === questions.length - 1 ? 'Finish' : 'Next'}
        </Text>
      </TouchableOpacity>

      {/* Skip button */}
      {!currentQ.required && (
        <TouchableOpacity style={[styles.button, styles.skipButton]} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 20, justifyContent: 'center' },
  question: { fontSize: 22, fontWeight: '700', color: theme.text, marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, marginBottom: 24, color: theme.text, backgroundColor: '#1E293B' },
  button: { backgroundColor: theme.primary, paddingVertical: 14, borderRadius: 24, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: theme.text, fontSize: 16, fontWeight: '700' },
  skipButton: { backgroundColor: '#E2E8F0' },
  skipButtonText: { color: theme.bg, fontSize: 16, fontWeight: '700' },
});
