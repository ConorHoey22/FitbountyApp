import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

// Card with the same clear Liquid Glass look as the tab bar.
// - iOS 26+: real Liquid Glass (GlassView, 'clear' style)
// - Android / older iOS: Liquid Glass isn't available, so a translucent dark
//   card with a light edge is used instead (real blur on Android is
//   experimental and costly inside scrolling lists).
// `gradient` (optional): translucent colours washed over the glass, top-left →
// bottom-right, so each card can have its own colour.
const HAS_LIQUID_GLASS = isLiquidGlassAvailable();

export default function GlassCard({ style, gradient, children }) {
  const content = (
    <>
      {gradient && (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      {children}
    </>
  );

  if (HAS_LIQUID_GLASS) {
    return (
      <GlassView glassEffectStyle="clear" colorScheme="dark" style={[styles.card, style]}>
        {content}
      </GlassView>
    );
  }

  return <View style={[styles.card, styles.fallback, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', // faint light edge so cards read on dark backgrounds
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: 'rgba(44,44,47,0.55)', // translucent charcoal
  },
});
