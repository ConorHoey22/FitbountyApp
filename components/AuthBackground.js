import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';

// Shared backdrop for the Login / Register screens: Home's blue → white
// gradient with a faint scatter of fitness icons across the blue area.
const BG_GRADIENT = ['#5669FF', '#5669FF', '#FFFFFF'];

// Positions are percentages so the pattern scales with the screen.
// Keep `left` under ~15% or over ~75% so nothing sits behind the centred logo,
// and `top` under ~30% so nothing sits behind the form card.
const ICONS = [
  // Left column (starts below the BETA badge)
  { name: 'heart-outline',     size: 28, top: '12%', left: '5%',  rotate: '12deg' },
  { name: 'stopwatch-outline', size: 32, top: '20%', left: '12%', rotate: '10deg' },
  { name: 'bicycle-outline',   size: 38, top: '28%', left: '3%',  rotate: '-8deg' },
  // Right column
  { name: 'barbell-outline',   size: 42, top: '6%',  left: '78%', rotate: '-18deg' },
  { name: 'trophy-outline',    size: 26, top: '14%', left: '88%', rotate: '-6deg' },
  { name: 'flame-outline',     size: 30, top: '21%', left: '76%', rotate: '-12deg' },
  { name: 'footsteps-outline', size: 34, top: '28%', left: '86%', rotate: '24deg' },
];

// Home is covered in cards below the header, so its icons only fill the gaps
// either side of the logo in TopActionBar (row spans ~64–140px from the top).
// `top` is in px from the top of the ScrollView content.
export const HOME_ICONS = [
  // Between the XP ring and the logo
  { name: 'barbell-outline',   size: 24, top: 74,  left: '22%', rotate: '-18deg' },
  { name: 'heart-outline',     size: 18, top: 72,  left: '31%', rotate: '12deg' },
  { name: 'stopwatch-outline', size: 20, top: 112, left: '27%', rotate: '10deg' },
  // Between the logo and the settings button
  { name: 'flame-outline',     size: 20, top: 70,  left: '62%', rotate: '-12deg' },
  { name: 'trophy-outline',    size: 22, top: 90,  left: '72%', rotate: '-6deg' },
  { name: 'footsteps-outline', size: 18, top: 118, left: '63%', rotate: '24deg' },
];

// Icons only — for screens that already draw their own gradient (e.g. Home)
export function BackgroundIcons({ icons = ICONS }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {icons.map(({ name, size, top, left, rotate }) => (
        <Ionicons
          key={name}
          name={name}
          size={size}
          color="#FFFFFF"
          style={[styles.icon, { top, left, transform: [{ rotate }] }]}
        />
      ))}
    </View>
  );
}

// Midnight blue page background shared by Home, Login and Register
export const MIDNIGHT = '#191970';

// Dot pattern settings (see BackgroundPattern)
const PATTERN_SPACING = 18;     // px between dots
const PATTERN_DOT_RADIUS = 1.2; // dot size
const PATTERN_OPACITY = 0.18;   // overall strength

// Fine white dot grid across the whole background
export function BackgroundPattern() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id="bgDots" width={PATTERN_SPACING} height={PATTERN_SPACING} patternUnits="userSpaceOnUse">
          <Circle cx={PATTERN_SPACING / 2} cy={PATTERN_SPACING / 2} r={PATTERN_DOT_RADIUS} fill="#FFFFFF" />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bgDots)" opacity={PATTERN_OPACITY} />
    </Svg>
  );
}

// `pattern` adds the dot grid on top of the gradient
export default function AuthBackground({ colors = BG_GRADIENT, pattern = false }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />
      {pattern && <BackgroundPattern />}
      {/* <BackgroundIcons /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    position: 'absolute',
    opacity: 0.3,
  },
});
