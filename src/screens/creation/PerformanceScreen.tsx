import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Pressable,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { useAppStore } from '../../store/useAppStore';
import theme from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getInstrumentNames, TILES_PER_TRACK, TILE_DURATION_MS, INSTRUMENT_COUNT } from '../../api/aceStepApi';
import { FALLBACK_AUDIO_URLS } from '../../utils/audioUtils';

const { width } = Dimensions.get('window');
const GRID_PADDING = 20;
const GRID_GAP = 10;
const PAD_SIZE = (width - GRID_PADDING * 2 - GRID_GAP * 3) / 4;

const INSTRUMENT_ICONS: string[] = ['musical-notes', 'radio', 'disc'];

// Scale-based suggested orders — musically logical sequences
const SCALE_ORDERS: Record<string, number[]> = {
  minor_pentatonic: [0, 2, 4, 1, 3, 5, 6, 8, 10, 7, 9, 11],
  major_pentatonic: [0, 1, 2, 4, 3, 5, 7, 6, 8, 9, 11, 10],
  phrygian:         [0, 3, 1, 4, 2, 5, 6, 9, 7, 10, 8, 11],
  lydian:           [0, 2, 4, 6, 1, 3, 5, 7, 8, 10, 9, 11],
  aeolian:          [0, 2, 4, 1, 3, 5, 7, 6, 8, 10, 9, 11],
  major:            [0, 2, 4, 5, 7, 9, 11, 1, 3, 6, 8, 10],
  minor:            [0, 2, 3, 5, 7, 8, 10, 1, 4, 6, 9, 11],
  default:          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

const PerformanceScreen = () => {
  const {
    selectedMatch,
    generatedAudio,
    useFallback,
    currentInstrumentIndex,
    setCurrentInstrumentIndex,
  } = useAppStore();

  const [isAutomate, setIsAutomate] = useState(false);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [shuffleMap, setShuffleMap] = useState<number[]>(() =>
    Array.from({ length: TILES_PER_TRACK }, (_, i) => i)
  );
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [isLayered, setIsLayered] = useState(false);

  const autoTimer = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const soundRefs = useRef<(Audio.Sound | null)[]>([null, null, null]);
  const padScales = useRef(
    Array.from({ length: TILES_PER_TRACK }, () => new Animated.Value(1))
  ).current;

  const instrumentNames = getInstrumentNames();
  const dna = selectedMatch?.dna;
  const moodColor = dna?.color || theme.colors?.accentTeal || '#00D4B1';
  const moodId = selectedMatch?.id || 'unknown';

  // Get suggested play order based on scale
  const suggestedOrder = SCALE_ORDERS[dna?.scale || 'default'] || SCALE_ORDERS.default;

  useEffect(() => {
    isMounted.current = true;
    setupAudio();
    return () => {
      isMounted.current = false;
      stopAutoPlay();
      unloadAllSounds();
    };
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.setIsEnabledAsync(true);
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Audio setup failed:', error);
    }
  };

  const unloadAllSounds = async () => {
    for (let i = 0; i < soundRefs.current.length; i++) {
      try {
        if (soundRefs.current[i]) {
          await soundRefs.current[i]!.unloadAsync();
          soundRefs.current[i] = null;
        }
      } catch {
        // ignore
      }
    }
  };

  const unloadSound = async (index: number) => {
    try {
      if (soundRefs.current[index]) {
        await soundRefs.current[index]!.unloadAsync();
        soundRefs.current[index] = null;
      }
    } catch {
      // ignore
    }
  };

  // Animate pad press
  const animatePad = (tileIndex: number) => {
    Animated.sequence([
      Animated.spring(padScales[tileIndex], {
        toValue: 0.88,
        useNativeDriver: true,
        speed: 100,
      }),
      Animated.spring(padScales[tileIndex], {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 10,
      }),
    ]).start();
  };

  /**
   * Plays a tile on one or all instrument tracks.
   */
  const playTile = useCallback(async (tileIndex: number) => {
    if (!isMounted.current) return;

    // The shuffleMap remaps visual position -> audio segment
    const audioSegment = shuffleMap[tileIndex];

    setActivePad(tileIndex);
    animatePad(tileIndex);
    setTimeout(() => {
      if (isMounted.current) setActivePad(null);
    }, 400);

    // If guide mode, advance the guide step
    if (showGuide) {
      setGuideStep((prev) => (prev + 1) % TILES_PER_TRACK);
    }

    if (isLayered) {
      // Play on ALL instruments simultaneously
      for (let inst = 0; inst < INSTRUMENT_COUNT; inst++) {
        playSoundForInstrument(audioSegment, inst);
      }
    } else {
      // Play on current instrument only
      await playSoundForInstrument(audioSegment, currentInstrumentIndex);
    }
  }, [shuffleMap, currentInstrumentIndex, isLayered, showGuide, moodId, generatedAudio, useFallback]);

  const playSoundForInstrument = async (audioSegment: number, instrumentIdx: number) => {
    const audioKey = `${moodId}_inst${instrumentIdx}`;
    const filePath = generatedAudio[audioKey];
    const hasAudio = !!filePath && !useFallback;

    try {
      await unloadSound(instrumentIdx);

      if (hasAudio) {
        const positionMs = audioSegment * TILE_DURATION_MS;
        const { sound } = await Audio.Sound.createAsync(
          { uri: filePath },
          {
            shouldPlay: true,
            positionMillis: positionMs,
            isLooping: false,
          }
        );

        soundRefs.current[instrumentIdx] = sound;

        setTimeout(async () => {
          try {
            if (soundRefs.current[instrumentIdx] === sound) {
              await sound.pauseAsync();
            }
          } catch { /* ignore */ }
        }, TILE_DURATION_MS);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
            if (soundRefs.current[instrumentIdx] === sound) {
              soundRefs.current[instrumentIdx] = null;
            }
          }
        });
      } else {
        // Fallback samples
        const instrumentName = instrumentNames[instrumentIdx] || 'Piano & Strings';
        const urls = FALLBACK_AUDIO_URLS[instrumentName] || FALLBACK_AUDIO_URLS['Piano & Strings'];
        const url = urls[audioSegment % urls.length];
        const pitch = getPitchShift(audioSegment);

        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          {
            shouldPlay: true,
            rate: Math.max(0.2, Math.min(pitch, 4.0)),
            shouldCorrectPitch: false,
          }
        );

        soundRefs.current[instrumentIdx] = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
            if (soundRefs.current[instrumentIdx] === sound) {
              soundRefs.current[instrumentIdx] = null;
            }
          }
        });
      }
    } catch (error) {
      console.log('Audio play error:', error);
    }
  };

  const getPitchShift = (index: number): number => {
    const SCALES: Record<string, number[]> = {
      major: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19],
      minor: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19],
      minor_pentatonic: [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24, 27],
      major_pentatonic: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26],
    };
    const KEY_BASE: Record<string, number> = {
      'C': 60, 'C#': 61, 'D': 62, 'D#': 63, 'E': 64, 'F': 65,
      'F#': 66, 'G': 67, 'G#': 68, 'A': 69, 'A#': 70, 'B': 71,
    };
    const scale = SCALES[dna?.scale || 'major'] || SCALES.major;
    const base = KEY_BASE[dna?.key || 'C'] || 60;
    const pitch = base + scale[index % scale.length];
    return Math.pow(2, (pitch - 60) / 12);
  };

  // Shuffle pads
  const shufflePads = () => {
    stopAutoPlay();
    const arr = Array.from({ length: TILES_PER_TRACK }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffleMap(arr);

    // Animate all pads
    padScales.forEach((scale) => {
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.8, duration: 100, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 12 }),
      ]).start();
    });
  };

  // Reset pad order
  const resetPadOrder = () => {
    setShuffleMap(Array.from({ length: TILES_PER_TRACK }, (_, i) => i));
  };

  const startAutoPlay = () => {
    setIsAutomate(true);
    const bpm = dna?.bpm || 80;
    const interval = (60 / bpm) * 1000;

    let step = 0;
    const playTick = () => {
      if (!isMounted.current) return;

      // Auto-jam follows the suggested order
      const orderIndex = step % TILES_PER_TRACK;
      const tileToPlay = suggestedOrder[orderIndex];
      playTile(tileToPlay);
      step++;

      const nextTick = Math.random() > 0.2 ? interval : interval * 0.5;
      autoTimer.current = setTimeout(playTick, nextTick);
    };

    playTick();
  };

  const stopAutoPlay = () => {
    setIsAutomate(false);
    if (autoTimer.current) {
      clearTimeout(autoTimer.current);
      autoTimer.current = null;
    }
  };

  const toggleAutomate = () => {
    if (isAutomate) stopAutoPlay();
    else startAutoPlay();
  };

  const switchInstrument = async (index: number) => {
    if (index === currentInstrumentIndex) return;
    stopAutoPlay();
    await unloadAllSounds();
    setActivePad(null);
    setCurrentInstrumentIndex(index);
  };

  // Find what position in suggested order this tile index appears
  const getGuideNumber = (tileIndex: number): number | null => {
    if (!showGuide) return null;
    const pos = suggestedOrder.indexOf(shuffleMap[tileIndex]);
    return pos >= 0 ? pos + 1 : null;
  };

  const isNextInGuide = (tileIndex: number): boolean => {
    if (!showGuide) return false;
    return shuffleMap[tileIndex] === suggestedOrder[guideStep];
  };

  const noteLabels = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C²', 'D²', 'E²', 'F²', 'G²'];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors?.background || '#000' }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.moodLabel, { color: '#FFF' }]}>
            {selectedMatch?.label || 'Performance'}
          </Text>
          <Text style={[styles.description, { color: '#777' }]}>
            {useFallback ? 'Sample mode' : 'AI-generated'}
            {isLayered ? ' · Layered' : ` · ${instrumentNames[currentInstrumentIndex]}`}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {!useFallback && (
            <View style={[styles.aiBadge, { backgroundColor: moodColor + '18', borderColor: moodColor + '35' }]}>
              <Ionicons name="sparkles" size={11} color={moodColor} />
              <Text style={[styles.aiBadgeText, { color: moodColor }]}>AI</Text>
            </View>
          )}
        </View>
      </View>

      {/* Track Selector (Instrument Switcher) */}
      <View style={styles.trackRow}>
        {instrumentNames.map((name, i) => {
          const isActive = i === currentInstrumentIndex;
          const instAudioKey = `${moodId}_inst${i}`;
          const hasThisAudio = !!generatedAudio[instAudioKey] && !useFallback;

          return (
            <Pressable
              key={i}
              onPress={() => switchInstrument(i)}
              style={[
                styles.trackButton,
                {
                  backgroundColor: isActive ? moodColor + '20' : 'rgba(255,255,255,0.03)',
                  borderColor: isActive ? moodColor + '50' : 'rgba(255,255,255,0.06)',
                },
              ]}
            >
              <Ionicons
                name={INSTRUMENT_ICONS[i] as any}
                size={14}
                color={isActive ? moodColor : '#555'}
              />
              <Text
                style={[styles.trackText, { color: isActive ? moodColor : '#777' }]}
                numberOfLines={1}
              >
                {name}
              </Text>
              {hasThisAudio && (
                <View style={[styles.audioDot, { backgroundColor: moodColor }]} />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Action Row: Shuffle, Guide, Layer */}
      <View style={styles.actionRow}>
        <Pressable
          style={[styles.actionButton, { borderColor: moodColor + '30' }]}
          onPress={shufflePads}
        >
          <Ionicons name="shuffle" size={16} color={moodColor} />
          <Text style={[styles.actionText, { color: moodColor }]}>Shuffle</Text>
        </Pressable>

        <Pressable
          style={[
            styles.actionButton,
            showGuide && { backgroundColor: moodColor + '18' },
            { borderColor: moodColor + '30' },
          ]}
          onPress={() => { setShowGuide(!showGuide); setGuideStep(0); }}
        >
          <Ionicons name="compass" size={16} color={showGuide ? moodColor : '#666'} />
          <Text style={[styles.actionText, { color: showGuide ? moodColor : '#666' }]}>Guide</Text>
        </Pressable>

        <Pressable
          style={[
            styles.actionButton,
            isLayered && { backgroundColor: moodColor + '18' },
            { borderColor: moodColor + '30' },
          ]}
          onPress={() => setIsLayered(!isLayered)}
        >
          <Ionicons name="layers" size={16} color={isLayered ? moodColor : '#666'} />
          <Text style={[styles.actionText, { color: isLayered ? moodColor : '#666' }]}>Layer</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, { borderColor: 'rgba(255,255,255,0.06)' }]}
          onPress={resetPadOrder}
        >
          <Ionicons name="refresh" size={16} color="#555" />
          <Text style={[styles.actionText, { color: '#555' }]}>Reset</Text>
        </Pressable>
      </View>

      {/* Pad Grid — 4×3 */}
      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {[...Array(TILES_PER_TRACK)].map((_, i) => {
            const isActive = activePad === i;
            const guideNum = getGuideNumber(i);
            const isNext = isNextInGuide(i);

            return (
              <Animated.View
                key={i}
                style={[
                  styles.padWrapper,
                  { transform: [{ scale: padScales[i] }] },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => playTile(i)}
                  style={[
                    styles.pad,
                    {
                      borderColor: isNext
                        ? '#FFF'
                        : isActive
                        ? moodColor
                        : moodColor + '25',
                      borderWidth: isNext ? 2 : 1,
                    },
                    isActive && {
                      shadowColor: moodColor,
                      shadowOpacity: 0.6,
                      shadowRadius: 20,
                      elevation: 24,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isActive
                        ? [moodColor, moodColor + 'BB']
                        : isNext
                        ? [moodColor + '30', moodColor + '10']
                        : ['#181818', '#0E0E0E']
                    }
                    style={styles.padGradient}
                  >
                    {/* Guide number badge */}
                    {guideNum !== null && (
                      <View
                        style={[
                          styles.guideBadge,
                          {
                            backgroundColor: isNext ? moodColor : 'rgba(255,255,255,0.08)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.guideBadgeText,
                            { color: isNext ? '#FFF' : '#666' },
                          ]}
                        >
                          {guideNum}
                        </Text>
                      </View>
                    )}

                    {/* Glow dot */}
                    <View
                      style={[
                        styles.innerGlow,
                        isActive && { backgroundColor: '#FFFFFF60', width: '35%', height: '35%' },
                      ]}
                    />

                    {/* Note label */}
                    <Text
                      style={[
                        styles.tileLabel,
                        {
                          color: isActive
                            ? '#FFF'
                            : isNext
                            ? moodColor
                            : moodColor + '60',
                        },
                      ]}
                    >
                      {noteLabels[shuffleMap[i]] || `${shuffleMap[i] + 1}`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.autoButton,
            isAutomate && { backgroundColor: moodColor, borderColor: moodColor },
          ]}
          onPress={toggleAutomate}
        >
          <Ionicons
            name={isAutomate ? 'stop' : 'play'}
            size={22}
            color={isAutomate ? 'white' : moodColor}
          />
          <Text
            style={[
              styles.autoText,
              { color: isAutomate ? 'white' : moodColor },
            ]}
          >
            {isAutomate ? 'STOP AUTO-JAM' : 'AUTO-JAM'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.hint}>
          {showGuide
            ? `Follow the guide · Step ${guideStep + 1}/${TILES_PER_TRACK}`
            : isAutomate
            ? 'AI is playing · Join in!'
            : 'Tap pads to play · Try Guide mode'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 52,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    paddingTop: 2,
  },
  moodLabel: {
    fontSize: 24,
    fontFamily: theme.fonts?.heading || 'System',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    fontFamily: theme.fonts?.body || 'System',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    gap: 3,
  },
  aiBadgeText: {
    fontSize: 10,
    fontFamily: theme.fonts?.heading || 'System',
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // Track selector
  trackRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 12,
  },
  trackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  trackText: {
    fontSize: 9,
    fontFamily: theme.fonts?.heading || 'System',
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  audioDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 14,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  actionText: {
    fontSize: 10,
    fontFamily: theme.fonts?.body || 'System',
    fontWeight: '500',
  },

  // Grid
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: GRID_PADDING,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: GRID_GAP,
  },
  padWrapper: {
    width: PAD_SIZE,
    height: PAD_SIZE,
  },
  pad: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  padGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  guideBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: theme.fonts?.heading || 'System',
  },
  innerGlow: {
    width: '22%',
    height: '22%',
    borderRadius: 100,
    backgroundColor: '#FFFFFF06',
    marginBottom: 4,
  },
  tileLabel: {
    fontSize: 12,
    fontFamily: theme.fonts?.heading || 'System',
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Controls
  controls: {
    paddingBottom: 40,
    paddingTop: 12,
    alignItems: 'center',
  },
  autoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#161616',
    marginBottom: 12,
    gap: 8,
  },
  autoText: {
    fontSize: 12,
    fontFamily: theme.fonts?.heading || 'System',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  hint: {
    fontSize: 10,
    color: '#444',
    fontFamily: theme.fonts?.body || 'System',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});

export default PerformanceScreen;
