import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

// Glass pill button — matches GlassCard: clear Liquid Glass on iOS 26+,
// translucent charcoal on Android / older iOS, with the purple → blue wash
// (a little stronger than the cards so buttons stand out inside them).
// Pass layout (flex, padding, gap…) via `style`; colour comes from here.
const HAS_LIQUID_GLASS = isLiquidGlassAvailable();

export const GLASS_BUTTON_GRADIENT = ['rgba(139,92,246,0.35)', 'rgba(37,99,235,0.18)'];
export const GLASS_BUTTON_TEXT = '#FFFFFF';

export default function GlassButton({ style, gradient = GLASS_BUTTON_GRADIENT, children, ...touchableProps }) {
  return (
    <TouchableOpacity activeOpacity={0.8} {...touchableProps} style={[styles.button, style]}>
      {HAS_LIQUID_GLASS ? (
        <GlassView
          glassEffectStyle="clear"
          colorScheme="dark"
          isInteractive
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]} pointerEvents="none" />
      )}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)', // faint light edge
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: 'rgba(44,44,47,0.55)', // translucent charcoal
  },
});
