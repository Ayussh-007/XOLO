import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { fonts, spacing } from '../theme/theme';
import { useThemeColors } from '../hooks/useThemeColors';
import { useThemeStore } from '../store/useThemeStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
  const activeColors = useThemeColors();
  const { theme, toggleTheme } = useThemeStore();
  
  // Animated floating blobs
  const blob1X = useRef(new Animated.Value(0)).current;
  const blob1Y = useRef(new Animated.Value(0)).current;
  const blob2X = useRef(new Animated.Value(0)).current;
  const blob2Y = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Floating blob 1
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(blob1X, {
            toValue: 30,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(blob1X, {
            toValue: -20,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(blob1X, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(blob1Y, {
            toValue: -25,
            duration: 5500,
            useNativeDriver: true,
          }),
          Animated.timing(blob1Y, {
            toValue: 15,
            duration: 4500,
            useNativeDriver: true,
          }),
          Animated.timing(blob1Y, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Floating blob 2
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(blob2X, {
            toValue: -25,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(blob2X, {
            toValue: 20,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(blob2X, {
            toValue: 0,
            duration: 4500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(blob2Y, {
            toValue: 20,
            duration: 4500,
            useNativeDriver: true,
          }),
          Animated.timing(blob2Y, {
            toValue: -20,
            duration: 5500,
            useNativeDriver: true,
          }),
          Animated.timing(blob2Y, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Animated gradient blobs */}
      <Animated.View
        style={[
          styles.blobContainer,
          {
            transform: [{ translateX: blob1X }, { translateY: blob1Y }],
          },
        ]}
      >
        <LinearGradient
          colors={[activeColors.accentTeal, 'transparent']}
          style={styles.blob1}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.blobContainer2,
          {
            transform: [{ translateX: blob2X }, { translateY: blob2Y }],
          },
        ]}
      >
        <LinearGradient
          colors={[activeColors.accentAmber, 'transparent']}
          style={styles.blob2}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.containerAnimated, { opacity: fadeIn }]}>
          {/* Header row with logo, theme toggle, and logout */}
          <View style={styles.headerRow}>
            <View style={styles.logoRow}>
              <Ionicons name="camera" size={18} color={activeColors.accentTeal} />
              <MaterialCommunityIcons
                name="waveform"
                size={20}
                color={activeColors.accentTeal}
                style={{ marginLeft: 2 }}
              />
            </View>
            <View style={styles.headerActions}>
              <Pressable
                onPress={toggleTheme}
                style={[styles.headerButton, { backgroundColor: activeColors.surfaceElevated, borderColor: activeColors.borderSubtle }]}
              >
                <Ionicons
                  name={theme === 'dark' ? 'moon' : 'sunny'}
                  size={18}
                  color={activeColors.textPrimary}
                />
              </Pressable>
              <Pressable
                onPress={() => navigation.replace('Welcome')}
                style={[styles.headerButton, { backgroundColor: activeColors.surfaceElevated, borderColor: activeColors.borderSubtle, marginLeft: spacing.sm }]}
              >
                <Ionicons
                  name="log-out-outline"
                  size={18}
                  color={activeColors.error}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.centerContent}>
            {/* Headline */}
            <Text style={[styles.headline, { color: activeColors.textPrimary }]}>
              What does{'\n'}it sound like?
            </Text>

            {/* Buttons */}
            <View style={styles.buttonGroup}>
              <PrimaryButton
                label="Take a Photo"
                onPress={() => navigation.navigate('Camera', { mode: 'camera' })}
                shimmer
                icon={
                  <Ionicons name="camera" size={20} color={activeColors.black} />
                }
              />

              <SecondaryButton
                label="From Gallery"
                onPress={() => navigation.navigate('Camera', { mode: 'gallery' })}
                icon={
                  <Ionicons name="images" size={18} color={activeColors.accentTeal} />
                }
                style={{ marginTop: spacing.base }}
              />
            </View>

            {/* History link */}
            <Pressable
              onPress={() => navigation.navigate('History')}
              style={styles.historyLink}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={activeColors.textSecondary}
                style={{ marginRight: spacing.xs }}
              />
              <Text style={[styles.historyText, { color: activeColors.textSecondary }]}>History</Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  containerAnimated: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
  },
  blobContainer: {
    position: 'absolute',
    top: -80,
    left: -60,
  },
  blob1: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    opacity: 0.12,
  },
  blobContainer2: {
    position: 'absolute',
    top: 40,
    right: -100,
  },
  blob2: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    opacity: 0.1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    zIndex: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headline: {
    fontFamily: fonts.displayBold,
    fontSize: 38,
    lineHeight: 48,
    letterSpacing: -0.5,
    marginBottom: spacing.xxl,
  },
  buttonGroup: {
    width: '100%',
  },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
    paddingVertical: spacing.sm,
  },
  historyText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
