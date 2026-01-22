import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WorkoutContainerCard({ children }) {



  return (
    <View style={styles.statsContainer}>
        <View style={styles.planCard}>
        {children}
        </View>
    </View>

  )
}


const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
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


