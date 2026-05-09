import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export default function CameraScreen({ route, navigation }: Props) {
  const { mode } = route.params;
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

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
          'We need camera access to take photos of instruments.',
          [{ text: 'Go Back', onPress: () => navigation.goBack() }]
        );
      }
    }
  };

  const handleGallerySelection = async () => {
    try {
      // Use ImagePicker's own permission request
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'We need access to your gallery to pick images.',
          [{ text: 'Go Back', onPress: () => navigation.goBack() }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Disabling editing fixes crashes on many Android devices
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        navigation.navigate('Result', { imageUri: result.assets[0].uri });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Gallery selection error:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
      navigation.goBack();
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
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
        Alert.alert('Error', 'Failed to capture photo. Please try again.');
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (mode === 'gallery') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Opening Gallery...</Text>
      </View>
    );
  }

  if (!cameraPermission || !cameraPermission.granted) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Checking Camera Permissions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        ref={cameraRef}
        facing="back"
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.topControls}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={takePicture}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    padding: 20,
    alignItems: 'flex-start',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bottomControls: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
});
