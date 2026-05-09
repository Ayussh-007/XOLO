import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTFSetup } from './src/hooks/useTFSetup';
import { RootStackParamList } from './src/navigation/types';

// Screens
import SplashDownloadScreen from './src/screens/SplashDownloadScreen';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import ResultScreen from './src/screens/ResultScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { isReady, error } = useTFSetup();

  // Initial engine setup (TensorFlow + WebGL)
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing XOLO Engine...</Text>
        {error && <Text style={styles.errorText}>Error: {error}</Text>}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <Stack.Navigator 
          initialRouteName="Splash"
          screenOptions={{
            headerShown: true,
            headerShadowVisible: false,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen 
            name="Splash" 
            component={SplashDownloadScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Camera" 
            component={CameraScreen} 
            options={{ title: 'Analyze' }}
          />
          <Stack.Screen 
            name="Result" 
            component={ResultScreen} 
            options={{ title: 'Result' }}
          />
          <Stack.Screen 
            name="History" 
            component={HistoryScreen} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 20,
    color: '#FF3B30',
    textAlign: 'center',
  },
});
