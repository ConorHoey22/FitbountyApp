// components/Card.js
import React from 'react';
import { StyleSheet , View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Card({ children, primaryColor }) {
  return (


    <View style={[styles.card, { backgroundColor: primaryColor }]}>
    <View style={styles.content}>
      {children}
    </View>
  </View>
 
  );
}

const styles = StyleSheet.create({
  
  card: {
    backgroundColor: '#1C1F26', // Default background color
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  content: {
    flex: 1,
    width: '100%', // Ensures the content takes full width
  },

  
});
