import torch
import numpy as np
import base64
import io
import threading
import time
from PIL import Image
from transformers import CLIPProcessor, CLIPModel, AutoProcessor, MusicgenForConditionalGeneration, logging as transformers_logging
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import uvicorn
import scipy.io.wavfile as wavfile

# 1. Silences the "UNEXPECTED" key reports and other warnings
transformers_logging.set_verbosity_error()

app = FastAPI()

# Global variables for models
clip_model = None
clip_processor = None
music_model = None
music_processor = None
clip_ready = False
music_ready = False

def load_clip_background():
    global clip_model, clip_processor, clip_ready
    print("⏳ Loading CLIP model...")
    start_time = time.time()
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    
    if device == "cuda":
        clip_model = clip_model.half() 
        
    clip_ready = True
    print(f"✅ CLIP ready ({round(time.time() - start_time, 2)}s)")

def load_musicgen_background():
    global music_model, music_processor, music_ready
    print("⏳ Loading MusicGen model (facebook/musicgen-small)...")
    start_time = time.time()
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    music_processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
    music_model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small").to(device)
    
    if device == "cuda":
        music_model = music_model.half()
    
    music_ready = True
    print(f"✅ MusicGen ready ({round(time.time() - start_time, 2)}s)")

# Start loading both models in separate threads
threading.Thread(target=load_clip_background).start()
threading.Thread(target=load_musicgen_background).start()

MOOD_LIBRARY = [
    {"id": "lofi_chill", "prompt": "cozy lofi hip hop aesthetic, rainy window, purple lighting", "label": "Lofi Chill", "description": "Soft keys and dusty rhythms.", "dna": {"scale": "minor_pentatonic", "key": "C", "bpm": 80, "instrument": "electric_piano", "color": "#6a5acd"}},
    {"id": "cyberpunk_neon", "prompt": "cyberpunk city neon lights, high tech, cinematic", "label": "Cyberpunk Neon", "description": "Aggressive digital pulses.", "dna": {"scale": "phrygian", "key": "F#", "bpm": 128, "instrument": "lead_synth", "color": "#ff00ff"}},
    {"id": "zen_garden", "prompt": "peaceful zen garden, japanese trees, meditative", "label": "Zen Garden", "description": "Minimalist bamboo flutes.", "dna": {"scale": "major_pentatonic", "key": "G", "bpm": 65, "instrument": "bamboo_flute", "color": "#98fb98"}},
    {"id": "ethereal_space", "prompt": "deep space nebula, cosmic beauty, dreamy", "label": "Ethereal Space", "description": "Floating crystalline notes.", "dna": {"scale": "lydian", "key": "Db", "bpm": 60, "instrument": "glass_pad", "color": "#e0ffff"}},
    {"id": "dark_gothic", "prompt": "dark gothic cathedral, shadows, mysterious", "label": "Dark Gothic", "description": "Haunting low-end melodies.", "dna": {"scale": "aeolian", "key": "Am", "bpm": 90, "instrument": "pipe_organ", "color": "#2f4f4f"}},
    {"id": "tropical_sun", "prompt": "sunny tropical beach, turquoise water, energetic", "label": "Tropical Sun", "description": "Bright upbeat tropical rhythms.", "dna": {"scale": "major", "key": "C", "bpm": 120, "instrument": "steel_drum", "color": "#ffd700"}}
]

PROMPTS = [m["prompt"] for m in MOOD_LIBRARY]

# Instrument style prompts for the 3 variations
INSTRUMENT_PROMPTS = [
    "piano and strings, orchestral, cinematic, emotional",
    "synthesizer, electronic, ambient pads, digital beats",
    "acoustic guitar, drums, percussion, organic rhythms",
]

@app.get("/")
async def root():
    return {
        "status": "Online",
        "clip_ready": clip_ready,
        "music_ready": music_ready
    }

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not clip_ready:
        return {"success": False, "error": "AI Brain is still loading. Please wait."}

    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    device = "cuda" if torch.cuda.is_available() else "cpu"

    inputs = clip_processor(text=PROMPTS, images=image, return_tensors="pt", padding=True).to(device)
    
    with torch.no_grad():
        outputs = clip_model(**inputs)
        probs = outputs.logits_per_image.softmax(dim=1).flatten().tolist()

    results = []
    for i, prob in enumerate(probs):
        results.append({"confidence": round(prob * 100, 2), **MOOD_LIBRARY[i]})

    results.sort(key=lambda x: x["confidence"], reverse=True)
    
    top_matches = results[:5]
    print(f"📸 Analysis Complete! Top Match: {top_matches[0]['label']} ({top_matches[0]['confidence']}%)")
    
    return {"success": True, "matches": top_matches}


class MusicRequest(BaseModel):
    prompt: str
    duration: int = 10
    instrument_index: int = 0


@app.post("/generate_music")
async def generate_music(req: MusicRequest):
    if not music_ready:
        return {"success": False, "error": "MusicGen is still loading. Please wait."}

    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Build the full prompt with instrument style
        instrument_style = INSTRUMENT_PROMPTS[req.instrument_index % len(INSTRUMENT_PROMPTS)]
        full_prompt = f"{req.prompt}, {instrument_style}"
        
        print(f"🎵 Generating music: \"{full_prompt[:80]}...\" ({req.duration}s)")
        start_time = time.time()
        
        # Tokenize the prompt
        inputs = music_processor(
            text=[full_prompt],
            padding=True,
            return_tensors="pt",
        ).to(device)
        
        # Calculate max_new_tokens from duration
        # MusicGen generates at 50 tokens/sec for the audio codec
        tokens_per_second = 50
        max_tokens = req.duration * tokens_per_second
        
        # Generate audio
        with torch.no_grad():
            audio_values = music_model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                do_sample=True,
                temperature=1.0,
            )
        
        # Convert to numpy
        audio_data = audio_values[0, 0].cpu().float().numpy()
        
        # Normalize
        peak = np.abs(audio_data).max()
        if peak > 1e-4:
            audio_data = (audio_data / peak * 0.95).astype(np.float32)
        
        # Get sample rate from model config
        sample_rate = music_model.config.audio_encoder.sampling_rate  # Usually 32000
        
        # Encode to WAV in memory
        wav_buffer = io.BytesIO()
        # scipy expects int16 for WAV
        audio_int16 = (audio_data * 32767).astype(np.int16)
        wavfile.write(wav_buffer, sample_rate, audio_int16)
        wav_bytes = wav_buffer.getvalue()
        
        # Base64 encode
        audio_b64 = f"data:audio/wav;base64,{base64.b64encode(wav_bytes).decode()}"
        
        gen_time = round(time.time() - start_time, 2)
        print(f"✅ Music generated in {gen_time}s ({len(wav_bytes) // 1024}KB)")
        
        return {
            "success": True,
            "audio": audio_b64,
            "duration": req.duration,
            "sample_rate": sample_rate,
            "generation_time": gen_time,
        }
        
    except Exception as e:
        print(f"❌ Music generation failed: {e}")
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
