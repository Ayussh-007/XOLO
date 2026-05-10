import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Animated,
  Dimensions,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { PrimaryButton, SecondaryButton } from '../../components/ui/Button';
import theme from '../../theme/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useThemeStore } from '../../store/useThemeStore';
import { useAppStore } from '../../store/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
  // CORRECTLY USING THE HOOK
  const activeColors = useThemeColors();
  const { theme: themeMode, toggleTheme } = useThemeStore();
  const { serverIp, setServerIp, resetSession } = useAppStore();
  
  const blob1X = useRef(new Animated.Value(0)).current;
  const blob1Y = useRef(new Animated.Value(0)).current;
  const blob2X = useRef(new Animated.Value(0)).current;
  const blob2Y = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    resetSession();

    const loop = (val: Animated.Value, points: {to: number, dur: number}[]) => {
      const anims = points.map(p => Animated.timing(val, { toValue: p.to, duration: p.dur, useNativeDriver: true }));
      Animated.loop(Animated.sequence(anims)).start();
    };

    loop(blob1X, [{to: 30, dur: 6000}, {to: -20, dur: 5000}, {to: 0, dur: 4000}]);
    loop(blob1Y, [{to: -25, dur: 5500}, {to: 15, dur: 4500}, {to: 0, dur: 5000}]);
    loop(blob2X, [{to: -25, dur: 5000}, {to: 20, dur: 6000}, {to: 0, dur: 4500}]);
    loop(blob2Y, [{to: 20, dur: 4500}, {to: -20, dur: 5500}, {to: 0, dur: 5000}]);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      <Animated.View style={[styles.blobContainer, { transform: [{ translateX: blob1X }, { translateY: blob1Y }] }]}>
        <LinearGradient colors={[activeColors.accentTeal, 'transparent']} style={styles.blob1} />
      </Animated.View>

      <Animated.View style={[styles.blobContainer2, { transform: [{ translateX: blob2X }, { translateY: blob2Y }] }]}>
        <LinearGradient colors={[activeColors.accentAmber, 'transparent']} style={styles.blob2} />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.containerAnimated, { opacity: fadeIn }]}>
          <View style={styles.headerRow}>
            <View style={styles.logoRow}>
              <Ionicons name="camera" size={18} color={activeColors.accentTeal} />
              <MaterialCommunityIcons name="waveform" size={20} color={activeColors.accentTeal} style={{ marginLeft: 2 }} />
            </View>
            <View style={styles.headerActions}>
              <Pressable onPress={toggleTheme} style={[styles.headerButton, { backgroundColor: activeColors.surfaceElevated, borderColor: activeColors.borderSubtle }]}>
                <Ionicons name={themeMode === 'dark' ? 'moon' : 'sunny'} size={18} color={activeColors.textPrimary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.screenBody}>
            <Text style={[styles.headline, { color: activeColors.textPrimary }]}>What does{'\n'}it sound like?</Text>
            
            <View style={styles.buttonGroup}>
              <PrimaryButton
                label="Take a Photo"
                onPress={() => navigation.navigate('Camera', { mode: 'camera' })}
                shimmer
                icon={<Ionicons name="camera" size={20} color={activeColors.black} />}
              />
              <SecondaryButton
                label="From Gallery"
                onPress={() => navigation.navigate('Camera', { mode: 'gallery' })}
                icon={<Ionicons name="images" size={18} color={activeColors.accentTeal} />}
                style={{ marginTop: 16 }}
              />
            </View>

            <View style={[styles.serverConfig, { backgroundColor: activeColors.surface, borderColor: activeColors.borderSubtle }]}>
              <View style={styles.serverHeader}>
                <Ionicons name="laptop-outline" size={16} color={activeColors.accentTeal} />
                <Text style={[styles.serverLabel, { color: activeColors.textSecondary }]}>AI BRAIN IP</Text>
              </View>
              <TextInput
                style={[styles.serverInput, { color: activeColors.textPrimary }]}
                value={serverIp}
                onChangeText={setServerIp}
                placeholder="192.168.1.XX"
                placeholderTextColor={activeColors.textMuted}
                keyboardType="numeric"
              />
            </View>

            <Pressable onPress={() => navigation.navigate('History')} style={styles.historyLink}>
              <Ionicons name="time-outline" size={16} color={activeColors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.historyText, { color: activeColors.textSecondary }]}>History</Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  containerAnimated: { flex: 1 },
  screenBody: { flex: 1, justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 40 },
  blobContainer: { position: 'absolute', top: -80, left: -60 },
  blob1: { width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4, opacity: 0.12 },
  blobContainer2: { position: 'absolute', top: 40, right: -100 },
  blob2: { width: width * 0.6, height: width * 0.6, borderRadius: width * 0.3, opacity: 0.1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32, paddingTop: 16, zIndex: 10 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  headline: { fontFamily: theme.fonts.displayBold, fontSize: 38, lineHeight: 48, letterSpacing: -0.5, marginBottom: 48 },
  buttonGroup: { width: '100%' },
  serverConfig: { marginTop: 48, padding: 16, borderRadius: 16, borderWidth: 1 },
  serverHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  serverLabel: { fontSize: 10, fontFamily: theme.fonts.bodyRegular, marginLeft: 4, letterSpacing: 1 },
  serverInput: { fontSize: 16, fontFamily: theme.fonts.bodyRegular, padding: 0 },
  historyLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 48, paddingVertical: 8 },
  historyText: { fontFamily: theme.fonts.bodyRegular, fontSize: 14, letterSpacing: 0.3 },
});
