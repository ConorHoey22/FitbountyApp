import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import GlassButton from './GlassButton';

const FB_LOGO = require('../lib/assets/FBLogo.png');

// FBLogo.png is mostly transparent padding (the target fills ~14% of it), so the
// full image is drawn large and allowed to overflow a small layout slot.
// Change LOGO_SIZE to resize the visible target (~14% of this value).
const LOGO_SIZE = 230;
const LOGO_SLOT = 64;

const TopActionBar = ({ navigation: navigationProp, name, left }) => {
  const fallbackNavigation = useNavigation();
  const navigation = navigationProp || fallbackNavigation;
  const initial = name ? name.trim().charAt(0).toUpperCase() : '';

  return (
    <View>
      <View style={styles.header}>
        {/* Left — optional slot (e.g. level ring) */}
        <View style={styles.side}>{left}</View>

        {/* Center — Logo */}
        <View style={styles.logoSlot} pointerEvents="none">
          <Image source={FB_LOGO} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Right — Actions */}
        <View style={[styles.side, styles.sideRight]}>

          <GlassButton
            style={styles.iconButton}
            onPress={() => navigation.navigate('SettingsScreen')}
          >
            <Ionicons name="settings-outline" size={22} color={WHITE} />
          </GlassButton>
        </View>
      </View>

  
    </View>
  );
};
export default TopActionBar;

const INK = '#111111';
const WHITE = '#FFFFFF';
const MUTED = '#8C8C8C';
const BLUE = '#2563EB';
const BLUE_SOFT = '#E7F0FF';
const BLUE_BORDER = '#BFD5FF';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  // Both sides flex equally so the logo stays dead centre
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideRight: {
    justifyContent: 'flex-end',
    gap: 10,
  },
  logoSlot: {
    width: LOGO_SLOT,
    height: LOGO_SLOT,
    overflow: 'visible',
  },
  logo: {
    position: 'absolute',
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    // centre the target itself (it sits slightly right of and above the PNG's centre)
    left: (LOGO_SLOT - LOGO_SIZE) / 2 - LOGO_SIZE * 0.02,
    top: (LOGO_SLOT - LOGO_SIZE) / 2 + LOGO_SIZE * 0.028,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: WHITE,
    fontSize: 22,
    fontWeight: '800',
  },
  greeting: {
    marginTop: 14,
    marginLeft: 2,
  },
  welcome: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
  name: {
    color: INK,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
