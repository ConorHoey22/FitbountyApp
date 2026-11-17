import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Workout timer for Workout Mode — shows a Start button, which turns into
// the workout's elapsed time (counting up) once started.
// Controlled by the parent: `startedAt` (ms timestamp, or null) is when the
// workout began — time is worked out from it, so it stays right after leaving
// the screen. `onStart` is called when Start is pressed.
const Timer = ({ startedAt, onStart }) => {
  const isActive = !!startedAt;
  const elapsed = () => (startedAt ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) : 0);
  const [seconds, setSeconds] = useState(elapsed);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSeconds(elapsed());
    if (isActive) {
      intervalRef.current = setInterval(() => setSeconds(elapsed()), 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [startedAt]);

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  if (!isActive) {
    return (
      <TouchableOpacity style={[styles.pill, styles.startPill]} onPress={onStart} activeOpacity={0.8}>
        <Ionicons name="play" size={14} color={WHITE} />
        <Text style={styles.startText}>Start</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.pill}>
      <Ionicons name="time-outline" size={14} color={ACCENT} />
      <Text style={styles.timeText}>{formatTime(seconds)}</Text>
    </View>
  );
};

export default Timer;

const ACCENT = '#228B22';
const WHITE = '#FFFFFF';

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(44,44,47,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  startPill: {
    backgroundColor: ACCENT + 'CC',
    borderColor: ACCENT,
  },
  startText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '800',
  },
  timeText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
