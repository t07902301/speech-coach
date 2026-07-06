import os
import random
import io
import json
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, status
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from utils import (
    clip_speech_to_text,
    speech_to_text_group_sentence,
    eval_revision,
    evaluate_audio_discrepancy,
    load_fileStorage,
    speech_to_text,
    text_to_text,
    text_to_speech_multilingual
)

app = FastAPI(title="Speech API", docs_url="/api/docs", openapi_url="/api/openapi.json")

# --- CORS Configuration ---
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Templates Configuration ---
templates = Jinja2Templates(directory="templates")


# --- Pydantic Models for JSON Payloads ---
class SynthesisRequest(BaseModel):
    text: str
    language: str


# --- Global Exception Handler (Replacing Werkzeug HTTPException handler) ---
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.status_code,
            "name": getattr(exc, "name", "HTTP Exception"),
            "description": exc.detail,
        },
    )

@app.exception_handler(Exception)
async def universal_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "code": 500,
            "name": "Internal Server Error",
            "description": str(exc),
        },
    )


# --- Routes ---

# Note: Using standard 'def' here so FastAPI handles the blocking I/O / file writing in a thread pool.
@app.post("/api/speeches/audios")
def save_audio(audio: UploadFile = File(...)):
    try:
        storage_dir = "database/audios"
        os.makedirs(storage_dir, exist_ok=True)
        storage_path = os.path.join(storage_dir, audio.filename)
        
        # load_fileStorage might expect a file-like object; audio.file provides that.
        load_fileStorage(audio.file, storage_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return {"message": "File saved successfully", "file_path": storage_path}


@app.post("/api/speeches/transcriptions")
def transcribe(audio: UploadFile = File(...)):
    try:
        # Pass the file-like object wrapped inside UploadFile
        transcript = speech_to_text(audio.file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"transcript": transcript}


@app.post("/api/speeches/revisions")
def revise_transcript(
    payload: str = Form(...), 
    image: Optional[UploadFile] = File(None)
):
    try:
        payload_dict = json.loads(payload)
        
        # Extract file contents if the image exists
        image_file = image.file if image else None
        
        response_text = text_to_text(
            payload_dict["transcript"], image_file, payload_dict["customized_prompt"]
        )
        revision_score = eval_revision(payload_dict["transcript"], response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return {
        "revisedTranscript": response_text,
        "revisionScore": revision_score,
    }


@app.post("/api/speeches/transcription_clips")
def transcribe_audio_clip(
    audio: UploadFile = File(...), 
    clip_option: str = Form("sentence")
):
    try:
        if clip_option == "sentence":
            transcript_clips = speech_to_text_group_sentence(audio.file)
        else:
            transcript_clips = clip_speech_to_text(audio.file)
        return {"transcription": transcript_clips}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/speeches/generate/synthesis")
def generate_speech(data: SynthesisRequest):
    try:
        synthesis_result = text_to_speech_multilingual(data.text, data.language)
        return {
            "audio": synthesis_result["audio"],
            "characters": synthesis_result["characters"]
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/speeches/acoustic_evaluation")
def predict_acoustics_scores(
    query_audio: UploadFile = File(...),
    reference_audio: UploadFile = File(...),
    query_start: float = Form(0.0)
):
    try:
        # Read the raw browser bytes immediately (synchronous read)
        query_raw_bytes = query_audio.file.read()
        reference_raw_bytes = reference_audio.file.read()
        
        query_start = max(0.0, query_start)

        score = evaluate_audio_discrepancy(
            io.BytesIO(query_raw_bytes),
            io.BytesIO(reference_raw_bytes),
            query_start
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return {"score": score}


# Lightweight, non-blocking requests can use async def safely
@app.get("/api/sample-questions")
async def sample_questions():
    questions = [
        "What kind of TV programmes do you like to watch?",
        "Do you like reading books? Why?",
    ]
    return {"question": random.choice(questions)}


@app.get("/api/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/fake_transcribe")
async def fake_transcribe():
    return {"transcript": "This is a fake transcript"}