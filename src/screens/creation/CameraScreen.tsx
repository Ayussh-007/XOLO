import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import theme from '../../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;
const { width, height } = Dimensions.get('window');
const FRAME_SIZE = width * 0.78;

export default function CameraScreen({ route, navigation }: Props) {
  const { mode } = route.params;
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const captureScale = useRef(new Animated.Value(1)).current;
  const loadingOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(loadingOpacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  useEffect(() => {
    if (mode === 'gallery') {
      // Delay slightly to ensure UI is ready
      const timer = setTimeout(handleGallerySelection, 500);
      return () => clearTimeout(timer);
    } else {
      handleCameraPermissions();
    }
  }, [mode]);

  const handleCameraPermissions = async () => {
    try {
      const status = await requestCameraPermission();
      if (!status.granted) {
        Alert.alert(
          'Permission Required', 
          'XOLO needs camera access to analyze your world.', 
          [{ text: 'Go Back', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Camera permission error:', error);
      navigation.goBack();
    }
  };

  const handleGallerySelection = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Permission Required', 
          'Gallery access is needed to pick photos.', 
          [{ text: 'Go Back', onPress: () => navigation.goBack() }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Updated to latest API enum
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        navigation.navigate('Result', { imageUri: result.assets[0].uri });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Gallery picker error:', error);
      navigation.goBack();
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isProcessing) return;

    Animated.sequence([
      Animated.spring(captureScale, { toValue: 0.85, useNativeDriver: true, speed: 80 }),
      Animated.spring(captureScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
    ]).start();

    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false, // Ensures cleaner image on Android
      });
      if (photo && photo.uri) {
        navigation.navigate('Result', { imageUri: photo.uri });
      } else {
        throw new Error('Failed to capture image path.');
      }
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Capture Error', 'Could not take the photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Safe rendering fallback
  if (mode === 'gallery' || !cameraPermission || !cameraPermission.granted) {
    const accent = theme.colors?.accentTeal || '#00D4B1';
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors?.background || '#080C14' }]}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <Animated.View style={{ opacity: loadingOpacity }}>
          <Ionicons name={mode === 'gallery' ? "images" : "camera"} size={48} color={accent} />
        </Animated.View>
        <Animated.Text style={[styles.loadingText, { opacity: loadingOpacity, color: theme.colors?.textMuted || '#3A4A66' }]}>
          {mode === 'gallery' ? 'Opening Gallery...' : 'Initializing Camera...'}
        </Animated.Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <CameraView 
        style={styles.camera} 
        ref={cameraRef} 
        facing="back"
        mode="picture"
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </Pressable>
          <Text style={styles.topLabel}>XOLO CAMERA</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.frameGuide} />

        <View style={styles.bottomBar}>
          <View style={styles.galleryThumb}>
            <Ionicons name="images" size={18} color="#3A4A66" />
          </View>

          <Animated.View style={[styles.captureOuter, { transform: [{ scale: captureScale }] }]}>
            <Pressable 
              onPress={takePicture} 
              disabled={isProcessing} 
              style={[styles.captureInner, { backgroundColor: theme.colors?.accentTeal || '#00D4B1' }]} 
            />
          </Animated.View>

          <View style={styles.flipButton}>
            <Ionicons name="camera-reverse" size={22} color="#3A4A66" />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: theme.fonts?.bodyRegular || 'System', fontSize: 14, marginTop: 16 },
  camera: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingHorizontal: 24, paddingBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  topLabel: { fontFamily: theme.fonts?.displayBold || 'System', fontSize: 16, color: '#FFF', letterSpacing: 0.5 },
  frameGuide: { position: 'absolute', top: (height - FRAME_SIZE) / 2 - 30, left: (width - FRAME_SIZE) / 2, width: FRAME_SIZE, height: FRAME_SIZE, borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(0,212,177,0.4)' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingBottom: 44, paddingTop: 24, backgroundColor: 'rgba(8,12,20,0.85)' },
  galleryThumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#161F30', borderWidth: 1, borderColor: '#1E2D45', alignItems: 'center', justifyContent: 'center' },
  captureOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center', padding: 4 },
  captureInner: { width: '100%', height: '100%', borderRadius: 32 },
  flipButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
});
