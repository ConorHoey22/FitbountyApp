import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';

// Custom bottom tab bar — a floating solid black pill.
// Screens add bottom space via utils/useTabBarSpace so nothing is hidden behind it.
// Routes whose options set `tabBarButton` (hidden screens) are skipped.

const ICONS = {
  Home: ['home', 'home-outline'],
  MyHealth: ['heart', 'heart-outline'],
  Rewards: ['gift', 'gift-outline'],
  Workouts: ['fitness', 'fitness-outline'],
  PlanYourWeekScreen: ['calendar', 'calendar-outline'],
};

function TabItem({ label, iconName, focused, onPress, onLongPress }) {
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      friction: 7,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={styles.tab}
    >
      {/* Red-tinted capsule behind the active tab */}
      <Animated.View
        style={[
          styles.activeCapsule,
          {
            opacity: anim,
            transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
          },
        ]}
      />

      <Ionicons name={iconName} size={22} color={focused ? ICON_ACTIVE : ICON_INACTIVE} />
      <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function AppTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  // Tell React Navigation how tall the bar is, so screens can read it (useTabBarSpace)
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);

  const visibleRoutes = state.routes
    .map((route, index) => ({ route, index }))
    .filter(({ route }) => !descriptors[route.key].options.tabBarButton);

  const tabs = visibleRoutes.map(({ route, index }) => {
    const { options } = descriptors[route.key];
    const focused = state.index === index;
    const label = options.tabBarLabel ?? options.title ?? route.name;
    const [activeIcon] = ICONS[route.name] || ['ellipse'];

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    const onLongPress = () => {
      navigation.emit({ type: 'tabLongPress', target: route.key });
    };

    return (
      <TabItem
        key={route.key}
        label={label}
        iconName={activeIcon}
        focused={focused}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    );
  });

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}
      onLayout={(e) => onHeightChange?.(e.nativeEvent.layout.height)}
    >
      <View style={[styles.pill, styles.pillSolid]}>{tabs}</View>
    </View>
  );
}

// ─── Palette ─────────────────────────────────────────────────────────────────
const ICON_ACTIVE = '#FFFFFF';             // white
const ICON_INACTIVE = '#FFFFFFD9';         // white, slightly dimmed
const ACTIVE = '#FFFFFF';                  // active label
const INACTIVE = '#E0E0E0';                // inactive label — light so it reads on glass
const CAPSULE = 'rgba(239,68,68,0.16)';    // red tint behind the active tab
const BAR_BG = '#000000';                  // solid black pill

const styles = StyleSheet.create({
  // Transparent strip pinned to the bottom; the pill floats inside it
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  pill: {
    flexDirection: 'row',
    borderRadius: 32,
    paddingVertical: 6,
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  pillSolid: {
    backgroundColor: BAR_BG,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  activeCapsule: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    backgroundColor: CAPSULE,
  },
  label: {
    color: INACTIVE,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelActive: {
    color: ACTIVE,
    fontWeight: '800',
  },
});
