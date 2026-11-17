import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { font } from '../utils/fonts';

// Circular progress tracker — a coloured arc over a faint track of the same
// colour, with a label (e.g. "60%") in the middle.
export default function ProgressRing({
  progress = 0,      // 0 → 1
  color = '#2563EB',
  size = 46,
  stroke = 5,
  label,
  labelColor = '#FFFFFF',
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(progress, 1));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Ring drawn as a background layer; the label sits centred on top */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color + '33'}
          strokeWidth={stroke}
          fill="none"
        />
        {/* Progress arc — starts at 12 o'clock */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {label != null && (
        <Text
          style={[styles.label, { color: labelColor, fontSize: size * 0.24, maxWidth: size - stroke * 2 - 4 }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          pointerEvents="none"
        >
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...font('600'),
    textAlign: 'center',
    includeFontPadding: false, // Android: keep the text vertically centred
  },
});
