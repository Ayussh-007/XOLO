/**
 * TFLiteService — Image Analysis (Simulated)
 *
 * The original implementation used @tensorflow/tfjs + @tensorflow/tfjs-react-native
 * which crash on React Native due to `process.hrtime` being a Node.js API
 * that doesn't exist in the RN JS runtime.
 *
 * This version provides a simulated analysis that maps basic image characteristics
 * to classification labels for mood mapping. In production, swap this with:
 *   - A cloud API (Google Cloud Vision, AWS Rekognition)
 *   - react-native-fast-tflite for on-device inference
 *   - An Expo module for ML Kit
 */

let isModelLoaded = false;

// Predefined label pools for simulated analysis
const LABEL_POOLS = [
  ['beach', 'ocean', 'seashore', 'coast', 'sandbar'],
  ['mountain', 'alp', 'valley', 'cliff', 'volcano'],
  ['forest', 'tree', 'park', 'garden', 'blossom'],
  ['street', 'building', 'skyscraper', 'road', 'bridge'],
  ['bedroom', 'kitchen', 'library', 'room', 'indoor'],
  ['night', 'dark', 'moon', 'evening', 'shadow'],
  ['stadium', 'gym', 'sport', 'crowd', 'athlete'],
  ['flower', 'butterfly', 'petal', 'garden', 'children'],
];

/**
 * Simulates model loading
 */
export const loadModel = async (): Promise<void> => {
  if (isModelLoaded) return;

  console.log('Loading simulated analysis model...');
  // Simulate loading delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  isModelLoaded = true;
  console.log('Analysis model ready (simulated)');
};

/**
 * Simulates image analysis by returning random classification labels.
 * In production, this should use actual ML inference.
 */
export const analyseImage = async (imageUri: string): Promise<string[]> => {
  if (!isModelLoaded) {
    await loadModel();
  }

  console.log('Analyzing image:', imageUri);

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Pick a random label pool to simulate different scenes
  const poolIndex = Math.floor(Math.random() * LABEL_POOLS.length);
  const selectedPool = LABEL_POOLS[poolIndex];

  // Shuffle and return top 5 labels
  const shuffled = [...selectedPool].sort(() => Math.random() - 0.5);
  const results = shuffled.slice(0, 5);

  console.log('Analysis results:', results);
  return results;
};

/**
 * Free up memory
 */
export const disposeModel = () => {
  isModelLoaded = false;
  console.log('Analysis model disposed');
};
