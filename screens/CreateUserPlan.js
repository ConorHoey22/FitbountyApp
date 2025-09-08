// import React, { useEffect, useState } from 'react';
// import { useNavigation } from '@react-navigation/native';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar ,ActivityIndicator } from 'react-native';
// import XPBar from '../components/XPBarLevel';
// import TrackerBar from '../components/TrackerBar';
// import { supabase } from '../lib/supabase';


// const theme = {
//   // Dim hybrid palette
//   bg: '#111827',            // slate-900 (dark, not black)
//   surface: '#1E293B',       // slate-800 (mid card)
//   surfaceAlt: '#0F172A',    // slate-900/indigo tint (header/alt)
//   surfaceLight: '#F1F5F9',  // slate-100 (light card to break up darkness)
//   border: '#334155',        // slate-700
//   text: '#E5E7EB',          // light text on dark
//   textMuted: '#9CA3AF',     // muted on dark
//   textOnLight: '#0F172A',   // dark text on light cards
//   primary: '#3B82F6',       // blue
//   success: '#22C55E',       // green
//   warning: '#F59E0B',       // amber
// };

// export default function CreateUserPlan() {
//   const navigation = useNavigation();

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
//         <Text style={styles.title}>Welcome to FitBounty!</Text>

//         <Text style={styles.subtitle}>Your fitness journey starts here</Text>

//         {/* What is your name */}

//         {/* What is your goal - Dropdown Weight loss , maintain , Gain muscle , keep active / physically fit  , create better habits */}

//         {/* What is your Current Weight {KG , Stone , ilb }  - Optional not a required field  */}

//         {/* Are you able to workout , if so how many days a week would you like to work at the gym or at home - Optional not a required field  */}

//         {/* What is your daily step count - Optional not a required field */}

//         {/* How many minutes of cardio do you do per week ? - Optional not a required field */}

//         {/*   */}


//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   // Base
//   container: {
//     flex: 1,
//     backgroundColor: theme.bg,
//     padding: 40,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '800',
//     marginBottom: 6,
//     color: theme.text,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: theme.textMuted,
//     marginBottom: 22,
//     textAlign: 'center',
//   },

//   // Cards
//   cardPadded: {
//     backgroundColor: theme.surface,
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 18,
//     borderWidth: 1,
//     borderColor: theme.border,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 14,
//   },
//   statCard: {
//     backgroundColor: theme.surface,
//     borderRadius: 14,
//     paddingTop:20,
//     padding: 7,
//     alignItems: 'flex-start', 
//     flex: 1,
//     marginHorizontal: 5,
//     borderWidth: 1,
//     borderColor: theme.border,
//   },
//   trackerWrap: {
//     width: '100%',
//     marginTop: -10,
//   },

//   // Text
//   statValue: {
//     fontSize: 14,
//     fontWeight: '350',
//     color: theme.text,
//     alignItems: 'flex-start', 
//   },
//   statUnit: {
//     fontSize: 12,
//     color: theme.textMuted,
//     marginBottom: 5,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: theme.text,
//     textAlign: 'center',
//   },

//   // Nutrition (light card for contrast)
//   nutritionContainer: {
//     marginTop: 6,
//     marginBottom: 16,
//   },
//   nutritionCardLight: {
//     backgroundColor: theme.surfaceLight,
//     borderRadius: 14,
//     padding: 20,
//     alignItems: 'center',
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#E2E8F0', // slate-200 for light edge
//   },
//   caloriesValueLight: {
//     fontSize: 30,
//     fontWeight: '800',
//     color: theme.warning,
//   },
//   caloriesLabelLight: {
//     fontSize: 12,
//     color: theme.textOnLight,
//     opacity: 0.7,
//     marginTop: 2,
//   },

//   macrosRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   macroCard: {
//     flex: 1,
//     backgroundColor: theme.surface,
//     borderRadius: 14,
//     padding: 14,
//     alignItems: 'center',
//     marginHorizontal: 5,
//     borderWidth: 1,
//     borderColor: theme.border,
//   },
//   macroValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: theme.text,
//   },
//   macroLabel: {
//     fontSize: 12,
//     color: theme.textMuted,
//   },
//   macroLabelSmall: {
//     fontSize: 12,
 
//     color: theme.textMuted,
//   },
//   macroLabelMedium: {
//     fontSize: 15,

//     color: theme.textMuted,
//   },
//   macroLabelLarge: {
//     fontSize: 25,

//     color: theme.textMuted,
//   },

//   // Buttons
//   quickActions: {
//     marginTop: 10,
//   },
//   actionButton: {
//     backgroundColor: theme.primary,
//     paddingVertical: 14,
//     borderRadius: 24,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   actionButtonText: {
//     color: theme.text,
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   secondaryButton: {
//     backgroundColor: '#E2E8F0',   // light button for contrast
//     borderWidth: 0,
//   },
//   secondaryButtonText: {
//     color: theme.textOnLight,
//     fontSize: 16,
//     fontWeight: '700',
//   },

//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: theme.text,
//     marginBottom: 10,
//   },
// });
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
    weight: '',
    workoutDays: '',
    steps: '',
    cardioMinutes: '',
  });

  const questions = [
    {
      key: 'name',
      label: 'What is your name?',
      required: true,
      inputType: 'text',
    },
    {
      key: 'goal',
      label: 'What is your goal?',
      required: true,
      inputType: 'text', // (you could later replace with dropdown: weight loss, maintain, etc.)
    },
    {
      key: 'weight',
      label: 'What is your current weight?',
      required: false,
      inputType: 'text',
    },
    {
      key: 'workoutDays',
      label: 'How many days a week would you like to work out?',
      required: false,
      inputType: 'text',
    },
    {
      key: 'steps',
      label: 'What is your daily step count?',
      required: false,
      inputType: 'text',
    },
    {
      key: 'cardioMinutes',
      label: 'How many minutes of cardio do you do per week?',
      required: false,
      inputType: 'text',
    },
  ];

  const currentQ = questions[step];

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSkip = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleChange = (value) => {
    const numericKeys = ['weight', 'workoutDays', 'steps', 'cardioMinutes'];
    const newValue = numericKeys.includes(currentQ.key)
      ? parseInt(value, 10) || 0
      : value;
  
    setAnswers({ ...answers, [currentQ.key]: newValue });
  };
  

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('userProfiles')
        .update({
          first_name: answers.name,
          goal: answers.goal,
          startingWeight: answers.weight,
          currentWeight: answers.weight,
          workoutSessionsGoal: answers.workoutDays,
          stepGoal: answers.steps + 2000,
          cardioGoal: answers.cardioMinutes,
          UserHasEnteredTheirProfileDataTrigger: true,
          lastupdate_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      navigation.replace('Home'); // back to home once complete
    } catch (err) {
      console.error('Submit error:', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />



      <Text style={styles.question}>{currentQ.label}</Text>

      <TextInput
        style={styles.input}
        placeholder="Type here..."
        placeholderTextColor={theme.textMuted}
        value={String(answers[currentQ.key])}
        onChangeText={(val) => handleChange(val)}
        keyboardType={
          ['weight', 'workoutDays', 'steps', 'cardioMinutes'].includes(currentQ.key)
            ? 'numeric'
            : 'default'
        }
      />

      {/* Next / Submit button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {step === questions.length - 1 ? 'Finish' : 'Next'}
        </Text>
      </TouchableOpacity>

      {/* Skip button for optional questions */}
      {!currentQ.required && (
        <TouchableOpacity style={[styles.button, styles.skipButton]} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    padding: 20,
    justifyContent: 'center',
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    color: theme.text,
    backgroundColor: theme.surface, // so it's visible against dark bg
  },
  button: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    backgroundColor: '#E2E8F0',
  },
  skipButtonText: {
    color: theme.bg,
    fontSize: 16,
    fontWeight: '700',
  },
});
