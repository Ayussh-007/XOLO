import * as FileSystem from 'expo-file-system/legacy';

export interface ModelFile {
  name: string;
  url: string;
  localPath: string;
}

const MODELS_DIR = `${FileSystem.documentDirectory}models/`;

const MODELS: ModelFile[] = [
  {
    name: 'mobilenet_v3',
    url: 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v3_small_100_224_float/model.json', // Note: TFLite usually needs a .tflite, but for TFJS-RN we often use model.json
    localPath: `${MODELS_DIR}mobilenet_v3.json`,
  },
  {
    name: 'magenta_rnn',
    url: 'http://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn/config.json',
    localPath: `${MODELS_DIR}magenta_config.json`,
  },
  {
    name: 'imagenet_labels',
    url: 'https://storage.googleapis.com/download.tensorflow.org/data/ImageNetLabels.txt',
    localPath: `${MODELS_DIR}labels.txt`,
  },
];

/**
 * Ensures the models directory exists
 */
const ensureDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(MODELS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MODELS_DIR, { intermediates: true });
  }
};

/**
 * Checks if all required model files exist locally
 */
export const modelsExist = async (): Promise<boolean> => {
  try {
    for (const model of MODELS) {
      const info = await FileSystem.getInfoAsync(model.localPath);
      if (!info.exists) return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Downloads all models and reports overall progress (0-100)
 */
export const downloadAllModels = async (
  onProgress: (progress: number) => void
): Promise<void> => {
  await ensureDirectory();

  let totalDownloaded = 0;
  const totalFiles = MODELS.length;

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    const info = await FileSystem.getInfoAsync(model.localPath);

    if (!info.exists) {
      console.log(`Downloading ${model.name}...`);
      
      const downloadResumable = FileSystem.createDownloadResumable(
        model.url,
        model.localPath,
        {},
        (downloadProgress) => {
          const fileProgress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          
          // Calculate overall progress based on file index and current file progress
          const overallProgress = ((i + fileProgress) / totalFiles) * 100;
          onProgress(Math.round(overallProgress));
        }
      );

      await downloadResumable.downloadAsync();
    } else {
      console.log(`${model.name} already exists.`);
      const overallProgress = ((i + 1) / totalFiles) * 100;
      onProgress(Math.round(overallProgress));
    }
  }

  onProgress(100);
};

/**
 * Gets the local URI for a specific model by name
 */
export const getModelLocalUri = (name: string): string | undefined => {
  return MODELS.find((m) => m.name === name)?.localPath;
};
