import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet , Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TopActionBar = ({ navigation }) => {
  return (

      <View>
          <View style={styles.header}>
          {/* Column 1 — Profile */}
          <View style={styles.sideContainer}>
            <TouchableOpacity style={styles.profileImageContainer}>
            <Ionicons name="person" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Column 2 — Logo */}
          <View style={styles.headerCenter}>
            <Image
            source={require('../lib/assets/FBLogo.png')}
            style={styles.image}
            />
          </View>
          {/* Column 3 — Settings */}
          <View style={styles.sideContainer}>
            <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('SettingsScreen')}
            activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={22} color={ACCENT} />
            </TouchableOpacity>

          </View>

          </View>
      </View>
  );
};
export default TopActionBar;

// ─── Palette ──────────────────────────────────────────────────────────────────
const ACCENT    = '#C6F135';   // electric lime
const BG        = '#0E0E12';   // page background
const CARD_BG   = '#22222E';   // outer card
const MACRO_OUT = '#2C2C3C';   // macro card outer
const MACRO_IN  = '#252532';   // macro card inner
const BORDER    = '#42425A';   // brighter border for visibility
const STAT_BG  = '#2C2C3C';

const styles = StyleSheet.create({
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 10,
    },
  profileImageContainer: {
  width: 55,
  height: 55,
  borderRadius: 27.5,
  backgroundColor: ACCENT,
  justifyContent: 'center',
  alignItems: 'center',
    },
  sideContainer: {
  width: 55, // same width on both sides
  alignItems: 'center',
    },
  headerCenter: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
    },
    image: {
      width: 460,
      height: 190,
      margin:-70,
      resizeMode: 'contain',
        },
  });