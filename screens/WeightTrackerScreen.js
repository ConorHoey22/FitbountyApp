import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const STORAGE_KEY = 'weight-tracker:entries:v1';
const POUNDS_PER_KG = 2.20462262185;

function toKg(value, unit) {
  return unit === 'lbs' ? value / POUNDS_PER_KG : value;
}
function fromKg(valueKg, unit) {
  return unit === 'lbs' ? valueKg * POUNDS_PER_KG : valueKg;
}
function round1(n) {
  return Math.round(n * 10) / 10;
}
function formatDateISO(d) {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function getWeekKey(date) {
  const d = new Date(date);
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = utc.getUTCDay();
  const diffToMonday = (day + 6) % 7; // 0 for Monday
  const monday = new Date(utc);
  monday.setUTCDate(utc.getUTCDate() - diffToMonday);
  const year = monday.getUTCFullYear();
  const firstJan = new Date(Date.UTC(year, 0, 1));
  const days = Math.floor((monday - firstJan) / 86400000);
  const week = Math.floor(days / 7) + 1;
  const weekStr = String(week).padStart(2, '0');
  return `${year}-W${weekStr}`;
}

async function loadEntries() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load entries', e);
    return [];
  }
}
async function saveEntries(entries) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save entries', e);
  }
}

export default function WeightTrackerScreen() {
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(formatDateISO(new Date()));
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('kg');
  const [displayUnit, setDisplayUnit] = useState('kg');

  useEffect(() => {
    (async () => {
      const loaded = await loadEntries();
      loaded.sort((a, b) => a.date.localeCompare(b.date));
      setEntries(loaded);
    })();
  }, []);

  const upsert = useCallback(async () => {
    const value = parseFloat(weight);
    if (!isFinite(value) || value <= 0) {
      Alert.alert('Invalid weight', 'Please enter a valid weight');
      return;
    }
    const weightKg = toKg(value, unit);
    const next = [...entries];
    const idx = next.findIndex(e => e.date === date);
    if (idx >= 0) next[idx].weightKg = weightKg; else next.push({ date, weightKg });
    next.sort((a, b) => a.date.localeCompare(b.date));
    setEntries(next);
    setWeight('');
    await saveEntries(next);
  }, [weight, unit, date, entries]);

  const remove = useCallback(async (d) => {
    const next = entries.filter(e => e.date !== d);
    setEntries(next);
    await saveEntries(next);
  }, [entries]);

  const clearAll = useCallback(() => {
    Alert.alert('Clear all?', 'Delete all entries', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await saveEntries([]); setEntries([]); } }
    ]);
  }, []);

  const weekly = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const wk = getWeekKey(e.date);
      if (!map.has(wk)) map.set(wk, []);
      map.get(wk).push(e.weightKg);
    }
    const result = [];
    for (const [wk, arr] of map.entries()) {
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      result.push({ week: wk, avgKg: avg });
    }
    result.sort((a, b) => a.week.localeCompare(b.week));
    return result;
  }, [entries]);

  const chartData = useMemo(() => {
    const labels = weekly.map(w => w.week);
    const data = weekly.map(w => round1(fromKg(w.avgKg, displayUnit)));
    return { labels, datasets: [{ data }] };
  }, [weekly, displayUnit]);

  const screenWidth = Dimensions.get('window').width - 40;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight Tracker</Text>

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Weight</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            placeholder="0.0"
            keyboardType="decimal-pad"
            style={styles.input}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Unit</Text>
          <View style={styles.switchRow}>
            <TouchableOpacity onPress={() => setUnit('kg')} style={[styles.pill, unit === 'kg' && styles.pillActive]}>
              <Text style={[styles.pillText, unit === 'kg' && styles.pillTextActive]}>kg</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setUnit('lbs')} style={[styles.pill, unit === 'lbs' && styles.pillActive]}>
              <Text style={[styles.pillText, unit === 'lbs' && styles.pillTextActive]}>lbs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={upsert}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Weekly Average</Text>
        <View style={styles.switchRow}>
          <TouchableOpacity onPress={() => setDisplayUnit('kg')} style={[styles.pill, displayUnit === 'kg' && styles.pillActive]}>
            <Text style={[styles.pillText, displayUnit === 'kg' && styles.pillTextActive]}>kg</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDisplayUnit('lbs')} style={[styles.pill, displayUnit === 'lbs' && styles.pillActive]}>
            <Text style={[styles.pillText, displayUnit === 'lbs' && styles.pillTextActive]}>lbs</Text>
          </TouchableOpacity>
        </View>
      </View>

      <LineChart
        data={chartData}
        width={screenWidth}
        height={220}
        yAxisSuffix={` ${displayUnit}`}
        chartConfig={{
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
          decimalPlaces: 1,
          propsForDots: { r: '3' },
        }}
        bezier
        style={{ marginVertical: 8, borderRadius: 12, alignSelf: 'center' }}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Entries</Text>
        <TouchableOpacity onPress={clearAll}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.entryRow}>
            <View>
              <Text style={styles.entryDate}>{item.date}</Text>
              <Text style={styles.entryWeight}>{round1(fromKg(item.weightKg, displayUnit))} {displayUnit}</Text>
            </View>
            <TouchableOpacity onPress={() => remove(item.date)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No entries yet.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  pillText: {
    color: '#333',
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  entryRow: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryDate: {
    color: '#666',
    marginBottom: 4,
  },
  entryWeight: {
    fontWeight: '700',
    color: '#333',
  },
  deleteText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  empty: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});