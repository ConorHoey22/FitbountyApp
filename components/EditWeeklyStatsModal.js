import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getActivityDateKey,
  getActivityDay,
  getWeeklyTotals,
  saveActivityDay,
} from '../utils/activityHistory';

const EditWeeklyActivityModal = ({ visible, onClose, onSave }) => {
  const [cardioValue, setCardioValue] = useState('');
  const [workoutValue, setWorkoutValue] = useState('');
  const [stepsValue, setStepsValue] = useState('');

  useEffect(() => {
    if (visible) loadCurrentWeeklyTotals();
  }, [visible]);

  // This week's totals, summed from daily_activity rows
  const loadCurrentWeeklyTotals = async () => {
    try {
      const week = await getWeeklyTotals();
      setCardioValue(String(week.cardio));
      setWorkoutValue(String(week.workouts));
      setStepsValue(String(week.steps));
    } catch (err) {
      console.error('Error loading weekly totals:', err.message);
    }
  };

  // Weekly totals are summed from daily rows, so the correction is applied to
  // today's row: today += (entered weekly total − current weekly total).
  // Today can't go below 0, so a total can't drop below what was logged before today.
  const handleSave = async () => {
    try {
      const newCardio = Math.max(0, parseInt(cardioValue) || 0);
      const newWorkouts = Math.max(0, parseInt(workoutValue) || 0);
      const newSteps = Math.max(0, parseInt(stepsValue) || 0);

      const [week, today] = await Promise.all([getWeeklyTotals(), getActivityDay()]);

      await saveActivityDay({
        date: getActivityDateKey(),
        cardio: Math.max(0, today.cardio + (newCardio - week.cardio)),
        workouts: Math.max(0, today.workouts + (newWorkouts - week.workouts)),
        steps: Math.max(0, today.steps + (newSteps - week.steps)),
      });
    } catch (err) {
      console.error('Error updating weekly totals:', err.message);
      return;
    }

    if (onSave) onSave();
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          <View style={styles.header}>
            <Text style={styles.title}>Edit Weekly Activity</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={INK} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Correct your totals for this week if something was logged wrong.
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Cardio (minutes)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholderTextColor={PLACEHOLDER}
              value={cardioValue}
              onChangeText={setCardioValue}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Workouts</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholderTextColor={PLACEHOLDER}
              value={workoutValue}
              onChangeText={setWorkoutValue}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Steps</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholderTextColor={PLACEHOLDER}
              value={stepsValue}
              onChangeText={setStepsValue}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark-outline" size={18} color={WHITE} />
            <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

// ─── Palette — matches Login / Home (navy, white, black) ─────────
const NAVY = '#0B1F4D';
const INK = '#111111';          // primary text / buttons
const WHITE = '#FFFFFF';
const SURFACE = '#F2F2F2';      // input rows / close button
const MUTED = '#8C8C8C';        // secondary text
const PLACEHOLDER = '#BABABA';

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: NAVY + 'CC', justifyContent: 'center', alignItems: 'center' },
  modalContainer: {
    width: '88%', backgroundColor: WHITE, borderRadius: 24, padding: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25, shadowRadius: 24, elevation: 12,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: INK, letterSpacing: -0.5 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: SURFACE,
    justifyContent: 'center', alignItems: 'center',
  },
  subtitle: { fontSize: 12, color: MUTED, marginBottom: 16, lineHeight: 17 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: SURFACE, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10,
  },
  label: { fontSize: 15, fontWeight: '700', color: INK },
  input: {
    minWidth: 80, paddingVertical: 4,
    textAlign: 'right', color: INK, fontSize: 18, fontWeight: '800',
  },
  saveButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: INK, paddingVertical: 16, borderRadius: 14, gap: 8, marginTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  saveButtonText: { color: WHITE, fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
});

export default EditWeeklyActivityModal;