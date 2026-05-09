import { create } from 'zustand';

interface MoodParams {
  tempo: number;
  scale: string;
  key: string;
  instruments: string[];
}

interface AppState {
  // State
  imageUri: string | null;
  moodLabel: string | null;
  moodParams: MoodParams | null;
  audioPath: string | null;
  isAnalysing: boolean;
  isGenerating: boolean;
  status: string;

  // Actions
  setImageUri: (uri: string | null) => void;
  setMoodLabel: (label: string | null) => void;
  setMoodParams: (params: MoodParams | null) => void;
  setAudioPath: (path: string | null) => void;
  setIsAnalysing: (loading: boolean) => void;
  setIsGenerating: (loading: boolean) => void;
  setStatus: (status: string) => void;
  resetAll: () => void;
}

const initialState = {
  imageUri: null,
  moodLabel: null,
  moodParams: null,
  audioPath: null,
  isAnalysing: false,
  isGenerating: false,
  status: 'Ready',
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setImageUri: (uri) => set({ imageUri: uri }),
  setMoodLabel: (label) => set({ moodLabel: label }),
  setMoodParams: (params) => set({ moodParams: params }),
  setAudioPath: (path) => set({ audioPath: path }),
  setIsAnalysing: (loading) => set({ isAnalysing: loading }),
  setIsGenerating: (loading) => set({ isGenerating: loading }),
  setStatus: (status) => set({ status: status }),
  
  resetAll: () => set(initialState),
}));
