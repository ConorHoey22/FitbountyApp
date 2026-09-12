import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { getLevelProgress } from '../lib/xpRewardConfig';
import Divider from './Divider';

const theme = {
bg: '#111827',
surface: '#1E293B',
surfaceAlt: '#0F172A',
surfaceLight: '#F1F5F9',
border: '#334155',
text: '#E5E7EB',
textMuted: '#9CA3AF',
textOnLight: '#0F172A',
primary: '#3B82F6',
success: '#22C55E',
warning: '#F59E0B',
color : '#FF8A00',     // Default start color (Calories orange)
endColor : '#FFB84D'
};

export default function XPBarLevel({ refreshKey }) {
  const [currentXP, setCurrentXP] = useState(0);
  const [levelXP, setLevelXP] = useState(100);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const loadXP = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: profileData, error } = await supabase
          .from('userProfiles')
          .select('totalXP')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        const totalXP = profileData?.totalXP || 0;
        const progress = getLevelProgress(totalXP);

        setCurrentXP(progress.currentXP);
        setLevelXP(progress.levelXP);
        setLevel(progress.level);
      } catch (err) {
        console.error('XPBarLevel load error:', err.message);
      }
    };

    loadXP();
  }, [refreshKey]);

  const progress = Math.min(currentXP / levelXP, 1); // 0 → 1

  return (
    <View style={styles.container}>
      <Text style={styles.macroLabel}>
        LEVEL {level}
      </Text>
      <Text style={styles.badgeText}> {currentXP} <Text style={styles.secondaryTextColor}>/ {levelXP} XP </Text> </Text>

      <View style={styles.barBackground}>

        {/* Progress fill */}
        <View style={[styles.barFillContainer, { flex: progress }]}>
          <LinearGradient
            colors={['#FF7A00', '#FFD54F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.barFillGradient}
          />
        </View>

        {/* Remaining bar */}
        <View style={[styles.remainingBar, { flex: 1 - progress }]} />
      </View>
    </View>
  );
}


// ─── Palette ──────────────────────────────────────────────────────────────────
const ACCENT    = '#C6F135';   // electric lime

const styles = StyleSheet.create({

barBackground: {
flexDirection: 'row',
height: 14,
width: '100%',
backgroundColor: '#1E1E1E',
borderRadius: 999,
overflow: 'hidden',
shadowColor: '#000',
shadowOffset: { width: 0, height: 3 },
shadowOpacity: 0.2,
shadowRadius: 4,
elevation: 3,
marginTop:10
    },
barFillContainer: {
borderRadius: 999,
overflow: 'hidden',
    },
barFillGradient: {
flex: 1,
borderRadius: 999,
    },
remainingBar: {
backgroundColor: '#2C2C2C',
    },

container: {
marginTop: 10,
marginBottom: 10,
alignItems: 'center',
  },
title: {
fontSize: 15,
fontWeight: '800',
marginBottom: 6,
color: theme.text,
textAlign: 'center',
  },
xpText: {
color: theme.textMuted,
  },
boldBlackText:
  {
color: 'black', fontSize: 16, fontWeight: '700'
  },

subtitle: { fontSize: 14, color: theme.text, marginBottom: 22, textAlign: 'center' },
primaryTextColor: {
color: '#FFFFFF',
fontSize: 14,
fontWeight: '700',
textShadowColor: 'transparent',
opacity: 1,
padding:5
    },
secondaryTextColor: {
fontSize: 14,
color: '#ffffff',
fontWeight: '500',
marginTop: 4,
    },

macroLabel: {
fontSize: 15,
fontWeight: '700',
color: ACCENT,       // clear medium-grey label
letterSpacing: 1.2,
marginBottom: 4,
    }, 
badgeText: {
color: '#ffffff',
fontSize: 15,
fontWeight: '700',
letterSpacing: 1.5,
    },



  });