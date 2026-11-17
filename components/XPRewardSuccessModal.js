import React, { useEffect, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';

// Level-up popup — shown when an XP award takes the user to a new level
const XPRewardSuccessModal = ({ visible, level, onClose }) => {
  const cardScale = useRef(new Animated.Value(0.6)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  const accent = LEVEL_COLOR;

  // Replay the entrance every time the popup opens
  useEffect(() => {
    if (!visible || level == null) return;

    cardScale.setValue(0.6);
    cardOpacity.setValue(0);
    iconScale.setValue(0);
    burst.setValue(0);
    pulse.setValue(0);

    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(150),
      Animated.spring(iconScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(200),
      Animated.timing(burst, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [visible, level]);

  if (level == null) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>

          {/* Icon with burst + pulse ring */}
          <View style={styles.iconArea}>
            {BURST_DOTS.map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const distance = i % 2 === 0 ? 70 : 54;
              return (
                <Animated.View
                  key={angle}
                  style={[
                    styles.burstDot,
                    {
                      backgroundColor: i % 3 === 0 ? NAVY : accent,
                      opacity: burst.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
                      transform: [
                        { translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * distance] }) },
                        { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * distance] }) },
                        { scale: burst.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }) },
                      ],
                    },
                  ]}
                />
              );
            })}

            <Animated.View
              style={[
                styles.pulseRing,
                {
                  borderColor: accent,
                  opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                  transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
                },
              ]}
            />

            <Animated.View style={[styles.iconCircle, { backgroundColor: accent, transform: [{ scale: iconScale }] }]}>
              <Text style={styles.levelNumber}>{level}</Text>
            </Animated.View>
          </View>

          {/* Text */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>LEVEL UP</Text>
          </View>

          <Text style={styles.title}>
            You reached Level {level}!
          </Text>

          <Text style={styles.subtitle}>
            Keep it up — your next level is waiting.
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Nice!</Text>
          </TouchableOpacity>

        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── Palette — matches Login / Home (navy, white, black) ─────────────────────
const NAVY = '#0B1F4D';
const INK = '#111111';
const WHITE = '#FFFFFF';
const MUTED = '#8C8C8C';
const LEVEL_COLOR = '#ff7722';   // same as the XP ring on Home

const BURST_DOTS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: NAVY + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '84%',
    backgroundColor: WHITE,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  iconArea: {
    width: 150,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  burstDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pulseRing: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    color: WHITE,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  badge: {
    backgroundColor: NAVY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 10,
  },
  badgeText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: INK,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  button: {
    alignSelf: 'stretch',
    backgroundColor: INK,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default XPRewardSuccessModal;
