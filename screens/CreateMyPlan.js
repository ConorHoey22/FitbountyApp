
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Modal, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { M, modalStyles as ms } from '../components/modalTheme';
import { font } from '../utils/fonts';

const STORAGE_KEY = 'fitbounty.weeklyPlanner.v1';
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];


const DEFAULT_XP_BY_TYPE = { Gym: 50, Cardio: 30, Stretching: 20, Social: 10 };

function createEmptyPlanner() {
  return DAYS.reduce((acc, day) => { acc[day] = []; return acc; }, {});
}

export default function CreateMyPlan() {
  const [tasksByDay, setTasksByDay] = useState(createEmptyPlanner());
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState('Gym');
  const [newTaskXp, setNewTaskXp] = useState(String(DEFAULT_XP_BY_TYPE['Gym']));
  const [isInitializing, setIsInitializing] = useState(true);
 
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setTasksByDay({ ...createEmptyPlanner(), ...JSON.parse(saved) });
      } catch {}
      finally { setIsInitializing(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasksByDay)).catch(() => {});
  }, [tasksByDay, isInitializing]);

  const weeklyXp = useMemo(() =>
    DAYS.reduce((sum, day) => sum + (tasksByDay[day] || [])
      .reduce((s, t) => s + (t.completed ? Number(t.xp || 0) : 0), 0), 0),
    [tasksByDay]
  );

  const toggleComplete = (day, id) => {
    setTasksByDay(prev => ({ ...prev, [day]: prev[day].map(t => t.id === id ? { ...t, completed: !t.completed } : t) }));
  };

  const removeTask = (day, id) => {
    setTasksByDay(prev => ({ ...prev, [day]: prev[day].filter(t => t.id !== id) }));
  };

  const openAddModal = () => {
    setNewTaskTitle('');
    setNewTaskType('Gym');
    setNewTaskXp(String(DEFAULT_XP_BY_TYPE['Gym']));
    setIsModalVisible(true);
  };

  const addTask = () => {
    const title = newTaskTitle.trim();
    const xpValue = Number(newTaskXp);
    if (!title) return Alert.alert('Task title required');
    if (Number.isNaN(xpValue) || xpValue < 0) return Alert.alert('Invalid XP value');

    const task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      type: newTaskType,
      xp: xpValue,
      completed: false,
    };
    setTasksByDay(prev => ({ ...prev, [selectedDay]: [...prev[selectedDay], task] }));
    setIsModalVisible(false);
  };

  const TaskItem = ({ item }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity style={[styles.checkbox, item.completed && styles.checkboxChecked]} onPress={() => toggleComplete(selectedDay, item.id)}>
        {item.completed ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
      </TouchableOpacity>
      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, item.completed && styles.taskTitleDone]}>{item.title}</Text>
        <Text style={styles.taskMeta}>{item.type} • {item.xp} XP</Text>
      </View>
      <TouchableOpacity onPress={() => removeTask(selectedDay, item.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Weekly Planner</Text>
        <View style={styles.xpPill}>
          <Ionicons name="trophy-outline" size={16} color="#fff" />
          <Text style={styles.xpText}>{weeklyXp} XP</Text>
        </View>
      </View>

      <View style={styles.daysRow}>
        {DAYS.map(day => (
          <TouchableOpacity key={day} onPress={() => setSelectedDay(day)} style={[styles.dayChip, selectedDay === day && styles.dayChipActive]}>
            <Text style={[styles.dayChipText, selectedDay === day && styles.dayChipTextActive]}>{day.slice(0,3)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={tasksByDay[selectedDay]}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet. Add one!</Text>}
          renderItem={({ item }) => <TaskItem item={item} />}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      </View>

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={ms.sheetOverlay}>
          <View style={ms.sheetCard}>
            <View style={[ms.headerLeft, { marginBottom: 12 }]}>
              <View style={ms.badge}>
                <Text style={ms.badgeText}>NEW TASK</Text>
              </View>
              <Text style={ms.title}>Add Task - {selectedDay}</Text>
            </View>

            <Text style={[ms.fieldLabel, styles.fieldGap]}>Title</Text>
            <TextInput placeholder="e.g. Leg Day, 5km Run, Visit a friend" placeholderTextColor={M.PLACEHOLDER} value={newTaskTitle} onChangeText={setNewTaskTitle} style={ms.textInput} />

            <Text style={[ms.fieldLabel, styles.fieldGap]}>Type</Text>
            <View style={styles.typesRow}>
              {Object.keys(DEFAULT_XP_BY_TYPE).map(type => {
                const isActive = newTaskType === type;
                return (
                  <Pressable key={type} onPress={() => { setNewTaskType(type); setNewTaskXp(String(DEFAULT_XP_BY_TYPE[type])); }} style={[styles.typeChip, isActive && styles.typeChipActive]}>
                    <Text style={[styles.typeChipText, isActive && styles.typeChipTextActive]}>{type}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[ms.fieldLabel, styles.fieldGap]}>XP</Text>
            <TextInput keyboardType="numeric" value={newTaskXp} onChangeText={setNewTaskXp} style={ms.textInput} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[ms.secondaryButton, styles.modalBtn]} onPress={() => setIsModalVisible(false)}>
                <Text style={ms.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[ms.saveButton, styles.modalBtn]} onPress={addTask}>
                <Text style={ms.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  xpPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  xpText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  dayChip: { flex: 1, marginHorizontal: 3, backgroundColor: '#e9ecef', paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  dayChipActive: { backgroundColor: '#4CAF50' },
  dayChipText: { color: '#333', fontWeight: '600' },
  dayChipTextActive: { color: '#fff' },
  listContainer: { flex: 1, marginTop: 6 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
  taskItem: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 2 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: '#fff' },
  checkboxChecked: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  taskTitleDone: { textDecorationLine: 'line-through', color: '#999' },
  taskMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  deleteBtn: { padding: 6 },
  fab: { position: 'absolute', right: 20, bottom: 30, backgroundColor: '#4CAF50', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  // Add Task modal — Add Food design (components/modalTheme.js)
  fieldGap: { marginTop: 10 },
  typesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  typeChip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, backgroundColor: M.SURFACE },
  typeChipActive: { backgroundColor: M.INK },
  typeChipText: { color: M.INK, ...font('600') },
  typeChipTextActive: { color: M.WHITE },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  modalBtn: { flex: 1 },
});