import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { Card } from '../components/ui/Card';
import { IconButton } from '../components/ui/Button';
import { colors, fonts, spacing, radius } from '../theme/theme';

interface HistoryItem {
  id: string;
  imageUri: string;
  moodLabel: string;
  audioPath: string;
  createdAt: string;
}

const HISTORY_KEY = 'photomusic_history';

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const isFocused = useIsFocused();
  const fadeIn = useRef(new Animated.Value(0)).current;

  // Pulsing skeleton
  const skeletonOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonOpacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  };

  const playSound = async (item: HistoryItem) => {
    try {
      if (playingId === item.id && sound) {
        await sound.stopAsync();
        setPlayingId(null);
        return;
      }

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: item.audioPath },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingId(item.id);

      newSound.setOnPlaybackStatusUpdate((s) => {
        if (s.isLoaded && s.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Card style={styles.cardOverride}>
      {/* Thumbnail */}
      <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />

      {/* Info */}
      <View style={styles.itemInfo}>
        <Text style={styles.moodLabel}>
          {item.moodLabel.charAt(0).toUpperCase() + item.moodLabel.slice(1)}
        </Text>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Play button */}
      <IconButton
        onPress={() => playSound(item)}
        variant="teal"
        size={40}
      >
        <Ionicons
          name={playingId === item.id ? 'stop' : 'play'}
          size={16}
          color={colors.accentTeal}
        />
      </IconButton>
    </Card>
  );

  const renderSkeleton = () => (
    <Animated.View style={{ opacity: skeletonOpacity }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonThumb} />
          <View style={styles.skeletonTextBlock}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
          </View>
          <View style={styles.skeletonCircle} />
        </View>
      ))}
    </Animated.View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <Text style={styles.title}>Your Tracks</Text>
        {renderSkeleton()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={[styles.inner, { opacity: fadeIn }]}>
        <Text style={styles.title}>Your Tracks</Text>

        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            {/* Dim teal glow behind icon */}
            <View style={styles.emptyGlow} />
            <Ionicons name="camera" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No tracks yet</Text>
            <Text style={styles.emptySubtext}>
              Go make some noise.
            </Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={{ height: spacing.md }} />
            )}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
    letterSpacing: -0.3,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  cardOverride: {
    gap: spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  itemInfo: {
    flex: 1,
  },
  moodLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  dateText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
  },

  /* Empty state */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accentTeal,
    opacity: 0.06,
  },
  emptyTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  /* Skeleton loading */
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.base,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  skeletonThumb: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  skeletonTextBlock: {
    flex: 1,
    marginLeft: spacing.md,
  },
  skeletonLine: {
    height: 12,
    width: '60%',
    borderRadius: 6,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  skeletonLineShort: {
    width: '35%',
  },
  skeletonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
});
