#!/usr/bin/env python3
"""
Test script to verify API endpoints and timeout handling
"""

import requests
import time
import json

# Configuration
BASE_URL = "http://localhost:8000"  # Change this to your API URL
TIMEOUT = 30  # 30 seconds timeout for requests

def test_health_endpoint():
    """Test the health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        print(f"Health Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.Timeout:
        print("❌ Health endpoint timed out")
        return False
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def test_root_endpoint():
    """Test the root endpoint"""
    print("\nTesting root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
        print(f"Root Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.Timeout:
        print("❌ Root endpoint timed out")
        return False
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False

def test_transcript_endpoint():
    """Test the transcript endpoint with a simple request"""
    print("\nTesting transcript endpoint...")
    try:
        # Test with a simple request that should fail gracefully
        data = {
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",  # Rick Roll
            "ai_provider": "openai"
        }
        
        response = requests.post(
            f"{BASE_URL}/extract-transcript", 
            json=data, 
            timeout=TIMEOUT
        )
        print(f"Transcript Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Transcript endpoint working")
            return True
        elif response.status_code in [400, 401, 500]:
            print(f"Response: {response.json()}")
            print("⚠️  Endpoint responding but with expected error (likely missing API key)")
            return True  # This is expected without proper API keys
        else:
            print(f"❌ Unexpected status: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Transcript endpoint timed out (524 error likely)")
        return False
    except Exception as e:
        print(f"❌ Transcript endpoint error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing FastAPI endpoints for timeout issues...")
    print(f"Base URL: {BASE_URL}")
    print(f"Timeout: {TIMEOUT} seconds")
    
    tests = [
        test_health_endpoint,
        test_root_endpoint,
        test_transcript_endpoint
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append(False)
    
    print(f"\n📊 Test Results:")
    print(f"Passed: {sum(results)}/{len(results)}")
    
    if all(results):
        print("✅ All tests passed! API should be working correctly.")
    else:
        print("❌ Some tests failed. Check the API configuration.")
        
        if not results[0]:  # Health check failed
            print("💡 Suggestion: Check if the API server is running")
        if not results[2]:  # Transcript endpoint failed
            print("💡 Suggestion: Check API keys and timeout configurations")

if __name__ == "__main__":
    main() 