import React from 'react';
import { StyleSheet, View, Text, StatusBar, Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { Syne_700Bold } from '@expo-google-fonts/syne';
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';

import { useTFSetup } from './src/hooks/useTFSetup';
import { RootStackParamList } from './src/navigation/types';
import { colors, fonts, spacing } from './src/theme/theme';

// Screens
import SplashDownloadScreen from './src/screens/SplashDownloadScreen';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import ResultScreen from './src/screens/ResultScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Dark navigation theme matching our design tokens */
const DarkNavTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accentTeal,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.borderSubtle,
    notification: colors.accentAmber,
  },
};

export default function App() {
  const { isReady: engineReady, error: engineError } = useTFSetup();

  const [fontsLoaded] = useFonts({
    Syne_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  // Wait for both engine and fonts
  if (!engineReady || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <PulsingLoader />
        <Text style={styles.loadingText}>Initializing...</Text>
        {engineError && (
          <Text style={styles.errorText}>{engineError}</Text>
        )}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={DarkNavTheme}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen name="Splash" component={SplashDownloadScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Camera" component={CameraScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

/** Pulsing opacity loader matching our design system */
function PulsingLoader() {
  const opacity = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.pulseCircle, { opacity }]}>
      <View style={styles.pulseInner} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  pulseCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentTealDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  pulseInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accentTeal,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  errorText: {
    marginTop: spacing.base,
    color: colors.error,
    textAlign: 'center',
    fontSize: 13,
  },
});
