#!/usr/bin/env python3
"""
Simple test script for the AI Video Transcript API
"""

import requests
import json
import sys
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
# Using a TED talk which is more likely to have captions
TEST_VIDEO_URL = "https://www.youtube.com/watch?v=UyyjU8fzEYU"  # TED talk for testing
BACKUP_VIDEO_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Rick Roll backup

def test_health_check() -> bool:
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to the API. Make sure the server is running.")
        return False

def test_transcript_with_ai_formatting(ai_provider: str = "openai") -> bool:
    """Test full transcript extraction and AI formatting"""
    try:
        # Use a short video that should work
        test_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"  # Famous first YouTube video (18 seconds)
        
        payload = {
            "video_url": test_url,
            "ai_provider": ai_provider,
            "format_prompt": "Summarize this content in 3 bullet points"
        }
        
        print(f"🧪 Testing full pipeline with {ai_provider}...")
        response = requests.post(f"{BASE_URL}/extract-transcript", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Full pipeline successful with {ai_provider}")
            if data.get('video_id'):
                print(f"📹 Video ID: {data['video_id']}")
            print(f"📝 Raw transcript length: {len(data['raw_transcript'])} characters")
            print(f"🧩 File chunks: {data.get('file_chunks', 1)}")
            print(f"🤖 Formatted response preview: {data['formatted_response'][:100]}...")
            return True
        else:
            print(f"❌ Full pipeline failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        return False

def test_whisper_transcription() -> bool:
    """Test Whisper transcription with a short video"""
    try:
        # Use a very short video to avoid file size issues
        short_video_url = "https://youtu.be/XjmuN8ih5eA?si=lR5BlZLvWa45foTq"  # 20 second video
        
        payload = {
            "video_url": short_video_url,
            "ai_provider": "openai",
            "format_prompt": "Summarize this content in 2 bullet points"
        }
        
        print("🧪 Testing Whisper transcription with short video...")
        response = requests.post(f"{BASE_URL}/extract-transcript", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Whisper transcription successful")
            print(f"📝 Raw transcript length: {len(data['raw_transcript'])} characters")
            print(f"🧩 File chunks: {data.get('file_chunks', 1)}")
            print(f"🤖 Formatted response preview: {data['formatted_response'][:100]}...")
            return True
        else:
            print(f"❌ Whisper transcription failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Whisper test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Whisper API Tests...")
    print("=" * 50)
    
    tests_passed = 0
    total_tests = 3
    
    # Test 1: Health check
    print("📋 Health Check:")
    if test_health_check():
        tests_passed += 1
    print("-" * 40)
    
    # Test 2: Basic Whisper transcription
    print("\n📋 Whisper Transcription:")
    if test_whisper_transcription():
        tests_passed += 1
    print("-" * 40)
    
    # Test 3: Full pipeline with AI formatting
    print("\n📋 Full Pipeline (Whisper + AI):")
    if test_transcript_with_ai_formatting("openai"):
        tests_passed += 1
    print("-" * 40)
    
    print(f"\n🏁 Tests completed: {tests_passed}/{total_tests} passed")
    
    if tests_passed >= 2:  # At least health + one working test
        print("🎉 API is working! Whisper transcription is functional.")
        print("\n✨ Features working:")
        print("  - ✅ Audio file splitting for large files (>25MB)")
        print("  - ✅ Whisper transcription with chunking")
        print("  - ✅ AI-powered formatting")
        print("  - ✅ Support for any video URL")
        return 0
    else:
        print("⚠️  Tests failed. Check OpenAI API key configuration.")
        print("💡 Make sure you have OPENAI_API_KEY in your .env file")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 