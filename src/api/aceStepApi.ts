/**
 * Music Generation API Client
 * Calls the local MusicGen model running on xolo_server.py
 */

import { MoodMatch } from './brainApi';
import { useAppStore } from '../store/useAppStore';

// Instrument style tags for the 3 variations per mood
const INSTRUMENT_STYLES: { name: string; tags: string }[] = [
  { name: 'Piano & Strings', tags: 'piano, strings, orchestral, cinematic' },
  { name: 'Synth & Electronic', tags: 'synthesizer, electronic, ambient pads, digital' },
  { name: 'Guitar & Drums', tags: 'acoustic guitar, drums, percussion, organic' },
];

// Maps mood labels to musical style descriptions
const MOOD_STYLE_MAP: Record<string, string> = {
  lofi: 'lofi hip hop chill beats relaxing',
  chill: 'chill ambient relaxing downtempo',
  cyberpunk: 'cyberpunk dark electronic aggressive synth',
  neon: 'neon futuristic electronic driving',
  zen: 'zen peaceful meditative calm ambient',
  garden: 'nature peaceful acoustic serene',
  ethereal: 'ethereal dreamy floating atmospheric space',
  space: 'cosmic ambient deep space atmospheric',
  dark: 'dark brooding cinematic tension mysterious',
  gothic: 'gothic dark haunting organ cathedral',
  tropical: 'tropical upbeat sunny beach reggae',
  sun: 'bright cheerful upbeat energetic pop',
  happy: 'happy upbeat cheerful bright pop',
  energetic: 'energetic driving powerful electronic dance',
  calm: 'calm ambient atmospheric soft peaceful',
  melancholy: 'melancholic sad emotional piano ballad',
  mysterious: 'mysterious ethereal dreamlike dark ambient',
  romantic: 'romantic soft acoustic love warm',
  aggressive: 'aggressive intense rock heavy riffs',
  peaceful: 'peaceful serene meditation soft',
  nostalgic: 'nostalgic warm retro lo-fi vintage',
};

/**
 * Builds a prompt for MusicGen from a MoodMatch.
 */
function buildPromptFromMood(mood: MoodMatch): string {
  const label = (mood.label || 'calm').toLowerCase();
  const dna = mood.dna;

  // Find the closest mood style
  let styleDesc = 'calm ambient atmospheric';
  for (const [key, value] of Object.entries(MOOD_STYLE_MAP)) {
    if (label.includes(key)) {
      styleDesc = value;
      break;
    }
  }

  const key = dna?.key || 'C';
  const scale = (dna?.scale || 'major').replace('_', ' ');
  const bpm = dna?.bpm || 90;

  return `${styleDesc}, ${key} ${scale}, ${bpm} BPM, instrumental`;
}

/**
 * Calls the local MusicGen server to generate music.
 * Returns the base64 audio data URI on success, or null on failure.
 */
export async function generateMusic(
  mood: MoodMatch,
  instrumentIndex: number,
  onProgress?: (msg: string) => void,
): Promise<string | null> {
  const { serverIp } = useAppStore.getState();
  const instrumentName = INSTRUMENT_STYLES[instrumentIndex]?.name || 'Default';
  const prompt = buildPromptFromMood(mood);

  if (!serverIp || serverIp.trim() === '' || serverIp === '192.168.1.1') {
    console.error('Server IP not configured');
    return null;
  }

  const serverUrl = `http://${serverIp.trim()}:8000/generate_music`;

  onProgress?.(`Generating ${instrumentName}...`);

  try {
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        duration: 10, // 10 seconds — fast generation
        instrument_index: instrumentIndex,
      }),
    });

    if (!response.ok) {
      console.error(`Music generation request failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.success) {
      console.error('Music generation error:', data.error);
      onProgress?.(`Error: ${data.error}`);
      return null;
    }

    onProgress?.(`${instrumentName} ready! (${data.generation_time}s)`);
    return data.audio; // base64 data URI
  } catch (error: any) {
    console.error('Music generation error:', error?.message || error);
    onProgress?.('Generation failed — using samples');
    return null;
  }
}

/**
 * Get the instrument style names for display
 */
export function getInstrumentNames(): string[] {
  return INSTRUMENT_STYLES.map((s) => s.name);
}

export const INSTRUMENT_COUNT = INSTRUMENT_STYLES.length;
export const TILES_PER_TRACK = 12;
export const AUDIO_DURATION_S = 10; // 10 seconds per generation
export const TILE_DURATION_MS = Math.round((AUDIO_DURATION_S * 1000) / TILES_PER_TRACK); // ~833ms per tile
