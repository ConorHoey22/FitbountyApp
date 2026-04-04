import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, Text, Pressable, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const AddTodayPlanModal = ({
    visible,
    onClose,
    onSave, // Add this callback to notify parent component
}) => {
  // Local state for what the user is currently typing in the input
  const [cardioInputValue, setCardioInputValue] = useState("");
  const [stepsInputValue, setStepsInputValue] = useState("");
  const [workoutsInputValue, setWorkoutsInputValue] = useState("");

  // Current totals from AsyncStorage
  const [currentCardio, setCurrentCardio] = useState(0);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [currentWorkouts, setCurrentWorkouts] = useState(0);

  // Load current values when modal opens
  useEffect(() => {
    if (visible) {
      loadCurrentProgress();
    }
  }, [visible]);

  const loadCurrentProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('todayChecks');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCurrentCardio(Number(parsed.cardio) || 0);
        setCurrentSteps(Number(parsed.steps) || 0);
        setCurrentWorkouts(Number(parsed.gym) || 0);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      // Convert the local string inputs to numbers
      const cardioToAdd = parseInt(cardioInputValue) || 0;
      const stepsToAdd = parseInt(stepsInputValue) || 0;
      const workoutsToAdd = parseInt(workoutsInputValue) || 0;

      // ADD to existing totals
      const newCardio = currentCardio + cardioToAdd;
      const newSteps = currentSteps + stepsToAdd;
      const newWorkouts = currentWorkouts + workoutsToAdd;

      // Create the updated checks object
      const todayChecks = {
        cardio: newCardio,
        steps: newSteps,
        gym: newWorkouts > 0, // true if any workouts completed
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem('todayChecks', JSON.stringify(todayChecks));

      // Update local state
      setCurrentCardio(newCardio);
      setCurrentSteps(newSteps);
      setCurrentWorkouts(newWorkouts);

      // Clear input values
      setCardioInputValue("");
      setStepsInputValue("");
      setWorkoutsInputValue("");

      // Notify parent component to refresh
      if (onSave) {
        onSave();
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Update Activity</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close-circle-outline" size={28} color="#333" />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>Update this form throughout your day to keep track - * Smart Watch integration coming soon *</Text>

          {/* Current Progress Display */}
          <View style={styles.currentProgress}>
            <Text style={styles.progressTitle}>Current Progress:</Text>
            <Text style={styles.progressText}>Cardio: {currentCardio} min</Text>
            <Text style={styles.progressText}>Steps: {currentSteps}</Text>
            <Text style={styles.progressText}>Workouts: {currentWorkouts}</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputGroup}>
            <MacroInput 
              label="Add Cardio (Minutes)" 
              value={cardioInputValue} 
              onChange={setCardioInputValue} 
              placeholder="0" 
            /> 
            <MacroInput 
              label="Add Steps" 
              value={stepsInputValue} 
              onChange={setStepsInputValue} 
              placeholder="0" 
            />
            <MacroInput 
              label="Add Workouts" 
              value={workoutsInputValue} 
              onChange={setWorkoutsInputValue} 
              placeholder="0" 
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
            <Text style={styles.saveButtonText}>Save Progress</Text>
          </TouchableOpacity>

          {/* Reset Button */}
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={async () => {
              await AsyncStorage.removeItem('todayChecks');
              setCurrentCardio(0);
              setCurrentSteps(0);
              setCurrentWorkouts(0);
              if (onSave) onSave();
            }}
          >
            <Text style={styles.resetButtonText}>Reset Today's Progress</Text>
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
      keyboardType="number-pad"
      value={value}
      onChangeText={onChange}
    />
  </View>
);

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
    elevation: 5,
    shadowColor: '#000',
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
    marginBottom: 15
  },
  currentProgress: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
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
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  resetButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  }
});

export default AddTodayPlanModal;