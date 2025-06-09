# AI Interview Analysis Platform

A comprehensive AI-powered platform for interview analysis with skill assessment, Q&A grading, and detailed insights. Also supports general video transcription and formatting.

## Features

### 🎯 Comprehensive Interview Analysis

- **Skill Assessment**: Evaluate specific skills with confidence scores and evidence
- **Q&A Extraction**: Automatic extraction and grading of interview questions and answers
- **Performance Insights**: Detailed analysis including communication clarity, technical depth, and hiring recommendations
- **Structured AI Responses**: Uses OpenAI's structured output for consistent, reliable analysis

### 📝 Transcript Extraction

- **Multi-format Support**: MP3, WAV, M4A, MP4, AVI, MOV, WebM, MKV
- **YouTube Integration**: Direct URL processing for YouTube videos
- **AI-Powered Formatting**: Clean, readable transcript formatting
- **Chunked Processing**: Handles large files by splitting into manageable chunks

### 🤖 AI Providers

- **OpenAI**: Whisper for transcription, GPT-4 for analysis (recommended for structured responses)
- **Google Gemini**: Alternative AI provider for basic formatting

## Quick Start

### Backend Setup

1. **Install Dependencies**

```bash
pip install fastapi uvicorn python-multipart openai google-generativeai yt-dlp ffmpeg-python python-dotenv
```

2. **Environment Configuration**
   Create a `.env` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here  # Optional
```

3. **Run the FastAPI Server**

```bash
python main.py
# Server will start on http://localhost:8000
```

### Frontend Setup

1. **Navigate to Frontend Directory**

```bash
cd frontend
```

2. **Install Dependencies**

```bash
npm install
```

3. **Environment Configuration**
   Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **Run the Development Server**

```bash
npm run dev
# Frontend will start on http://localhost:3000
```

## API Endpoints

### 📊 Interview Analysis

#### `POST /analyze-interview`

Comprehensive interview analysis with skill assessment and insights.

**Parameters:**

- `file`: Audio/video file (multipart/form-data)
- `skills_to_assess`: Comma-separated skills list (form field)
- `job_role`: Job role for context (form field, default: "Software Developer")
- `company_name`: Company name for context (form field, default: "Company")
- `ai_provider`: AI provider (form field, default: "openai")

**Example Request:**

```bash
curl -X POST "http://localhost:8000/analyze-interview" \
  -F "file=@interview.mp3" \
  -F "skills_to_assess=Python,React,Problem Solving,Communication" \
  -F "job_role=Senior Developer" \
  -F "company_name=Tech Corp"
```

**Response Structure:**

```json
{
  "filename": "interview.mp3",
  "raw_transcript": "...",
  "formatted_transcript": "...",
  "ai_provider": "openai",
  "file_chunks": 2,
  "skill_assessments": [
    {
      "skill": "Python",
      "level": "Advanced",
      "confidence_score": 85,
      "evidence": "Demonstrated strong knowledge...",
      "recommendations": "Consider exploring..."
    }
  ],
  "questions_and_answers": [
    {
      "question": "Tell me about your Python experience",
      "answer": "I have been working with Python...",
      "grade": "Good",
      "score": 78,
      "feedback": "Good technical explanation...",
      "key_points_covered": ["Experience", "Projects"],
      "areas_for_improvement": ["More specific examples"]
    }
  ],
  "interview_insights": {
    "overall_performance_score": 75,
    "communication_clarity": 80,
    "technical_depth": 70,
    "problem_solving_ability": 85,
    "confidence_level": 75,
    "strengths": ["Clear communication", "Strong technical knowledge"],
    "weaknesses": ["Could provide more examples"],
    "hiring_recommendation": "Recommend for hire with considerations...",
    "next_steps": ["Technical deep-dive interview", "Reference checks"]
  },
  "analysis_summary": "Executive summary of the analysis..."
}
```

#### `POST /analyze-interview-url`

Same as above but accepts a video URL instead of file upload.

**Parameters:**

- `video_url`: Video URL (YouTube, etc.)
- `skills_to_assess`: Comma-separated skills list
- `job_role`: Job role for context
- `company_name`: Company name for context
- `ai_provider`: AI provider

### 📝 General Transcription

#### `POST /extract-transcript`

Extract and format transcript from video URL.

#### `POST /upload-audio`

Upload audio file for transcription and formatting.

## Skill Assessment Levels

- **Expert**: Demonstrates mastery and deep understanding
- **Advanced**: Strong knowledge with practical application
- **Intermediate**: Good understanding with some gaps
- **Beginner**: Basic knowledge, needs development
- **Not Demonstrated**: Skill not shown in the interview

## Q&A Grading Scale

- **Excellent (90-100)**: Outstanding answer with depth and clarity
- **Good (70-89)**: Solid answer covering key points
- **Average (50-69)**: Adequate answer with room for improvement
- **Below Average (30-49)**: Weak answer missing key elements
- **Poor (0-29)**: Inadequate or incorrect answer

## Performance Metrics

The system evaluates candidates across multiple dimensions:

- **Overall Performance**: Comprehensive score (0-100)
- **Communication Clarity**: How well the candidate communicates
- **Technical Depth**: Level of technical knowledge demonstrated
- **Problem Solving**: Ability to think through problems
- **Confidence Level**: Candidate's confidence and self-assurance

## Best Practices

### For Accurate Analysis

1. **Clear Audio Quality**: Ensure good audio quality for better transcription
2. **Specific Skills**: List specific, relevant skills for assessment
3. **Proper Context**: Provide accurate job role and company information
4. **Interview Structure**: Well-structured interviews yield better analysis

### Skill Input Examples

- **Technical**: "Python, JavaScript, React, SQL, AWS, Docker"
- **Soft Skills**: "Communication, Leadership, Problem Solving, Teamwork"
- **Domain-Specific**: "Machine Learning, Data Analysis, System Design"

## Limitations

- Currently optimized for English-language interviews
- Works best with structured interview formats
- Requires OpenAI API for comprehensive analysis features
- Analysis quality depends on audio quality and interview content

## Error Handling

The API includes comprehensive error handling:

- File format validation
- Transcript quality validation
- Skill count limits (max 20 skills)
- AI provider compatibility checks
- Structured response validation

## Security Considerations

- Files are processed temporarily and cleaned up automatically
- No permanent storage of audio/video files
- API keys should be secured and rotated regularly
- Consider rate limiting for production deployments

## Development

### Adding New Analysis Features

1. Define new Pydantic models in `main.py`
2. Create analysis functions using OpenAI structured responses
3. Update the response models to include new data
4. Add frontend components to display new insights

### Custom AI Prompts

The system uses carefully crafted prompts for each analysis type. You can customize these prompts in the respective functions to better suit your interview style or requirements.

## Contributing

Contributions are welcome! Please ensure:

- Add appropriate error handling
- Include type hints and documentation
- Test with various file formats and interview styles
- Follow the existing code structure and patterns

## License

MIT License - see LICENSE file for details.
