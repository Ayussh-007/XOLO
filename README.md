<p align="center">
  <h1 align="center">XOLO</h1>
  <p align="center"><strong>AI-Powered Photo → Music Generator</strong></p>
  <p align="center">
    <em>Snap a photo. Detect the mood. Generate music.</em>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Expo-SDK_54-000020?style=flat-square&logo=expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

## 📖 Overview

**XOLO** is a React Native mobile app that transforms photographs into original music. Point your camera at any scene — a beach, a city street, a cozy room — and XOLO will analyze the visual content, determine a mood, and algorithmically generate a unique musical piece tailored to that mood.

### How It Works

```
📷 Capture Photo → 🧠 Scene Analysis → 🎭 Mood Mapping → 🎵 Music Generation → 🔊 Playback
```

1. **Capture** — Take a photo or pick one from your gallery
2. **Analyze** — AI classifies the scene into categories (nature, urban, indoor, etc.)
3. **Map** — Classification labels are mapped to musical parameters (tempo, scale, key, instruments)
4. **Generate** — An algorithmic engine creates a note sequence based on those parameters
5. **Play & Save** — Listen to the result and save it to your library

---

## ✨ Features

- 🎨 **Dark Luxury UI** — Stunning premium aesthetic with custom fonts, animations, and electric teal/amber accents
- 📷 **Camera & Gallery** — Capture live photos or pick from your photo library
- 🧠 **Scene Classification** — Identifies scene types from images
- 🎭 **Mood Mapping** — 6 mood profiles: Calm, Tense, Warm, Mysterious, Energetic, Joyful
- 🎵 **Algorithmic Music Generation** — Creates unique note sequences using music theory (scales, keys, tempo)
- 🔊 **Audio Playback** — Listen to generated tracks with expo-av
- 💾 **Save & History** — Persist results to device storage and review past analyses
- 📦 **Model Download Manager** — Downloads and caches ML assets on first launch
- ⚡ **Splash Screen** — Progress-tracked asset download on first run

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native 0.81 + Expo SDK 54 |
| **Language** | TypeScript 5.9 |
| **Navigation** | React Navigation 7 (Native Stack) |
| **State Management** | Zustand 5 |
| **Camera** | expo-camera (CameraView API) |
| **Image Picker** | expo-image-picker |
| **Audio** | expo-av |
| **File System** | expo-file-system |
| **Storage** | @react-native-async-storage/async-storage |
| **Media Library** | expo-media-library |

---

## 📁 Project Structure

```
PhotoMusic/
├── App.tsx                          # Root component with navigation setup
├── index.ts                         # Entry point (registerRootComponent)
├── app.json                         # Expo configuration
├── metro.config.js                  # Metro bundler config
├── package.json
├── tsconfig.json
│
├── assets/                          # App icons and splash images
│
└── src/
    ├── components/
    │   └── ui/                      # Reusable UI components (Buttons, Cards, Badges)
    │
    ├── hooks/
    │   └── useTFSetup.ts            # Engine initialization hook
    │
    ├── navigation/
    │   └── types.ts                 # RootStackParamList type definitions
    │
    ├── screens/
    │   ├── SplashDownloadScreen.tsx  # First-run model download with progress bar
    │   ├── HomeScreen.tsx            # Main menu (Camera / Gallery / History)
    │   ├── CameraScreen.tsx         # Camera capture & gallery picker
    │   ├── ResultScreen.tsx         # Analysis results, music gen, playback
    │   └── HistoryScreen.tsx        # Past analysis history with playback
    │
    ├── services/
    │   ├── TFLiteService.ts         # Image classification service
    │   ├── MoodMapper.ts            # Label → musical parameter mapping
    │   ├── MagentaService.ts        # Algorithmic music generation
    │   └── ModelDownloadManager.ts  # Download & cache ML model files
    │
    ├── store/
        └── useAppStore.ts           # Zustand global state store
    │
    └── theme/
        └── theme.ts                 # Design tokens (colors, fonts, spacing)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **Expo Go** app on your Android/iOS device
- **Expo CLI** (`npx expo`)

### Installation

```bash
# Clone the repository
git clone https://github.com/Ayussh-007/XOLO.git
cd XOLO

# Install dependencies
npm install

# Start the development server
npx expo start -c
```

### Running on Device

1. Install **Expo Go** from the [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) or [App Store](https://apps.apple.com/app/expo-go/id982107779)
2. Scan the QR code shown in the terminal
3. The app will download required assets on first launch

---

## 🎭 Mood Mapping System

XOLO maps visual scene labels to musical parameters:

| Scene Keywords | Mood | Tempo | Scale | Key | Instruments |
|---|---|---|---|---|---|
| beach, ocean, mountain, forest | **Calm** | 70 BPM | Major | C | Piano, Strings |
| street, building, traffic, car | **Tense** | 110 BPM | Minor | Am | Synth, Bass |
| bedroom, kitchen, library, room | **Warm** | 80 BPM | Major | G | Guitar, Piano |
| night, dark, shadow, moon | **Mysterious** | 85 BPM | Phrygian | Em | Pad, Bells |
| sport, gym, crowd, stadium | **Energetic** | 140 BPM | Minor | Dm | Drums, Synth |
| flower, park, garden, butterfly | **Joyful** | 120 BPM | Major | F | Marimba, Flute |

---

## 🗺️ Roadmap

- [ ] **Real ML Inference** — Integrate `react-native-fast-tflite` for on-device MobileNet classification
- [ ] **Audio Synthesis** — Generate actual WAV/MP3 output using a native audio bridge
- [ ] **Cloud Vision API** — Optional Google Cloud Vision integration for better accuracy
- [ ] **MIDI Export** — Export generated sequences as MIDI files
- [ ] **Custom Moods** — Let users create and save custom mood-to-music mappings
- [ ] **Social Sharing** — Share generated tracks to social media

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Ayussh-007">Ayussh-007</a>
</p>
