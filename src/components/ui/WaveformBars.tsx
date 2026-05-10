import React, { useRef, useEffect, useMemo } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';

interface WaveformBarsProps {
  barCount?: number;
  isActive?: boolean;
  height?: number;
}

/**
 * Interpolates between teal (#00D4B1) and amber (#F5A623) based on position 0→1
 */
function interpolateColor(t: number): string {
  const r = Math.round(0 + t * (245 - 0));
  const g = Math.round(212 + t * (166 - 212));
  const b = Math.round(177 + t * (35 - 177));
  return `rgb(${r},${g},${b})`;
}

export function WaveformBars({
  barCount = 40,
  isActive = false,
  height = 64,
}: WaveformBarsProps) {
  const animValues = useRef<Animated.Value[]>(
    Array.from({ length: barCount }, () => new Animated.Value(4))
  ).current;

  const barColors = useMemo(
    () =>
      Array.from({ length: barCount }, (_, i) =>
        interpolateColor(i / (barCount - 1))
      ),
    [barCount]
  );

  useEffect(() => {
    if (isActive) {
      // Stagger-animate each bar to a random height, looping
      const animations = animValues.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 8 + Math.random() * (height - 12),
              duration: 200 + Math.random() * 300,
              useNativeDriver: false,
              delay: i * 15,
            }),
            Animated.timing(anim, {
              toValue: 4 + Math.random() * 12,
              duration: 200 + Math.random() * 300,
              useNativeDriver: false,
            }),
          ])
        )
      );
      Animated.stagger(20, animations).start();

      return () => {
        animations.forEach((a) => a.stop());
      };
    } else {
      // Reset to idle height
      animValues.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 4,
          duration: 400,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isActive]);

  return (
    <View style={[styles.container, { height }]}>
      {animValues.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              height: anim,
              backgroundColor: isActive ? barColors[i] : colors.textMuted,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  bar: {
    width: 3,
    borderRadius: 2,
    minHeight: 4,
  },
});
