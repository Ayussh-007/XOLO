/**
 * Audio Utilities for ACE-Step generated music
 * Handles saving base64 audio to file system and managing cached audio.
 */

import * as FileSystem from 'expo-file-system/legacy';

const AUDIO_CACHE_DIR = `${FileSystem.cacheDirectory}xolo_audio/`;

/**
 * Ensures the audio cache directory exists.
 */
async function ensureCacheDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true });
  }
}

/**
 * Generates a cache key from mood ID and instrument index.
 */
function getCacheKey(moodId: string, instrumentIndex: number): string {
  return `${moodId}_inst${instrumentIndex}`;
}

/**
 * Gets the file path for cached audio.
 */
function getCachePath(moodId: string, instrumentIndex: number): string {
  return `${AUDIO_CACHE_DIR}${getCacheKey(moodId, instrumentIndex)}.wav`;
}

/**
 * Saves a base64 data URI to the file system.
 * @param base64DataUri - The full data URI (e.g., "data:audio/wav;base64,...")
 * @param moodId - The mood identifier
 * @param instrumentIndex - The instrument variation index
 * @returns The local file URI, or null on failure
 */
export async function saveBase64AudioToFile(
  base64DataUri: string,
  moodId: string,
  instrumentIndex: number,
): Promise<string | null> {
  try {
    await ensureCacheDir();

    // Strip the data URI prefix to get raw base64
    const base64Data = base64DataUri.replace(/^data:audio\/\w+;base64,/, '');
    const filePath = getCachePath(moodId, instrumentIndex);

    await FileSystem.writeAsStringAsync(filePath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return filePath;
  } catch (error) {
    console.error('Failed to save audio file:', error);
    return null;
  }
}

/**
 * Checks if cached audio exists for a mood/instrument combo.
 */
export async function getCachedAudioPath(
  moodId: string,
  instrumentIndex: number,
): Promise<string | null> {
  try {
    const filePath = getCachePath(moodId, instrumentIndex);
    const info = await FileSystem.getInfoAsync(filePath);
    return info.exists ? filePath : null;
  } catch {
    return null;
  }
}

/**
 * Clears all cached audio files.
 */
export async function clearAudioCache(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(AUDIO_CACHE_DIR, { idempotent: true });
    }
  } catch (error) {
    console.error('Failed to clear audio cache:', error);
  }
}

/**
 * Sample music URLs for fallback when HuggingFace is unreachable.
 * These are free-to-use sample audio clips that serve as placeholder music.
 */
export const FALLBACK_AUDIO_URLS: Record<string, string[]> = {
  'Piano & Strings': [
    'https://s3.amazonaws.com/freecodecamp/drums/Chord_1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Chord_2.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Chord_3.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Give_us_a_light.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Dry_Ohh.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Bld_H1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/punchy_kick_1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/side_stick_1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Brk_Snr.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Chord_1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Chord_2.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Chord_3.mp3',
  ],
  'Synth & Electronic': [
    'https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Heater-2.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Heater-3.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Heater-4_1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Heater-6.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Dsc_Oh.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Kick_n_Hat.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/RP4_KICK_1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Cev_H2.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Heater-2.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Heater-3.mp3',
  ],
  'Guitar & Drums': [
    'https://s3.amazonaws.com/freecodecamp/drums/punchy_kick_1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/side_stick_1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Brk_Snr.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Give_us_a_light.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Dry_Ohh.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Bld_H1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Kick_n_Hat.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/RP4_KICK_1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Cev_H2.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/punchy_kick_1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/side_stick_1.mp3',
    'https://s3.amazonaws.com/freecodecamp/drums/Brk_Snr.mp3',
  ],
};
