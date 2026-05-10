import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import * as TFLiteService from '../services/TFLiteService';
import * as MoodMapper from '../services/MoodMapper';
import * as MagentaService from '../services/MagentaService';

import { PrimaryButton, IconButton } from '../components/ui/Button';
import { MoodBadge } from '../components/ui/MoodBadge';
import { StatChip } from '../components/ui/StatChip';
import { WaveformBars } from '../components/ui/WaveformBars';
import { colors, fonts, spacing, radius } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;
const { width } = Dimensions.get('window');
const PHOTO_HEIGHT = width * 0.85;
const HISTORY_KEY = 'photomusic_history';

export default function ResultScreen({ route, navigation }: Props) {
  const { imageUri } = route.params;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fadeIn = useRef(new Animated.Value(0)).current;

  const {
    status,
    isAnalysing,
    isGenerating,
    moodLabel,
    moodParams,
    audioPath,
    setStatus,
    setIsAnalysing,
    setIsGenerating,
    setImageUri,
    setMoodLabel,
    setMoodParams,
    setAudioPath,
  } = useAppStore();

  useEffect(() => {
    setImageUri(imageUri);
    setStatus('Ready to analyze');
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [imageUri]);

  const handleAnalyseAndGenerate = async () => {
    try {
      setIsAnalysing(true);
      setStatus('Identifying scene...');

      const labels = await TFLiteService.analyseImage(imageUri);

      const params = MoodMapper.getMoodParams(labels);
      setMoodLabel(params.moodLabel);
      setMoodParams(params);

      setIsAnalysing(false);
      setIsGenerating(true);
      setStatus(`Mood: ${params.moodLabel}. Generating track...`);

      await MagentaService.initMagenta();
      const sequence = await MagentaService.generateMusic(params);

      setStatus('Synthesizing audio...');
      const outputPath = `${FileSystem.cacheDirectory}generated_track_${Date.now()}.wav`;
      await MagentaService.noteSequenceToWav(sequence, outputPath);

      setAudioPath(outputPath);
      setStatus('Track generated');
    } catch (error) {
      console.error('Pipeline error:', error);
      setStatus('Generation failed');
      Alert.alert('Error', 'Something went wrong during generation.');
    } finally {
      setIsAnalysing(false);
      setIsGenerating(false);
    }
  };

  const playAudio = async () => {
    if (!audioPath) return;

    try {
      if (sound) {
        const audioStatus = await sound.getStatusAsync();
        if (audioStatus.isLoaded && audioStatus.isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
          return;
        }
        if (audioStatus.isLoaded) {
          await sound.playAsync();
          setIsPlaying(true);
          return;
        }
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioPath },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((s) => {
        if (s.isLoaded && s.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch {
      Alert.alert('Playback Error', 'Could not play the audio.');
    }
  };

  const saveResult = async () => {
    if (!audioPath) return;

    try {
      setStatus('Saving...');

      const { status: permission } =
        await MediaLibrary.requestPermissionsAsync();
      if (permission === 'granted') {
        const asset = await MediaLibrary.createAssetAsync(audioPath);
        await MediaLibrary.createAlbumAsync('PhotoMusic', asset, false);
      }

      const historyData = await AsyncStorage.getItem(HISTORY_KEY);
      const history = historyData ? JSON.parse(historyData) : [];

      const newItem = {
        id: Date.now().toString(),
        imageUri,
        moodLabel: moodLabel || 'Unknown',
        audioPath,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        HISTORY_KEY,
        JSON.stringify([newItem, ...history])
      );

      setStatus('Saved');
      Alert.alert('Saved', 'Track saved to your library.');
    } catch {
      Alert.alert('Error', 'Failed to save.');
    } finally {
      setStatus('Ready');
    }
  };

  const isPipelineRunning = isAnalysing || isGenerating;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo with vignette */}
        <Animated.View style={[styles.photoContainer, { opacity: fadeIn }]}>
          <Image
            source={{ uri: imageUri }}
            style={styles.photo}
            resizeMode="cover"
          />
          {/* Vignette overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(8,12,20,0.6)']}
            style={styles.vignette}
          />

          {/* Mood badge */}
          {moodLabel && (
            <MoodBadge mood={moodLabel} style={styles.moodBadge} />
          )}

          {/* Back button */}
          <View style={styles.photoTopBar}>
            <IconButton
              onPress={() => navigation.goBack()}
              variant="ghost"
              size={40}
            >
              <Ionicons name="arrow-back" size={20} color={colors.white} />
            </IconButton>
          </View>
        </Animated.View>

        {/* Content below photo */}
        <View style={styles.content}>
          {/* Status */}
          <Text style={styles.statusText}>{status}</Text>

          {/* Stat chips */}
          {moodParams && (
            <View style={styles.chipRow}>
              <StatChip label={`${moodParams.tempo} BPM`} />
              <StatChip
                label={`${moodParams.key} ${moodParams.scale}`}
                style={{ marginLeft: spacing.sm }}
              />
            </View>
          )}

          {/* Waveform */}
          <View style={styles.waveformSection}>
            <WaveformBars
              isActive={isPipelineRunning || isPlaying}
              barCount={40}
              height={72}
            />
          </View>

          {/* Generate button */}
          <PrimaryButton
            label={
              isPipelineRunning
                ? 'Generating...'
                : audioPath
                ? 'Regenerate Track'
                : 'Generate Track'
            }
            onPress={handleAnalyseAndGenerate}
            disabled={isPipelineRunning}
            icon={
              <Ionicons
                name="sparkles"
                size={18}
                color={isPipelineRunning ? colors.textMuted : colors.black}
              />
            }
          />

          {/* Play + Save buttons */}
          {audioPath && (
            <View style={styles.actionRow}>
              <IconButton
                onPress={playAudio}
                variant="teal"
                size={56}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={24}
                  color={colors.accentTeal}
                />
              </IconButton>

              <IconButton
                onPress={saveResult}
                variant="amber"
                size={56}
                style={{ marginLeft: spacing.base }}
              >
                <Ionicons
                  name="download-outline"
                  size={22}
                  color={colors.accentAmber}
                />
              </IconButton>
            </View>
          )}

          {/* New analysis link */}
          <View style={styles.newAnalysisLink}>
            <Text
              onPress={() => navigation.navigate('Home')}
              style={styles.newAnalysisText}
            >
              Start New Analysis
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  photoContainer: {
    width,
    height: PHOTO_HEIGHT,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  vignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PHOTO_HEIGHT * 0.5,
  },
  photoTopBar: {
    position: 'absolute',
    top: 48,
    left: spacing.base,
  },
  moodBadge: {
    position: 'absolute',
    bottom: spacing.base,
    left: spacing.base,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  statusText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.3,
    marginBottom: spacing.base,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  waveformSection: {
    marginBottom: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  newAnalysisLink: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  newAnalysisText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
});
