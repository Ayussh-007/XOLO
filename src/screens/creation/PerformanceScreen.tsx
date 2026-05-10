import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { useAppStore } from '../../store/useAppStore';
import theme from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PAD_SIZE = (width - 64) / 3;

const SCALES: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19],
  minor: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19],
  minor_pentatonic: [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24, 27],
  major_pentatonic: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26],
  phrygian: [0, 1, 3, 5, 7, 8, 10, 12, 13, 15, 17, 19],
  lydian: [0, 2, 4, 6, 7, 9, 11, 12, 14, 16, 18, 19],
  aeolian: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19],
};

const KEY_BASE: Record<string, number> = {
  'C': 60, 'C#': 61, 'Db': 61, 'D': 62, 'D#': 63, 'Eb': 63,
  'E': 64, 'F': 65, 'F#': 66, 'Gb': 66, 'G': 67, 'G#': 68,
  'Ab': 68, 'A': 69, 'A#': 70, 'Bb': 70, 'B': 71,
};

const PerformanceScreen = () => {
  const { selectedMatch } = useAppStore();
  const [isAutomate, setIsAutomate] = useState(false);
  const [activePad, setActivePad] = useState<number | null>(null);
  const autoTimer = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  const dna = selectedMatch?.dna;
  const moodColor = dna?.color || theme.colors?.accentTeal || '#00D4B1';

  useEffect(() => {
    isMounted.current = true;
    setupAudio();
    return () => {
      isMounted.current = false;
      stopAutoPlay();
      Audio.setIsEnabledAsync(false).catch(() => {}); // Safely release audio resources
    };
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldRouteThroughEarpieceAndroid: false,
        playThroughEarpieceAndroid: false, // Fix for some Android devices
      });
    } catch (error) {
      console.error('Audio setup failed:', error);
    }
  };

  const getNotePitch = (index: number) => {
    if (!dna) return 60;
    const scale = SCALES[dna.scale] || SCALES.major;
    const base = KEY_BASE[dna.key] || 60;
    return base + scale[index % scale.length];
  };

  const playNote = async (index: number) => {
    if (!isMounted.current) return;
    
    setActivePad(index);
    setTimeout(() => {
      if (isMounted.current) setActivePad(null);
    }, 200);

    // Prototype note trigger
    console.log(`🎵 Trigger: Note ${getNotePitch(index)} (${dna?.instrument})`);
  };

  const startAutoPlay = () => {
    setIsAutomate(true);
    const bpm = dna?.bpm || 80;
    const interval = (60 / bpm) * 1000;
    
    const playTick = () => {
      if (!isMounted.current || !isAutomate) return;

      const nextIndex = Math.floor(Math.random() * 12);
      playNote(nextIndex);
      
      const nextTick = Math.random() > 0.3 ? interval : interval * 2;
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors?.background || '#000' }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={[styles.moodLabel, { color: '#FFF' }]}>{selectedMatch?.label || 'Mood Name'}</Text>
        <Text style={[styles.description, { color: '#888' }]}>{selectedMatch?.description || 'AI composition generated.'}</Text>
      </View>

      <View style={styles.grid}>
        {[...Array(12)].map((_, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.7}
            onPress={() => playNote(i)}
            style={[
              styles.pad,
              { borderColor: moodColor + '40' },
              activePad === i && { backgroundColor: moodColor, shadowColor: moodColor, elevation: 20 }
            ]}
          >
            <LinearGradient 
              colors={activePad === i ? [moodColor, moodColor] : ['#1A1A1A', '#0D0D0D']} 
              style={styles.padGradient}
            >
              <View style={[styles.innerGlow, activePad === i && { backgroundColor: '#FFFFFF40' }]} />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.autoButton, isAutomate && { backgroundColor: moodColor }]} 
          onPress={toggleAutomate}
        >
          <Ionicons 
            name={isAutomate ? "stop" : "play"} 
            size={24} 
            color={isAutomate ? "white" : moodColor} 
          />
          <Text style={[styles.autoText, { color: isAutomate ? 'white' : moodColor }]}>
            {isAutomate ? "STOP AUTO-JAM" : "START AUTO-JAM"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.hint}>
          {isAutomate ? "AI is playing... Join in!" : "Tap the pads to create your melody"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { paddingHorizontal: 32, marginBottom: 40 },
  moodLabel: { fontSize: 32, fontFamily: theme.fonts?.heading || 'System', marginBottom: 4 },
  description: { fontSize: 16, fontFamily: theme.fonts?.body || 'System' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 16, gap: 16 },
  pad: { width: PAD_SIZE, height: PAD_SIZE, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  padGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  innerGlow: { width: '40%', height: '40%', borderRadius: 100, backgroundColor: '#FFFFFF05' },
  controls: { position: 'absolute', bottom: 60, width: '100%', alignItems: 'center' },
  autoButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#1A1A1A', marginBottom: 20 },
  autoText: { fontSize: 14, fontFamily: theme.fonts?.heading || 'System', fontWeight: '700', marginLeft: 12, letterSpacing: 1 },
  hint: { fontSize: 12, color: '#666', fontFamily: theme.fonts?.body || 'System', textTransform: 'uppercase', letterSpacing: 2 }
});

export default PerformanceScreen;
