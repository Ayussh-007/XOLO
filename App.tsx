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
import { colors, lightColors, fonts, spacing } from './src/theme/theme';
import { useThemeStore } from './src/store/useThemeStore';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import SplashDownloadScreen from './src/screens/SplashDownloadScreen';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import ResultScreen from './src/screens/ResultScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { isReady: engineReady, error: engineError } = useTFSetup();
  const { theme } = useThemeStore();
  const activeColors = theme === 'dark' ? colors : lightColors;

  const [fontsLoaded] = useFonts({
    Syne_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  // Wait for both engine and fonts
  if (!engineReady || !fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: activeColors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <PulsingLoader />
        <Text style={[styles.loadingText, { color: activeColors.textMuted }]}>Initializing...</Text>
        {engineError && (
          <Text style={[styles.errorText, { color: activeColors.error }]}>{engineError}</Text>
        )}
      </View>
    );
  }

  const navTheme = {
    ...DefaultTheme,
    dark: theme === 'dark',
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

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: activeColors.background },
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
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
