<p align="center">
  <h1 align="center">XOLO</h1>
  <p align="center"><strong>AI-Powered Photo → Music Generator</strong></p>
  <p align="center">
    <em>Snap a photo. Detect the vibe. Perform your melody.</em>
  </p>
</p>

---

## 🌟 Overview

**XOLO** is a multimodal AI mobile application that translates the visual atmosphere of a photograph into a unique musical composition. Using the power of OpenAI's **CLIP** model hosted locally on your laptop, XOLO analyzes the emotional "DNA" of a scene and generates a custom Smart Instrument that allows anyone to perform professional-sounding music, regardless of their training.

---

## ✨ Key Features

- 📸 **Visual Vibe Analysis** — Capture a scene or upload from your gallery.
- 🧠 **Local AI Brain** — Hosted Python server using CLIP for deep, zero-shot multimodal reasoning.
- 🎼 **Smart Mapping** — Re-tunes 12 interactive pads to musical scales (Major, Minor, Pentatonic, Phrygian, etc.) that match the photo's mood.
- 🎹 **Performance Grid** — A glowing 12-key instrument designed for high-fidelity musical expression.
- 🤖 **Auto-Jam Mode** — Let the AI perform a beautiful, never-ending melody based on the detected mood.
- 🎨 **Dark Luxury UI** — A premium aesthetic featuring dynamic gradients and custom typography (Syne & DM Sans).

---

## 🏗️ Technical Architecture

### 1. The Mobile App (React Native / Expo)
The "Player" that handles user interaction, camera capture, and real-time audio performance.
- **Navigation:** React Navigation 7 (Native Stack)
- **State:** Zustand (Session & Global Config)
- **Audio:** Expo-AV (High-quality sampled instrument playback)
- **Networking:** Local binary uploads to the Python Brain.

### 2. The AI Brain (Python / FastAPI)
The "Processor" that runs on your laptop to handle heavy AI inference.
- **Model:** OpenAI CLIP (`clip-vit-base-patch32`)
- **Backend:** FastAPI with Uvicorn (Host: `0.0.0.0`)
- **Intelligence:** Maps visual embeddings to 6 musical archetypes (*Lofi, Cyberpunk, Zen, Ethereal, Dark Gothic, Tropical*).

---

## 🚀 Getting Started

### Step 1: Set up the AI Brain (Laptop)
Ensure you have **Python 3.10+** installed.

1. **Install Dependencies:**
   ```bash
   pip install torch torchvision transformers fastapi uvicorn pillow python-multipart
   ```
2. **Run the Server:**
   ```bash
   python xolo_server.py
   ```
   *Note: On the first run, the CLIP model (~600MB) will be downloaded automatically.*

### Step 2: Set up the Mobile App (Phone)
1. **Find your Laptop's IP Address:**
   - Windows: `ipconfig` (IPv4 Address)
   - Mac/Linux: `ifconfig` or check Network Settings.
2. **Launch XOLO:**
   - Run `npx expo start` and open it on your device.
3. **Configure Connection:**
   - On the **Home Screen**, enter your laptop's IP in the **"AI BRAIN IP"** box.
   - Ensure both devices are on the **same Wi-Fi network**.

---

## 📂 Project Structure

```text
XOLO/
├── src/
│   ├── api/          # Network services (Brain API)
│   ├── components/   # Reusable UI (Buttons, Waveforms, etc.)
│   ├── hooks/        # Reactive logic (Theme, Brain Setup)
│   ├── navigation/   # Root Navigator & Type definitions
│   ├── screens/      # Feature-based screen modules
│   ├── store/        # Zustand global stores
│   └── theme/        # Design system & color tokens
├── xolo_server.py    # Python AI Brain (Laptop side)
├── App.tsx           # Entry point
└── README.md         # Documentation
```

---

## 💡 How it Works (The Math)

1. **Vision:** CLIP converts your image into a 512-dimensional vector.
2. **Comparison:** It calculates the cosine similarity between your image vector and several pre-defined text mood vectors.
3. **Synthesis:** The top match defines the **Musical DNA** (BPM, Scale, Key, and Instrument).
4. **Logic:** The mobile app maps these parameters to the performance grid, ensuring zero dissonant notes.

---

<p align="center">
  Built with ❤️ for AI Musicians.
</p>
