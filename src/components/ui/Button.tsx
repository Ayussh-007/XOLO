import React, { useRef, useEffect } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radius, spacing } from '../../theme/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  shimmer?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  icon,
  shimmer = false,
  style,
}: PrimaryButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    if (shimmer && !disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, { toValue: 2, duration: 2400, useNativeDriver: true }),
          Animated.delay(1200),
        ])
      ).start();
    }
  }, [shimmer, disabled]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.primaryBase, disabled && styles.primaryDisabled]}
      >
        <View style={styles.primaryGlow} />
        {shimmer && !disabled && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.shimmerContainer,
              { transform: [{ translateX: shimmerAnim.interpolate({ inputRange: [-1, 2], outputRange: [-200, 400] }) }] },
            ]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.18)', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        )}
        <View style={styles.primaryInner}>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.primaryLabel, disabled && styles.labelDisabled]}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  icon,
  style,
}: SecondaryButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.secondaryBase, disabled && styles.secondaryDisabled]}
      >
        <View style={styles.primaryInner}>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.secondaryLabel, disabled && styles.labelDisabled]}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface IconButtonProps {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'teal' | 'amber' | 'ghost';
  size?: number;
  style?: ViewStyle;
}

export function IconButton({
  onPress,
  disabled = false,
  children,
  variant = 'teal',
  size = 56,
  style,
}: IconButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  };

  const bgColor = variant === 'teal' ? colors.accentTealDim : variant === 'amber' ? colors.accentAmberDim : 'transparent';
  const borderColor = variant === 'teal' ? colors.accentTeal : variant === 'amber' ? colors.accentAmber : colors.borderSubtle;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.iconButtonBase,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: disabled ? colors.surface : bgColor, borderColor: disabled ? colors.borderSubtle : borderColor },
        ]}
      >
        {variant === 'teal' && !disabled && (
          <View style={[styles.iconGlow, { width: size + 16, height: size + 16, borderRadius: (size + 16) / 2 }]} />
        )}
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  primaryBase: { backgroundColor: colors.accentTeal, borderRadius: radius.full, paddingVertical: spacing.base, paddingHorizontal: spacing.lg, overflow: 'hidden', position: 'relative' },
  primaryDisabled: { backgroundColor: colors.textMuted },
  primaryGlow: { position: 'absolute', bottom: -10, left: '15%', right: '15%', height: 30, backgroundColor: colors.accentTeal, opacity: 0.25, borderRadius: radius.full },
  primaryInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconLeft: { marginRight: spacing.sm },
  primaryLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.black, letterSpacing: 0.3 },
  labelDisabled: { color: colors.textMuted },
  shimmerContainer: { overflow: 'hidden', borderRadius: radius.full },
  shimmerGradient: { width: 120, height: '100%' },
  secondaryBase: { backgroundColor: 'transparent', borderRadius: radius.full, paddingVertical: spacing.base, paddingHorizontal: spacing.lg, borderWidth: 1.5, borderColor: colors.accentTeal },
  secondaryDisabled: { borderColor: colors.textMuted },
  secondaryLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.accentTeal, letterSpacing: 0.3 },
  iconButtonBase: { borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  iconGlow: { position: 'absolute', backgroundColor: colors.accentTeal, opacity: 0.12 },
});
