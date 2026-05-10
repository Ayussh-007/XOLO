import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { theme } from '../../theme/theme';
import { MoodMatch } from '../../api/brainApi';

type Props = NativeStackScreenProps<RootStackParamList, 'MoodSelection'>;

const MoodSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { matches, setSelectedMatch } = useAppStore();
  const { imageUri } = route.params;

  const handleSelect = (match: MoodMatch) => {
    if (match) {
      setSelectedMatch(match);
      navigation.navigate('Performance');
    }
  };

  // Safety check for empty matches
  if (!matches || matches.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FFF' }}>No moods found. Please try again.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image source={{ uri: imageUri }} style={styles.bgImage} blurRadius={10} />
      <LinearGradient colors={['rgba(0,0,0,0.6)', '#000']} style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>CHOOSE YOUR VIBE</Text>
          <Text style={styles.subtitle}>CLIP analyzed your photo and found {matches.length} musical moods.</Text>
        </View>

        <View style={styles.cardContainer}>
          {matches.map((match, index) => (
            <TouchableOpacity 
              key={match.id || index} 
              activeOpacity={0.9} 
              onPress={() => handleSelect(match)} 
              style={styles.card}
            >
              <LinearGradient colors={['#1A1A1A', '#0D0D0D']} style={styles.cardGradient}>
                <View style={styles.cardHeader}>
                  <Text style={styles.matchText}>{match.confidence}% MATCH</Text>
                  <View style={[styles.dot, { backgroundColor: match.dna?.color || '#00D4B1' }]} />
                </View>
                <Text style={styles.moodLabel}>{match.label}</Text>
                <Text style={styles.moodDesc}>{match.description}</Text>
                <View style={styles.dnaFooter}>
                  <Text style={styles.dnaText}>
                    {match.dna?.key || 'C'} {(match.dna?.scale || 'major').replace('_', ' ')}
                  </Text>
                  <Text style={styles.dnaText}>{match.dna?.bpm || 80} BPM</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bgImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.5 },
  overlay: { ...StyleSheet.absoluteFillObject },
  scrollContent: { paddingTop: 80, paddingBottom: 40, paddingHorizontal: 24 },
  header: { marginBottom: 40 },
  title: { fontSize: 12, fontFamily: theme.fonts.heading, color: theme.colors.primary, letterSpacing: 4, marginBottom: 8 },
  subtitle: { fontSize: 24, fontFamily: theme.fonts.heading, color: '#FFF', lineHeight: 32 },
  cardContainer: { gap: 20 },
  card: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardGradient: { padding: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  matchText: { fontSize: 10, fontFamily: theme.fonts.body, color: '#888', letterSpacing: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  moodLabel: { fontSize: 24, fontFamily: theme.fonts.heading, color: '#FFF', marginBottom: 8 },
  moodDesc: { fontSize: 14, fontFamily: theme.fonts.body, color: '#AAA', marginBottom: 20, lineHeight: 20 },
  dnaFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
  dnaText: { fontSize: 12, fontFamily: theme.fonts.body, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
});

export default MoodSelectionScreen;
