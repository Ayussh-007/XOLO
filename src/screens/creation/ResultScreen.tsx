import React, { useEffect, useRef } from 'react';
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

import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import * as brainApi from '../../api/brainApi';

import { PrimaryButton, IconButton } from '../../components/ui/Button';
import { WaveformBars } from '../../components/ui/WaveformBars';
import theme from '../../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;
const { width } = Dimensions.get('window');
const PHOTO_HEIGHT = width * 0.85;

export default function ResultScreen({ route, navigation }: Props) {
  const { imageUri } = route.params;
  const fadeIn = useRef(new Animated.Value(0)).current;

  const { status, isAnalysing, setStatus, setIsAnalysing, setImageUri, setMatches } = useAppStore();

  useEffect(() => {
    if (imageUri) {
      setImageUri(imageUri);
      setStatus('Ready to analyze');
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  }, [imageUri]);

  const handleAnalyseWithLaptop = async () => {
    try {
      setIsAnalysing(true);
      setStatus('Connecting to AI Brain...');
      const matches = await brainApi.analyzeImageWithLaptop(imageUri);
      if (matches && matches.length > 0) {
        setMatches(matches);
        setStatus('Analysis complete');
        navigation.navigate('MoodSelection', { imageUri });
      }
    } catch (error: any) {
      setStatus('Analysis failed');
      Alert.alert('Brain Error', error.message || 'Check your laptop server.');
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.photoContainer, { opacity: fadeIn }]}>
          <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(8,12,20,0.6)']} style={styles.vignette} />
          <View style={styles.photoTopBar}>
            <IconButton onPress={() => navigation.goBack()} variant="ghost" size={40}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.white} />
            </IconButton>
          </View>
        </Animated.View>

        <View style={styles.screenBody}>
          <Text style={[styles.title, { color: theme.colors.white }]}>PHOTO READY</Text>
          <Text style={[styles.statusText, { color: theme.colors.textMuted }]}>{status || 'Ready'}</Text>
          <View style={styles.waveformSection}>
            <WaveformBars isActive={isAnalysing} barCount={40} height={72} />
          </View>
          <PrimaryButton
            label={isAnalysing ? 'Analyzing...' : 'Analyze with AI Brain'}
            onPress={handleAnalyseWithLaptop}
            disabled={isAnalysing}
            icon={<Ionicons name="pulse-outline" size={18} color={isAnalysing ? theme.colors.textMuted : theme.colors.black} />}
          />
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.textMuted} />
            <Text style={[styles.infoText, { color: theme.colors.textMuted }]}>Your photo will be sent to the Brain on your laptop for analysis.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollBody: { flexGrow: 1 },
  photoContainer: { width, height: PHOTO_HEIGHT, backgroundColor: '#0F1624', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  vignette: { position: 'absolute', bottom: 0, left: 0, right: 0, height: PHOTO_HEIGHT * 0.5 },
  photoTopBar: { position: 'absolute', top: 48, left: 16 },
  screenBody: { padding: 24, paddingBottom: 64 },
  title: { fontSize: 24, fontFamily: theme.fonts.heading, letterSpacing: 2, marginBottom: 4 },
  statusText: { fontFamily: theme.fonts.bodyRegular, fontSize: 13, letterSpacing: 0.3, marginBottom: 24 },
  waveformSection: { marginBottom: 32 },
  infoBox: { flexDirection: 'row', marginTop: 32, padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, alignItems: 'center' },
  infoText: { flex: 1, fontSize: 12, marginLeft: 8, lineHeight: 18 },
});
