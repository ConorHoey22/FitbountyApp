import React, { useState, useCallback } from 'react';
import ScreenBackground from '../components/ScreenBackground';
import { View, Text, StyleSheet, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../lib/supabase';
import { getProfile } from '../lib/GetProfile';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { font } from '../utils/fonts';

// My PRs — every exercise the user has a record for.
// - Best: overall PR from `personal_records`
// - Set 1, Set 2…: best ever for each set, worked out from `exercise_logs`
//   (same rule as Workout Mode — heavier wins, then more reps at the same weight)

const beatsPR = (a, b) =>
  !b || a.weight > b.weight || (a.weight === b.weight && a.reps > b.reps);

export default function PRScreen() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('kg');
  const [records, setRecords] = useState([]); // [{ name, best, sets: [{ setNumber, weight, reps }] }]

  const loadPRs = async () => {
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const userId = session.user.id;

      const [profile, prResult, logResult] = await Promise.all([
        getProfile().catch(() => null),
        supabase.from('personal_records').select('exercise_name, weight, reps').eq('user_id', userId),
        supabase.from('exercise_logs').select('exercise_name, sets, weight, reps').eq('user_id', userId),
      ]);
      if (prResult.error) throw prResult.error;
      if (logResult.error) throw logResult.error;

      setUnit(profile?.unitMeasurement || 'kg');

      const byExercise = {};
      const entryFor = (name) => {
        if (!byExercise[name]) byExercise[name] = { name, best: null, sets: {} };
        return byExercise[name];
      };

      (prResult.data ?? []).forEach((pr) => {
        entryFor(pr.exercise_name).best = { weight: Number(pr.weight) || 0, reps: Number(pr.reps) || 0 };
      });

      (logResult.data ?? []).forEach((log) => {
        const entry = entryFor(log.exercise_name);
        const set = { weight: Number(log.weight) || 0, reps: Number(log.reps) || 0 };
        if (beatsPR(set, entry.sets[log.sets])) entry.sets[log.sets] = set;
        if (beatsPR(set, entry.best)) entry.best = set; // in case personal_records is missing one
      });

      setRecords(
        Object.values(byExercise)
          .map((e) => ({
            ...e,
            sets: Object.entries(e.sets)
              .map(([setNumber, s]) => ({ setNumber: Number(setNumber), ...s }))
              .sort((a, b) => a.setNumber - b.setNumber),
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (err) {
      console.error('PR load error:', err.message);
      setError('Failed to load your PRs.');
    } finally {
      setLoading(false);
    }
  };

  // Reload each time the screen opens (a workout may have just been saved)
  useFocusEffect(useCallback(() => { loadPRs(); }, []));

  const formatSet = (s) => `${s.weight}${unit} × ${s.reps}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenBackground />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <GlassButton style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={WHITE} />
          </GlassButton>
          <Text style={styles.title}>My PRs</Text>
        </View>

        {loading && <ActivityIndicator size="large" color={WHITE} style={{ marginTop: 40 }} />}

        {!loading && error && <Text style={styles.emptyText}>{error}</Text>}

        {!loading && !error && records.length === 0 && (
          <Text style={styles.emptyText}>No PRs yet — finish a workout to set your first one.</Text>
        )}

        {!loading && !error && records.map((r) => (
          <GlassCard key={r.name} style={styles.card} gradient={CARD_GRADIENT}>
            {/* Exercise + overall best */}
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="trophy" size={18} color={WHITE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName}>{r.name}</Text>
                <Text style={styles.bestLabel}>BEST</Text>
              </View>
              {r.best && <Text style={styles.bestValue}>{formatSet(r.best)}</Text>}
            </View>

            {/* Best for each set */}
            {r.sets.length > 0 && (
              <View style={styles.setList}>
                {r.sets.map((s) => (
                  <View key={s.setNumber} style={styles.setRow}>
                    <Text style={styles.setLabel}>Set {s.setNumber}</Text>
                    <Text style={styles.setValue}>{formatSet(s)}</Text>
                  </View>
                ))}
              </View>
            )}
          </GlassCard>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Palette — matches Home ──────────────────────────────────────────────────
const CARD_GRADIENT = ['rgba(139,92,246,0.20)', 'rgba(37,99,235,0.06)', 'rgba(37,99,235,0)']; // purple → blue → clear
const WHITE = '#FFFFFF';
const PR_COLOR = '#F59E0B'; // amber — same as Workout Mode's PR colour
const ROW_BG = 'rgba(255,255,255,0.06)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: WHITE,
    fontSize: 28,
    ...font('800'),
    letterSpacing: -0.5,
  },

  emptyText: {
    color: WHITE,
    fontSize: 15,
    ...font('400'),
    textAlign: 'center',
    marginTop: 40,
  },

  // Exercise card
  card: {
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PR_COLOR + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseName: {
    color: WHITE,
    fontSize: 16,
    ...font('700'),
  },
  bestLabel: {
    color: WHITE,
    fontSize: 10,
    ...font('700'),
    letterSpacing: 1,
    marginTop: 2,
  },
  bestValue: {
    color: WHITE,
    fontSize: 18,
    ...font('800'),
    letterSpacing: -0.3,
  },

  // Per-set rows
  setList: {
    marginTop: 12,
    gap: 6,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: ROW_BG,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  setLabel: {
    color: WHITE,
    fontSize: 13,
    ...font('600'),
  },
  setValue: {
    color: WHITE,
    fontSize: 14,
    ...font('700'),
  },
});
