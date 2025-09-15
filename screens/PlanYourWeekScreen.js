import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function PlanYourWeekScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [maxGymDays, setMaxGymDays] = useState(0);
  const [cardioGoal, setCardioGoal] = useState(0);

  const [selectedGymDays, setSelectedGymDays] = useState([]);
  const [cardioPlan, setCardioPlan] = useState({}); // { Monday: 30, Wednesday: 30 }

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
      setSelectedGymDays(selectedGymDays.filter(d => d !== day));
    } else if (selectedGymDays.length < maxGymDays) {
      setSelectedGymDays([...selectedGymDays, day]);
    }
  };

  const toggleCardioDay = (day) => {
    if (cardioPlan[day]) {
      const newPlan = { ...cardioPlan };
      delete newPlan[day];
      setCardioPlan(newPlan);
    } else {
      setCardioPlan({ ...cardioPlan, [day]: 0 });
    }
  };

  const updateCardioMinutes = (day, minutes) => {
    setCardioPlan({ ...cardioPlan, [day]: parseInt(minutes, 10) || 0 });
  };

  const totalCardioMinutes = Object.values(cardioPlan).reduce((a, b) => a + b, 0);

  // const savePlan = async () => {
  //   try {
  //     const weeklyPlan = {};
  //     selectedGymDays.forEach(day => {
  //       weeklyPlan[day] = { type: 'Workout', cardio: 0 };
  //     });
  //     Object.entries(cardioPlan).forEach(([day, minutes]) => {
  //       weeklyPlan[day] = { type: 'Cardio', cardio: minutes };
  //     });
  
  //     await AsyncStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan));
  
  //     // Update DB first
  //     const { data: { user } } = await supabase.auth.getUser();
  //     const { error } = await supabase
  //       .from('userProfiles')
  //       .update({
  //         UserHasWeeklyPlanSetup: true,
  //         lastupdate_at: new Date().toISOString(),
  //       })
  //       .eq('id', user.id);
  
  //     if (error) throw error;
  
  //     // Only navigate after DB update succeeds
  //     navigation.replace('Home');
  //   } catch (err) {
  //     console.error('Save plan error:', err.message);
  //   }
  // };
  

  const savePlan = async () => {
    try {
      const weeklyPlan = {};
      selectedGymDays.forEach(day => {
        weeklyPlan[day] = { type: 'Workout', cardio: 0 };
      });
      Object.entries(cardioPlan).forEach(([day, minutes]) => {
        weeklyPlan[day] = { type: 'Cardio', cardio: minutes };
      });
  
      await AsyncStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan));
  
      // Update DB first
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('userProfiles')
        .update({
          UserHasWeeklyPlanSetup: true,
          lastupdate_at: new Date().toISOString(),
        })
        .eq('id', user.id);
  
      if (error) throw error;
  
      // Only navigate after DB update succeeds
      navigation.replace('Home');
    } catch (err) {
      console.error('Save plan error:', err.message);
    }
  };
  



  
  return (
    <ScrollView style={styles.container}>
      {/* Step 0: Select Gym Days */}
      {step === 0 && maxGymDays > 0 && (
        <>
          <Text style={styles.title}>
            Select {maxGymDays} gym days:
          </Text>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedGymDays.includes(day) && styles.selectedDay
              ]}
              onPress={() => toggleGymDay(day)}
            >
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          ))}
          {selectedGymDays.length === maxGymDays && (
            <TouchableOpacity style={styles.nextButton} onPress={() => setStep(1)}>
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Step 1: Select Cardio Days + Minutes */}
      {step === 1 && (
        <>
          <Text style={styles.title}>
            Select cardio days and enter minutes (Goal: {cardioGoal} mins)
          </Text>
          {daysOfWeek.map((day) => (
            <View key={day} style={{ marginBottom: 10 }}>
              <TouchableOpacity
                style={[
                  styles.dayButton,
                  cardioPlan[day] !== undefined && styles.selectedDay
                ]}
                onPress={() => toggleCardioDay(day)}
              >
                <Text style={styles.dayText}>{day}</Text>
              </TouchableOpacity>
              {cardioPlan[day] !== undefined && (
                <TextInput
                  style={styles.input}
                  placeholder="Minutes"
                  keyboardType="numeric"
                  value={String(cardioPlan[day])}
                  onChangeText={(val) => updateCardioMinutes(day, val)}
                />
              )}
            </View>
          ))}

          <Text style={styles.summary}>
            Total Cardio: {totalCardioMinutes}/{cardioGoal} mins
          </Text>

          <TouchableOpacity
            style={[
              styles.nextButton,
              totalCardioMinutes !== cardioGoal && { backgroundColor: 'gray' }
            ]}
            disabled={totalCardioMinutes !== cardioGoal}
            onPress={savePlan}
          >
            <Text style={styles.nextText}>Save Plan</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#111827' },
  title: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 20, textAlign: 'center' },
  dayButton: { padding: 14, marginVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  selectedDay: { backgroundColor: '#4CAF50' },
  dayText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 5, color: '#fff' },
  summary: { marginTop: 15, fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center' },
  nextButton: { marginTop: 20, backgroundColor: '#3B82F6', padding: 14, borderRadius: 8 },
  nextText: { color: '#fff', fontWeight: '700', textAlign: 'center' }
});
