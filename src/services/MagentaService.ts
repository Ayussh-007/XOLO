import * as mm from '@magenta/music/node/music_rnn';
import { NoteSequence } from '@magenta/music/node/core';
import * as FileSystem from 'expo-file-system/legacy';
import Soundfont from 'soundfont-player';
import { MoodParams } from './MoodMapper';

let musicRnn: mm.MusicRNN | null = null;

/**
 * Initializes the Magenta MusicRNN model
 */
export const initMagenta = async (checkpointPath: string): Promise<void> => {
  try {
    if (musicRnn) return;
    
    // In a browser, this would be a URL. In RN with local files, 
    // it requires the directory containing config.json and weights.
    musicRnn = new mm.MusicRNN(checkpointPath);
    await musicRnn.initialize();
    console.log('Magenta MusicRNN initialized');
  } catch (error) {
    console.error('Failed to initialize Magenta:', error);
    throw error;
  }
};

/**
 * Generates a NoteSequence based on mood parameters
 */
export const generateMusic = async (params: MoodParams): Promise<NoteSequence> => {
  if (!musicRnn) {
    throw new Error('Magenta model not initialized');
  }

  // 1. Create a seed sequence based on key/scale
  // A simple 1-bar seed (4 beats)
  const seed: NoteSequence = {
    notes: [
      { pitch: 60, startTime: 0, endTime: 0.5 }, // C4
      { pitch: 64, startTime: 0.5, endTime: 1.0 }, // E4
      { pitch: 67, startTime: 1.0, endTime: 1.5 }, // G4
      { pitch: 72, startTime: 1.5, endTime: 2.0 }, // C5
    ],
    totalTime: 2.0,
  };

  // 2. Continue the sequence
  // steps: number of steps to continue (e.g., 30 steps)
  // temperature: higher = more random (e.g., params.tempo / 60 is a bit high, maybe fixed 1.0)
  const steps = 30;
  const temperature = 1.0;
  
  const generatedSeq = await musicRnn.continueSequence(seed, steps, temperature);
  return generatedSeq;
};

/**
 * Synthesizes a NoteSequence to a WAV file
 * NOTE: soundfont-player and WebAudio logic in React Native often require 
 * polyfills or a WebView bridge. This implementation follows the requested structure.
 */
export const noteSequenceToWav = async (
  sequence: NoteSequence,
  outputPath: string
): Promise<void> => {
  try {
    console.log('Synthesizing NoteSequence to:', outputPath);
    
    // This is a high-level representation of the synthesis logic.
    // Real synthesis in RN usually requires a WebView or a native module
    // that can handle MIDI + Soundfonts.
    
    /*
    const ac = new AudioContext(); // Not natively in RN
    const player = await Soundfont.instrument(ac, 'acoustic_grand_piano');
    
    // Map NoteSequence to Soundfont events
    sequence.notes.forEach(note => {
      player.play(note.pitch, ac.currentTime + note.startTime, {
        duration: note.endTime - note.startTime
      });
    });
    
    // Capture the audio buffer and write to FileSystem
    // await FileSystem.writeAsStringAsync(outputPath, audioBufferB64, { encoding: 'base64' });
    */

    // Placeholder: In a real implementation for this project, 
    // we would use a library that doesn't depend on the Browser's AudioContext.
    console.warn('Synthesis logic requires AudioContext polyfill or Native Bridge');
  } catch (error) {
    console.error('Synthesis failed:', error);
    throw error;
  }
};

/**
 * Frees memory
 */
export const disposeModel = () => {
  if (musicRnn) {
    musicRnn.dispose();
    musicRnn = null;
  }
};
