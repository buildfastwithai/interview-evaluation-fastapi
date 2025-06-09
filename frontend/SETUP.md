# AI Video Transcript Extractor - Frontend Setup

## Prerequisites

1. Node.js 18+ installed
2. Digital Ocean Spaces account and bucket
3. FastAPI backend running (see parent directory)

## Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
# Digital Ocean Spaces Configuration
NEXT_PUBLIC_DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
NEXT_PUBLIC_DO_SPACES_BUCKET=your-bucket-name
NEXT_PUBLIC_DO_SPACES_REGION=nyc3
DO_SPACES_ACCESS_KEY_ID=your-access-key
DO_SPACES_SECRET_ACCESS_KEY=your-secret-key

# FastAPI Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Digital Ocean Spaces Setup

1. Create a Digital Ocean account and navigate to Spaces
2. Create a new Space (bucket)
3. Generate API keys:
   - Go to API → Spaces Keys
   - Generate a new key pair
   - Note the Access Key ID and Secret Access Key
4. Configure CORS for your Space:
   - Go to your Space settings
   - Add CORS rule:
     ```json
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
     ```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- **File Upload**: Upload video/audio files directly to Digital Ocean Spaces
- **URL Processing**: Enter YouTube, Vimeo, or other video URLs
- **AI Processing**: Choose between OpenAI and Google Gemini for transcription
- **Custom Formatting**: Provide custom prompts for AI formatting
- **Download Results**: Download transcripts as text files
- **Copy to Clipboard**: Easy copying of results

## Usage

1. **Configure**: Select AI provider and customize format prompt
2. **Upload**: Either upload a file or enter a video URL
3. **Process**: The system will:
   - Upload file to Digital Ocean Spaces (if applicable)
   - Send to FastAPI backend for processing
   - Display formatted and raw transcripts
4. **Export**: Copy or download results

## Supported File Types

- **Video**: MP4, AVI, MOV, WMV, QuickTime
- **Audio**: MP3, WAV, M4A, MPEG
- **URLs**: YouTube, Vimeo, and other platforms supported by yt-dlp

## File Size Limits

- Maximum file size: 100MB
- Large files are automatically chunked for processing

## Troubleshooting

### Upload Issues

- Check Digital Ocean Spaces credentials
- Verify CORS configuration
- Ensure file size is under 100MB

### Processing Issues

- Ensure FastAPI backend is running
- Check API URL configuration
- Verify OpenAI/Gemini API keys in backend

### Build Issues

- Clear `.next` directory: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check React 19 compatibility warnings
