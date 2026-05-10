import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { generateMusic, INSTRUMENT_COUNT, getInstrumentNames } from '../../api/aceStepApi';
import { saveBase64AudioToFile } from '../../utils/audioUtils';
import theme from '../../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Generating'>;
const { width } = Dimensions.get('window');

const GeneratingScreen: React.FC<Props> = ({ navigation }) => {
  const {
    selectedMatch,
    setGeneratedAudio,
    setIsGenerating,
    setGenerationProgress,
    setUseFallback,
    generationProgress,
  } = useAppStore();

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = INSTRUMENT_COUNT;
  const instrumentNames = getInstrumentNames();

  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;
  const barAnims = useRef(
    Array.from({ length: 24 }, () => new Animated.Value(0.2))
  ).current;

  const moodColor = selectedMatch?.dna?.color || theme.colors?.accentTeal || '#00D4B1';

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Ring pulse
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, { toValue: 1.5, duration: 1800, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Waveform bar animations
    barAnims.forEach((anim) => {
      const randomLoop = () => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0.2 + Math.random() * 0.8,
            duration: 200 + Math.random() * 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.05 + Math.random() * 0.3,
            duration: 200 + Math.random() * 400,
            useNativeDriver: true,
          }),
        ]).start(() => randomLoop());
      };
      randomLoop();
    });

    startGeneration();

    return () => {
      setIsGenerating(false);
    };
  }, []);

  const startGeneration = async () => {
    if (!selectedMatch) {
      navigation.goBack();
      return;
    }

    setIsGenerating(true);
    const moodId = selectedMatch.id;
    let anySuccess = false;

    for (let i = 0; i < INSTRUMENT_COUNT; i++) {
      setCurrentStep(i);
      setGenerationProgress(`Generating ${instrumentNames[i]}...`);

      try {
        const audioDataUri = await generateMusic(
          selectedMatch,
          i,
          (msg) => setGenerationProgress(msg),
        );

        if (audioDataUri) {
          setGenerationProgress(`Saving ${instrumentNames[i]}...`);
          const filePath = await saveBase64AudioToFile(audioDataUri, moodId, i);
          if (filePath) {
            setGeneratedAudio(`${moodId}_inst${i}`, filePath);
            anySuccess = true;
          }
        }
      } catch (error) {
        console.error(`Generation failed for instrument ${i}:`, error);
      }
    }

    setIsGenerating(false);

    if (!anySuccess) {
      setUseFallback(true);
      setGenerationProgress('Using sample music (server unavailable)');
      await new Promise((r) => setTimeout(r, 1200));
    } else {
      setGenerationProgress('All tracks ready!');
      await new Promise((r) => setTimeout(r, 600));
    }

    navigation.replace('Performance');
  };

  const handleSkip = () => {
    setIsGenerating(false);
    setUseFallback(true);
    navigation.replace('Performance');
  };

  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors?.background || '#000' }]}>
      <StatusBar barStyle="light-content" />

      {/* Animated ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            borderColor: moodColor,
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          },
        ]}
      />

      {/* Center orb */}
      <Animated.View style={[styles.orb, { opacity: pulseAnim }]}>
        <LinearGradient
          colors={[moodColor, moodColor + '40']}
          style={styles.orbGradient}
        >
          <Ionicons name="musical-notes" size={36} color="#FFF" />
        </LinearGradient>
      </Animated.View>

      {/* Mood label */}
      <Text style={[styles.moodLabel, { color: moodColor }]}>
        {selectedMatch?.label || 'Generating'}
      </Text>
      <Text style={styles.subLabel}>Creating your soundtrack</Text>

      {/* Progress text */}
      <Text style={styles.progressText}>
        {generationProgress || 'Connecting to AI Brain...'}
      </Text>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <LinearGradient
            colors={[moodColor, moodColor + 'AA']}
            style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={styles.progressPercent}>
          {currentStep + 1} / {totalSteps} · {instrumentNames[currentStep]}
        </Text>
      </View>

      {/* Waveform bars */}
      <View style={styles.barsContainer}>
        {barAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor: moodColor,
                transform: [{ scaleY: anim }],
                opacity: 0.4 + (i % 3) * 0.2,
              },
            ]}
          />
        ))}
      </View>

      {/* Skip button */}
      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <Ionicons name="play-skip-forward" size={14} color="#555" />
        <Text style={styles.skipText}>Skip & Use Samples</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  ring: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
  },
  orb: {
    marginBottom: 28,
  },
  orbGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodLabel: {
    fontSize: 26,
    fontFamily: theme.fonts?.heading || 'System',
    marginBottom: 4,
    textAlign: 'center',
  },
  subLabel: {
    fontSize: 13,
    fontFamily: theme.fonts?.body || 'System',
    color: '#666',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    fontFamily: theme.fonts?.body || 'System',
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 36,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressPercent: {
    fontSize: 11,
    fontFamily: theme.fonts?.body || 'System',
    color: '#555',
    letterSpacing: 0.5,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 50,
    gap: 2,
    marginBottom: 48,
  },
  bar: {
    width: 3,
    height: 50,
    borderRadius: 2,
  },
  skipButton: {
    position: 'absolute',
    bottom: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  skipText: {
    fontSize: 12,
    fontFamily: theme.fonts?.body || 'System',
    color: '#555',
    letterSpacing: 0.3,
  },
});

export default GeneratingScreen;
