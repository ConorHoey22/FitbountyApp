import React, { useState } from 'react';
import { APP_BG_GRADIENT } from '../components/ScreenBackground';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

import AuthBackground from '../components/AuthBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { font } from '../utils/fonts';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      Alert.alert('Logout Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AuthBackground colors={BG_GRADIENT} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <GlassButton style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={WHITE} />
          </GlassButton>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Options */}
        <GlassCard style={styles.card} gradient={CARD_GRADIENT}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Register')}
          >
            <View style={[styles.iconCircle, { backgroundColor: NOTIFY_COLOR + 'CC' }]}>
              <Ionicons name="notifications" size={18} color={WHITE} />
            </View>
            <Text style={styles.rowLabel}>Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color={MUTED} />
          </TouchableOpacity>
        </GlassCard>

        {/* Log out */}
        <GlassCard style={styles.card} gradient={CARD_GRADIENT}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={handleLogout}
            disabled={loading}
          >
            <View style={[styles.iconCircle, { backgroundColor: DANGER + 'CC' }]}>
              <Ionicons name="log-out-outline" size={18} color={WHITE} />
            </View>
            <Text style={[styles.rowLabel, { color: DANGER }]}>Log out</Text>
            {loading && <ActivityIndicator size="small" color={WHITE} />}
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

// ─── Palette — matches Home ──────────────────────────────────────────────────
const BG_GRADIENT = APP_BG_GRADIENT; // shared — components/ScreenBackground.js
const CARD_GRADIENT = ['rgba(139,92,246,0.20)', 'rgba(37,99,235,0.06)', 'rgba(37,99,235,0)']; // purple → blue → clear
const TEXT = '#FFFFFF';
const WHITE = '#FFFFFF';
const MUTED = '#9A9A9E';
const NOTIFY_COLOR = '#8B5CF6'; // purple
const DANGER = '#EF4444';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: TEXT,
    fontSize: 28,
    ...font('800'),
    letterSpacing: -0.5,
  },

  // Rows
  card: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    color: TEXT,
    fontSize: 16,
    ...font('600'),
  },
});
