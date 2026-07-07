import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const EditWeeklyActivityModal = ({ visible, onClose, onSave }) => {
  const [cardioValue, setCardioValue] = useState('');
  const [workoutValue, setWorkoutValue] = useState('');

  useEffect(() => {
    if (visible) loadCurrentWeeklyTotals();
  }, [visible]);

  const loadCurrentWeeklyTotals = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: profile } = await supabase
      .from('userProfiles')
      .select('weeklyCardioCount, weeklyWorkoutCount')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      setCardioValue(String(profile.weeklyCardioCount ?? 0));
      setWorkoutValue(String(profile.weeklyWorkoutCount ?? 0));
    }
  };

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const newCardio = Math.max(0, parseInt(cardioValue) || 0);
    const newWorkouts = Math.max(0, parseInt(workoutValue) || 0);

    const { error } = await supabase
      .from('userProfiles')
      .update({
        weeklyCardioCount: newCardio,
        weeklyWorkoutCount: newWorkouts,
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error updating weekly totals:', error.message);
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
              <Ionicons name="close" size={20} color="#A0A0BC" />
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
              value={cardioValue}
              onChangeText={setCardioValue}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Workouts</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={workoutValue}
              onChangeText={setWorkoutValue}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark-outline" size={18} color="#0E0E12" />
            <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const ACCENT = '#C6F135';
const BG_MODAL = '#1A1A26';
const SURFACE = '#22222E';
const SURFACE2 = '#2C2C3C';
const BORDER = '#42425A';

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: {
    width: '88%', backgroundColor: BG_MODAL, borderRadius: 22, padding: 22,
    borderWidth: 1, borderColor: BORDER,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: SURFACE2,
    borderWidth: 1, borderColor: BORDER, justifyContent: 'center', alignItems: 'center',
  },
  subtitle: { fontSize: 12, color: '#A0A0BC', marginBottom: 18, lineHeight: 17 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: SURFACE, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#DDDDF0' },
  input: {
    width: 80, backgroundColor: SURFACE2, borderWidth: 1.5, borderColor: BORDER,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7,
    textAlign: 'center', color: '#FFFFFF', fontSize: 15, fontWeight: '700',
  },
  saveButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: ACCENT, paddingVertical: 14, borderRadius: 13, gap: 8, marginTop: 6,
  },
  saveButtonText: { color: '#0E0E12', fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
});

export default EditWeeklyActivityModal;