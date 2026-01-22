import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Divider from './Divider';

const theme = {
  bg: '#111827',
  surface: '#1E293B',
  surfaceAlt: '#0F172A',
  surfaceLight: '#F1F5F9',
  border: '#334155',
  text: '#E5E7EB',
  textMuted: '#9CA3AF',
  textOnLight: '#0F172A',
  primary: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  color : '#FF8A00',     // Default start color (Calories orange)
  endColor : '#FFB84D'
};

export default function XPBarLevel({ currentXP = 10, levelXP = 100, level = 3 }) {
  const progress = Math.min(currentXP / levelXP, 1); // 0 → 1

  return (
    <View style={styles.container}>
      <Text style={styles.primaryTextColor}>
        LEVEL {level}
      </Text>
     
      <Text style={styles.primaryTextColor}> {currentXP} <Text style={styles.secondaryTextColor}>/ {levelXP} XP </Text> </Text>
        
     

      <View style={styles.barBackground}>
        {/* Progress fill */}
        <View style={[styles.barFillContainer, { flex: progress }]}>
          <LinearGradient
            colors={['#FF8A00', '#FFB84D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.barFillGradient}
          />
        </View>

        {/* Empty space */}
        <View style={{ flex: 1 - progress }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
    color: theme.text,
    textAlign: 'center',
  },
  xpText: {
    color: theme.textMuted,
  },
  barBackground: {
    flexDirection: 'row', // horizontal fill
    height: 12,
    width: '90%',
    backgroundColor: theme.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFillContainer: {
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  boldBlackText:
  {
   color: 'black', fontSize: 16, fontWeight: '700'
  },
  barFillGradient: {
    flex: 1, // fill the container width
  },
    subtitle: { fontSize: 14, color: theme.text, marginBottom: 22, textAlign: 'center' },
    primaryTextColor: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
      textShadowColor: 'transparent',
      opacity: 1,
      padding:5
    },
    secondaryTextColor: {
      fontSize: 14,
      color: '#A0A3A8',
      fontWeight: '500',
      marginTop: 4,
    },

  });