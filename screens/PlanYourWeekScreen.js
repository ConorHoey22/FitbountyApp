import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function PlanYourWeekScreen() {
  const navigation = useNavigation();
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday ...

  const [openDay, setOpenDay] = useState(null); // expanded card
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const days = [
    { id: 1, name: 'Monday', description: 'Workout', cardio: 10, stepCount: 10000, icon: 'barbell' },
    { id: 2, name: 'Tuesday', description: 'Busy Day (Rest)', cardio: 30, stepCount: 300, icon: 'bed' },
    { id: 3, name: 'Wednesday', description: 'Golf', cardio: 10, stepCount: 11000, icon: 'flag-outline' },
    { id: 4, name: 'Thursday', description: 'Workout', cardio: 10, stepCount: 2820, icon: 'barbell' },
    { id: 5, name: 'Friday', description: 'Workout', cardio: 40, stepCount: 2810, icon: 'barbell' },
    { id: 6, name: 'Saturday', description: 'Workout', cardio: 10, stepCount: 2820, icon: 'barbell' },
    { id: 0, name: 'Sunday', description: 'Visiting a Friend', cardio: 10, stepCount: 2820, icon: 'people' },
  ];

  const totalSteps = days.reduce((acc, d) => acc + d.stepCount, 0);
  const totalCardio = days.reduce((acc, d) => acc + d.cardio, 0);
  const workoutDays = days.filter(d => d.description.includes('Workout')).length;

  const toggleDay = (id) => {
    setOpenDay(prev => (prev === id ? null : id));
  };

  const handleViewDetails = (day) => {
    setSelectedDay(day);
    setModalVisible(true);
  };

  const handleEdit = () => {
    setModalVisible(false);
    alert(`Edit ${selectedDay?.name}`);
    // navigation.navigate("EditScreen", { day: selectedDay });
  };

  const handleDelete = () => {
    setModalVisible(false);
    alert(`${selectedDay?.name} deleted`);
    // hook up with DB later
  };

  const handleComplete = () => {
    setModalVisible(false);
    alert(`${selectedDay?.name} marked complete! 🎉`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plan ahead and Plan your Week!</Text>
      <Text style={styles.subtitle}>Fail to plan, plan to fail!</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CreateMyPlan')}>
        <Text style={styles.buttonText}>Plan your Week</Text>
      </TouchableOpacity>

      {/* Weekly Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.subtitle}>Weekly Summary</Text>
        <Text style={styles.summaryText}>Total Steps: {totalSteps.toLocaleString()}</Text>
        <Text style={styles.summaryText}>Cardio Minutes: {totalCardio}</Text>
        <Text style={styles.summaryText}>Workout Days: {workoutDays}</Text>
      </View>

      {/* Collapsible Days */}
      <ScrollView style={styles.daysList} showsVerticalScrollIndicator={false}>
        {days.map((day) => {
          const isToday = today === day.id;
          const isOpen = openDay === day.id;

          return (
            <View key={day.id} style={[styles.daysCard, isToday && styles.todayHighlight]}>
              {/* Header */}
              <TouchableOpacity style={styles.dayHeader} onPress={() => toggleDay(day.id)}>
                <View style={styles.iconWrapper}>
                  <Ionicons name={day.icon} size={28} color="#4CAF50" />
                </View>
                <Text style={styles.daysName}>{day.name}</Text>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
              </TouchableOpacity>

              {/* Expanded Content */}
              {isOpen && (
                <View style={styles.dayDetails}>
                  <Text style={styles.daysDetails}>{day.description}</Text>
                  <Text style={styles.progressText}>Cardio: {day.cardio} mins</Text>
                  <Text style={styles.progressText}>Steps: {day.stepCount.toLocaleString()}</Text>

                  <TouchableOpacity style={styles.viewButton} onPress={() => handleViewDetails(day)}>
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedDay?.name} Options</Text>
            <Text style={styles.modalSubtitle}>{selectedDay?.description}</Text>

            <TouchableOpacity style={styles.modalButton} onPress={handleEdit}>
              <Text style={styles.modalButtonText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleComplete}>
              <Text style={styles.modalButtonText}>✅ Mark Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={handleDelete}>
              <Text style={styles.modalButtonText}>🗑️ Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5, color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 20, elevation: 2 },
  summaryText: { fontSize: 14, color: '#333', marginBottom: 5 },
  daysList: { flex: 1 },
  daysCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, elevation: 2, overflow: 'hidden' },
  todayHighlight: { borderWidth: 2, borderColor: '#4CAF50' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, justifyContent: 'space-between' },
  iconWrapper: { marginRight: 10 },
  daysName: { flex: 1, fontSize: 18, fontWeight: '600', color: '#333' },
  dayDetails: { padding: 15, borderTopWidth: 1, borderTopColor: '#eee' },
  daysDetails: { fontSize: 14, color: '#666', marginBottom: 5 },
  progressText: { fontSize: 13, color: '#666', marginBottom: 3 },
  viewButton: { marginTop: 10, backgroundColor: '#4CAF50', paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  viewButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  button: { backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 20, alignSelf: 'center' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  modalButton: { width: '100%', paddingVertical: 12, borderRadius: 8, backgroundColor: '#4CAF50', alignItems: 'center', marginBottom: 10 },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteButton: { backgroundColor: '#E53935' },
  closeButton: { marginTop: 10, paddingVertical: 10, paddingHorizontal: 20 },
  closeButtonText: { color: '#4CAF50', fontWeight: '600' },
});
