import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// App-wide page background — dark purple (top) → near-black → black.
// Change it here to update every screen.
export const APP_BG_GRADIENT = ['#1E0B3D', '#0A0414', '#000000'];

// Drop in as the first child of a screen's root View (absolute fill, behind content).
export default function ScreenBackground() {
  return <LinearGradient colors={APP_BG_GRADIENT} style={StyleSheet.absoluteFill} pointerEvents="none" />;
}
