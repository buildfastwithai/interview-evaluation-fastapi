from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional, Literal, List
import os
import re
import tempfile
import shutil
import math
from dotenv import load_dotenv
import openai
import google.generativeai as genai
import requests
import json
import yt_dlp
import ffmpeg

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Video Transcript API",
    description="Lightweight API for video transcript extraction and AI-powered formatting",
    version="1.0.0"
)

# CORS middleware for web applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class TranscriptRequest(BaseModel):
    video_url: str
    ai_provider: Literal["openai", "gemini"] = "openai"
    format_prompt: Optional[str] = "Please format this transcript into a clear, well-structured summary with key points and main topics."

class TranscriptResponse(BaseModel):
    video_id: Optional[str] = None
    filename: Optional[str] = None
    raw_transcript: str
    formatted_response: str
    ai_provider: str
    file_chunks: Optional[int] = None

class HealthResponse(BaseModel):
    status: str
    message: str

# Utility functions
def extract_video_id_from_url(url: str) -> Optional[str]:
    """Extract video ID from URL for reference (optional)"""
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com/v/([a-zA-Z0-9_-]{11})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None

def download_audio_from_url(video_url: str) -> str:
    """Download audio from video URL using yt-dlp"""
    try:
        # Create temporary directory
        temp_dir = tempfile.mkdtemp()
        
        # Configure yt-dlp options with error handling
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(temp_dir, 'audio.%(ext)s'),
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info = ydl.extract_info(video_url, download=True)
            except Exception as download_error:
                raise Exception(f"Download failed: {str(download_error)}")
            
        # Find the downloaded file
        audio_files = []
        for file in os.listdir(temp_dir):
            if file.endswith(('.mp3', '.m4a', '.webm', '.ogg')):
                audio_files.append(os.path.join(temp_dir, file))
                
        if not audio_files:
            raise Exception("No audio file found after download. The video might not be available or accessible.")
            
        return audio_files[0]  # Return the first audio file found
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not download audio from {video_url}. Error: {str(e)}")

def split_audio_file(audio_file_path: str, max_size_mb: int = 25) -> List[str]:
    """Split audio file into chunks if it's larger than max_size_mb"""
    file_size = os.path.getsize(audio_file_path)
    max_size_bytes = max_size_mb * 1024 * 1024
    
    if file_size <= max_size_bytes:
        return [audio_file_path]  # No need to split
    
    # Calculate number of chunks needed
    num_chunks = math.ceil(file_size / max_size_bytes)
    
    # Get audio duration using ffmpeg
    try:
        probe = ffmpeg.probe(audio_file_path)
        duration = float(probe['streams'][0]['duration'])
    except:
        # Fallback: estimate based on file size
        duration = file_size / (128 * 1024 / 8)  # Assume 128kbps
    
    chunk_duration = duration / num_chunks
    
    # Split the audio file
    chunk_files = []
    temp_dir = os.path.dirname(audio_file_path)
    base_name = os.path.splitext(os.path.basename(audio_file_path))[0]
    
    for i in range(num_chunks):
        start_time = i * chunk_duration
        chunk_file = os.path.join(temp_dir, f"{base_name}_chunk_{i+1}.mp3")
        
        try:
            (
                ffmpeg
                .input(audio_file_path, ss=start_time, t=chunk_duration)
                .output(chunk_file, acodec='mp3', audio_bitrate='128k')
                .overwrite_output()
                .run(quiet=True)
            )
            chunk_files.append(chunk_file)
        except Exception as e:
            # Clean up on error
            for cf in chunk_files:
                if os.path.exists(cf):
                    os.remove(cf)
            raise Exception(f"Failed to split audio file: {str(e)}")
    
    return chunk_files

def transcribe_with_whisper(audio_file_path: str) -> tuple[str, int]:
    """Transcribe audio file using OpenAI Whisper API, handling large files"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured.")
    
    client = openai.OpenAI(api_key=api_key)
    
    try:
        # Split file if needed
        chunk_files = split_audio_file(audio_file_path)
        transcriptions = []
        
        for i, chunk_file in enumerate(chunk_files):
            print(f"Transcribing chunk {i+1}/{len(chunk_files)}...")
            
            with open(chunk_file, "rb") as audio_file:
                response = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
                transcriptions.append(response)
        
        # Combine all transcriptions
        full_transcript = " ".join(transcriptions)
        
        return full_transcript, len(chunk_files)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Whisper transcription error: {str(e)}")
    finally:
        # Clean up all files
        try:
            if audio_file_path and os.path.exists(audio_file_path):
                os.remove(audio_file_path)
            
            # Clean up chunk files if they exist
            temp_dir = os.path.dirname(audio_file_path) if audio_file_path else None
            if temp_dir and os.path.exists(temp_dir):
                for file in os.listdir(temp_dir):
                    if file.endswith('_chunk_') and file.endswith('.mp3'):
                        chunk_path = os.path.join(temp_dir, file)
                        if os.path.exists(chunk_path):
                            os.remove(chunk_path)
                
                # Clean up temp directory if empty
                try:
                    os.rmdir(temp_dir)
                except:
                    pass
        except Exception as cleanup_error:
            print(f"Warning: Cleanup failed: {cleanup_error}")

def format_with_openai(transcript: str, prompt: str) -> str:
    """Format transcript using OpenAI API"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured.")
    
    client = openai.OpenAI(api_key=api_key)
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that formats and summarizes video transcripts."},
                {"role": "user", "content": f"{prompt}\n\nTranscript:\n{transcript}"}
            ],
            max_tokens=1500,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

def format_with_gemini(transcript: str, prompt: str) -> str:
    """Format transcript using Google Gemini API"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured.")
    
    genai.configure(api_key=api_key)
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        full_prompt = f"{prompt}\n\nTranscript:\n{transcript}"
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

# API Endpoints
@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="AI Video Transcript API is running"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check"""
    return HealthResponse(
        status="healthy",
        message="All systems operational"
    )

@app.post("/extract-transcript", response_model=TranscriptResponse)
async def extract_and_format_transcript(request: TranscriptRequest):
    """
    Extract transcript from video URL using Whisper and format it using AI
    
    - **video_url**: Video URL (YouTube, etc.)
    - **ai_provider**: Choose between 'openai' or 'gemini'
    - **format_prompt**: Custom prompt for AI formatting (optional)
    """
    try:
        # Extract video ID for reference (optional)
        video_id = extract_video_id_from_url(request.video_url)
        
        # Use Whisper API for transcription
        print("Using Whisper API for transcription...")
        audio_file_path = download_audio_from_url(request.video_url)
        raw_transcript, num_chunks = transcribe_with_whisper(audio_file_path)
        
        # Format with AI
        if request.ai_provider == "openai":
            formatted_response = format_with_openai(raw_transcript, request.format_prompt)
        elif request.ai_provider == "gemini":
            formatted_response = format_with_gemini(raw_transcript, request.format_prompt)
        else:
            raise HTTPException(status_code=400, detail="Invalid AI provider. Choose 'openai' or 'gemini'")
        
        return TranscriptResponse(
            video_id=video_id,
            raw_transcript=raw_transcript,
            formatted_response=formatted_response,
            ai_provider=request.ai_provider,
            file_chunks=num_chunks
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")



@app.post("/upload-audio", response_model=TranscriptResponse)
async def upload_and_transcribe_audio(
    file: UploadFile = File(...),
    ai_provider: Literal["openai", "gemini"] = "openai",
    format_prompt: str = "Please format this transcript into a clear, well-structured summary with key points and main topics."
):
    """
    Upload audio file and transcribe using Whisper, then format with AI
    
    - **file**: Audio file (mp3, wav, m4a, etc.)
    - **ai_provider**: Choose between 'openai' or 'gemini'
    - **format_prompt**: Custom prompt for AI formatting
    """
    try:
        # Validate file type
        allowed_extensions = {'.mp3', '.wav', '.m4a', '.mp4', '.avi', '.mov', '.webm'}
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}")
        
        # Save uploaded file temporarily
        temp_dir = tempfile.mkdtemp()
        temp_file_path = os.path.join(temp_dir, file.filename)
        
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Transcribe with Whisper
        raw_transcript, num_chunks = transcribe_with_whisper(temp_file_path)
        
        # Format with AI
        if ai_provider == "openai":
            formatted_response = format_with_openai(raw_transcript, format_prompt)
        elif ai_provider == "gemini":
            formatted_response = format_with_gemini(raw_transcript, format_prompt)
        else:
            raise HTTPException(status_code=400, detail="Invalid AI provider. Choose 'openai' or 'gemini'")
        
        return TranscriptResponse(
            filename=file.filename,
            raw_transcript=raw_transcript,
            formatted_response=formatted_response,
            ai_provider=ai_provider,
            file_chunks=num_chunks
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio file: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 