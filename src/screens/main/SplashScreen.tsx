import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import theme from '../../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const [status, setStatus] = useState('Initializing XOLO...');
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseGlow = useRef(new Animated.Value(0.3)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: true }).start();

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 1800, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseGlow, { toValue: 0.7, duration: 1800, useNativeDriver: true }),
          Animated.timing(pulseGlow, { toValue: 0.3, duration: 1800, useNativeDriver: true }),
        ]),
      ])
    ).start();

    setTimeout(() => {
      setStatus('Ready.');
      setTimeout(() => navigation.replace('Home'), 600);
    }, 1500);
  }, []);

  // Use hardcoded colors for absolute safety during early boot
  const accentColor = '#00D4B1';
  const bgColor = '#080C14';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Animated.View style={[styles.centerContent, { opacity: fadeIn }]}>
        <Animated.View style={[styles.logoCircle, { transform: [{ scale: pulseScale }], borderColor: accentColor }]}>
          <Animated.View style={[styles.glowRing, { opacity: pulseGlow, backgroundColor: accentColor }]} />
          <View style={styles.iconCluster}>
            <Ionicons name="camera" size={26} color={accentColor} style={{ marginRight: -3 }} />
            <MaterialCommunityIcons name="waveform" size={30} color={accentColor} style={{ marginLeft: -3 }} />
          </View>
        </Animated.View>
        <Text style={[styles.appName, { color: '#FFF' }]}>XOLO</Text>
        <Text style={[styles.tagline, { color: '#6B7FA3' }]}>Your world, in sound.</Text>
      </Animated.View>
      <View style={styles.bottomSection}>
        <Text style={[styles.statusText, { color: '#3A4A66' }]}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#0F1624', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  glowRing: { position: 'absolute', width: 140, height: 140, borderRadius: 70 },
  iconCluster: { flexDirection: 'row', alignItems: 'center' },
  appName: { fontFamily: theme.fonts.displayBold, fontSize: 36, letterSpacing: 1 },
  tagline: { fontFamily: theme.fonts.bodyRegular, fontSize: 15, marginTop: 8, letterSpacing: 0.5 },
  bottomSection: { paddingHorizontal: 32, paddingBottom: 80, alignItems: 'center' },
  statusText: { fontFamily: theme.fonts.bodyRegular, fontSize: 12, letterSpacing: 0.3 },
});
