import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function XPBar({ currentXP = 350, levelXP = 500, level = 3 }) {
  const progress = Math.min(currentXP / levelXP, 1); // progress capped at 100%

  return (
    <View style={styles.container}>
      <Text style={styles.levelText}>Level {level}</Text>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>
      <Text style={styles.xpText}>
        {currentXP} / {levelXP} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  barBackground: {
    flexDirection: 'row',
    height: 20,
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
  xpText: {
    fontSize: 14,
    color: '#666',
  },
});