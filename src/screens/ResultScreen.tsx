import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import * as TFLiteService from '../services/TFLiteService';
import * as MoodMapper from '../services/MoodMapper';
import * as MagentaService from '../services/MagentaService';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

const { width } = Dimensions.get('window');
const HISTORY_KEY = 'photomusic_history';

export default function ResultScreen({ route, navigation }: Props) {
  const { imageUri } = route.params;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  // Zustand Store State
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
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [imageUri]);

  const handleAnalyseAndGenerate = async () => {
    try {
      // 1. Initial State
      setIsAnalysing(true);
      setStatus('Identifying instruments...');

      // 2. Visual Analysis (TFLite)
      const labels = await TFLiteService.analyseImage(imageUri);
      
      // 3. Mood Mapping
      const params = MoodMapper.getMoodParams(labels);
      setMoodLabel(params.moodLabel);
      setMoodParams(params);
      
      setIsAnalysing(false);
      setIsGenerating(true);
      setStatus(`Detected ${params.moodLabel} mood. Generating music...`);

      // 4. Music Generation
      await MagentaService.initMagenta();
      
      const sequence = await MagentaService.generateMusic(params);
      
      // 5. Synthesis
      setStatus('Synthesizing audio...');
      const outputPath = `${FileSystem.cacheDirectory}generated_track_${Date.now()}.wav`;
      await MagentaService.noteSequenceToWav(sequence, outputPath);
      
      // 6. Finalize
      setAudioPath(outputPath);
      setStatus('Generation complete!');
    } catch (error) {
      console.error('Pipeline error:', error);
      setStatus('Error in AI pipeline');
      Alert.alert('Error', 'Something went wrong during analysis or generation.');
    } finally {
      setIsAnalysing(false);
      setIsGenerating(false);
    }
  };

  const playAudio = async () => {
    if (!audioPath) return;

    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await sound.stopAsync();
          return;
        }
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioPath },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      Alert.alert('Playback Error', 'Could not play the generated audio.');
    }
  };

  const saveResult = async () => {
    if (!audioPath) return;

    try {
      setStatus('Saving to library...');
      
      // 1. Save to Media Library
      const { status: permission } = await MediaLibrary.requestPermissionsAsync();
      if (permission === 'granted') {
        const asset = await MediaLibrary.createAssetAsync(audioPath);
        await MediaLibrary.createAlbumAsync('XOLO', asset, false);
      }

      // 2. Save to History (AsyncStorage)
      const historyData = await AsyncStorage.getItem(HISTORY_KEY);
      const history = historyData ? JSON.parse(historyData) : [];
      
      const newItem = {
        id: Date.now().toString(),
        imageUri,
        moodLabel: moodLabel || 'Unknown',
        audioPath,
        createdAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([newItem, ...history]));
      
      setStatus('Saved successfully!');
      Alert.alert('Success', 'Music saved to library and history.');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save the result.');
    } finally {
      setStatus('Ready');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        </View>

        <View style={styles.content}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>System Status</Text>
            <Text style={styles.statusText}>{status}</Text>
          </View>

          {moodParams && (
            <View style={styles.moodDetailCard}>
              <Text style={styles.moodLabelText}>Mood: {moodParams.moodLabel.toUpperCase()}</Text>
              <View style={styles.moodParamsRow}>
                <Text style={styles.moodParamItem}>Tempo: {moodParams.tempo} BPM</Text>
                <Text style={styles.moodParamItem}>Key: {moodParams.key} {moodParams.scale}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.analyseButton,
              (isAnalysing || isGenerating) && styles.disabledButton,
            ]}
            onPress={handleAnalyseAndGenerate}
            disabled={isAnalysing || isGenerating}
          >
            {isAnalysing || isGenerating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.analyseButtonText}>Analyse & Generate</Text>
            )}
          </TouchableOpacity>

          <View style={styles.waveformContainer}>
            <Text style={styles.sectionTitle}>Audio Waveform</Text>
            <View style={styles.waveformBars}>
              {[...Array(20)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveformBar,
                    { 
                      height: audioPath ? Math.floor(Math.random() * 40) + 10 : 4,
                      backgroundColor: audioPath ? '#007AFF' : '#ccc' 
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.playButton, !audioPath && styles.disabledActionButton]}
              onPress={playAudio}
              disabled={!audioPath}
            >
              <Text style={styles.actionButtonText}>Play</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton, !audioPath && styles.disabledActionButton]}
              onPress={saveResult}
              disabled={!audioPath}
            >
              <Text style={styles.actionButtonText}>Save & Sync</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.resetButtonText}>Start New Analysis</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    width: width,
    height: width * 0.75,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
    flex: 1,
  },
  statusContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  statusTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#007AFF',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  moodDetailCard: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  moodLabelText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  moodParamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodParamItem: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  analyseButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  analyseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  waveformContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#34C759',
  },
  saveButton: {
    backgroundColor: '#5856D6',
  },
  disabledActionButton: {
    backgroundColor: '#E5E5EA',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  resetButton: {
    padding: 15,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
