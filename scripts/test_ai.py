import google.generativeai as genai
import os
import sys

# Add backend to path to import config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from config import settings

def test_genai():
    print(f"Testing Gemini API Key: {settings.GEMINI_API_KEY[:10]}...")
    
    if not settings.GEMINI_API_KEY:
        print("[FAIL] No API Key found in settings.")
        return

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash-lite')
        print("Model configured. Generating content...")
        
        response = model.generate_content("Say 'Hello Verify' if you can hear me.")
        print(f"Response: {response.text}")
        print("[SUCCESS] API Key is valid and working.")
        
    except Exception as e:
        print(f"[FAIL] Error generating content: {e}")

if __name__ == "__main__":
    test_genai()
