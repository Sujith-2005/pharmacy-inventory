import google.generativeai as genai

def test_key_direct():
    # Hardcoded key for testing
    key = "AIzaSyDlZTrdIjjtRykAgC8_7Nwo_zalM4fLlgU"

    print(f"Testing Key: {key[:10]}...{key[-5:]}")
    try:
        genai.configure(api_key=key)
        print("Listing available models...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
        
        # Test generation with a safe fallback
        print("\nTesting generation with models/gemini-1.5-flash-latest...")
        # We will try dynamic resolution or just list first
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    test_key_direct()
