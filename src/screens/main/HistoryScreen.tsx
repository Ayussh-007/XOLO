import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../navigation/types';
import { useThemeColors } from '../../hooks/useThemeColors';
import { fonts, spacing, radius } from '../../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;
const HISTORY_KEY = 'photomusic_history';

export default function HistoryScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      if (data) setHistory(JSON.parse(data));
    } catch {
      Alert.alert('Error', 'Could not load history.');
    }
  };

  const clearHistory = async () => {
    Alert.alert('Clear History', 'Delete all saved sessions?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem(HISTORY_KEY);
          setHistory([]);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
      <Image source={{ uri: item.imageUri }} style={styles.thumb} />
      <View style={styles.cardInfo}>
        <Text style={[styles.moodLabel, { color: colors.textPrimary }]}>{item.moodLabel}</Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>History</Text>
        <Pressable onPress={clearHistory}>
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </Pressable>
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="musical-notes-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No saved sessions yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.base },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.displayBold, fontSize: 24 },
  list: { padding: spacing.lg },
  card: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.md },
  thumb: { width: 60, height: 60, borderRadius: radius.sm },
  cardInfo: { flex: 1, marginLeft: spacing.base },
  moodLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, marginBottom: 2 },
  date: { fontFamily: fonts.bodyRegular, fontSize: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontFamily: fonts.bodyRegular, fontSize: 14, marginTop: spacing.base },
});
