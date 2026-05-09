import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

export const useTFSetup = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupTF() {
      try {
        console.log('Starting TensorFlow.js initialization...');
        
        // 1. Wait for TF to be ready
        await tf.ready();
        
        // 2. The @tensorflow/tfjs-react-native package automatically 
        // registers the 'rn-webgl' backend if available.
        // We verify the current backend.
        const backend = tf.getBackend();
        console.log(`TensorFlow.js ready with backend: ${backend}`);

        setIsReady(true);
      } catch (err) {
        console.error('TensorFlow.js initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown TF setup error');
      }
    }

    setupTF();
  }, []);

  return { isReady, error };
};
