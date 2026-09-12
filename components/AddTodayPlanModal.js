import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { getISOWeekKey } from '../utils/weeklyKeyCreate';
import ActivityInputNumberPad from './ActivityInputNumber';
import { awardXP, removeXP } from '../lib/rewards';



const AddTodayPlanModal = ({ visible, onClose, onSave }) => {
  const [cardioInputValue, setCardioInputValue] = useState('');
  const [stepsInputValue, setStepsInputValue] = useState('');
  const [workoutsInputValue, setWorkoutsInputValue] = useState('');

  const [currentCardio, setCurrentCardio] = useState(0);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [currentWorkouts, setCurrentWorkouts] = useState(0);

  // Edit mode — lets the user correct today's totals instead of adding to them
  const [isEditMode, setIsEditMode] = useState(false);


  //DONE Button For number Pad 
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setKeyboardVisible(true);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setKeyboardVisible(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      loadCurrentProgress();
    } else {
      setIsEditMode(false);
      setCardioInputValue('');
      setStepsInputValue('');
      setWorkoutsInputValue('');
    }
  }, [visible]);

  const loadCurrentProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('todayChecks');
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];

        if (parsed.date !== today) {
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
      const stepsCompleted = Number(parsed.steps) || 0;

      if (workoutsCompleted === 0 && cardioMinutes === 0 && stepsCompleted === 0 ) return;

      const { data: profile, error: fetchError } = await supabase
        .from('userProfiles')
        .select('weeklyFitBKey, weeklyWorkoutCount, weeklyCardioCount,dailyStepCount')
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

      const newStepCount = isSameWeek
        ? (profile.weeklyStepCount || 0) + stepsCompleted
        : stepsCompleted;

      const { error: updateError } = await supabase
        .from('userProfiles')
        .update({
          weeklyFitBKey: currentWeekKey,
          weeklyWorkoutCount: newWorkoutCount,
          weeklyCardioCount: newCardioCount,
          dailyStepCount: newStepCount
        })
        .eq('id', session.user.id);

      if (updateError) {
        console.error('Update profile error:', updateError.message);
      } else {
        console.log('Pushed to Supabase:', { newWorkoutCount, newCardioCount, currentWeekKey, newStepCount });
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

      await pushTotalsToSupabase({
        workouts: workoutsToAdd,
        cardio: cardioToAdd,
        steps: stepsToAdd
      });

      // This will add XP 
      if (cardioToAdd)
      {
        const resultCardio = await awardXP('cardio');

      }

      if(workoutsToAdd)
      {
        const resultWorkout = await awardXP('workout');

      }

      if(stepsToAdd)
      {
        const resultSteps = await awardXP('steps');
      }


      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Edit mode: inputs hold the CORRECT total for today, not an amount to add.
  // We diff against what was previously stored to correct Supabase totals
  // and only award/remove XP when an activity toggles between
  // logged (>0) and not-logged (0), since XP is flat-per-activity, not
  // proportional to the amount entered.
  const handleEditUpdate = async () => {
    try {
      const newCardio = parseInt(cardioInputValue) || 0;
      const newSteps = parseInt(stepsInputValue) || 0;
      const newWorkouts = parseInt(workoutsInputValue) || 0;

      const cardioDiff = newCardio - currentCardio;
      const stepsDiff = newSteps - currentSteps;
      const workoutsDiff = newWorkouts - currentWorkouts;

      const todayChecks = {
        date: new Date().toISOString().split('T')[0],
        cardio: newCardio,
        steps: newSteps,
        gym: newWorkouts > 0,
        workouts: newWorkouts,
      };

      await AsyncStorage.setItem('todayChecks', JSON.stringify(todayChecks));

      // Push only the difference so weekly Supabase totals stay accurate
      await pushTotalsToSupabase({
        workouts: workoutsDiff,
        cardio: cardioDiff,
        steps: stepsDiff,
      });

      // Reverse or award XP only when an activity toggles logged/not-logged
      if (currentCardio === 0 && newCardio > 0) {
        await awardXP('cardio');
      } else if (currentCardio > 0 && newCardio === 0) {
        await removeXP('cardio');
      }

      if (currentWorkouts === 0 && newWorkouts > 0) {
        await awardXP('workout');
      } else if (currentWorkouts > 0 && newWorkouts === 0) {
        await removeXP('workout');
      }

      if (currentSteps === 0 && newSteps > 0) {
        await awardXP('steps');
      } else if (currentSteps > 0 && newSteps === 0) {
        await removeXP('steps');
      }

      setCurrentCardio(newCardio);
      setCurrentSteps(newSteps);
      setCurrentWorkouts(newWorkouts);
      setCardioInputValue('');
      setStepsInputValue('');
      setWorkoutsInputValue('');
      setIsEditMode(false);

      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Error editing progress:', error);
    }
  };

  const enterEditMode = () => {
    setIsEditMode(true);
    setCardioInputValue(String(currentCardio || ''));
    setStepsInputValue(String(currentSteps || ''));
    setWorkoutsInputValue(String(currentWorkouts || ''));
  };

  const cancelEditMode = () => {
    setIsEditMode(false);
    setCardioInputValue('');
    setStepsInputValue('');
    setWorkoutsInputValue('');
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>ACTIVITY</Text>
                </View>
                <Text style={styles.title}>{isEditMode ? 'Edit Progress' : 'Update Progress'}</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#A0A0BC" />
              </Pressable>
            </View>

            <Text style={styles.subtitle}>
              {isEditMode
                ? 'Correct today\'s totals below — this replaces the value, it doesn\'t add to it.'
                : 'Log your activity throughout the day · Smart watch integration coming soon'}
            </Text>

            {/* Current Progress */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressTitle}>Today so far</Text>
                {!isEditMode && (
                  <TouchableOpacity onPress={enterEditMode} style={styles.editBtn}>
                    <Ionicons name="create-outline" size={14} color={ACCENT} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.progressRow}>
                <View style={styles.progressItem}>
                  <Ionicons name="bicycle-outline" size={18} color={ACCENT} />
                  <Text style={styles.progressValue}>{currentCardio}</Text>
                  <Text style={styles.progressLabel}>Cardio</Text>
                </View>
                <View style={styles.progressDivider} />
                <View style={styles.progressItem}>
                  <Ionicons name="footsteps-outline" size={18} color="#A49BFF" />
                  <Text style={styles.progressValue}>{currentSteps}</Text>
                  <Text style={styles.progressLabel}>Steps</Text>
                </View>
                <View style={styles.progressDivider} />
                <View style={styles.progressItem}>
                  <Ionicons name="barbell-outline" size={18} color="#FFA940" />
                  <Text style={styles.progressValue}>{currentWorkouts}</Text>
                  <Text style={styles.progressLabel}>Workouts</Text>
                </View>
              </View>
            </View>

            {/* Input Fields */}
            <View style={styles.inputGroup}>
              <ActivityInputNumberPad
                icon="bicycle-outline"
                iconColor={ACCENT}
                label={isEditMode ? 'Cardio total (minutes)' : 'Cardio (minutes)'}
                value={cardioInputValue}
                onChange={setCardioInputValue}
              />
              <ActivityInputNumberPad
                icon="footsteps-outline"
                iconColor="#A49BFF"
                label={isEditMode ? 'Steps total' : 'Steps'}
                value={stepsInputValue}
                onChange={setStepsInputValue}
              />
              <ActivityInputNumberPad
                icon="barbell-outline"
                iconColor="#FFA940"
                label={isEditMode ? 'Workouts total' : 'Workouts'}
                value={workoutsInputValue}
                placeholder='test'
                onChange={setWorkoutsInputValue}
              />
            </View>

            {/* Buttons */}
            {isEditMode ? (
              <>
                <TouchableOpacity style={styles.saveButton} onPress={handleEditUpdate}>
                  <Ionicons name="checkmark-outline" size={18} color="#ffffff" />
                  <Text style={styles.saveButtonText}>SAVE CORRECTION</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={cancelEditMode}>
                  <Text style={styles.resetButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                <Ionicons name="checkmark-outline" size={18} color="#ffffff" />
                <Text style={styles.saveButtonText}>SAVE PROGRESS</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      </TouchableWithoutFeedback>

      {keyboardVisible && (
        <View style={[styles.accessoryBar, { bottom: keyboardHeight }]}>
          <TouchableOpacity onPress={Keyboard.dismiss}>
            <Text style={styles.accessoryDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </Modal>
  );
};

// ─── Palette ──────────────────────────────────────────────────────────────────
const ACCENT   = '#C6F135';
const BG_MODAL = '#1A1A26';
const SURFACE  = '#22222E';
const SURFACE2 = '#2C2C3C';
const BORDER   = '#42425A';
const ACCENT2   = '#2563EB';


const styles = StyleSheet.create({
  accessoryBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  accessoryDoneText: {
    backgroundColor: '#22222E',
    borderWidth: 1,
    borderRadius: 41,
    borderColor: '#C6F135',
    padding: 10,
    color: '#C6F135',
    fontSize: 16,
    fontWeight: '700',
    overflow: 'hidden',
  },
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
    color: '#ffffff',
    marginBottom: 18,
    lineHeight: 17,
  },
  progressCard: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 20,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: ACCENT + '18',
    borderWidth: 1,
    borderColor: ACCENT + '44',
  },
  editBtnText: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '700',
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
    color: '#DDDDF0',
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT2,
    paddingVertical: 14,
    borderRadius: 13,
    gap: 8,
    marginBottom: 10,
    shadowColor: ACCENT2,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    color: '#ffffff',
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