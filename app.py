from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import joblib
import os
import numpy as np
from model_train import train_model
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(title="Student Behavior Analysis API")

# --- 1. CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. Model Loading ---
MODEL_PATH = "model.pkl"

@app.on_event("startup")
def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        print("model.pkl not found. Training model now...")
        train_model()
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully.")

# --- 3. Request Schema ---
class BehaviorRequest(BaseModel):
    attendance: float
    grades: float
    social_engagement: float
    stress_level: float

# --- 4. API Endpoints ---
@app.post("/predict")
async def predict_behavior(request: BehaviorRequest):
    try:
        input_data = np.array([[
            request.attendance, 
            request.grades, 
            request.social_engagement, 
            request.stress_level
        ]])
        
        prediction = int(model.predict(input_data)[0])
        probabilities = model.predict_proba(input_data)[0]
        confidence = float(np.max(probabilities))
        
        result_label = "Needs Support" if prediction == 1 else "Balanced"
        
        return {
            "prediction": result_label,
            "confidence": confidence,
            "raw_result": prediction
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 5. Static File Serving (React Frontend) ---
# Check if build directory exists
dist_path = Path("dist")
if dist_path.exists():
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

@app.get("/{full_path:path}")
async def serve_react(full_path: str):
    if dist_path.exists():
        file_path = dist_path / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(dist_path / "index.html")
    return {"message": "API is running. Build the frontend to see the UI."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)
