import React, { useEffect } from 'react';
import { StyleSheet, View, Text, StatusBar, Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Syne_700Bold } from '@expo-google-fonts/syne';
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';

import { useBrainSetup } from './src/hooks/useBrainSetup';
import { darkColors, lightColors } from './src/theme/theme';
import { useThemeStore } from './src/store/useThemeStore';
import { useAppStore } from './src/store/useAppStore'; // Added Store
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  const { isReady: brainReady } = useBrainSetup();
  const { theme: themeMode } = useThemeStore();
  const { purgeLegacyData } = useAppStore(); // Get purge action
  const activeColors = themeMode === 'dark' ? darkColors : lightColors;

  const [fontsLoaded] = useFonts({
    Syne_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  // RUN PURGE ON MOUNT
  useEffect(() => {
    purgeLegacyData();
  }, []);

  const navTheme = {
    ...DefaultTheme,
    dark: themeMode === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: activeColors.accentTeal,
      background: activeColors.background,
      card: activeColors.surface,
      text: activeColors.textPrimary,
      border: activeColors.borderSubtle,
      notification: activeColors.accentAmber,
    },
  };

  if (!brainReady || !fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: activeColors.background }]}>
        <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <PulsingLoader color={activeColors.accentTeal} />
        <Text style={[styles.loadingText, { color: activeColors.textMuted }]}>Initializing XOLO...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function PulsingLoader({ color }: { color: string }) {
  const opacity = React.useRef(new Animated.Value(0.4)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.pulseCircle, { opacity, borderColor: color }]}>
      <View style={[styles.pulseInner, { backgroundColor: color }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  pulseCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  pulseInner: { width: 16, height: 16, borderRadius: 8 },
  loadingText: { fontSize: 14, letterSpacing: 0.3 },
});
