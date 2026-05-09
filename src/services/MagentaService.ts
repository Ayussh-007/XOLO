/**
 * MagentaService — Music Generation (Simulated)
 *
 * The original implementation used @magenta/music which is a BROWSER-ONLY
 * library that depends on the Web Audio API (AudioContext, etc.) and
 * @tensorflow/tfjs (which crashes in RN due to process.hrtime).
 *
 * This version provides a simulated music generation pipeline that creates
 * note sequences based on mood parameters. For production, consider:
 *   - Running Magenta.js in a WebView bridge
 *   - Using a cloud-based music generation API
 *   - Using a native MIDI library with react-native
 */

import * as FileSystem from 'expo-file-system/legacy';
import { MoodParams } from './MoodMapper';

export interface NoteEvent {
  pitch: number;
  startTime: number;
  endTime: number;
  velocity: number;
}

export interface GeneratedSequence {
  notes: NoteEvent[];
  totalTime: number;
  tempo: number;
  moodLabel: string;
}

let isInitialized = false;

/**
 * Initialize the music generation engine
 */
export const initMagenta = async (_checkpointPath?: string): Promise<void> => {
  if (isInitialized) return;

  console.log('Initializing music generator (simulated)...');
  await new Promise((resolve) => setTimeout(resolve, 200));
  isInitialized = true;
  console.log('Music generator ready');
};

/**
 * Scale definitions for note generation
 */
const SCALES: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
};

const KEY_OFFSETS: Record<string, number> = {
  C: 60,
  D: 62,
  E: 64,
  F: 65,
  G: 67,
  A: 69,
  Am: 57,
  Dm: 62,
  Em: 64,
};

/**
 * Generates a note sequence based on mood parameters
 */
export const generateMusic = async (params: MoodParams): Promise<GeneratedSequence> => {
  if (!isInitialized) {
    await initMagenta();
  }

  console.log(`Generating ${params.moodLabel} music in ${params.key} ${params.scale}...`);

  // Simulate generation time
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const scale = SCALES[params.scale] || SCALES.major;
  const baseNote = KEY_OFFSETS[params.key] || 60;
  const beatDuration = 60 / params.tempo; // seconds per beat

  const notes: NoteEvent[] = [];
  const totalBeats = 16; // 4 bars of 4/4

  for (let beat = 0; beat < totalBeats; beat++) {
    // Generate 1-3 notes per beat for variety
    const notesPerBeat = Math.random() > 0.3 ? 1 : Math.random() > 0.5 ? 2 : 0;

    for (let n = 0; n < notesPerBeat; n++) {
      const scaleIndex = Math.floor(Math.random() * scale.length);
      const octaveShift = Math.floor(Math.random() * 2) * 12;
      const pitch = baseNote + scale[scaleIndex] + octaveShift;

      const startTime = beat * beatDuration + n * (beatDuration / 2);
      const duration = beatDuration * (0.5 + Math.random() * 0.5);

      notes.push({
        pitch: Math.max(40, Math.min(88, pitch)), // Clamp to reasonable range
        startTime,
        endTime: startTime + duration,
        velocity: 60 + Math.floor(Math.random() * 40),
      });
    }
  }

  const sequence: GeneratedSequence = {
    notes,
    totalTime: totalBeats * beatDuration,
    tempo: params.tempo,
    moodLabel: params.moodLabel,
  };

  console.log(`Generated ${notes.length} notes over ${sequence.totalTime.toFixed(1)}s`);
  return sequence;
};

/**
 * Converts a note sequence to a WAV placeholder file.
 * 
 * NOTE: Real audio synthesis requires a native audio module or WebView.
 * This creates a metadata JSON file as a placeholder.
 */
export const noteSequenceToWav = async (
  sequence: GeneratedSequence,
  outputPath: string
): Promise<void> => {
  try {
    console.log('Creating audio metadata at:', outputPath);

    // Save the sequence metadata as JSON (can be used by a player later)
    const metadataPath = outputPath.replace('.wav', '.json');
    await FileSystem.writeAsStringAsync(
      metadataPath,
      JSON.stringify(sequence, null, 2)
    );

    console.log('Audio metadata saved');
  } catch (error) {
    console.error('Synthesis failed:', error);
    throw error;
  }
};

/**
 * Frees memory
 */
export const disposeModel = () => {
  isInitialized = false;
  console.log('Music generator disposed');
};
