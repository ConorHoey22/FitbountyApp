import React from 'react';
import { APP_BG_GRADIENT } from '../components/ScreenBackground';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AuthBackground from '../components/AuthBackground';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import { font } from '../utils/fonts';
import useTabBarSpace from '../utils/useTabBarSpace';

// My Health — dashboard for health metrics (HRV, resting heart rate, recovery,
// sleep, water intake, VO₂ max).
//
// No data source is connected yet, so every value is null and shows "—".
// To display real data, fill in `health` below (e.g. from Apple Health / a
// wearable) — the cards update automatically.
const health = {
  recovery: null,      // %   (0–100)
  hrv: null,           // ms
  restingHeartRate: null, // bpm
  sleepHours: null,    // hours
  sleepGoal: 8,        // hours
  vo2Max: null,        // ml/kg/min
  waterLitres: null,   // litres today
  waterGoal: 2.5,      // litres
};

const METRICS = [
  { key: 'hrv',              label: 'HRV',          icon: 'pulse',       unit: 'ms',        color: '#8B5CF6' },
  { key: 'restingHeartRate', label: 'Resting HR',   icon: 'heart',       unit: 'bpm',       color: '#F43F5E' },
  { key: 'sleepHours',       label: 'Sleep',        icon: 'moon',        unit: 'hrs',       color: '#818CF8', goalKey: 'sleepGoal' },
  { key: 'vo2Max',           label: 'VO₂ Max',      icon: 'speedometer', unit: 'ml/kg/min', color: '#F59E0B' },
  { key: 'waterLitres',      label: 'Water Intake', icon: 'water',       unit: 'L',         color: '#06B6D4', goalKey: 'waterGoal' },
];

const hasValue = (v) => v !== null && v !== undefined;

export default function MyHealthScreen() {
  const tabSpace = useTabBarSpace(); // room for the floating tab bar

  const recovery = health.recovery;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AuthBackground colors={BG_GRADIENT} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + tabSpace }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>

          <Text style={styles.title}>Your Health</Text>
          <Text style={styles.subtitle}>Recovery, heart, sleep and hydration at a glance.</Text>
        </View>

        {/* Recovery */}
        <GlassCard style={styles.card} gradient={CARD_GRADIENT}>
          <View style={styles.recoveryRow}>
            <View style={styles.recoveryInfo}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: RECOVERY_COLOR + 'CC' }]}>
                  <Ionicons name="battery-charging" size={18} color={WHITE} />
                </View>
                <Text style={styles.cardTitle}>Recovery</Text>
              </View>
              <Text style={styles.recoveryCaption}>
                {hasValue(recovery)
                  ? recovery >= 67 ? 'Ready to train hard' : recovery >= 34 ? 'Train moderately' : 'Prioritise rest'
                  : 'No data yet'}
              </Text>
            </View>

            <ProgressRing
              progress={hasValue(recovery) ? recovery / 100 : 0}
              color={RECOVERY_COLOR}
              size={96}
              stroke={9}
              label={hasValue(recovery) ? `${recovery}%` : '—'}
            />
          </View>
        </GlassCard>

        {/* Metric tiles */}
        <View style={styles.grid}>
          {METRICS.map((m) => {
            const value = health[m.key];
            const goal = m.goalKey ? health[m.goalKey] : null;

            return (
              <GlassCard key={m.key} style={styles.tile} gradient={CARD_GRADIENT}>
                <View style={[styles.iconCircle, { backgroundColor: m.color + 'CC' }]}>
                  <Ionicons name={m.icon} size={18} color={WHITE} />
                </View>

                <Text style={styles.tileLabel}>{m.label}</Text>

                <View style={styles.valueRow}>
                  <Text style={styles.tileValue}>{hasValue(value) ? value : '—'}</Text>
                  <Text style={styles.tileUnit}>{m.unit}</Text>
                </View>

                <Text style={styles.tileCaption}>
                  {hasValue(value) ? (goal ? `Goal ${goal} ${m.unit}` : 'Latest reading') : 'No data yet'}
                </Text>
              </GlassCard>
            );
          })}
        </View>

        <Text style={styles.footnote}>
          Health data will appear here once a data source is connected.
        </Text>
      </ScrollView>
    </View>
  );
}

// ─── Palette — matches Home ──────────────────────────────────────────────────
const BG_GRADIENT = APP_BG_GRADIENT; // shared — components/ScreenBackground.js
const CARD_GRADIENT = ['rgba(139,92,246,0.20)', 'rgba(37,99,235,0.06)', 'rgba(37,99,235,0)']; // purple → blue → clear
const TEXT = '#FFFFFF';
const WHITE = '#FFFFFF';
const MUTED = '#9A9A9E';
const RECOVERY_COLOR = '#16A34A'; // green

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingTop: 64,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  eyebrow: {
    color: MUTED,
    fontSize: 11,
    ...font('700'),
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: TEXT,
    fontSize: 28,
    ...font('800'),
    letterSpacing: -0.5,
  },
  subtitle: {
    color: MUTED,
    fontSize: 14,
    ...font('400'),
    marginTop: 4,
  },

  // Recovery card
  card: {
    padding: 16,
    marginBottom: 14,
  },
  recoveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  recoveryInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cardTitle: {
    color: TEXT,
    fontSize: 18,
    ...font('700'),
  },
  recoveryCaption: {
    color: MUTED,
    fontSize: 14,
    ...font('500'),
  },

  // Tiles
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    padding: 14,
    marginBottom: 14,
    gap: 6,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    color: MUTED,
    fontSize: 13,
    ...font('600'),
    marginTop: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  tileValue: {
    color: TEXT,
    fontSize: 26,
    ...font('800'),
    letterSpacing: -0.5,
  },
  tileUnit: {
    color: MUTED,
    fontSize: 12,
    ...font('600'),
    flexShrink: 1,
  },
  tileCaption: {
    color: MUTED,
    fontSize: 12,
    ...font('400'),
  },

  footnote: {
    color: MUTED,
    fontSize: 12,
    ...font('400'),
    textAlign: 'center',
    marginTop: 6,
  },
});
