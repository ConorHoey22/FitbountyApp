import React, { useRef, useEffect, useState } from 'react';
import ScreenBackground from '../components/ScreenBackground';
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
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import RestTimer from '../components/RestTimer';
import Timer from '../components/Timer';
import useTabBarSpace from '../utils/useTabBarSpace';
import { M, modalStyles as ms } from '../components/modalTheme';
import { font } from '../utils/fonts';
import { getActivityDay, saveActivityDay } from '../utils/activityHistory';
import { getActiveWorkout, saveActiveWorkout, clearActiveWorkout } from '../utils/activeWorkout';
import GlassCard from '../components/GlassCard';
import GlassButton, { GLASS_BUTTON_TEXT } from '../components/GlassButton';

const PR_COLOR = '#F59E0B'; // amber — new personal record
const NOTES_MAX_LENGTH = 100;
const NOTES_MAX_LINES = 3;
const NOTES_STORAGE_KEY = 'exerciseNotes'; // AsyncStorage: { [exercise id]: note } — kept on this device

// Does set `a` beat PR `b`? Heavier weight always wins (101kg × 1 beats 100kg × 5);
// at the same weight, more reps wins (100kg × 6 beats 100kg × 5).
const beatsPR = (a, b) =>
  !b || a.weight > b.weight || (a.weight === b.weight && a.reps > b.reps);

export default function WorkoutModeScreen() {
  const tabSpace = useTabBarSpace(); // room for the floating tab bar

  const navigation = useNavigation();
  const route = useRoute();

  const { workoutName, exercises: rawExercises = [] } = route.params ?? {};

  const workouts = rawExercises.map((ex, i) => ({
    id: ex.id ?? i,
    name: ex.exercise_name ?? 'Unknown',
    sets: parseInt(ex.sets) || 3,
    reps: ex.reps ?? '-',
    pr: null,
    restTimer: ex.rest_timer ?? 20,
  }));

  const totalSets = workouts.reduce((acc, w) => acc + w.sets, 0);

  const restTimerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileUnitMeasurement, setProfileUnitMeasurement] = useState('kg');
  const [setPRs, setSetPRs] = useState({}); // exercise_name → { setNumber → { weight, reps } } — best ever for each set, shown as input placeholders
  const [newSetPRs, setNewSetPRs] = useState([]); // sets in this workout that beat that set's PR
  const [completedSets, setCompletedSets] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);
  const [startedAt, setStartedAt] = useState(null); // workout timer start (ms) — set by Start or the first completed set
  const [sessionReady, setSessionReady] = useState(false); // saved session checked — don't save over it before then
  const sessionNameRef = useRef(null); // which workout the entered data belongs to
  const [isResting, setIsResting] = useState(false); // rest timer replaces the workout timer while counting down
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [currentSetIndex, setCurrentSetIndex] = useState(null);
  const [enteredWeight, setEnteredWeight] = useState({});
  const [enteredReps, setEnteredReps] = useState({});
  const [notes, setNotes] = useState({}); // workout.id → note text (max NOTES_MAX_LENGTH)
  const savedNotesRef = useRef({}); // every exercise's saved note (AsyncStorage copy)
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

  // Restore the workout in progress (if it's this workout); a different workout starts fresh
  useEffect(() => {
    let cancelled = false;
    setSessionReady(false);
    sessionNameRef.current = null;
    getActiveWorkout()
      .then((session) => {
        if (cancelled) return;
        const resume = session?.workoutName === workoutName ? session : null;
        setCompletedSets(resume?.completedSets ?? {});
        setEnteredWeight(resume?.enteredWeight ?? {});
        setEnteredReps(resume?.enteredReps ?? {});
        setStartedAt(resume?.startedAt ?? null);
        setIsResting(false);
        restTimerRef.current?.stop();
        sessionNameRef.current = workoutName;
      })
      .catch((err) => console.error('Active workout load error:', err.message))
      .finally(() => { if (!cancelled) setSessionReady(true); });
    return () => { cancelled = true; };
  }, [workoutName]);

  // Exit — discard the workout in progress (e.g. the wrong workout was started)
  const handleExit = () => {
    Alert.alert(
      'Exit workout?',
      'Everything entered for this workout will be discarded.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearActiveWorkout();
            } catch (err) {
              console.error('Active workout clear error:', err.message);
            }
            restTimerRef.current?.stop();
            setIsResting(false);
            setCompletedSets({});
            setEnteredWeight({});
            setEnteredReps({});
            setStartedAt(null);
            navigation.navigate('Workouts');
          },
        },
      ]
    );
  };

  // Save the workout in progress whenever something is entered
  useEffect(() => {
    if (!sessionReady || !workoutName || sessionNameRef.current !== workoutName) return;
    const hasData = startedAt || Object.keys(completedSets).length ||
      Object.keys(enteredWeight).length || Object.keys(enteredReps).length;
    if (!hasData) return;
    saveActiveWorkout({ workoutName, exercises: rawExercises, completedSets, enteredWeight, enteredReps, startedAt })
      .catch((err) => console.error('Active workout save error:', err.message));
  }, [sessionReady, completedSets, enteredWeight, enteredReps, startedAt]);

  // Notes saved last time for these exercises
  useEffect(() => {
    AsyncStorage.getItem(NOTES_STORAGE_KEY)
      .then((json) => {
        const saved = json ? JSON.parse(json) : {};
        savedNotesRef.current = saved;
        const forThisWorkout = {};
        workouts.forEach((w) => {
          if (saved[w.id]) forThisWorkout[w.id] = saved[w.id];
        });
        setNotes(forThisWorkout);
      })
      .catch((err) => console.error('Notes load error:', err.message));
  }, [workoutName]); // reload when a different workout is opened

  // Max NOTES_MAX_LINES lines; saved straight away so it's there next time
  const updateNote = async (exerciseId, text) => {
    const note = text.split('\n').slice(0, NOTES_MAX_LINES).join('\n');
    setNotes(prev => ({ ...prev, [exerciseId]: note }));
    try {
      // Update the in-memory copy, then write it — avoids lost keystrokes from overlapping reads
      const saved = savedNotesRef.current;
      if (note.trim()) saved[exerciseId] = note;
      else delete saved[exerciseId];
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(saved));
    } catch (err) {
      console.error('Notes save error:', err.message);
    }
  };

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

        // PR for each set — the best ever logged (exercise_logs) for that exercise + set number
        const names = workouts.map((w) => w.name);
        if (names.length) {
          const { data: logs, error: logsError } = await supabase
            .from('exercise_logs')
            .select('exercise_name, sets, weight, reps')
            .eq('user_id', session.user.id)
            .in('exercise_name', names);
          if (logsError) throw logsError;
          const prMap = {};
          (logs ?? []).forEach((log) => {
            const entry = { weight: Number(log.weight) || 0, reps: Number(log.reps) || 0 };
            if (!prMap[log.exercise_name]) prMap[log.exercise_name] = {};
            const bySet = prMap[log.exercise_name];
            if (beatsPR(entry, bySet[log.sets])) bySet[log.sets] = entry;
          });
          setSetPRs(prMap);
        }
      } catch (err) {
        console.error('WorkoutModeScreen load error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workoutName]); // reload when a different workout is opened

  const toggleSetCompletion = (workout, setIndex) => {
    setCurrentWorkout(workout);
    setCurrentSetIndex(setIndex);
    const alreadyCompleted = completedSets[workout.id]?.[setIndex];
    setCompletedSets(prev => ({
      ...prev,
      [workout.id]: { ...prev[workout.id], [setIndex]: !alreadyCompleted },
    }));
    if (!alreadyCompleted) {
      restTimerRef.current?.start(workout.restTimer);
      setIsResting(true);
      setStartedAt(prev => prev ?? Date.now());
    } else {
      restTimerRef.current?.stop();
      setIsResting(false);
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
        if (beatsPR({ weight, reps }, prev)) {
          bestPerExercise[workout.name] = { workout, weight, reps };
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
      (existingPRs ?? []).forEach((pr) => { prMap[pr.exercise_name] = { weight: Number(pr.weight) || 0, reps: Number(pr.reps) || 0 }; });

      // Overall best per exercise (personal_records)
      const detectedNewPRs = [];
      for (const [name, best] of Object.entries(bestPerExercise)) {
        const existing = prMap[name];
        const isNewPR = beatsPR(best, existing);
        if (isNewPR) detectedNewPRs.push({ exercise_name: name, weight: best.weight, reps: best.reps });
      }

      // Per set — each set compared with that set's own PR (e.g. Set 3 vs your best Set 3)
      const detectedSetPRs = completedEntries
        .filter(({ workout, setIndex, weight, reps }) =>
          beatsPR({ weight, reps }, setPRs[workout.name]?.[setIndex + 1]))
        .map(({ workout, setIndex }) => ({ exercise_name: workout.name, setNumber: setIndex + 1 }));

      const summary = workouts.map((workout) => {
        const setsData = Object.entries(completedSets[workout.id] ?? {})
          .filter(([, done]) => done)
          .map(([setIndex]) => {
            const key = `${workout.id}-${setIndex}`;
            return { setNumber: parseInt(setIndex) + 1, weight: parseFloat(enteredWeight[key]) || 0, reps: parseFloat(enteredReps[key]) || 0 };
          });
        const isNewPR = detectedSetPRs.some((p) => p.exercise_name === workout.name);
        return { workout, setsData, isNewPR };
      });

      setSummaryData(summary);
      setNewPRs(detectedNewPRs);
      setNewSetPRs(detectedSetPRs);
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

      // Count this workout towards today's (and so this week's) workout goal on Home
      const today = await getActivityDay(undefined, userId);
      await saveActivityDay({ ...today, workouts: today.workouts + 1 }, userId);

      await clearActiveWorkout(); // saved — nothing left in progress
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
      <ScreenBackground />

      {/* ── Header: workout timer · workout name · rest timer ── */}
      <View style={styles.topBar}>
        {/* Name is laid over the full row so it sits in the exact centre of the screen */}
        <View style={styles.titleWrap} pointerEvents="none">
          <Text style={styles.headerTitle} numberOfLines={1}>{workoutName ?? 'Workout'}</Text>
        </View>

        {/* Workout timer — hidden (but still running) while resting */}
        <View style={[styles.topSide, isResting && styles.hidden]}>
          <Timer startedAt={startedAt} onStart={() => setStartedAt(Date.now())} />
        </View>

        {/* Rest timer — only shown after a set is completed */}
        <View style={[styles.topSide, !isResting && styles.hidden]}>
          <View style={styles.timerPill}>
            <RestTimer ref={restTimerRef} onTimerComplete={() => setIsResting(false)} />
          </View>
        </View>

        {/* Exit — discards this workout */}
        <TouchableOpacity style={styles.exitPill} onPress={handleExit} activeOpacity={0.8}>
          <Ionicons name="close" size={14} color={EXIT_COLOR} />
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
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
        contentContainerStyle={{ paddingBottom: 40 + tabSpace, paddingHorizontal: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {workouts.length === 0 && (
          <Text style={styles.emptyText}>No exercises found for this workout.</Text>
        )}

        {workouts.map((workout) => (
          <GlassCard key={workout.id} style={styles.workoutCard} gradient={CARD_GRADIENT}>

            {/* Exercise header */}
            <View style={styles.exerciseHeader}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <View style={styles.repsBadge}>
                <Text style={styles.repsBadgeText}>{workout.sets} Sets : {workout.reps} Reps</Text>
              </View>
            </View>

            {workout.pr != null && (
              <View style={styles.prRow}>
                <Ionicons name="trophy-outline" size={13} color={PR_COLOR} />
                <Text style={styles.prText}>PR — {workout.pr} {profileUnitMeasurement}</Text>
              </View>
            )}

            {/* Notes */}
            <Text style={styles.notesLabel}>NOTES</Text>
            <View style={[
              styles.inputWrap,
              styles.notesWrap,
              focusedInput === `${workout.id}-notes` && styles.inputWrapFocused,
            ]}>
              <TextInput
                style={styles.notesInput}
                placeholder="Add a note"
                placeholderTextColor={MUTED}
                maxLength={NOTES_MAX_LENGTH}
                multiline
                numberOfLines={NOTES_MAX_LINES}
                value={notes[workout.id] ?? ''}
                onFocus={() => setFocusedInput(`${workout.id}-notes`)}
                onBlur={() => setFocusedInput(null)}
                onChangeText={(val) => updateNote(workout.id, val)}
              />
            </View>

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
                      placeholder={setPRs[workout.name]?.[index + 1] ? String(setPRs[workout.name][index + 1].reps) : 'Reps'}
                      placeholderTextColor={MUTED}
                      keyboardType="numeric"
                      value={enteredReps[`${workout.id}-${index}`] ?? ''}
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
                      placeholder={setPRs[workout.name]?.[index + 1] ? `${setPRs[workout.name][index + 1].weight}${profileUnitMeasurement}` : profileUnitMeasurement}
                      placeholderTextColor={MUTED}
                      keyboardType="numeric"
                      value={enteredWeight[`${workout.id}-${index}`] ?? ''}
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
                      color={done ? DONE_COLOR : MUTED}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </GlassCard>
        ))}

        {/* ── Finish button — end of the list ── */}
        <GlassButton style={styles.finishButton} onPress={toggleWorkoutComplete}>
          <Ionicons name="checkmark-done-outline" size={20} color={GLASS_BUTTON_TEXT} />
          <Text style={styles.finishButtonText}>FINISH WORKOUT</Text>
        </GlassButton>
      </ScrollView>

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
              <TouchableOpacity onPress={() => setShowSummaryModal(false)} style={styles.closeBtn} hitSlop={10}>
                <Ionicons name="close" size={20} color={M.INK} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>

              {newSetPRs.length > 0 && (
                <View style={styles.prBanner}>
                  <Ionicons name="trophy" size={18} color={PR_COLOR} />
                  <Text style={styles.prBannerText}>
                    {newSetPRs.length} New PR{newSetPRs.length > 1 ? 's' : ''} set!
                  </Text>
                </View>
              )}

              {summaryData.map(({ workout, setsData, isNewPR }) => (
                <View key={workout.id} style={styles.summaryCard}>
                  <View style={styles.summaryCardHeader}>
                    <Text style={styles.summaryExerciseName}>{workout.name}</Text>
                    {isNewPR && (
                      <View style={styles.prBadge}>
                        <Ionicons name="trophy" size={11} color={PR_COLOR} />
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
                  <ActivityIndicator color={M.WHITE} size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={18} color={M.WHITE} />
                    <Text style={styles.modalSubmitText}>Save & Finish</Text>
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

// ─── Palette — matches Home ──────────────────────────────────────────────────
const ACCENT   = '#F59E0B';                  // amber — Home's workout colour
const EXIT_COLOR = '#EF4444';                // red — discard workout
const DONE_COLOR = '#16A34A';                // green — set done (Home's goal reached)
const BG       = '#000000';                  // black page background
const CARD     = 'rgba(44,44,47,0.55)';      // translucent charcoal (glass fallback)
const SURFACE2 = 'rgba(255,255,255,0.06)';   // inner rows — translucent like Home
const BORDER   = 'rgba(255,255,255,0.12)';   // faint light edge
const WHITE    = '#FFFFFF';
const MUTED    = '#9A9A9E';                  // secondary text
const CARD_GRADIENT = ['rgba(139,92,246,0.20)', 'rgba(37,99,235,0.06)', 'rgba(37,99,235,0)']; // purple → blue → clear

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },

  // Top bar
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 60, paddingBottom: 16, gap: 10 },
  topSide:      { flexDirection: 'row' },
  hidden:       { display: 'none' },
  exitPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: CARD, borderWidth: 1, borderColor: EXIT_COLOR + '66', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  exitText: { color: EXIT_COLOR, fontSize: 14, fontWeight: '800' },
  timerPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  titleWrap:   { position: 'absolute', left: 0, right: 0, top: 60, bottom: 16, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { maxWidth: '36%', fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5, textAlign: 'center' },

  // Progress
  progressSection:  { paddingHorizontal: 18, marginBottom: 16 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel:    { fontSize: 11, fontWeight: '700', color: WHITE, letterSpacing: 1 },
  progressPct:      { fontSize: 11, fontWeight: '700', color: WHITE },
  progressTrack:    { height: 4, backgroundColor: SURFACE2, borderRadius: 2, overflow: 'hidden' },
  progressFill:     { height: '100%', backgroundColor: ACCENT, borderRadius: 2 },

  // List
  workoutList: { flex: 1 },
  emptyText:   { color: WHITE, textAlign: 'center', marginTop: 40, fontSize: 15 },

  // Exercise card
  workoutCard:    { padding: 16, marginBottom: 14 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  workoutName:    { fontSize: 16, fontWeight: '800', color: '#FFFFFF', flex: 1 },
  repsBadge:      { backgroundColor: SURFACE2, borderWidth: 1, borderColor: BORDER, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  repsBadgeText:  { color: WHITE, fontSize: 12, fontWeight: '700' },
  prRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  prText: { color: WHITE, fontSize: 12, fontWeight: '600' },

  // Notes
  notesLabel: { fontSize: 9, fontWeight: '700', color: WHITE, letterSpacing: 1, marginTop: 6, marginBottom: 6 },
  notesWrap:  { flex: 0, marginBottom: 12 },
  // 3 lines tall at most (lineHeight 20 × 3 + padding)
  notesInput: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10, fontSize: 14, lineHeight: 20, maxHeight: 20 * NOTES_MAX_LINES + 20, color: '#FFFFFF', fontWeight: '500', textAlignVertical: 'top' },

  // Set header row
  setHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 35, marginBottom: 6 },
  setHeaderCell: { flex: 1, fontSize: 9, fontWeight: '700', color: WHITE, letterSpacing: 1, textAlign: 'center' , paddingHorizontal:50},

  // Set rows
  setRow:          { flexDirection: 'row', alignItems: 'center', backgroundColor: SURFACE2, borderRadius: 11, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 7, borderWidth: 1, borderColor: BORDER, gap: 8 },
  setRowCompleted: { backgroundColor: DONE_COLOR + '1F', borderColor: DONE_COLOR + '66' },
  setLabel:        { fontSize: 14, fontWeight: '800', color: WHITE, width: 20, textAlign: 'center' },
  setLabelDone:    { color: WHITE },
  inputWrap:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 8, borderWidth: 1.5, borderColor: BORDER },
  inputWrapFocused: { borderColor: WHITE },
  input:            { paddingHorizontal: 8, paddingVertical: 8, fontSize: 14, color: '#FFFFFF', textAlign: 'center', fontWeight: '600' },
  checkBtn: { padding: 2 },

  // Finish
  finishButton:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8, marginTop: 6 },
  finishButtonText: { color: GLASS_BUTTON_TEXT, fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },

  // Modal — Add Food design (white bottom sheet), see components/modalTheme.js
  modalOverlay:   { ...ms.sheetOverlay },
  modalContainer: { backgroundColor: M.WHITE, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 22, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: M.SURFACE },
  modalBadge:     { ...ms.badge, marginBottom: 6 },
  modalBadgeText: { ...ms.badgeText },
  modalTitle:     { ...ms.title, marginBottom: 3 },
  modalSubtitle:  { fontSize: 14, color: M.MUTED, ...font('500') },
  closeBtn:       { ...ms.closeBtn },

  modalScroll: { padding: 18, maxHeight: 480 },

  prBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: PR_COLOR + '1A', padding: 12, borderRadius: 14, marginBottom: 16 },
  prBannerText: { color: '#B45309', ...font('700'), fontSize: 14 },

  summaryCard:       { backgroundColor: M.SURFACE, borderRadius: 14, padding: 14, marginBottom: 12 },
  summaryCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryExerciseName: { fontSize: 15, ...font('800'), color: M.INK },
  prBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: PR_COLOR + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  prBadgeText: { color: '#B45309', fontSize: 11, ...font('700') },

  summarySetHeaderRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, paddingHorizontal: 4 },
  summarySetHeaderText: { flex: 1, textAlign: 'center', fontSize: 9, ...font('700'), color: M.MUTED, letterSpacing: 1 },
  summarySetRow:  { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: M.WHITE, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 4, marginBottom: 5 },
  summarySetCell: { flex: 1, textAlign: 'center', color: M.INK, fontSize: 14, ...font('600') },
  skippedText:    { color: M.MUTED, fontSize: 13, textAlign: 'center', paddingVertical: 6, ...font('400') },

  modalFooter:        { padding: 18, borderTopWidth: 1, borderTopColor: M.SURFACE },
  modalSubmitButton:  { ...ms.saveButton },
  modalSubmitText:    { ...ms.saveButtonText },
});