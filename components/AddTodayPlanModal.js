import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { getISOWeekKey } from '../utils/weeklyKeyCreate'; // ← add this import

const AddTodayPlanModal = ({ visible, onClose, onSave }) => {
  const [cardioInputValue, setCardioInputValue] = useState('');
  const [stepsInputValue, setStepsInputValue] = useState('');
  const [workoutsInputValue, setWorkoutsInputValue] = useState('');

  const [currentCardio, setCurrentCardio] = useState(0);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [currentWorkouts, setCurrentWorkouts] = useState(0);

  useEffect(() => {
    if (visible) loadCurrentProgress();
  }, [visible]);

  const loadCurrentProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('todayChecks');
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
  
        if (parsed.date !== today) {
          // New day — just reset local storage, DB is already up to date
          await AsyncStorage.removeItem('todayChecks');
          setCurrentCardio(0);
          setCurrentSteps(0);
          setCurrentWorkouts(0);
        } else {
          setCurrentCardio(Number(parsed.cardio) || 0);
          setCurrentSteps(Number(parsed.steps) || 0);
          setCurrentWorkouts(Number(parsed.workouts) || 0);
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const pushTotalsToSupabase = async (parsed) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
  
      const workoutsCompleted = Number(parsed.workouts) || 0;
      const cardioMinutes = Number(parsed.cardio) || 0;
  
      if (workoutsCompleted === 0 && cardioMinutes === 0) return;
  
      const { data: profile, error: fetchError } = await supabase
        .from('userProfiles')
        .select('weeklyFitBKey, weeklyWorkoutCount, weeklyCardioCount')
        .eq('id', session.user.id)
        .single();
  
      if (fetchError) {
        console.error('Fetch profile error:', fetchError.message);
        return;
      }
  
      const currentWeekKey = getISOWeekKey(new Date());
      const isSameWeek = profile?.weeklyFitBKey === currentWeekKey;
  
      const newWorkoutCount = isSameWeek
        ? (profile.weeklyWorkoutCount || 0) + workoutsCompleted
        : workoutsCompleted;
  
      const newCardioCount = isSameWeek
        ? (profile.weeklyCardioCount || 0) + cardioMinutes
        : cardioMinutes;
  
      const { error: updateError } = await supabase
        .from('userProfiles')
        .update({
          weeklyFitBKey: currentWeekKey,
          weeklyWorkoutCount: newWorkoutCount,
          weeklyCardioCount: newCardioCount,
        })
        .eq('id', session.user.id);
  
      if (updateError) {
        console.error('Update profile error:', updateError.message);
      } else {
        console.log('Pushed to Supabase:', { newWorkoutCount, newCardioCount, currentWeekKey });
      }
    } catch (err) {
      console.error('Error pushing totals to Supabase:', err.message);
    }
  };


  const handleUpdate = async () => {
    try {
      const cardioToAdd = parseInt(cardioInputValue) || 0;
      const stepsToAdd = parseInt(stepsInputValue) || 0;
      const workoutsToAdd = parseInt(workoutsInputValue) || 0;
  
      const newCardio = currentCardio + cardioToAdd;
      const newSteps = currentSteps + stepsToAdd;
      const newWorkouts = currentWorkouts + workoutsToAdd;
  
      const todayChecks = {
        date: new Date().toISOString().split('T')[0],
        cardio: newCardio,
        steps: newSteps,
        gym: newWorkouts > 0,
        workouts: newWorkouts,
      };
  
      await AsyncStorage.setItem('todayChecks', JSON.stringify(todayChecks));
      setCurrentCardio(newCardio);
      setCurrentSteps(newSteps);
      setCurrentWorkouts(newWorkouts);
      setCardioInputValue('');
      setStepsInputValue('');
      setWorkoutsInputValue('');
  
      // ✅ Push THIS update's increments straight to Supabase, right now
      await pushTotalsToSupabase({
        workouts: workoutsToAdd,
        cardio: cardioToAdd,
      });
  
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  

  const handleReset = async () => {
    await AsyncStorage.removeItem('todayChecks');
    setCurrentCardio(0);
    setCurrentSteps(0);
    setCurrentWorkouts(0);
    if (onSave) onSave();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>ACTIVITY</Text>
              </View>
              <Text style={styles.title}>Update Progress</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#A0A0BC" />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Log your activity throughout the day · Smart watch integration coming soon
          </Text>

          {/* Current Progress */}
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Today so far</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressItem}>
                <Ionicons name="bicycle-outline" size={18} color={ACCENT} />
                <Text style={styles.progressValue}>{currentCardio}</Text>
                <Text style={styles.progressLabel}>min cardio</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressItem}>
                <Ionicons name="footsteps-outline" size={18} color="#A49BFF" />
                <Text style={styles.progressValue}>{currentSteps}</Text>
                <Text style={styles.progressLabel}>steps</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressItem}>
                <Ionicons name="barbell-outline" size={18} color="#FFA940" />
                <Text style={styles.progressValue}>{currentWorkouts}</Text>
                <Text style={styles.progressLabel}>workouts</Text>
              </View>
            </View>
          </View>

          {/* Input Fields */}
          <View style={styles.inputGroup}>
            <ActivityInput
              icon="bicycle-outline"
              iconColor={ACCENT}
              label="Cardio (minutes)"
              value={cardioInputValue}
              onChange={setCardioInputValue}
            />
            <ActivityInput
              icon="footsteps-outline"
              iconColor="#A49BFF"
              label="Steps"
              value={stepsInputValue}
              onChange={setStepsInputValue}
            />
            <ActivityInput
              icon="barbell-outline"
              iconColor="#FFA940"
              label="Workouts"
              value={workoutsInputValue}
              onChange={setWorkoutsInputValue}
            />
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
            <Ionicons name="checkmark-outline" size={18} color="#0E0E12" />
            <Text style={styles.saveButtonText}>SAVE PROGRESS</Text>
          </TouchableOpacity>


        </View>
      </View>
    </Modal>
  );
};

const ActivityInput = ({ icon, iconColor, label, value, onChange }) => (
  <View style={styles.inputWrapper}>
    <View style={styles.inputLabel}>
      <Ionicons name={icon} size={16} color={iconColor} />
      <Text style={styles.label}>{label}</Text>
    </View>
    <TextInput
      style={styles.input}
      placeholder="0"
      placeholderTextColor="#4a4a5a"
      keyboardType="number-pad"
      value={value}
      onChangeText={onChange}
    />
  </View>
);

// ─── Palette ──────────────────────────────────────────────────────────────────
const ACCENT   = '#C6F135';
const BG_MODAL = '#1A1A26';
const SURFACE  = '#22222E';
const SURFACE2 = '#2C2C3C';
const BORDER   = '#42425A';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '88%',
    backgroundColor: BG_MODAL,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    gap: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: ACCENT + '22',
    borderWidth: 1,
    borderColor: ACCENT + '55',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: ACCENT,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SURFACE2,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#A0A0BC',
    marginBottom: 18,
    lineHeight: 17,
  },

  // Progress card
  progressCard: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A0A0BC',
    letterSpacing: 1.2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  progressItem: {
    alignItems: 'center',
    gap: 3,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  progressLabel: {
    fontSize: 11,
    color: '#A0A0BC',
    fontWeight: '500',
  },
  progressDivider: {
    width: 1,
    height: 36,
    backgroundColor: BORDER,
  },

  // Inputs
  inputGroup: {
    gap: 12,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DDDDF0',   // bright, readable
  },
  input: {
    width: 72,
    backgroundColor: SURFACE2,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Buttons
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 13,
    gap: 8,
    marginBottom: 10,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    color: '#0E0E12',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 11,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#FF4D6D44',
    gap: 7,
  },
  resetButtonText: {
    color: '#FF4D6D',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default AddTodayPlanModal;