import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import { getLevelProgress } from '../lib/xpRewardConfig';
import { font } from '../utils/fonts';

const SIZE = 52;
const STROKE = 5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const LEVEL_FONT_SIZE = 20;

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
      <View style={styles.ring}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={TRACK}
            strokeWidth={STROKE}
            fill={WHITE}
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={BLUE}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            // start the arc at 12 o'clock
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
          <SvgText
            x={SIZE / 2}
            // nudge down ~1/3 of the font size so the digits sit visually centred
            y={SIZE / 2 + LEVEL_FONT_SIZE * 0.35}
            textAnchor="middle"
            fontSize={LEVEL_FONT_SIZE}
            fontWeight="800"
            fill={INK}
          >
            {level}
          </SvgText>
        </Svg>
      </View>

      <Text style={styles.xpText}>
        {currentXP}
        <Text style={styles.xpMuted}>/{levelXP} XP</Text>
      </Text>
    </View>
  );
}

const INK = '#111111';
const WHITE = '#FFFFFF';
const MUTED = '#8C8C8C';
const BLUE = '#ff7722';
const TRACK = '#5A5A5E';   // remaining XP — solid grey so it shows on dark backgrounds

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  xpText: {
    marginTop: 4,
    color: WHITE,
    fontSize: 11,
    ...font('800'),
  },
  xpMuted: {
    color: WHITE,
    ...font('600'),
  },
});
