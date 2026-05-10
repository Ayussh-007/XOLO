import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
  StatusBar,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import {
  modelsExist,
  downloadAllModels,
} from '../services/ModelDownloadManager';
import { colors, fonts, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;
const { width } = Dimensions.get('window');

export default function SplashDownloadScreen({ navigation }: Props) {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Preparing your sound engine...');

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseGlow = useRef(new Animated.Value(0.3)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance fade
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation for the logo circle
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.06,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseGlow, {
            toValue: 0.7,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseGlow, {
            toValue: 0.3,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    checkAndDownload();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const checkAndDownload = async () => {
    setError(null);
    try {
      const exists = await modelsExist();
      if (exists) {
        setStatus('Ready.');
        setTimeout(() => navigation.replace('Home'), 600);
      } else {
        startDownload();
      }
    } catch {
      setError('Initialization failed. Check your connection.');
    }
  };

  const startDownload = async () => {
    setError(null);
    setStatus('Downloading sound models...');
    try {
      await downloadAllModels((p) => {
        setProgress(p);
        if (p < 33) setStatus('Downloading instrument model...');
        else if (p < 66) setStatus('Downloading music logic...');
        else if (p < 100) setStatus('Downloading labels...');
        else setStatus('Finalizing...');
      });
      setStatus('Ready.');
      setTimeout(() => navigation.replace('Home'), 800);
    } catch {
      setError('Download failed. Please try again.');
    }
  };

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={[styles.centerContent, { opacity: fadeIn }]}>
        {/* Pulsing logo circle */}
        <Animated.View
          style={[
            styles.logoCircle,
            { transform: [{ scale: pulseScale }] },
          ]}
        >
          {/* Teal glow ring */}
          <Animated.View style={[styles.glowRing, { opacity: pulseGlow }]} />

          {/* Icon cluster */}
          <View style={styles.iconCluster}>
            <Ionicons
              name="camera"
              size={26}
              color={colors.accentTeal}
              style={{ marginRight: -3 }}
            />
            <MaterialCommunityIcons
              name="waveform"
              size={30}
              color={colors.accentTeal}
              style={{ marginLeft: -3 }}
            />
          </View>
        </Animated.View>

        {/* App name */}
        <Text style={styles.appName}>PhotoMusic</Text>
        <Text style={styles.tagline}>Your world, in sound.</Text>
      </Animated.View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              onPress={checkAndDownload}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.statusText}>{status}</Text>
            {/* Progress bar at bottom */}
            <View style={styles.progressTrack}>
              <Animated.View
                style={[styles.progressFill, { width: progressBarWidth }]}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.accentTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accentTeal,
  },
  iconCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
    color: colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    letterSpacing: 0.5,
  },
  bottomSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  statusText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
    letterSpacing: 0.3,
  },
  progressTrack: {
    width: '100%',
    height: 2,
    backgroundColor: colors.borderSubtle,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentTeal,
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: colors.accentTeal,
    borderRadius: 9999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.accentTeal,
  },
});
