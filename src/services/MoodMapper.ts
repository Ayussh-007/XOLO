export interface MoodParams {
  moodLabel: string;
  tempo: number;
  scale: 'major' | 'minor' | 'phrygian' | 'aeolian';
  key: string;
  instruments: string[];
}

interface MoodMapping {
  keywords: string[];
  params: MoodParams;
}

const MOOD_MAPPINGS: MoodMapping[] = [
  {
    keywords: ['beach', 'mountain', 'forest', 'tree', 'ocean', 'valley', 'lakeside', 'alp'],
    params: {
      moodLabel: 'calm',
      tempo: 70,
      scale: 'major',
      key: 'C',
      instruments: ['piano', 'strings'],
    },
  },
  {
    keywords: ['street', 'building', 'traffic', 'car', 'bus', 'skyscraper', 'road', 'asphalt'],
    params: {
      moodLabel: 'tense',
      tempo: 110,
      scale: 'minor',
      key: 'Am',
      instruments: ['synth', 'bass'],
    },
  },
  {
    keywords: ['bedroom', 'kitchen', 'library', 'couch', 'table', 'shelf', 'indoor', 'room'],
    params: {
      moodLabel: 'warm',
      tempo: 80,
      scale: 'major',
      key: 'G',
      instruments: ['guitar', 'piano'],
    },
  },
  {
    keywords: ['night', 'dark', 'shadow', 'moon', 'evening', 'candle', 'dim'],
    params: {
      moodLabel: 'mysterious',
      tempo: 85,
      scale: 'phrygian',
      key: 'Em',
      instruments: ['pad', 'bells'],
    },
  },
  {
    keywords: ['sport', 'gym', 'crowd', 'stadium', 'ball', 'athlete', 'action'],
    params: {
      moodLabel: 'energetic',
      tempo: 140,
      scale: 'minor',
      key: 'Dm',
      instruments: ['drums', 'synth'],
    },
  },
  {
    keywords: ['flower', 'park', 'children', 'garden', 'blossom', 'petal', 'butterfly'],
    params: {
      moodLabel: 'joyful',
      tempo: 120,
      scale: 'major',
      key: 'F',
      instruments: ['marimba', 'flute'],
    },
  },
];

const DEFAULT_MOOD: MoodParams = {
  moodLabel: 'calm',
  tempo: 70,
  scale: 'major',
  key: 'C',
  instruments: ['piano', 'strings'],
};

/**
 * Maps classification labels to musical parameters.
 * It searches the top labels for keywords and returns the first matching mood.
 */
export const getMoodParams = (labels: string[]): MoodParams => {
  if (!labels || labels.length === 0) return DEFAULT_MOOD;

  const normalizedLabels = labels.map((l) => l.toLowerCase());

  for (const mapping of MOOD_MAPPINGS) {
    const hasMatch = mapping.keywords.some((keyword) =>
      normalizedLabels.some((label) => label.includes(keyword))
    );

    if (hasMatch) {
      return mapping.params;
    }
  }

  return DEFAULT_MOOD;
};
