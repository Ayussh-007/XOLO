import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodMatch } from '../api/brainApi';

interface AppState {
  // --- Persistent Configuration ---
  serverIp: string;

  // --- Session State ---
  imageUri: string | null;
  status: string;
  isAnalysing: boolean;
  
  // --- AI Results ---
  matches: MoodMatch[];
  selectedMatch: MoodMatch | null;

  // --- Music Generation ---
  generatedAudio: Record<string, string>; // "moodId_instX" -> local file path
  isGenerating: boolean;
  generationProgress: string;
  currentInstrumentIndex: number;
  useFallback: boolean; // true when HuggingFace is unreachable

  // --- Actions ---
  setImageUri: (uri: string | null) => void;
  setServerIp: (ip: string) => void;
  setMatches: (matches: MoodMatch[]) => void;
  setSelectedMatch: (match: MoodMatch | null) => void;
  setIsAnalysing: (loading: boolean) => void;
  setStatus: (status: string) => void;
  setGeneratedAudio: (key: string, filePath: string) => void;
  setIsGenerating: (val: boolean) => void;
  setGenerationProgress: (msg: string) => void;
  setCurrentInstrumentIndex: (index: number) => void;
  setUseFallback: (val: boolean) => void;
  resetSession: () => void;
  purgeLegacyData: () => Promise<void>;
}

const initialSessionState = {
  imageUri: null,
  status: 'Ready',
  isAnalysing: false,
  matches: [],
  selectedMatch: null,
  generatedAudio: {},
  isGenerating: false,
  generationProgress: '',
  currentInstrumentIndex: 0,
  useFallback: false,
};

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  serverIp: '192.168.1.1',
  ...initialSessionState,

  // Setters
  setImageUri: (uri) => set({ imageUri: uri }),
  setServerIp: (ip) => set({ serverIp: ip }),
  setMatches: (matches) => set({ matches: matches || [] }),
  setSelectedMatch: (match) => set({ selectedMatch: match }),
  setIsAnalysing: (loading) => set({ isAnalysing: loading }),
  setStatus: (status) => set({ status }),
  setGeneratedAudio: (key, filePath) =>
    set((state) => ({
      generatedAudio: { ...state.generatedAudio, [key]: filePath },
    })),
  setIsGenerating: (val) => set({ isGenerating: val }),
  setGenerationProgress: (msg) => set({ generationProgress: msg }),
  setCurrentInstrumentIndex: (index) => set({ currentInstrumentIndex: index }),
  setUseFallback: (val) => set({ useFallback: val }),

  resetSession: () => set(initialSessionState),

  // CRITICAL: Clears any corrupted old data from the phone's storage
  purgeLegacyData: async () => {
    try {
      console.log('🧹 Purging legacy app data...');
      const keys = await AsyncStorage.getAllKeys();
      // Keep history but clear everything else that might be corrupted
      const keysToRemove = keys.filter(k => k !== 'photomusic_history');
      await AsyncStorage.multiRemove(keysToRemove);
      set({ ...initialSessionState });
    } catch (e) {
      console.error('Failed to purge data');
    }
  }
}));
