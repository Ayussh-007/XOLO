import * as FileSystem from 'expo-file-system/legacy';
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
  id: String(raw?.id || `match_${index}`),
  label: String(raw?.label || 'Unknown Vibe'),
  description: String(raw?.description || 'No description available.'),
  confidence: Number(raw?.confidence || 0),
  dna: {
    scale: String(raw?.dna?.scale || 'major'),
    key: String(raw?.dna?.key || 'C'),
    bpm: Number(raw?.dna?.bpm || 80),
    instrument: String(raw?.dna?.instrument || 'piano'),
    color: String(raw?.dna?.color || '#00D4B1'),
  }
});

export const analyzeImageWithLaptop = async (imageUri: string): Promise<MoodMatch[]> => {
  const { serverIp } = useAppStore.getState();
  
  if (!serverIp || serverIp.trim() === '' || serverIp === '192.168.1.1') {
    throw new Error('Please set your Laptop IP on the Home screen first.');
  }

  // Ensure URI is properly formatted for FileSystem
  const cleanUri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
  const serverUrl = `http://${serverIp.trim()}:8000/analyze`;
  
  try {
    // uploadType 1 = MULTIPART (required for FastAPI's UploadFile)
    const response = await FileSystem.uploadAsync(serverUrl, cleanUri, {
      fieldName: 'file',
      httpMethod: 'POST',
      uploadType: 1,
      mimeType: 'image/jpeg',
    });

    if (!response || response.status !== 200) {
      const statusMsg = response ? `Status: ${response.status}` : 'No response from server';
      throw new Error(`Brain is offline or unreachable. ${statusMsg}`);
    }

    let data;
    try {
      data = JSON.parse(response.body);
    } catch (parseError) {
      throw new Error('Brain returned a non-JSON response. Ensure the Python server is running the correct script.');
    }
    
    if (!data || !Array.isArray(data.matches)) {
      throw new Error('Brain returned an unexpected data format (missing "matches" array).');
    }

    return data.matches.map((m: any, i: number) => sanitizeMatch(m, i));
    
  } catch (error: any) {
    console.error('AI Brain Error:', error.message);
    // Categorize the error for the user
    if (error.message.includes('Network request failed') || error.message.includes('timeout')) {
      throw new Error('Connection timed out. Check if your phone and laptop are on the same Wi-Fi.');
    }
    throw error;
  }
};
