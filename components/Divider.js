import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Divider = () => {

 
  
  return (
    <View style={styles.divider} />
  );
};

export default Divider;

const styles = StyleSheet.create({
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#334155', // slate-700 – subtle gray-blue
        marginVertical: 10,
      },
});
