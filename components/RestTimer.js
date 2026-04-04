import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const RestTimer = forwardRef(({
  onTimerComplete,
}, ref) => {

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(180);
  const intervalRef = useRef(null);

  useImperativeHandle(ref, () => ({
    start: (customDuration) => {
      const d = customDuration || 180;
      setDuration(d);
      setSecondsLeft(d);
      setIsRunning(true);
    },
    stop: () => {
      setIsRunning(false);
      clearInterval(intervalRef.current);
    },
  }));

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            onTimerComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={{ backgroundColor: 'rgba(16,185,129,0.1)', padding: 10, borderRadius: 12 }}>
      <Text style={{ color: '#10b981', fontSize: 22, fontWeight: 'bold' }}>  
        {isRunning ?  formatTime(secondsLeft) : ''}
      </Text>
      <TouchableOpacity onPress={() => restTimerRef.current?.start(180)}>
 
      </TouchableOpacity>
    </View>
  );
});

export default RestTimer;