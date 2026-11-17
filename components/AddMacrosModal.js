import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, Text, Pressable, TextInput, TouchableOpacity, Keyboard, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateKey } from '../utils/dailyMacros';


// ─── Palette — matches Login / Home (navy, white, black) ─────────
const NAVY        = '#0B1F4D';
const INK         = '#111111';   // primary text / buttons
const WHITE       = '#FFFFFF';
const SURFACE     = '#F2F2F2';   // input rows
const MUTED       = '#8C8C8C';   // secondary text
const PLACEHOLDER = '#BABABA';

// Macro colours — same as the Nutrition card on Home
const MACRO_CALORIES = '#EF4444';
const MACRO_PROTEIN  = '#5669FF';
const MACRO_CARBS    = '#16A34A';
const MACRO_FAT      = '#8B5CF6';



const AddMacrosModal = ({
    visible,
    onClose,

    caloriesConsumed = 0,
    proteinConsumed = 0,
    carbohydratesConsumed = 0,
    fatsConsumed = 0,

    setCaloriesConsumed,
    setProteinConsumed,
    setCarbohydratesConsumed,
    setFatsConsumed,
  }) => {
  // Local state for what the user is currently typing in the input
  const [calsInputValue, setCaloriesInputValue] = useState("");
  const [proteinInputValue, setProteinInputValue] = useState("");
  const [fatsInputValue, setFatsInputValue] = useState("");
  const [carbsInputValue, setCarbsInputValue] = useState("");

  const [saving, setSaving] = useState(false);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
      setKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);


  const handleUpdate = async () => {
    // Convert the local string inputs to numbers
    const cals = parseInt(calsInputValue) || 0;
    const protein = parseInt(proteinInputValue) || 0;
    const carbs = parseInt(carbsInputValue) || 0;
    const fats = parseInt(fatsInputValue) || 0;

    const newCalories = caloriesConsumed + cals;
    const newProtein = proteinConsumed + protein;
    const newCarbs = carbohydratesConsumed + carbs;
    const newFats = fatsConsumed + fats;

    try {
      setSaving(true);

      // ADD to existing totals, stored locally only — no Supabase write
      const todayMacros = {
        calories: newCalories,
        protein: newProtein,
        carbohydrates: newCarbs,
        fats: newFats,
      };


      await AsyncStorage.multiSet([
          ['todayMacros', JSON.stringify(todayMacros)],
          ['todayMacrosDate', getLocalDateKey()],
      ]);

      // Update local state (passed down from Home.js)
      setCaloriesConsumed(newCalories);
      setProteinConsumed(newProtein);
      setCarbohydratesConsumed(newCarbs);
      setFatsConsumed(newFats);

      // Clear input values
      setCaloriesInputValue(""); // Clear calories input
      setProteinInputValue(""); // Clear protein input
      setCarbsInputValue(""); // Clear carbs input
      setFatsInputValue(""); // Clear fats input

      onClose(); // Close modal
    } catch (err) {
      console.error('Error saving macros locally:', err.message);
    } finally {
      setSaving(false);
    }
  };

  const todaySoFar = [
    { key: 'calories', label: 'kcal',    value: caloriesConsumed,      color: MACRO_CALORIES },
    { key: 'protein',  label: 'Protein', value: proteinConsumed,       color: MACRO_PROTEIN },
    { key: 'carbs',    label: 'Carbs',   value: carbohydratesConsumed, color: MACRO_CARBS },
    { key: 'fats',     label: 'Fats',    value: fatsConsumed,          color: MACRO_FAT },
  ];

  return (
            <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>NUTRITION</Text>
                          </View>
                          <Text style={styles.title}>Add Food</Text>
                        </View>
                        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
                            <Ionicons name="close" size={20} color={INK} />
                        </Pressable>
                    </View>

                    <Text style={styles.subtitle}>
                      Added on top of today's totals · Nutrition tracker integrations coming soon
                    </Text>

                    {/* Today so far */}
                    <View style={styles.progressCard}>
                      <Text style={styles.progressTitle}>Today so far</Text>
                      <View style={styles.progressRow}>
                        {todaySoFar.map((item, index) => (
                          <React.Fragment key={item.key}>
                            {index > 0 && <View style={styles.progressDivider} />}
                            <View style={styles.progressItem}>
                              <Text style={styles.progressValue}>{item.value || 0}</Text>
                              <View style={styles.progressLabelRow}>
                                <View style={[styles.progressDot, { backgroundColor: item.color }]} />
                                <Text style={styles.progressLabel}>{item.label}</Text>
                              </View>
                            </View>
                          </React.Fragment>
                        ))}
                      </View>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.inputGroup}>
                        <MacroInput label="Calories" value={calsInputValue} onChange={setCaloriesInputValue} unit="kcal" color={MACRO_CALORIES} icon="flame-outline" />
                        <MacroInput label="Protein" value={proteinInputValue} onChange={setProteinInputValue} unit="g" color={MACRO_PROTEIN} icon="fish-outline" />
                        <MacroInput label="Carbs" value={carbsInputValue} onChange={setCarbsInputValue} unit="g" color={MACRO_CARBS} icon="nutrition-outline" />
                        <MacroInput label="Fats" value={fatsInputValue} onChange={setFatsInputValue} unit="g" color={MACRO_FAT} icon="water-outline" />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                      style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                      onPress={handleUpdate}
                      activeOpacity={0.85}
                      disabled={saving}
                    >
                        <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save Progress'}</Text>
                        {!saving && <Ionicons name="checkmark-outline" size={18} color={WHITE} />}
                    </TouchableOpacity>
                </View>


                        {Platform.OS === 'ios' && keyboardVisible && (
                                <View style={[styles.accessoryBar, { bottom: keyboardHeight }]}>
                                  <TouchableOpacity onPress={() => Keyboard.dismiss()}>
                                  <Text style={styles.accessoryDoneText}>Done</Text>
                                  </TouchableOpacity>
                                </View>
                        )}

            </View>
        </Modal>
  );



};

// One row per macro: coloured icon chip, label, number input + unit
const MacroInput = ({ label, color, value, onChange, unit, icon }) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
      <View style={styles.inputLabel}>
        <View style={[styles.inputIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={16} color={WHITE} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.inputRight}>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={PLACEHOLDER}
          keyboardType="number-pad"
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <Text style={styles.inputUnit}>{unit}</Text>
      </View>
    </View>
  );
};

// THESE STYLES ARE REQUIRED
const styles = StyleSheet.create({
  overlay: {
      flex: 1,
      backgroundColor: NAVY + 'CC',
      justifyContent: "center",
      alignItems: "center",
  },
  modalContainer: {
      width: "88%",
      backgroundColor: WHITE,
      padding: 22,
      borderRadius: 24,
      elevation: 12, // Shadow for Android
      shadowColor: '#000', // Shadow for iOS
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
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
      backgroundColor: NAVY,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
  },
  badgeText: {
      color: WHITE,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 1.5,
  },
  title: {
      fontSize: 22,
      fontWeight: "900",
      color: INK,
      letterSpacing: -0.5,
  },
  closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: SURFACE,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 4,
  },
  subtitle: {
      fontSize: 12,
      color: MUTED,
      lineHeight: 17,
      marginBottom: 16,
  },

  // Today so far
  progressCard: {
      backgroundColor: NAVY,
      borderRadius: 16,
      padding: 14,
      marginBottom: 16,
  },
  progressTitle: {
      fontSize: 10,
      fontWeight: '700',
      color: WHITE,
      opacity: 0.7,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 10,
  },
  progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
  },
  progressItem: {
      alignItems: 'center',
      gap: 4,
  },
  progressValue: {
      fontSize: 18,
      fontWeight: '800',
      color: WHITE,
      letterSpacing: -0.5,
  },
  progressLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
  },
  progressDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
  },
  progressLabel: {
      fontSize: 11,
      color: WHITE,
      opacity: 0.7,
      fontWeight: '500',
  },
  progressDivider: {
      width: 1,
      height: 32,
      backgroundColor: '#FFFFFF26',
  },

  // Inputs
  inputGroup: {
      gap: 10,
      marginBottom: 20
  },
  inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: SURFACE,
      borderWidth: 1.5,
      borderColor: SURFACE,
      borderRadius: 14,
      paddingVertical: 8,
      paddingLeft: 8,
      paddingRight: 14,
  },
  inputWrapperFocused: {
      backgroundColor: WHITE,
      borderColor: INK,
  },
  inputLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
  },
  inputIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
  },
  label: {
      fontSize: 15,
      fontWeight: '700',
      color: INK,
  },
  inputRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  input: {
      minWidth: 64,
      paddingVertical: 4,
      textAlign: 'right',
      color: INK,
      fontSize: 18,
      fontWeight: '800',
  },
  inputUnit: {
      width: 30,
      fontSize: 12,
      fontWeight: '600',
      color: MUTED,
  },

  // Save
  saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: INK,
      paddingVertical: 16,
      borderRadius: 14,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
  },
  saveButtonDisabled: {
      opacity: 0.6,
  },
  saveButtonText: {
      color: WHITE,
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.3,
  },

  // iOS keyboard "Done" bar
  accessoryBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  accessoryDoneText: {
    backgroundColor: INK,
    borderRadius: 41,
    paddingVertical: 10,
    paddingHorizontal: 18,
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    overflow: 'hidden',
  }
});

export default AddMacrosModal;
