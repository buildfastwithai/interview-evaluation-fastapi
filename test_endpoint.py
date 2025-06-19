import requests
import tempfile
import os

def test_analyze_transcript():
    url = 'http://127.0.0.1:8000/analyze-transcript'
    
    # Create a small test file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write('This is a test transcript for analysis. The candidate discussed Python programming skills.')
        test_file = f.name
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': ('test.txt', f, 'text/plain')}
            data = {
                'skills_to_assess': 'Python,Communication',
                'job_role': 'Software Developer',
                'company_name': 'Test Company',
                'ai_provider': 'openai'
            }
            
            print("Making request to analyze-transcript endpoint...")
            response = requests.post(url, files=files, data=data)
            
            print(f'Status Code: {response.status_code}')
            print(f'Response Headers: {dict(response.headers)}')
            print(f'Response Text: {response.text}')
            
            if response.status_code != 200:
                print("\n=== ERROR DETAILS ===")
                try:
                    error_json = response.json()
                    print(f"Error JSON: {error_json}")
                except:
                    print("Could not parse error as JSON")
                    
    except Exception as e:
        print(f"Exception occurred: {e}")
    finally:
        if os.path.exists(test_file):
            os.unlink(test_file)

if __name__ == "__main__":
    test_analyze_transcript() 