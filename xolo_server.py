import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel, logging as transformers_logging
from fastapi import FastAPI, UploadFile, File
import uvicorn
import io
import threading
import time

# 1. Silences the "UNEXPECTED" key reports and other warnings
transformers_logging.set_verbosity_error()

app = FastAPI()

# Global variables for the model
model = None
processor = None
is_ready = False

def load_model_background():
    global model, processor, is_ready
    print("⏳ AI Brain is warming up (Optimizing CLIP model)...")
    start_time = time.time()
    
    # Use GPU if available, else CPU
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    # Load model (Silent due to line 8)
    model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    
    # Half-precision optimization for faster inference on GPU
    if device == "cuda":
        model = model.half() 
        
    is_ready = True
    end_time = time.time()
    print(f"✅ AI Brain is READY (Clean Load in {round(end_time - start_time, 2)}s)")

# Start loading the model in a separate thread so the server starts INSTANTLY
threading.Thread(target=load_model_background).start()

MOOD_LIBRARY = [
    {"id": "lofi_chill", "prompt": "cozy lofi hip hop aesthetic, rainy window, purple lighting", "label": "Lofi Chill", "description": "Soft keys and dusty rhythms.", "dna": {"scale": "minor_pentatonic", "key": "C", "bpm": 80, "instrument": "electric_piano", "color": "#6a5acd"}},
    {"id": "cyberpunk_neon", "prompt": "cyberpunk city neon lights, high tech, cinematic", "label": "Cyberpunk Neon", "description": "Aggressive digital pulses.", "dna": {"scale": "phrygian", "key": "F#", "bpm": 128, "instrument": "lead_synth", "color": "#ff00ff"}},
    {"id": "zen_garden", "prompt": "peaceful zen garden, japanese trees, meditative", "label": "Zen Garden", "description": "Minimalist bamboo flutes.", "dna": {"scale": "major_pentatonic", "key": "G", "bpm": 65, "instrument": "bamboo_flute", "color": "#98fb98"}},
    {"id": "ethereal_space", "prompt": "deep space nebula, cosmic beauty, dreamy", "label": "Ethereal Space", "description": "Floating crystalline notes.", "dna": {"scale": "lydian", "key": "Db", "bpm": 60, "instrument": "glass_pad", "color": "#e0ffff"}},
    {"id": "dark_gothic", "prompt": "dark gothic cathedral, shadows, mysterious", "label": "Dark Gothic", "description": "Haunting low-end melodies.", "dna": {"scale": "aeolian", "key": "Am", "bpm": 90, "instrument": "pipe_organ", "color": "#2f4f4f"}},
    {"id": "tropical_sun", "prompt": "sunny tropical beach, turquoise water, energetic", "label": "Tropical Sun", "description": "Bright upbeat tropical rhythms.", "dna": {"scale": "major", "key": "C", "bpm": 120, "instrument": "steel_drum", "color": "#ffd700"}}
]

PROMPTS = [m["prompt"] for m in MOOD_LIBRARY]

@app.get("/")
async def root():
    return {
        "status": "Online" if is_ready else "Loading AI...",
        "ai_ready": is_ready
    }

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not is_ready:
        return {"success": False, "error": "AI Brain is still loading. Please wait."}

    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    device = "cuda" if torch.cuda.is_available() else "cpu"

    # Process through CLIP
    inputs = processor(text=PROMPTS, images=image, return_tensors="pt", padding=True).to(device)
    
    with torch.no_grad():
        outputs = model(**inputs)
        probs = outputs.logits_per_image.softmax(dim=1).flatten().tolist()

    results = []
    for i, prob in enumerate(probs):
        results.append({"confidence": round(prob * 100, 2), **MOOD_LIBRARY[i]})

    results.sort(key=lambda x: x["confidence"], reverse=True)
    
    top_matches = results[:5]
    print(f"📸 Analysis Complete! Top Match: {top_matches[0]['label']} ({top_matches[0]['confidence']}%)")
    
    return {"success": True, "matches": top_matches}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
