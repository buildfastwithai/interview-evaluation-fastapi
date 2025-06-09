# AI Video Transcript API

A lightweight FastAPI application for extracting video transcripts using OpenAI Whisper and formatting them with AI models.

## Features

- 🎥 **Universal Video Support**: Extract transcripts from any video URL using OpenAI Whisper
- ✂️ **Smart File Splitting**: Automatically handles large files by splitting into 25MB chunks
- 📁 **Direct File Upload**: Upload audio/video files directly for transcription
- 🤖 **AI Formatting**: Format transcripts using OpenAI GPT-3.5-turbo or Google Gemini
- 🚀 **Lightweight & Fast**: Optimized for deployment with minimal dependencies
- 🔐 **Secure**: Proper API key management and error handling
- 📝 **Customizable**: Custom formatting prompts for different use cases
- 🌐 **CORS Enabled**: Ready for web applications

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure API Keys

Create a `.env` file in the root directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here  # Optional, for Gemini formatting
```

### 3. Run the Application

```bash
# Development
python main.py

# Production with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Test the API

```bash
python test_api.py
```

## API Endpoints

### Health Check

```http
GET /
GET /health
```

### Extract and Format Transcript

```http
POST /extract-transcript
Content-Type: application/json

{
  "video_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "ai_provider": "openai",  // or "gemini"
  "format_prompt": "Summarize this transcript into key points"
}
```

### Upload Audio File

```http
POST /upload-audio
Content-Type: multipart/form-data

file: [audio/video file]
ai_provider: "openai"  // or "gemini"
format_prompt: "Summarize this content"
```

## Example Usage

### Using cURL

```bash
# Extract and format transcript
curl -X POST "http://localhost:8000/extract-transcript" \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "ai_provider": "openai",
    "format_prompt": "Create a bullet-point summary of the main topics discussed"
  }'

# Upload audio file
curl -X POST "http://localhost:8000/upload-audio" \
  -F "file=@audio.mp3" \
  -F "ai_provider=openai" \
  -F "format_prompt=Summarize this audio content"
```

### Using Python requests

```python
import requests

response = requests.post(
    "http://localhost:8000/extract-transcript",
    json={
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "ai_provider": "openai",
        "format_prompt": "Provide a detailed analysis of the content"
    }
)

result = response.json()
print(result["formatted_response"])
```

## Response Format

```json
{
  "video_id": "dQw4w9WgXcQ",
  "filename": null,
  "raw_transcript": "Original transcript text...",
  "formatted_response": "AI-formatted response...",
  "ai_provider": "openai",
  "file_chunks": 3
}
```

### Response Fields

- `video_id`: YouTube video ID (if applicable)
- `filename`: Original filename (for uploaded files)
- `raw_transcript`: Complete transcribed text
- `formatted_response`: AI-formatted and summarized content
- `ai_provider`: AI service used for formatting
- `file_chunks`: Number of chunks the file was split into (for large files)

## Key Features

### 🔧 Smart File Handling

- **Automatic Splitting**: Files larger than 25MB are automatically split into chunks
- **Chunk Processing**: Each chunk is transcribed separately with Whisper
- **Seamless Merging**: All transcriptions are combined into a single coherent text
- **Clean Cleanup**: Temporary files and chunks are automatically removed

### 🎯 Whisper Transcription

- **High Accuracy**: Uses OpenAI's Whisper API for superior transcription quality
- **Universal Support**: Works with any audio/video format supported by yt-dlp
- **No Caption Dependency**: Doesn't rely on existing captions or subtitles
- **Language Detection**: Automatic language detection and transcription

### 🤖 AI Formatting Options

- **OpenAI GPT-3.5**: Fast and cost-effective formatting
- **Google Gemini**: Alternative AI provider for formatting
- **Custom Prompts**: Tailor the formatting to your specific needs
- **Flexible Output**: Summaries, bullet points, analysis, or any custom format

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `GEMINI_API_KEY`: Your Google Gemini API key (optional)
- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: 0.0.0.0)

## Supported Platforms

- **Video Platforms**: YouTube, Vimeo, and any platform supported by yt-dlp
- **File Formats**: MP3, WAV, M4A, MP4, AVI, MOV, WebM
- **File Sizes**: Any size (automatically split if needed)
- **Languages**: Any language supported by OpenAI Whisper

## Error Handling

The API provides detailed error messages for:

- Invalid video URLs
- Unsupported file formats
- API key configuration issues
- File size and processing errors
- Network and download issues

## Testing

Run the comprehensive test suite:

```bash
python test_api.py
```

Tests include:

- Health check verification
- Whisper transcription with short videos
- Full pipeline testing (download → transcribe → format)
- File chunking for large files

## Performance Notes

- **Cost Optimization**: Uses GPT-3.5-turbo for formatting (cheaper than GPT-4)
- **File Splitting**: Handles large files without hitting API limits
- **Cleanup**: Automatic temporary file cleanup to save disk space
- **Async**: FastAPI provides async support for better performance

## Troubleshooting

### Common Issues

1. **FFmpeg not found**: Install ffmpeg on your system
2. **API key errors**: Ensure `OPENAI_API_KEY` is set in `.env`
3. **File too large**: The API automatically handles this with chunking
4. **Video unavailable**: Some videos may be private or restricted
