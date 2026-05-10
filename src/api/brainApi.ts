import * as FileSystem from 'expo-file-system/legacy'; // Switching to legacy import as per error message
import { useAppStore } from '../store/useAppStore';

export interface MoodDNA {
  scale: string;
  key: string;
  bpm: number;
  instrument: string;
  color: string;
}

export interface MoodMatch {
  id: string;
  label: string;
  description: string;
  confidence: number;
  dna: MoodDNA;
}

/**
 * Sanitizes and validates the Brain's response to prevent "undefined" errors.
 */
const sanitizeMatch = (raw: any, index: number): MoodMatch => ({
  id: raw.id || `match_${index}`,
  label: raw.label || 'Unknown Vibe',
  description: raw.description || 'No description available.',
  confidence: raw.confidence || 0,
  dna: {
    scale: raw.dna?.scale || 'major',
    key: raw.dna?.key || 'C',
    bpm: raw.dna?.bpm || 80,
    instrument: raw.dna?.instrument || 'piano',
    color: raw.dna?.color || '#00D4B1',
  }
});

export const analyzeImageWithLaptop = async (imageUri: string): Promise<MoodMatch[]> => {
  const { serverIp } = useAppStore.getState();
  
  if (!serverIp || serverIp.trim() === '' || serverIp === '192.168.1.1') {
    throw new Error('Please set your Laptop IP on the Home screen first.');
  }

  const serverUrl = `http://${serverIp.trim()}:8000/analyze`;
  
  try {
    // Accessing the UploadType from the legacy namespace
    const uploadType = (FileSystem as any).FileSystemUploadType?.BINARY_CONTENT ?? 1;

    const response = await FileSystem.uploadAsync(serverUrl, imageUri, {
      fieldName: 'file',
      httpMethod: 'POST',
      uploadType: uploadType,
    });

    if (response.status !== 200) {
      throw new Error(`Brain is offline or error occurred (${response.status})`);
    }

    const data = JSON.parse(response.body);
    
    if (!data || !Array.isArray(data.matches)) {
      throw new Error('Brain returned invalid data format.');
    }

    return data.matches.map((m: any, i: number) => sanitizeMatch(m, i));
    
  } catch (error: any) {
    console.error('AI Brain Error:', error.message);
    throw new Error('Could not reach the AI Brain. Ensure the Python server is running.');
  }
};
