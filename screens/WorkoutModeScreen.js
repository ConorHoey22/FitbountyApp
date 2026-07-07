import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import Timer from '../components/Timer';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import RestTimer from '../components/RestTimer';

export default function WorkoutModeScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { workoutName, exercises: rawExercises = [] } = route.params ?? {};

  const workouts = rawExercises.map((ex, i) => ({
    id: ex.id ?? i,
    name: ex.exercise_name ?? 'Unknown',
    sets: parseInt(ex.sets) || 3,
    reps: ex.reps ?? '-',
    pr: null,
    restTimer: ex.rest_timer ?? 120,
  }));

  const totalSets = workouts.reduce((acc, w) => acc + w.sets, 0);

  const restTimerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileUnitMeasurement, setProfileUnitMeasurement] = useState('kg');
  const [completedSets, setCompletedSets] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [currentSetIndex, setCurrentSetIndex] = useState(null);
  const [enteredWeight, setEnteredWeight] = useState({});
  const [enteredReps, setEnteredReps] = useState({});
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [newPRs, setNewPRs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [defaultXPRewardAmount, setDefaultXPRewardAmount] = useState();

  // Count total completed sets for progress
  const totalCompleted = Object.values(completedSets).reduce((acc, sets) => {
    return acc + Object.values(sets).filter(Boolean).length;
  }, 0);
  const progressPct = totalSets > 0 ? Math.round((totalCompleted / totalSets) * 100) : 0;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          return;
        }
        const { getProfile } = await import('../lib/GetProfile');
        const profileData = await getProfile(session.user.id);
        setProfile(profileData);
        setProfileUnitMeasurement(profileData.unitMeasurement ?? 'kg');
      } catch (err) {
        console.error('WorkoutModeScreen load error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleSetCompletion = (workout, setIndex) => {
    setCurrentWorkout(workout);
    setCurrentSetIndex(setIndex);
    const alreadyCompleted = completedSets[workout.id]?.[setIndex];
    setCompletedSets(prev => ({
      ...prev,
      [workout.id]: { ...prev[workout.id], [setIndex]: !alreadyCompleted },
    }));
    if (!alreadyCompleted) {
      setShowRestTimer(false);
      setTimeout(() => {
        setShowRestTimer(true);
        restTimerRef.current?.start(workout.restTimer);
      }, 50);
    } else {
      setShowRestTimer(false);
    }
  };

  const toggleWorkoutComplete = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const userId = session.user.id;

      const completedEntries = [];
      workouts.forEach((workout) => {
        const setsForWorkout = completedSets[workout.id] ?? {};
        Object.entries(setsForWorkout).forEach(([setIndex, isDone]) => {
          if (!isDone) return;
          const key = `${workout.id}-${setIndex}`;
          completedEntries.push({
            workout, setIndex: parseInt(setIndex),
            weight: parseFloat(enteredWeight[key]) || 0,
            reps: parseFloat(enteredReps[key]) || 0,
          });
        });
      });

      const bestPerExercise = {};
      completedEntries.forEach(({ workout, weight, reps }) => {
        const prev = bestPerExercise[workout.name];
        const score = weight * reps;
        if (!prev || score > prev.score) {
          bestPerExercise[workout.name] = { workout, weight, reps, score };
        }
      });

      const exerciseNames = Object.keys(bestPerExercise);
      const { data: existingPRs, error: prFetchError } = await supabase
        .from('personal_records')
        .select('exercise_name, weight, reps')
        .eq('user_id', userId)
        .in('exercise_name', exerciseNames);
      if (prFetchError) throw prFetchError;

      const prMap = {};
      (existingPRs ?? []).forEach((pr) => { prMap[pr.exercise_name] = pr; });

      const detectedNewPRs = [];
      for (const [name, best] of Object.entries(bestPerExercise)) {
        const existing = prMap[name];
        const isNewPR = !existing ||
          (best.weight > existing.weight && best.reps >= existing.reps) ||
          (best.reps > existing.reps && best.weight >= existing.weight);
        if (isNewPR) detectedNewPRs.push({ exercise_name: name, weight: best.weight, reps: best.reps });
      }

      const summary = workouts.map((workout) => {
        const setsData = Object.entries(completedSets[workout.id] ?? {})
          .filter(([, done]) => done)
          .map(([setIndex]) => {
            const key = `${workout.id}-${setIndex}`;
            return { setNumber: parseInt(setIndex) + 1, weight: parseFloat(enteredWeight[key]) || 0, reps: parseFloat(enteredReps[key]) || 0 };
          });
        const isNewPR = detectedNewPRs.some((p) => p.exercise_name === workout.name);
        return { workout, setsData, isNewPR };
      });

      setSummaryData(summary);
      setNewPRs(detectedNewPRs);
      setShowSummaryModal(true);
    } catch (err) {
      console.error('toggleWorkoutComplete error:', err.message);
    }
  };

  const submitWorkout = async () => {
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const userId = session.user.id;

      const logRows = [];
      workouts.forEach((workout) => {
        const setsForWorkout = completedSets[workout.id] ?? {};
        Object.entries(setsForWorkout).forEach(([setIndex, isDone]) => {
          if (!isDone) return;
          const key = `${workout.id}-${setIndex}`;
          logRows.push({
            user_id: userId, exercise_name: workout.name,
            sets: parseInt(setIndex) + 1,
            reps: parseFloat(enteredReps[key]) || 0,
            weight: parseFloat(enteredWeight[key]) || 0,
          });
        });
      });

      if (logRows.length > 0) {
        const { error: logError } = await supabase.from('exercise_logs').insert(logRows);
        if (logError) throw logError;
      }

      for (const pr of newPRs) {
        const matchedWorkout = workouts.find(w => w.name === pr.exercise_name);
        const { error: prError } = await supabase.from('personal_records').upsert(
          { user_id: userId, exerciseID: matchedWorkout?.id, exercise_name: pr.exercise_name, weight: pr.weight, reps: pr.reps },
          { onConflict: 'user_id, exercise_name' }
        );
        if (prError) throw prError;
      }

      setShowSummaryModal(false);


      // Reward functionality & Update Users Stats/Records 

      setDefaultXPRewardAmount(100);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      console.error('submitWorkout error:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      {/* ── Top bar: timer + rest timer ── */}
      <View style={styles.topBar}>
        <View style={styles.timerPill}>
          <Ionicons name="time-outline" size={14} color={ACCENT} />
          <Timer />
        </View>

        {showRestTimer && (
          <View style={styles.restPill}>
            <RestTimer
              ref={restTimerRef}
              workoutId={currentWorkout?.id}
              setIndex={currentSetIndex}
              weightLifted={enteredWeight}
              currentPR={currentWorkout?.pr}
              onTimerComplete={() => setShowRestTimer(false)}
            />
          </View>
        )}
      </View>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconRing}>
            <Ionicons name="barbell-outline" size={20} color={ACCENT} />
          </View>
          <View>
            <Text style={styles.headerTitle}>{workoutName ?? 'Workout'}</Text>
            <Text style={styles.headerSubtitle}>
              {workouts.length} exercise{workouts.length !== 1 ? 's' : ''} · {totalSets} sets
            </Text>
          </View>
        </View>
      </View>

      {/* ── Progress bar ── */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPct}>{progressPct}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
      </View>

      {/* ── Exercise list ── */}
      <ScrollView
        style={styles.workoutList}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {workouts.length === 0 && (
          <Text style={styles.emptyText}>No exercises found for this workout.</Text>
        )}

        {workouts.map((workout) => (
          <View key={workout.id} style={styles.workoutCard}>

            {/* Exercise header */}
            <View style={styles.exerciseHeader}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <View style={styles.repsBadge}>
                <Text style={styles.repsBadgeText}>{workout.sets} Sets : {workout.reps} Reps</Text>
              </View>
            </View>

            {workout.pr != null && (
              <View style={styles.prRow}>
                <Ionicons name="trophy-outline" size={13} color="#FFA940" />
                <Text style={styles.prText}>PR — {workout.pr} {profileUnitMeasurement}</Text>
              </View>
            )}

            {/* Set rows */}
            <View style={styles.setHeaderRow}>
     
              <Text style={styles.setHeaderCell}>REPS</Text>
              <Text style={styles.setHeaderCell}>WEIGHT</Text>
              <Text style={[styles.setHeaderCell, { textAlign: 'right' }]}>DONE</Text>
            </View>

            {Array.from({ length: workout.sets }).map((_, index) => {
              const done = completedSets[workout.id]?.[index];
              return (
                <View
                  key={index}
                  style={[styles.setRow, done && styles.setRowCompleted]}
                >
                  <Text style={[styles.setLabel, done && styles.setLabelDone]}>{index + 1}</Text>

                  <View style={[
                    styles.inputWrap,
                    focusedInput === `${workout.id}-${index}-reps` && styles.inputWrapFocused,
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Reps"
                      placeholderTextColor="#4a4a5a"
                      keyboardType="numeric"
                      onFocus={() => setFocusedInput(`${workout.id}-${index}-reps`)}
                      onBlur={() => setFocusedInput(null)}
                      onChangeText={(val) =>
                        setEnteredReps(prev => ({ ...prev, [`${workout.id}-${index}`]: val }))
                      }
                    />
                  </View>

                  <View style={[
                    styles.inputWrap,
                    focusedInput === `${workout.id}-${index}-weight` && styles.inputWrapFocused,
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder={profileUnitMeasurement}
                      placeholderTextColor="#4a4a5a"
                      keyboardType="numeric"
                      onFocus={() => setFocusedInput(`${workout.id}-${index}-weight`)}
                      onBlur={() => setFocusedInput(null)}
                      onChangeText={(val) =>
                        setEnteredWeight(prev => ({ ...prev, [`${workout.id}-${index}`]: val }))
                      }
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.checkBtn}
                    onPress={() => toggleSetCompletion(workout, index)}
                  >
                    <Ionicons
                      name={done ? 'checkmark-circle' : 'checkmark-circle-outline'}
                      size={28}
                      color={done ? ACCENT : '#42425A'}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* ── Finish button ── */}
      <View style={styles.finishWrapper}>
        <TouchableOpacity style={styles.finishButton} onPress={toggleWorkoutComplete} activeOpacity={0.85}>
          <Ionicons name="checkmark-done-outline" size={20} color="#0E0E12" />
          <Text style={styles.finishButtonText}>FINISH WORKOUT</Text>
        </TouchableOpacity>
      </View>

      {/* ── Summary Modal ── */}
      <Modal
        visible={showSummaryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSummaryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            {/* Modal header */}
            <View style={styles.modalHeader}>
              <View>
                <View style={styles.modalBadge}>
                  <Text style={styles.modalBadgeText}>WORKOUT COMPLETE</Text>
                </View>
                <Text style={styles.modalTitle}>Great work!</Text>
                <Text style={styles.modalSubtitle}>{workoutName}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSummaryModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#A0A0BC" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>

              {newPRs.length > 0 && (
                <View style={styles.prBanner}>
                  <Ionicons name="trophy-outline" size={18} color="#FFA940" />
                  <Text style={styles.prBannerText}>
                    {newPRs.length} New PR{newPRs.length > 1 ? 's' : ''} set!
                  </Text>
                </View>
              )}

              {summaryData.map(({ workout, setsData, isNewPR }) => (
                <View key={workout.id} style={styles.summaryCard}>
                  <View style={styles.summaryCardHeader}>
                    <Text style={styles.summaryExerciseName}>{workout.name}</Text>
                    {isNewPR && (
                      <View style={styles.prBadge}>
                        <Ionicons name="trophy-outline" size={11} color="#FFA940" />
                        <Text style={styles.prBadgeText}>New PR</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.summarySetHeaderRow}>
                    <Text style={styles.summarySetHeaderText}>SET</Text>
                    <Text style={styles.summarySetHeaderText}>REPS</Text>
                    <Text style={styles.summarySetHeaderText}>WEIGHT</Text>
                  </View>

                  {setsData.length === 0 ? (
                    <Text style={styles.skippedText}>No sets completed</Text>
                  ) : (
                    setsData.map((s) => (
                      <View key={s.setNumber} style={styles.summarySetRow}>
                        <Text style={styles.summarySetCell}>{s.setNumber}</Text>
                        <Text style={styles.summarySetCell}>{s.reps}</Text>
                        <Text style={styles.summarySetCell}>{s.weight} {profileUnitMeasurement}</Text>
                      </View>
                    ))
                  )}
                </View>
              ))}

            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalSubmitButton, isSaving && { opacity: 0.6 }]}
                onPress={submitWorkout}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator color="#0E0E12" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done-outline" size={18} color="#0E0E12" />
                    <Text style={styles.modalSubmitText}>SAVE & FINISH</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const ACCENT   = '#C6F135';
const BG       = '#0E0E12';
const CARD     = '#22222E';
const SURFACE2 = '#2C2C3C';
const BORDER   = '#42425A';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },

  blobTopRight:   { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: ACCENT, opacity: 0.05, top: -80, right: -80 },
  blobBottomLeft: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: '#5B4FE8', opacity: 0.06, bottom: 60, left: -80 },

  // Top bar
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 60, paddingBottom: 12, gap: 10 },
  timerPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  restPill:  { flex: 1, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },

  // Header
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, marginBottom: 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconRing:   { width: 44, height: 44, borderRadius: 13, borderWidth: 1.5, borderColor: ACCENT + '55', backgroundColor: ACCENT + '14', justifyContent: 'center', alignItems: 'center' },
  headerTitle:    { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: '#A0A0BC', marginTop: 2 },

  // Progress
  progressSection:  { paddingHorizontal: 18, marginBottom: 16 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel:    { fontSize: 11, fontWeight: '700', color: '#A0A0BC', letterSpacing: 1 },
  progressPct:      { fontSize: 11, fontWeight: '700', color: ACCENT },
  progressTrack:    { height: 4, backgroundColor: SURFACE2, borderRadius: 2, overflow: 'hidden' },
  progressFill:     { height: '100%', backgroundColor: ACCENT, borderRadius: 2 },

  // List
  workoutList: { flex: 1 },
  emptyText:   { color: '#A0A0BC', textAlign: 'center', marginTop: 40, fontSize: 15 },

  // Exercise card
  workoutCard:    { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 14 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  workoutName:    { fontSize: 16, fontWeight: '800', color: '#FFFFFF', flex: 1 },
  repsBadge:      { backgroundColor: SURFACE2, borderWidth: 1, borderColor: BORDER, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  repsBadgeText:  { color: '#DDDDF0', fontSize: 12, fontWeight: '700' },
  prRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  prText: { color: '#FFA940', fontSize: 12, fontWeight: '600' },

  // Set header row
  setHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 35, marginBottom: 6 },
  setHeaderCell: { flex: 1, fontSize: 9, fontWeight: '700', color: '#4a4a5a', letterSpacing: 1, textAlign: 'center' , paddingHorizontal:50},

  // Set rows
  setRow:          { flexDirection: 'row', alignItems: 'center', backgroundColor: SURFACE2, borderRadius: 11, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 7, borderWidth: 1, borderColor: BORDER, gap: 8 },
  setRowCompleted: { backgroundColor: ACCENT + '14', borderColor: ACCENT + '55' },
  setLabel:        { fontSize: 14, fontWeight: '800', color: '#A0A0BC', width: 20, textAlign: 'center' },
  setLabelDone:    { color: ACCENT },
  inputWrap:        { flex: 1, backgroundColor: BG, borderRadius: 8, borderWidth: 1.5, borderColor: BORDER },
  inputWrapFocused: { borderColor: ACCENT },
  input:            { paddingHorizontal: 8, paddingVertical: 8, fontSize: 14, color: '#FFFFFF', textAlign: 'center', fontWeight: '600' },
  checkBtn: { padding: 2 },

  // Finish
  finishWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18, backgroundColor: BG, borderTopWidth: 1, borderTopColor: BORDER },
  finishButton:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT, paddingVertical: 16, borderRadius: 14, gap: 8, shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 },
  finishButtonText: { color: '#0E0E12', fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },

  // Modal
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#18181F', borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: '92%', borderWidth: 1, borderColor: BORDER },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 22, borderBottomWidth: 1, borderBottomColor: BORDER },
  modalBadge:     { alignSelf: 'flex-start', backgroundColor: ACCENT + '22', borderWidth: 1, borderColor: ACCENT + '55', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 8 },
  modalBadgeText: { color: ACCENT, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  modalTitle:     { fontSize: 24, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 3 },
  modalSubtitle:  { fontSize: 14, color: '#A0A0BC' },
  closeBtn:       { width: 32, height: 32, borderRadius: 16, backgroundColor: SURFACE2, borderWidth: 1, borderColor: BORDER, justifyContent: 'center', alignItems: 'center' },

  modalScroll: { padding: 18, maxHeight: 480 },

  prBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFA94018', borderWidth: 1, borderColor: '#FFA94044', padding: 12, borderRadius: 12, marginBottom: 16 },
  prBannerText: { color: '#FFA940', fontWeight: '700', fontSize: 14 },

  summaryCard:       { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 12 },
  summaryCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryExerciseName: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  prBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFA94018', borderWidth: 1, borderColor: '#FFA94044', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  prBadgeText: { color: '#FFA940', fontSize: 11, fontWeight: '700' },

  summarySetHeaderRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, paddingHorizontal: 4 },
  summarySetHeaderText: { flex: 1, textAlign: 'center', fontSize: 9, fontWeight: '700', color: '#4a4a5a', letterSpacing: 1 },
  summarySetRow:  { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: SURFACE2, borderRadius: 9, paddingVertical: 9, paddingHorizontal: 4, marginBottom: 5 },
  summarySetCell: { flex: 1, textAlign: 'center', color: '#DDDDF0', fontSize: 14, fontWeight: '600' },
  skippedText:    { color: '#4a4a5a', fontSize: 13, textAlign: 'center', paddingVertical: 6 },

  modalFooter:        { padding: 18, borderTopWidth: 1, borderTopColor: BORDER },
  modalSubmitButton:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT, paddingVertical: 16, borderRadius: 14, gap: 8, shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  modalSubmitText:    { color: '#0E0E12', fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },
});