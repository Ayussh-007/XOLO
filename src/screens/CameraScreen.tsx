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
import { RootStackParamList } from '../navigation/types';
import { colors, fonts, spacing, radius } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;
const { width, height } = Dimensions.get('window');
const FRAME_SIZE = width * 0.78;

export default function CameraScreen({ route, navigation }: Props) {
  const { mode } = route.params;
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const captureScale = useRef(new Animated.Value(1)).current;

  // Pulsing loading animation
  const loadingOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(loadingOpacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (mode === 'gallery') {
      handleGallerySelection();
    } else {
      handleCameraPermissions();
    }
  }, [mode]);

  const handleCameraPermissions = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Camera access is needed to capture photos.',
          [{ text: 'Go Back', onPress: () => navigation.goBack() }]
        );
      }
    }
  };

  const handleGallerySelection = async () => {
    try {
      const { granted } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Gallery access is needed to pick images.',
          [{ text: 'Go Back', onPress: () => navigation.goBack() }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        navigation.navigate('Result', { imageUri: result.assets[0].uri });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery.');
      navigation.goBack();
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isProcessing) return;

    // Bounce animation
    Animated.sequence([
      Animated.spring(captureScale, {
        toValue: 0.85,
        useNativeDriver: true,
        speed: 80,
      }),
      Animated.spring(captureScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
    ]).start();

    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      if (photo) {
        navigation.navigate('Result', { imageUri: photo.uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Gallery loading state
  if (mode === 'gallery') {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <Animated.View style={{ opacity: loadingOpacity }}>
          <Ionicons name="images" size={48} color={colors.textMuted} />
        </Animated.View>
        <Animated.Text style={[styles.loadingText, { opacity: loadingOpacity }]}>
          Opening Gallery...
        </Animated.Text>
      </View>
    );
  }

  // Camera permission loading
  if (!cameraPermission || !cameraPermission.granted) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <Animated.View style={{ opacity: loadingOpacity }}>
          <Ionicons name="camera" size={48} color={colors.textMuted} />
        </Animated.View>
        <Animated.Text style={[styles.loadingText, { opacity: loadingOpacity }]}>
          Requesting Camera Access...
        </Animated.Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <Text style={styles.topLabel}>PhotoMusic</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Framing guide */}
        <View style={styles.frameGuide} />

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          {/* Gallery thumbnail placeholder */}
          <View style={styles.galleryThumb}>
            <Ionicons name="images" size={18} color={colors.textMuted} />
          </View>

          {/* Capture button */}
          <Animated.View
            style={[
              styles.captureOuter,
              { transform: [{ scale: captureScale }] },
            ]}
          >
            <Pressable
              onPress={takePicture}
              disabled={isProcessing}
              style={styles.captureInner}
            />
          </Animated.View>

          {/* Flip camera (visual only) */}
          <View style={styles.flipButton}>
            <Ionicons
              name="camera-reverse"
              size={22}
              color={colors.textMuted}
            />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.base,
  },
  camera: {
    flex: 1,
  },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.base,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 0.5,
  },

  /* Framing guide */
  frameGuide: {
    position: 'absolute',
    top: (height - FRAME_SIZE) / 2 - 30,
    left: (width - FRAME_SIZE) / 2,
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(0,212,177,0.4)',
  },

  /* Bottom bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: 44,
    paddingTop: spacing.lg,
    backgroundColor: 'rgba(8,12,20,0.85)',
  },
  galleryThumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  captureInner: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: colors.accentTeal,
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
