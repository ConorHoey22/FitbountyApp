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

    flex: 1,
 
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    // shadowColor: '#E9EAEB',
    // shadowOpacity: 0.9,
    // shadowRadius: 4,
    elevation: 2,
  },

  content: {
    flex: 1,
  },
// --- Each Goal Card
statCardCompact: {
  flex: 1,
  backgroundColor: '#c4f5d9',
  borderRadius: 16,
  paddingVertical: 16,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 14,
  // shadowColor: '#000',
  // shadowOpacity: 9,
  // shadowRadius: 4,
  // elevation: 5,
  borderWidth:1,
  borderColor: '#fff',
},

statLabel: {
  fontSize: 15,
  fontWeight: '600',
  color: '#111827',
  marginTop: 6,
},


  
});
