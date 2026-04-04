import React, { useState } from 'react';
import { Modal, StyleSheet, View, Text, Pressable, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

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


  const handleUpdate = () => {
    // Convert the local string inputs to numbers
    const cals = parseInt(calsInputValue) || 0;
    const protein = parseInt(proteinInputValue) || 0;
    const carbs = parseInt(carbsInputValue) || 0;
    const fats = parseInt(fatsInputValue) || 0;
  
    // ADD to existing totals
    setCaloriesConsumed(prev => prev + cals);
    setProteinConsumed(prev => prev + protein);
    setCarbohydratesConsumed(prev => prev + carbs);
    setFatsConsumed(prev => prev + fats);

    // Clear input values
    setCaloriesInputValue(""); // Clear calories input
    setProteinInputValue(""); // Clear protein input
    setCarbsInputValue(""); // Clear carbs input
    setFatsInputValue(""); // Clear fats input

    onClose(); // Close modal


};

  return (
            <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Update Macros</Text>
                        <Pressable onPress={onClose}>
                            <Ionicons name="close-circle-outline" size={28} color="#333" />
                        </Pressable>
                    </View>

                    <Text style={styles.subtitle}>* MyFitnessPal integration coming soon *</Text>

                    {/* Input Fields */}
                    <View style={styles.inputGroup}>
                        <MacroInput label="Calories" value={calsInputValue} onChange={setCaloriesInputValue} placeholder="kcal" />
                        <MacroInput label="Protein" value={proteinInputValue} onChange={setProteinInputValue} placeholder="g" />
                        <MacroInput label="Carbs" value={carbsInputValue} onChange={setCarbsInputValue} placeholder="g" />
                        <MacroInput label="Fats" value={fatsInputValue} onChange={setFatsInputValue} placeholder="g" />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                        <Text style={styles.saveButtonText}>Save Progress</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
  );


  
};

// Reusable Input Component to keep code DRY
const MacroInput = ({ label, value, onChange, placeholder }) => (
  <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
          style={styles.input}
          placeholder={placeholder}
          keyboardType="number-pad" // Better for macros (no decimals/signs)
          value={value}
          onChangeText={onChange}
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
      backgroundColor: "white",
      padding: 20,
      borderRadius: 20,
      elevation: 5, // Shadow for Android
      shadowColor: '#000', // Shadow for iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5
  },
  title: {
      fontSize: 22,
      fontWeight: "bold",
      color: '#1a1a1a'
  },
  subtitle: {
      fontSize: 12,
      color: '#666',
      fontStyle: 'italic',
      marginBottom: 20
  },
  inputGroup: {
      marginBottom: 20
  },
  inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15
  },
  label: {
      fontSize: 16,
      fontWeight: '500',
      color: '#444'
  },
  input: {
      width: 100,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      textAlign: 'right'
  },
  saveButton: {
      backgroundColor: '#4CAF50',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center'
  },
  saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold'
  }
});

export default AddMacrosModal;