import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// ─── Palette (mirrors RewardSystemScreen) ────────────────────────────────────
const ACCENT   = '#C6F135';
const BG       = '#0E0E12';
const CARD     = '#22222E';
const SURFACE2 = '#2C2C3C';
const BORDER   = '#42425A';

export default function WeightTrackerScreen() {
  const navigation = useNavigation();
  const [unit, setUnit] = useState('kg');
  const [weights, setWeights] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [inputUnit, setInputUnit] = useState('kg');
  const [stoneInput, setStoneInput] = useState('');
  const [lbsInput, setLbsInput] = useState('');
  const [XPEarned, setXPEarned] = useState(null);

  useEffect(() => {
    const mockData = [
      { date: '2025-08-19', weight: 70.2 },
      { date: '2025-08-20', weight: 70.5 },
      { date: '2025-08-21', weight: 70.1 },
      { date: '2025-08-22', weight: 69.8 },
      { date: '2025-08-23', weight: 69.6 },
    ];
    setWeights(mockData);
  }, []);

  // ── Conversion helpers ──────────────────────────────────────────────────
  const lbsToKg  = (lbs) => lbs / 2.20462;
  const stToKg   = (st, lbs = 0) => (st * 14 + lbs) / 2.20462;
  const kgToLbs  = (kg) => kg * 2.20462;
  const kgToSt   = (kg) => {
    const lbs       = kgToLbs(kg);
    const st        = Math.floor(lbs / 14);
    const remainder = Math.round(lbs % 14);
    return `${st}st ${remainder}lbs`;
  };

  const convertWeight = (kg) => {
    if (unit === 'kg')  return `${kg.toFixed(1)} kg`;
    if (unit === 'lbs') return `${kgToLbs(kg).toFixed(1)} lbs`;
    if (unit === 'st')  return kgToSt(kg);
  };

  // ── Chart data ──────────────────────────────────────────────────────────
  const chartData =
    unit === 'st'
      ? weights.map((w) => parseFloat((kgToLbs(w.weight) / 14).toFixed(2)))
      : weights.map((w) =>
          unit === 'kg' ? w.weight : parseFloat(kgToLbs(w.weight).toFixed(1))
        );

  const labels = weights.map((w) =>
    new Date(w.date).toLocaleDateString('en-GB', { weekday: 'short' })
  );

  // ── Trend indicator ─────────────────────────────────────────────────────
  const getTrend = () => {
    if (weights.length < 2) return null;
    const diff = weights[weights.length - 1].weight - weights[weights.length - 2].weight;
    if (Math.abs(diff) < 0.05) return { icon: 'remove-outline', color: '#A0A0BC', label: 'Stable' };
    if (diff < 0) return { icon: 'trending-down-outline', color: ACCENT, label: `${Math.abs(diff).toFixed(1)} kg down` };
    return { icon: 'trending-up-outline', color: '#FF4D6D', label: `${diff.toFixed(1)} kg up` };
  };
  const trend = getTrend();

  // ── Save ────────────────────────────────────────────────────────────────
  const saveWeight = () => {
    let weightKg = 0;
    if (inputUnit === 'kg')       weightKg = parseFloat(inputWeight);
    else if (inputUnit === 'lbs') weightKg = lbsToKg(parseFloat(inputWeight));
    else if (inputUnit === 'st')  weightKg = stToKg(parseFloat(stoneInput) || 0, parseFloat(lbsInput) || 0);

    if (!isNaN(weightKg) && weightKg > 0) {
      const newEntry = { date: new Date().toISOString(), weight: weightKg };
      setWeights((prev) => [...prev, newEntry]);
      setInputWeight('');
      setStoneInput('');
      setLbsInput('');
      setModalVisible(false);
      setXPEarned(100);
      setTimeout(() => setXPEarned(null), 3000);
    }
  };

  const latestWeight = weights.length > 0 ? weights[weights.length - 1] : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Decorative blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>WEIGHT TRACKER</Text>
            </View>
            <Text style={styles.title}>Your Progress</Text>
            <Text style={styles.subtitle}>Log daily to earn XP</Text>
          </View>
          {latestWeight && (
            <View style={styles.currentWeightPill}>
              <Ionicons name="scale-outline" size={14} color={ACCENT} />
              <Text style={styles.currentWeightText}>{convertWeight(latestWeight.weight)}</Text>
            </View>
          )}
        </View>

        {/* ── XP toast ── */}
        {XPEarned && (
          <View style={styles.xpToast}>
            <Ionicons name="flash" size={14} color="#0E0E12" />
            <Text style={styles.xpToastText}>+{XPEarned} XP EARNED!</Text>
          </View>
        )}

        {/* ── Stats row ── */}
        {weights.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>ENTRIES</Text>
              <Text style={styles.statValue}>{weights.length}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>LOWEST</Text>
              <Text style={styles.statValue}>
                {convertWeight(Math.min(...weights.map((w) => w.weight)))}
              </Text>
            </View>
            {trend && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>TREND</Text>
                <View style={styles.trendRow}>
                  <Ionicons name={trend.icon} size={16} color={trend.color} />
                  <Text style={[styles.statValue, { color: trend.color, fontSize: 12 }]}>{trend.label}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Unit toggle ── */}
        <View style={styles.toggleWrapper}>
          {['kg', 'lbs', 'st'].map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.toggleButton, unit === value && styles.activeToggle]}
              onPress={() => setUnit(value)}
            >
              <Text style={[styles.toggleText, unit === value && styles.activeToggleText]}>
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Chart ── */}
        {chartData.length > 0 && (
          <View style={styles.chartWrapper}>
            <LineChart
              data={{ labels, datasets: [{ data: chartData }] }}
              width={screenWidth - 40}
              height={200}
              yAxisSuffix={` ${unit === 'st' ? 'st' : unit}`}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </View>
        )}

        {/* ── Recent entries ── */}
        <Text style={styles.sectionTitle}>Recent Entries</Text>
        {weights.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="scale-outline" size={40} color={BORDER} />
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptySubtitle}>Record your first weight to get started!</Text>
          </View>
        ) : (
          weights.slice(-7).reverse().map((w, i) => (
            <View key={i} style={styles.entryCard}>
              <View style={styles.entryLeft}>
                <Ionicons name="calendar-outline" size={14} color="#A0A0BC" />
                <Text style={styles.entryDate}>
                  {new Date(w.date).toLocaleDateString('en-GB', {
                    weekday: 'short', day: 'numeric', month: 'short',
                  })}
                </Text>
              </View>
              <Text style={styles.entryWeight}>{convertWeight(w.weight)}</Text>
            </View>
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
          <Ionicons name="add-outline" size={20} color="#0E0E12" />
          <Text style={styles.fabText}>LOG WEIGHT</Text>
        </TouchableOpacity>
      </View>

      {/* ── Modal ── */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <View>
                <View style={styles.modalBadge}>
                  <Text style={styles.modalBadgeText}>LOG WEIGHT</Text>
                </View>
                <Text style={styles.modalTitle}>Enter Weight</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#A0A0BC" />
              </TouchableOpacity>
            </View>

            {/* Unit toggle in modal */}
            <View style={styles.toggleWrapper}>
              {['kg', 'lbs', 'st'].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.toggleButton, inputUnit === value && styles.activeToggle]}
                  onPress={() => setInputUnit(value)}
                >
                  <Text style={[styles.toggleText, inputUnit === value && styles.activeToggleText]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input */}
            {inputUnit === 'st' ? (
              <View style={styles.stoneWrapper}>
                <View style={[styles.fieldWrapper, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>STONE</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 11"
                    placeholderTextColor="#4a4a5a"
                    keyboardType="numeric"
                    value={stoneInput}
                    onChangeText={setStoneInput}
                  />
                </View>
                <View style={[styles.fieldWrapper, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>LBS</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 6"
                    placeholderTextColor="#4a4a5a"
                    keyboardType="numeric"
                    value={lbsInput}
                    onChangeText={setLbsInput}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>{inputUnit.toUpperCase()}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter weight in ${inputUnit}`}
                  placeholderTextColor="#4a4a5a"
                  keyboardType="numeric"
                  value={inputWeight}
                  onChangeText={setInputWeight}
                />
              </View>
            )}

            {/* XP note */}
            <View style={styles.xpNote}>
              <Ionicons name="flash" size={13} color={ACCENT} />
              <Text style={styles.xpNoteText}>Earn 100 XP for logging today</Text>
            </View>

            {/* Buttons */}
            <TouchableOpacity style={styles.saveBtn} onPress={saveWeight} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>SAVE ENTRY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Chart config ─────────────────────────────────────────────────────────────
const chartConfig = {
  backgroundColor: CARD,
  backgroundGradientFrom: CARD,
  backgroundGradientTo: CARD,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(198, 241, 53, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(160, 160, 188, ${opacity})`,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: ACCENT,
    fill: BG,
  },
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 20, paddingTop: 64 },
  blobTopRight:  { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: ACCENT, opacity: 0.05, top: -80, right: -80 },
  blobBottomLeft:{ position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: '#5B4FE8', opacity: 0.06, bottom: 60, left: -80 },

  // Header
  header:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  badge:              { alignSelf: 'flex-start', backgroundColor: ACCENT + '22', borderWidth: 1, borderColor: ACCENT + '55', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 8 },
  badgeText:          { color: ACCENT, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  title:              { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  subtitle:           { fontSize: 14, color: '#A0A0BC', marginTop: 4 },
  currentWeightPill:  { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: ACCENT + '18', borderWidth: 1, borderColor: ACCENT + '44', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  currentWeightText:  { color: ACCENT, fontSize: 14, fontWeight: '800' },

  // XP toast
  xpToast:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 10, marginBottom: 16 },
  xpToastText: { color: '#0E0E12', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },

  // Stats
  statsRow:   { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard:   { flex: 1, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14 },
  statLabel:  { color: '#A0A0BC', fontSize: 9, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  statValue:  { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  trendRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },

  // Toggle
  toggleWrapper: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 8 },
  toggleButton:  { paddingVertical: 8, paddingHorizontal: 20, borderWidth: 1, borderColor: BORDER, borderRadius: 20 },
  activeToggle:  { backgroundColor: ACCENT, borderColor: ACCENT },
  toggleText:    { fontSize: 14, color: '#A0A0BC', fontWeight: '700' },
  activeToggleText: { color: '#0E0E12' },

  // Chart
  chartWrapper: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, marginBottom: 24, overflow: 'hidden' },
  chart:        { borderRadius: 16 },

  // Entries
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 12, letterSpacing: -0.3 },
  entryCard:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 10 },
  entryLeft:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entryDate:    { color: '#A0A0BC', fontSize: 13, fontWeight: '600' },
  entryWeight:  { color: ACCENT, fontSize: 15, fontWeight: '800' },

  // Empty
  emptyBox:     { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: '#DDDDF0' },
  emptySubtitle:{ fontSize: 14, color: '#A0A0BC', textAlign: 'center' },

  // FAB
  fabWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18, backgroundColor: BG, borderTopWidth: 1, borderTopColor: BORDER },
  fab:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT, paddingVertical: 15, borderRadius: 14, gap: 8, shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 },
  fabText:    { color: '#0E0E12', fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },

  // Modal
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '88%', backgroundColor: '#18181F', borderRadius: 22, padding: 22, borderWidth: 1, borderColor: BORDER },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  modalBadge:     { alignSelf: 'flex-start', backgroundColor: ACCENT + '22', borderWidth: 1, borderColor: ACCENT + '55', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 6 },
  modalBadgeText: { color: ACCENT, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  modalTitle:     { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  closeBtn:       { width: 32, height: 32, borderRadius: 16, backgroundColor: SURFACE2, borderWidth: 1, borderColor: BORDER, justifyContent: 'center', alignItems: 'center' },
  stoneWrapper:   { flexDirection: 'row' },
  fieldWrapper:   { marginBottom: 16 },
  fieldLabel:     { color: '#A0A0BC', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  input:          { backgroundColor: SURFACE2, borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, padding: 14, color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  xpNote:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  xpNoteText:     { color: '#A0A0BC', fontSize: 12, fontWeight: '600' },
  saveBtn:        { backgroundColor: ACCENT, paddingVertical: 15, borderRadius: 13, alignItems: 'center', shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  saveBtnText:    { color: '#0E0E12', fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
});