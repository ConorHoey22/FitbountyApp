import React, { useState } from 'react';
import { Modal, StyleSheet, View, Text, Pressable, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const AddComingSoonModal = ({
    visible,
    onClose,
  
  
  }) => {
 
  return (
            <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    
                     {/* Header */}
                     <View style={styles.header}>
                        <Text style={styles.title}>Coming Soon</Text>
                        <Pressable onPress={onClose}>
                            <Ionicons name="close-circle-outline" size={28} color="#333" />
                        </Pressable>
                    </View>

                    <Text style={styles.subtitle}>* This Feature is currently under development *</Text>

                </View>
            </View>
        </Modal>
  );


  
};



// THESE STYLES ARE REQUIRED
const styles = StyleSheet.create({
  overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
  },
  modalContainer: {
      width: "85%",
      backgroundColor: "white",
      padding: 20,
      borderRadius: 20,
      elevation: 5, // Shadow for Android
      shadowColor: '#000', // Shadow for iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5
  },
  title: {
      fontSize: 22,
      fontWeight: "bold",
      color: '#1a1a1a'
  },
  subtitle: {
      fontSize: 12,
      color: '#666',
      fontStyle: 'italic',
      marginBottom: 20
  },
  inputGroup: {
      marginBottom: 20
  },
  inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15
  },
  label: {
      fontSize: 16,
      fontWeight: '500',
      color: '#444'
  },
  input: {
      width: 100,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      textAlign: 'right'
  },
  saveButton: {
      backgroundColor: '#4CAF50',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center'
  },
  saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold'
  }
});

export default AddComingSoonModal;