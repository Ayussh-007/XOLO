import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useIsFocused } from '@react-navigation/native';

interface HistoryItem {
  id: string;
  imageUri: string;
  moodLabel: string;
  audioPath: string;
  createdAt: string;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const isFocused = useIsFocused();

  const HISTORY_KEY = 'photomusic_history';

  useEffect(() => {
    if (isFocused) {
      loadHistory();
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [isFocused]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      if (data) {
        setHistory(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playSound = async (item: HistoryItem) => {
    try {
      // If already playing this one, stop it
      if (playingId === item.id && sound) {
        await sound.stopAsync();
        setPlayingId(null);
        return;
      }

      // Unload previous sound if any
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: item.audioPath },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setPlayingId(item.id);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
      <View style={styles.itemInfo}>
        <Text style={styles.moodLabel}>{item.moodLabel}</Text>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.playButton, playingId === item.id && styles.stopButton]} 
        onPress={() => playSound(item)}
      >
        <Text style={styles.playButtonText}>
          {playingId === item.id ? 'Stop' : 'Play'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {history.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No analysis history found.</Text>
          <Text style={styles.emptySubtext}>Analyze some instruments to see them here!</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  playButton: {
    backgroundColor: '#34C759',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  playButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
