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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { M, modalStyles as ms } from './modalTheme';
import { font } from '../utils/fonts';
import { awardXP, removeXP } from '../lib/rewards';
import { getActivityDateKey, getActivityDay, removeActivityDay, saveActivityDay } from '../utils/activityHistory';



const AddTodayPlanModal = ({ visible, onClose, onSave, onLevelUp }) => {
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

  // Today's totals come from today's daily_activity row
  const loadCurrentProgress = async () => {
    try {
      const today = await getActivityDay();
      setCurrentCardio(today.cardio);
      setCurrentSteps(today.steps);
      setCurrentWorkouts(today.workouts);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  // If any XP award reached a new level, tell the parent to show the level-up popup
  const notifyLevelUp = (awardResults) => {
    const levelUps = awardResults.filter((r) => r?.leveledUp);
    if (levelUps.length && onLevelUp) {
      onLevelUp(Math.max(...levelUps.map((r) => r.newLevel)));
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

      // Overwrite today's row with the new day totals
      await saveActivityDay({
        date: getActivityDateKey(),
        steps: newSteps,
        cardio: newCardio,
        workouts: newWorkouts,
      });
      setCurrentCardio(newCardio);
      setCurrentSteps(newSteps);
      setCurrentWorkouts(newWorkouts);
      setCardioInputValue('');
      setStepsInputValue('');
      setWorkoutsInputValue('');

      // This will add XP 
      const awardResults = [];

      if (cardioToAdd)
      {
        awardResults.push(await awardXP('cardio'));
      }

      if(workoutsToAdd)
      {
        awardResults.push(await awardXP('workout'));
      }

      if(stepsToAdd)
      {
        awardResults.push(await awardXP('steps'));
      }

      notifyLevelUp(awardResults);


      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Error saving progress:', error);
      Alert.alert('Unable to save activity', 'Please try again.');
    }
  };

  // Edit mode: inputs hold the CORRECT total for today, not an amount to add.
  // Today's row is overwritten, and XP is only awarded/removed when an activity toggles between
  // logged (>0) and not-logged (0), since XP is flat-per-activity, not
  // proportional to the amount entered.
  const handleEditUpdate = async () => {
    try {
      const newCardio = parseInt(cardioInputValue) || 0;
      const newSteps = parseInt(stepsInputValue) || 0;
      const newWorkouts = parseInt(workoutsInputValue) || 0;

      // Overwrite today's row — weekly totals are summed from daily rows, so no diffs needed
      await saveActivityDay({
        date: getActivityDateKey(),
        steps: newSteps,
        cardio: newCardio,
        workouts: newWorkouts,
      });

      // Reverse or award XP only when an activity toggles logged/not-logged
      const awardResults = [];

      if (currentCardio === 0 && newCardio > 0) {
        awardResults.push(await awardXP('cardio'));
      } else if (currentCardio > 0 && newCardio === 0) {
        await removeXP('cardio');
      }

      if (currentWorkouts === 0 && newWorkouts > 0) {
        awardResults.push(await awardXP('workout'));
      } else if (currentWorkouts > 0 && newWorkouts === 0) {
        await removeXP('workout');
      }

      if (currentSteps === 0 && newSteps > 0) {
        awardResults.push(await awardXP('steps'));
      } else if (currentSteps > 0 && newSteps === 0) {
        await removeXP('steps');
      }

      notifyLevelUp(awardResults);

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
      Alert.alert('Unable to save activity', 'Please try again.');
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
    try {
      await removeActivityDay(getActivityDateKey());
      setCurrentCardio(0);
      setCurrentSteps(0);
      setCurrentWorkouts(0);
      if (onSave) onSave();
    } catch (error) {
      console.error('Error resetting progress:', error);
      Alert.alert('Unable to reset activity', 'Please try again.');
    }
  };

  const todaySoFar = [
    { key: 'cardio', label: 'Cardio', value: currentCardio, color: CARDIO_COLOR },
    { key: 'steps', label: 'Steps', value: currentSteps, color: STEPS_COLOR },
    { key: 'workouts', label: 'Workouts', value: currentWorkouts, color: WORKOUT_COLOR },
  ];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={ms.overlay}>
          <View style={ms.card}>

            {/* Header */}
            <View style={ms.header}>
              <View style={ms.headerLeft}>
                <View style={ms.badge}>
                  <Text style={ms.badgeText}>ACTIVITY</Text>
                </View>
                <Text style={ms.title}>{isEditMode ? 'Edit Progress' : 'Update Progress'}</Text>
              </View>
              <Pressable onPress={onClose} style={ms.closeBtn} hitSlop={10}>
                <Ionicons name="close" size={20} color={M.INK} />
              </Pressable>
            </View>

            <Text style={ms.subtitle}>
              {isEditMode
                ? 'Correct today\'s totals below — this replaces the value, it doesn\'t add to it.'
                : 'Log your activity throughout the day · Smart watch integration coming soon'}
            </Text>

            {/* Today so far */}
            <View style={ms.infoCard}>
              <View style={styles.infoHeaderRow}>
                <Text style={[ms.infoTitle, { marginBottom: 0 }]}>Today so far</Text>
                {!isEditMode && (
                  <TouchableOpacity onPress={enterEditMode} style={styles.editBtn}>
                    <Ionicons name="create" size={13} color={M.WHITE} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.infoRow}>
                {todaySoFar.map((item, index) => (
                  <React.Fragment key={item.key}>
                    {index > 0 && <View style={styles.infoDivider} />}
                    <View style={styles.infoItem}>
                      <Text style={ms.infoValue}>{item.value}</Text>
                      <View style={styles.infoLabelRow}>
                        <View style={[styles.infoDot, { backgroundColor: item.color }]} />
                        <Text style={ms.infoLabel}>{item.label}</Text>
                      </View>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* Input Fields */}
            <View style={styles.inputGroup}>
              <ActivityRow
                icon="bicycle"
                color={CARDIO_COLOR}
                label={isEditMode ? 'Cardio total' : 'Cardio'}
                unit="min"
                value={cardioInputValue}
                onChange={setCardioInputValue}
              />
              <ActivityRow
                icon="footsteps"
                color={STEPS_COLOR}
                label={isEditMode ? 'Steps total' : 'Steps'}
                unit="steps"
                value={stepsInputValue}
                onChange={setStepsInputValue}
              />
              <ActivityRow
                icon="barbell"
                color={WORKOUT_COLOR}
                label={isEditMode ? 'Workouts total' : 'Workouts'}
                unit=""
                value={workoutsInputValue}
                onChange={setWorkoutsInputValue}
              />
            </View>

            {/* Buttons */}
            {isEditMode ? (
              <View style={styles.buttonStack}>
                <TouchableOpacity style={ms.saveButton} onPress={handleEditUpdate} activeOpacity={0.85}>
                  <Text style={ms.saveButtonText}>Save Correction</Text>
                  <Ionicons name="checkmark" size={18} color={M.WHITE} />
                </TouchableOpacity>
                <TouchableOpacity style={ms.secondaryButton} onPress={cancelEditMode} activeOpacity={0.85}>
                  <Text style={ms.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={ms.saveButton} onPress={handleUpdate} activeOpacity={0.85}>
                <Text style={ms.saveButtonText}>Save Progress</Text>
                <Ionicons name="checkmark" size={18} color={M.WHITE} />
              </TouchableOpacity>
            )}

          </View>
        </View>
      </TouchableWithoutFeedback>

      {keyboardVisible && (
        <View style={[ms.accessoryBar, { bottom: keyboardHeight }]}>
          <TouchableOpacity onPress={Keyboard.dismiss}>
            <Text style={ms.accessoryDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </Modal>
  );
};

// One row per activity — coloured icon square, label, number input + unit (matches Add Food)
const ActivityRow = ({ icon, color, label, unit, value, onChange }) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[ms.inputRow, focused && ms.inputRowFocused]}>
      <View style={styles.rowLeft}>
        <View style={[ms.inputIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={16} color={M.WHITE} />
        </View>
        <Text style={ms.inputLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        <TextInput
          style={ms.inputNumber}
          placeholder="0"
          placeholderTextColor={M.PLACEHOLDER}
          keyboardType="number-pad"
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
};

// Goal colours — same as Home
const CARDIO_COLOR = '#F43F5E';
const STEPS_COLOR = '#06B6D4';
const WORKOUT_COLOR = '#F59E0B';

// Layout-only styles; colours/type come from modalTheme
const styles = StyleSheet.create({
  infoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  editBtnText: {
    color: M.WHITE,
    fontSize: 11,
    ...font('700'),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoItem: {
    alignItems: 'center',
    gap: 4,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  infoDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  inputGroup: {
    gap: 10,
    marginBottom: 20,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unit: {
    width: 36,
    fontSize: 12,
    ...font('600'),
    color: M.MUTED,
  },
  buttonStack: {
    gap: 10,
  },
});

export default AddTodayPlanModal;
