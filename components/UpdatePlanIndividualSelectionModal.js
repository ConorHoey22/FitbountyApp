
import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { M, modalStyles as ms } from './modalTheme';
import { font } from '../utils/fonts';

const UpdatePlanIndividualSelectionModal = ({ visible, onClose, onSave }) => {

  const navigation = useNavigation();

  const [updateActivitySelection, setUpdateActivitySelection] = useState('');

  const [cardioInputValue, setCardioInputValue] = useState('');
  const [stepsInputValue, setStepsInputValue] = useState('');
  const [workoutsInputValue, setWorkoutsInputValue] = useState('');

  const [currentCardioGoal, setCurrentCardioGoal] = useState(0);
  const [currentStepsGoal, setCurrentStepsGoal] = useState(0);
  const [currentWorkoutsGoal, setCurrentWorkoutsGoal] = useState(0);

  const [saving, setSaving] = useState(false);

  // DONE Button For number Pad
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
      loadCurrentGoals();
    } else {
      // reset when modal closes so it reopens on the selection screen
      setUpdateActivitySelection('');
      setCardioInputValue('');
      setStepsInputValue('');
      setWorkoutsInputValue('');
    }
  }, [visible]);

  // Obtain Goals
  const loadCurrentGoals = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profileData, error } = await supabase
        .from('userProfiles')
        .select('cardioGoal, stepGoal, workoutSessionsGoal')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      setCurrentCardioGoal(profileData?.cardioGoal ?? 0);
      setCurrentStepsGoal(profileData?.stepGoal ?? 0);
      setCurrentWorkoutsGoal(profileData?.workoutSessionsGoal ?? 0);
    } catch (err) {
      console.error('UpdatePlanIndividualSelectionModal load error:', err.message);
    }
  };

  const goBackToSelection = () => {
    setUpdateActivitySelection('');
    setCardioInputValue('');
    setStepsInputValue('');
    setWorkoutsInputValue('');
  };

  // Header back button: goes to the selection screen if on an activity
  // screen, otherwise closes the modal from the top-level screen.
  const handleHeaderBack = () => {
    if (updateActivitySelection === '') {
      onClose();
    } else {
      goBackToSelection();
    }
  };

  const updateGoalField = async (field, value) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { error } = await supabase
      .from('userProfiles')
      .update({ [field]: value })
      .eq('id', session.user.id);

    if (error) throw error;
    return true;
  };

  // Flips UserHasWeeklyPlanSetup to false and sends the user to
  // PlanYourWeekScreen so their weekly schedule matches the new goal.
  const triggerWeeklyReplan = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase
      .from('userProfiles')
      .update({ UserHasWeeklyPlanSetup: false })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error resetting weekly plan flag:', error.message);
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'PlanYourWeekScreen' }],
    });
  };

  const handleUpdateCardio = async () => {
    const updatedCardioValue = parseInt(cardioInputValue, 10) || 0;
    if (!updatedCardioValue) return;

    try {
      setSaving(true);
      await updateGoalField('cardioGoal', updatedCardioValue);
      setCurrentCardioGoal(updatedCardioValue);
      setCardioInputValue('');
      if (onSave) onSave();
      await triggerWeeklyReplan();
    } catch (error) {
      console.error('Error updating cardio goal:', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSteps = async () => {
    const updatedStepsValue = parseInt(stepsInputValue, 10) || 0;
    if (!updatedStepsValue) return;

    try {
      setSaving(true);
      await updateGoalField('stepGoal', updatedStepsValue);
      setCurrentStepsGoal(updatedStepsValue);
      setStepsInputValue('');
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Error updating steps goal:', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateWorkouts = async () => {
    const updatedWorkoutsValue = parseInt(workoutsInputValue, 10) || 0;
    if (!updatedWorkoutsValue) return;

    try {
      setSaving(true);
      await updateGoalField('workoutSessionsGoal', updatedWorkoutsValue);
      setCurrentWorkoutsGoal(updatedWorkoutsValue);
      setWorkoutsInputValue('');
      if (onSave) onSave();
      await triggerWeeklyReplan();
    } catch (error) {
      console.error('Error updating workouts goal:', error.message);
    } finally {
      setSaving(false);
    }
  };

  // Display config for each goal (selection rows + edit screens)
  const GOALS = {
    Cardio: {
      icon: 'bicycle',
      color: CARDIO_COLOR,
      current: `${currentCardioGoal} min`,
      currentLong: `${currentCardioGoal} minutes`,
      label: 'Cardio (minutes)',
      value: cardioInputValue,
      onChange: setCardioInputValue,
      onSave: handleUpdateCardio,
    },
    Steps: {
      icon: 'footsteps',
      color: STEPS_COLOR,
      current: `${currentStepsGoal}`,
      currentLong: `${currentStepsGoal} steps`,
      label: 'Steps',
      value: stepsInputValue,
      onChange: setStepsInputValue,
      onSave: handleUpdateSteps,
    },
    Workouts: {
      icon: 'barbell',
      color: WORKOUT_COLOR,
      current: `${currentWorkoutsGoal}/wk`,
      currentLong: `${currentWorkoutsGoal} sessions per week`,
      label: 'Workouts',
      value: workoutsInputValue,
      onChange: setWorkoutsInputValue,
      onSave: handleUpdateWorkouts,
    },
  };

  const selected = GOALS[updateActivitySelection];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={ms.overlay}>
          <View style={ms.card}>

            {/* Header */}
            <View style={ms.header}>
              <View style={ms.headerLeft}>
                <View style={ms.badge}>
                  <Text style={ms.badgeText}>YOUR PLAN</Text>
                </View>
                <Text style={ms.title}>
                  {updateActivitySelection === '' ? 'Update your Plan' : `${updateActivitySelection} Goal`}
                </Text>
              </View>
              <TouchableOpacity onPress={handleHeaderBack} style={ms.closeBtn} hitSlop={10}>
                <Ionicons
                  name={updateActivitySelection === '' ? 'close' : 'chevron-back'}
                  size={20}
                  color={M.INK}
                />
              </TouchableOpacity>
            </View>

            {/* Selection menu */}
            {updateActivitySelection === '' && (
              <View>
                <Text style={ms.subtitle}>Which Goal would like to update?</Text>

                <View style={styles.list}>
                  {Object.entries(GOALS).map(([name, goal]) => (
                    <TouchableOpacity
                      key={name}
                      style={ms.inputRow}
                      onPress={() => setUpdateActivitySelection(name)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.rowLeft}>
                        <View style={[ms.inputIcon, { backgroundColor: goal.color }]}>
                          <Ionicons name={goal.icon} size={16} color={M.WHITE} />
                        </View>
                        <Text style={ms.inputLabel}>{name}</Text>
                      </View>
                      <View style={styles.rowRight}>
                        <Text style={styles.rowValue}>{goal.current}</Text>
                        <Ionicons name="chevron-forward" size={18} color={M.MUTED} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Individual goal screen */}
            {selected && (
              <View style={styles.list}>
                {/* Current goal — navy card like Add Food's "Today so far" */}
                <View style={[ms.infoCard, styles.currentGoal]}>
                  <View style={[ms.inputIcon, { backgroundColor: selected.color }]}>
                    <Ionicons name={selected.icon} size={16} color={M.WHITE} />
                  </View>
                  <View>
                    <Text style={[ms.infoTitle, { marginBottom: 2 }]}>Current goal</Text>
                    <Text style={ms.infoValue}>{selected.currentLong}</Text>
                  </View>
                </View>

                <GoalInput label={selected.label} value={selected.value} onChange={selected.onChange} />

                <TouchableOpacity
                  style={[ms.saveButton, styles.saveButton, saving && ms.saveButtonDisabled]}
                  onPress={selected.onSave}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  <Text style={ms.saveButtonText}>{saving ? 'Updating…' : 'Update'}</Text>
                  {!saving && <Ionicons name="checkmark" size={18} color={M.WHITE} />}
                </TouchableOpacity>
              </View>
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

// Number input row — matches Add Food's inputs (black outline while typing)
const GoalInput = ({ label, value, onChange }) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[ms.inputRow, styles.goalInput, focused && ms.inputRowFocused]}>
      <Text style={ms.inputLabel}>{label}</Text>
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
    </View>
  );
};

// Goal colours — same as Home
const CARDIO_COLOR = '#F43F5E';
const STEPS_COLOR = '#06B6D4';
const WORKOUT_COLOR = '#F59E0B';

// Layout-only styles; colours/type come from modalTheme
const styles = StyleSheet.create({
  list: {
    gap: 10,
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
  rowValue: {
    color: M.MUTED,
    fontSize: 14,
    ...font('600'),
  },
  currentGoal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 0,
  },
  goalInput: {
    paddingLeft: 14,
    paddingVertical: 10,
  },
  saveButton: {
    marginTop: 4,
  },
});

export default UpdatePlanIndividualSelectionModal;
