import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { modelsExist, downloadAllModels } from '../services/ModelDownloadManager';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashDownloadScreen({ navigation }: Props) {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState('Checking system assets...');
  
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkAndDownload();
  }, []);

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const checkAndDownload = async () => {
    setError(null);
    try {
      const exists = await modelsExist();
      if (exists) {
        setStatus('Ready!');
        setTimeout(() => navigation.replace('Home'), 500);
      } else {
        startDownload();
      }
    } catch (err) {
      setError('Initialization failed. Check your internet connection.');
    }
  };

  const startDownload = async () => {
    setIsDownloading(true);
    setError(null);
    setStatus('Preparing downloads...');
    
    try {
      await downloadAllModels((p) => {
        setProgress(p);
        if (p < 33) setStatus('Downloading instrument model...');
        else if (p < 66) setStatus('Downloading music logic...');
        else if (p < 100) setStatus('Downloading labels...');
        else setStatus('Finalizing...');
      });
      
      setStatus('Complete!');
      setTimeout(() => navigation.replace('Home'), 1000);
    } catch (err) {
      console.error(err);
      setError('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const progressBarWidth = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>XOLO</Text>
          <Text style={styles.tagline}>AI Musical Intelligence</Text>
        </View>

        <View style={styles.loaderContainer}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={checkAndDownload}>
                <Text style={styles.retryText}>Retry Setup</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.statusText}>{status}</Text>
              <View style={styles.progressBackground}>
                <Animated.View style={[styles.progressFill, { width: progressBarWidth }]} />
              </View>
              <Text style={styles.percentageText}>{progress}%</Text>
            </>
          )}
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>XOLO v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoText: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: 12,
    color: '#000',
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 2,
    marginTop: 5,
    textTransform: 'uppercase',
  },
  loaderContainer: {
    width: '100%',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    fontWeight: '500',
  },
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  percentageText: {
    marginTop: 10,
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
  },
  errorBox: {
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#ccc',
    fontSize: 10,
    letterSpacing: 1,
  },
});
