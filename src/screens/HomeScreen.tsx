import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>XOLO</Text>
        <Text style={styles.subtitle}>Musical Instrument Analyzer</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={() => navigation.navigate('Camera', { mode: 'camera' })}
          >
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={() => navigation.navigate('Camera', { mode: 'gallery' })}
          >
            <Text style={styles.buttonText}>Pick from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.historyButton} 
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.historyButtonText}>View History</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 8,
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 50,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  historyButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
