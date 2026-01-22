import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function XPTrophyCount() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyXp , setWeeklyXP] = useState(1000);

  useEffect(() => {
   
  }, []);

  return (
    
    <View style={styles.headerRow}>
  
        <View style={styles.xpFill}>
          <Ionicons name="trophy-outline" size={16} color="#fff" />
          <Text style={styles.xpText}>{weeklyXp} XP</Text>
        </View>
      </View>
      

    
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'left',marginBottom: 8 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    xpFill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'red', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
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
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#333' },
    inputLabel: { fontSize: 12, color: '#666', marginBottom: 4, marginTop: 8 },
    input: { backgroundColor: '#f1f3f5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
    typesRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
    typeChip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#e9ecef', marginRight: 8 },
    typeChipActive: { backgroundColor: '#4CAF50' },
    typeChipText: { color: '#333', fontWeight: '600' },
    typeChipTextActive: { color: '#fff' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
    modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginLeft: 8 },
    cancelBtn: { backgroundColor: '#f1f3f5' },
    saveBtn: { backgroundColor: '#4CAF50' },
    cancelText: { color: '#333', fontWeight: '600' },
    saveText: { color: '#fff', fontWeight: '700' },
  });