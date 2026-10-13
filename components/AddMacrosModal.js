import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, Text, Pressable, TextInput, TouchableOpacity, Keyboard, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateKey } from '../utils/dailyMacros';

import ActivityInputNumberPad from './ActivityInputNumber';


// // ─── Palette — matches app design system ─────────────────────────
const ACCENT   = '#C6F135';
const CARD_BG  = '#22222E';
const INPUT_BG = '#252532';
const BORDER   = '#42425A';

 // ─── Palette additions (place with your other consts) ──
 const MACRO_PROTEIN = '#C6F135'; // lime
 const MACRO_CARBS = '#2563EB';   // blue
 const MACRO_FAT = '#F97316';     // orange
 const MACRO_CALORIES = '#EC4899'; // pink, if you track calories separately
 


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

  return (
            <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                          {/* <Ionicons name="nutrition-outline" size={16} color={ACCENT} /> */}
                          <Text style={styles.title}>Update Macros</Text>
                        </View>
                        <Pressable onPress={onClose}>
                            <Ionicons name="close-circle-outline" size={26} color="#ffffff" />
                        </Pressable>
                    </View>

                    <Text style={styles.subtitle}>3rd Party Nutrition Trackers integrations coming soon</Text>

                    {/* Input Fields */}
                    <View style={styles.inputGroup}>
                        <MacroInput label="Calories" value={calsInputValue} onChange={setCaloriesInputValue} placeholder="kcal" icon_color = {MACRO_CALORIES} icon="flame-outline" />
                        <MacroInput label="Protein" value={proteinInputValue} onChange={setProteinInputValue} placeholder="g" icon_color = {MACRO_PROTEIN} icon="fish-outline" />
                        <MacroInput label="Carbs" value={carbsInputValue} onChange={setCarbsInputValue} placeholder="g" icon_color = {MACRO_CARBS}  icon="nutrition-outline" />
                        <MacroInput label="Fats" value={fatsInputValue} onChange={setFatsInputValue} placeholder="g" icon_color = {MACRO_FAT} icon="water-outline" />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                      style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                      onPress={handleUpdate}
                      activeOpacity={0.85}
                      disabled={saving}
                    >
                         {/* <Ionicons name="checkmark-outline" size={18} color="#0E0E12" /> */}
                        <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save Progress'}</Text>
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

// Reusable Input Component to keep code DRY
const MacroInput = ({ label, icon_color, value, onChange, placeholder, icon }) => (


<View>

      <ActivityInputNumberPad
          icon={icon}
          icon_color={icon_color}
          label={label}
          value={value}
          onChange={onChange}
      />

  </View>
);

// THESE STYLES ARE REQUIRED
const styles = StyleSheet.create({
  overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
  },
  modalContainer: {
      width: "85%",
      backgroundColor: CARD_BG,
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: BORDER,
      elevation: 5, // Shadow for Android
      shadowColor: '#000', // Shadow for iOS
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5
  },
  headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
  },
  title: {
      fontSize: 18,
      fontWeight: "700",
      color: '#FFFFFF',
      letterSpacing: 0.2,
  },
  subtitle: {
      fontSize: 12,
      color: '#ffffff',
      fontStyle: 'italic',
      marginBottom: 18
  },
  inputGroup: {
      gap: 10,
      marginBottom: 20
  },
  inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: INPUT_BG,
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
  },
  labelGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff'
  },
  input: {
      width: 90,
      backgroundColor: 'transparent',
      borderRadius: 8,
      paddingHorizontal: 4,
      paddingVertical: 4,
      textAlign: 'right',
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
  },
  saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: ACCENT,
      paddingVertical: 13,
      borderRadius: 12,
      shadowColor: ACCENT,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
  },
  saveButtonDisabled: {
      opacity: 0.6,
  },
  saveButtonText: {
      color: '#0E0E12',
      fontSize: 15,
      fontWeight: '900',
      letterSpacing: 0.3,
  },
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
  }
});

export default AddMacrosModal;