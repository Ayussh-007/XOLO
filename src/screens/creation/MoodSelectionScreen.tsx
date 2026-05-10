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
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import theme from '../../theme/theme';
import { MoodMatch } from '../../api/brainApi';

type Props = NativeStackScreenProps<RootStackParamList, 'MoodSelection'>;

const MoodSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { matches, setSelectedMatch } = useAppStore();
  const { imageUri } = route.params;

  const handleSelect = (match: MoodMatch) => {
    if (match) {
      setSelectedMatch(match);
      navigation.navigate('Generating');
    }
  };

  // Safety check for empty matches
  if (!matches || matches.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FFF' }}>No moods found. Please check your AI Brain connection.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={{ color: theme.colors?.accentTeal || '#00D4B1' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Image Preview */}
      {imageUri && (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.bgImage} 
          blurRadius={15} 
        />
      )}
      <LinearGradient colors={['rgba(0,0,0,0.7)', '#000']} style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.scrollBody}>
        <View style={styles.header}>
          <Text style={styles.title}>CHOOSE YOUR VIBE</Text>
          <Text style={styles.subtitle}>
            CLIP analyzed your photo and found {matches.length} musical moods.
          </Text>
        </View>

        <View style={styles.cardContainer}>
          {matches.map((match, index) => (
            <TouchableOpacity 
              key={match.id || `mood_${index}`} 
              activeOpacity={0.9} 
              onPress={() => handleSelect(match)} 
              style={styles.card}
            >
              <LinearGradient colors={['#1A1A1A', '#0D0D0D']} style={styles.cardGradient}>
                <View style={styles.cardHeader}>
                  <Text style={styles.matchText}>{Math.round(match.confidence || 0)}% MATCH</Text>
                  <View style={[styles.dot, { backgroundColor: match.dna?.color || '#00D4B1' }]} />
                </View>
                
                <Text style={styles.moodLabel}>{match.label || 'Unknown Vibe'}</Text>
                <Text style={styles.moodDesc}>{match.description || 'AI composition generated.'}</Text>
                
                <View style={styles.dnaFooter}>
                  <View style={styles.dnaBadge}>
                    <Ionicons name="musical-note" size={12} color={match.dna?.color || theme.colors?.accentTeal || '#00D4B1'} />
                    <Text style={[styles.dnaBadgeText, { color: match.dna?.color || theme.colors?.accentTeal || '#00D4B1' }]}>
                      {match.dna?.key || 'C'} {(match.dna?.scale || 'major').replace('_', ' ')}
                    </Text>
                  </View>
                  <View style={styles.dnaBadge}>
                    <Ionicons name="pulse" size={12} color="#AAA" />
                    <Text style={[styles.dnaBadgeText, { color: '#AAA' }]}>
                      {match.dna?.bpm || 80} BPM
                    </Text>
                  </View>
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
  bgImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.4 },
  overlay: { ...StyleSheet.absoluteFillObject },
  scrollBody: { paddingTop: 80, paddingBottom: 40, paddingHorizontal: 24 },
  header: { marginBottom: 40 },
  title: { fontSize: 12, fontFamily: theme.fonts?.heading || 'System', color: '#00D4B1', letterSpacing: 4, marginBottom: 8 },
  subtitle: { fontSize: 24, fontFamily: theme.fonts?.heading || 'System', color: '#FFF', lineHeight: 32 },
  cardContainer: { gap: 20 },
  card: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardGradient: { padding: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  matchText: { fontSize: 10, fontFamily: theme.fonts?.body || 'System', color: '#888', letterSpacing: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  moodLabel: { fontSize: 24, fontFamily: theme.fonts?.heading || 'System', color: '#FFF', marginBottom: 8 },
  moodDesc: { fontSize: 14, fontFamily: theme.fonts?.body || 'System', color: '#AAA', marginBottom: 20, lineHeight: 20 },
  dnaFooter: { flexDirection: 'row', gap: 8, marginTop: 8 },
  dnaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  dnaBadgeText: { fontSize: 10, fontFamily: theme.fonts?.heading || 'System', letterSpacing: 1, textTransform: 'uppercase' },
  backLink: { marginTop: 24, padding: 12 },
});

export default MoodSelectionScreen;
