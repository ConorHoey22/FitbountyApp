
import React, {
    useState,
    useEffect
  } from 'react';
  import {
    Modal,
    StyleSheet,
    View,
    Text,
    Pressable,
    TextInput,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    Platform,
  } from 'react-native';
  
  
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { Ionicons } from '@expo/vector-icons';
  import { supabase } from '../lib/supabase';
  import { getISOWeekKey } from '../utils/weeklyKeyCreate';
  
  
  const ActivityInputNumber = ({ icon, icon_color, label, value, onChange }) => {
  
    return (
      <View style={styles.inputWrapper}>
        <View style={styles.inputLabel}>
          <Ionicons name={icon} size={16} color={icon_color} />
          <Text style={styles.label}>{label}</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder='....'
          placeholderTextColor="#BABABA"
          keyboardType="number-pad"
          value={value}
          onChangeText={onChange}
        />
      </View>
  
    );
  
  
  };
  
  
  // ─── Palette ──────────────────────────────────────────────────────────────────
  const ACCENT   = '#C6F135';
  const BG_MODAL = '#1A1A26';
  const SURFACE  = '#22222E';
  const SURFACE2 = '#2C2C3C';
  const BORDER   = '#42425A';
  
  const styles = StyleSheet.create({
  
    inputGroup: {
      gap: 12,
      marginBottom: 20,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: SURFACE,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: BORDER,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    inputLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff',
    },
    input: {
      width: 72,
      backgroundColor: SURFACE2,
      borderWidth: 1.5,
      borderColor: BORDER,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 7,
      textAlign: 'center',
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: ACCENT,
      paddingVertical: 14,
      borderRadius: 13,
      gap: 8,
      marginBottom: 10,
      shadowColor: ACCENT,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    }
  
  
  });
  
  
  export default ActivityInputNumber;