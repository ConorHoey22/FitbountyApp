import React from 'react';
import { View, Image, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';

// Loading screen — black with the FIT-BOUNTY logo, matching the native splash
// (app.json → expo-splash-screen). No animation; a small spinner shows it's loading.

// Same width as the splash image (imageWidth in app.json)
const LOGO_SIZE = 400;

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image source={require('../lib/assets/FBLogo.png')} style={styles.logo} resizeMode="contain" />
      <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  // The logo PNG has lots of empty space around it, so pull the spinner up under the lettering
  spinner: {
    position: 'absolute',
    bottom: '32%',
  },
});
