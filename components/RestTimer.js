import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Rest timer for Workout Mode (red) — counts down after a set is completed.
// Call ref.start(seconds) to begin and ref.stop() to cancel.
const RestTimer = forwardRef(({
  onTimerComplete,
}, ref) => {

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useImperativeHandle(ref, () => ({
    start: (customDuration) => {
      clearInterval(intervalRef.current);
      setSecondsLeft(customDuration || 180);
      setIsRunning(false);
      // restart the interval even if a rest was already running
      setTimeout(() => setIsRunning(true), 0);
    },
    stop: () => {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      setSecondsLeft(0);
    },
  }));

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => Math.max(prev - 1, 0));
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Finished — handled here (not inside the setSecondsLeft updater) so the
  // parent's state isn't updated while this component is rendering
  useEffect(() => {
    if (isRunning && secondsLeft === 0) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      onTimerComplete?.();
    }
  }, [isRunning, secondsLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={styles.row}>
      <Ionicons name="hourglass-outline" size={14} color={RED} />
      <Text style={styles.label}>Rest</Text>
      <Text style={styles.time}>{formatTime(secondsLeft)}</Text>
    </View>
  );
});

export default RestTimer;

const RED = '#EF4444';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: RED,
    fontSize: 13,
    fontWeight: '700',
  },
  time: {
    color: RED,
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
