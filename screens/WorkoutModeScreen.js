import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WorkoutModeScreen({ currentAmount = 43, totalAmount = 100, l }) {
  const progress = Math.min(currentAmount / totalAmount, 1); // progress capped at 100%

  return (
    <View style={styles.container}>

        <Text>Workout</Text>
   
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
    marginBottom: 5,
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