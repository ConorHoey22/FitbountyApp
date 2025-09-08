import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


const theme = {
  // Dim hybrid palette
  bg: '#111827',            // slate-900 (dark, not black)
  surface: '#1E293B',       // slate-800 (mid card)
  surfaceAlt: '#0F172A',    // slate-900/indigo tint (header/alt)
  surfaceLight: '#F1F5F9',  // slate-100 (light card to break up darkness)
  border: '#334155',        // slate-700
  text: '#E5E7EB',          // light text on dark
  textMuted: '#9CA3AF',     // muted on dark
  textOnLight: '#0F172A',   // dark text on light cards
  primary: '#3B82F6',       // blue
  success: '#22C55E',       // green
  warning: '#F59E0B',       // amber
};


export default function XPBarLevel({ currentXP = 350, levelXP = 500, level = 3 }) {
  const progress = Math.min(currentXP / levelXP, 1); // progress capped at 100%





  return (
    <View style={styles.container}>
      <Text style={styles.levelText}>Level {level}</Text>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>
      <Text style={styles.macroLabelMedium}>
        {currentXP} / {levelXP} 
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  levelText: {

      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
 
  },
  barBackground: {
    flexDirection: 'row',
    height: 10,
    width: '90%',
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
  },
  macroLabelSmall: {
    fontSize: 12,
    color: theme.textMuted,
  },
  macroLabelMedium: {
    fontSize: 15,
    color: theme.textMuted,
  },
  macroLabelLarge: {
    fontSize: 25,
    color: theme.textMuted,
  },



});