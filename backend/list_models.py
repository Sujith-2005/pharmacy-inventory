
import google.generativeai as genai
import os
from config import settings

def list_available_models():
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        print("--- Listing Available Models ---")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"Name: {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    list_available_models()
