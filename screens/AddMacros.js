import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { supabase } from '../lib/supabase';


const theme = {
    bg: '#111827',
    text: '#E5E7EB',
    textMuted: '#9CA3AF',
    primary: '#3B82F6',
    warning: '#FF0000',
    border: '#334155',

  };

export default function AddMacros() {
const navigation = useNavigation();
const [step, setStep] = useState(0);

const [answers, setAnswers] = useState({
  calories: '',
  protein: '',       
  carbohydrates: '',
  fats: '',
});

const questions = [

  { key: 'healthWarning', label: 'What are Macros', type: 'text' },
  { key: 'calories', label: 'Set your Calories intake', required: true, type: 'text' },
  { key: 'protein', label: 'Set your Protein intake', required: true, type: 'text' },
  { key: 'carbohydrates', label: 'Set your Carbohydrates intake', required: true, type: 'text' },
  { key: 'fats', label: 'Set your Fats intake', required: true, type: 'text' },
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
  }
};

    return (
        <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
        {validationError ? (
            <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 12 }}>
                {validationError}
            </Text>
    ) : null}
        <Text style={styles.question}>{currentQ.label}</Text>

        {/* Health Warning*/}
        {currentQ.key === 'healthWarning' && (
            <View>

              {/* Image here of Marcos chart */}

                <Text style={styles.healthWarningText}> * Before setting your Macros, we recommend that you contact your Doctor for advice or speak to a Professional.</Text>
                <Text style={styles.text}> Macros (macronutrients) are protein, carbohydrates, and fats</Text>

            </View>
        )}

        {/* Calories Input*/}
        {currentQ.key === 'calories' && (
            
            <View>

                <Text style={styles.text}>Calories  - Calories are units of energy that fuel your body and affect weight change.</Text>
                <Text style={styles.healthWarningText}> *  Tip: Research Calorie Defecit or Surplus </Text>

            
                <TextInput
                    style={styles.input}
                    placeholder="Enter calories"
                    placeholderTextColor={theme.textMuted}
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
        )}




        {currentQ.key === 'protein' && (
           <View>

              <Text style={styles.text}>Protein - Protein builds and repairs muscle, helping you get stronger and recover faster.</Text>
              <TextInput
                  style={styles.input}
                  placeholder="grams (g)"
                  placeholderTextColor={theme.textMuted}
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
        )}

        {currentQ.key === 'carbohydrates' && (
            <View>

            <Text style={styles.text}>Carbohydrates - Provide energy for workouts and daily activity, fueling performance and recovery.</Text>
            <TextInput
                style={styles.input}
                placeholder="grams (g)"
                placeholderTextColor={theme.textMuted}
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
        )}

        {/* Number of days (Workout) - MAX is 7 */}
        
        {currentQ.key === 'fats' && (
            <View>
            
            <Text style ={styles.text}>Support hormones, brain function, joint health, and help absorb vitamins</Text>
    
            <TextInput
                style={styles.input}
                placeholder="grams (g)"
                placeholderTextColor={theme.textMuted}
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
        )}



        {/* Next / Submit button */}
        <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
            {step === questions.length - 1 ? 'Finish' : 'Next'}
            </Text>
        </TouchableOpacity>

    
        </View>
    );
    }

    const styles = StyleSheet.create({

    container: { flex: 1, backgroundColor: theme.bg, padding: 20, justifyContent: 'center' },
    healthWarningText: { fontSize: 15, fontWeight: '400', color: theme.warning, marginBottom: 16, textAlign: 'center' },
    question: { fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 16, textAlign: 'center' },
    text: { fontSize: 14, fontWeight: '500', color: theme.text, marginBottom: 16, textAlign: 'center' },

    input: { borderWidth: 1, borderColor: theme.text, borderRadius: 8, padding: 12, marginBottom: 24, color: theme.text, backgroundColor: '#1E293B' },
    button: { backgroundColor: theme.primary, paddingVertical: 14, borderRadius: 24, alignItems: 'center', marginBottom: 10 },
    buttonText: { color: theme.text, fontSize: 16, fontWeighteee: '700' },
    skipButton: { backgroundColor: '#E2E8F0' },
    skipButtonText: { color: theme.bg, fontSize: 16, fontWeight: '700' },

    });