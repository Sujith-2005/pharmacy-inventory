
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERROR: GEMINI_API_KEY not found in .env")
    exit(1)

print(f"Found API KEY: {api_key[:5]}...{api_key[-5:]}")

genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel("models/gemini-2.0-flash-lite")
    response = model.generate_content("Hello, can you help me with pharmacy inventory?")
    print("SUCCESS: Gemini responded.")
    print("Response preview:", response.text[:100])
except Exception as e:
    print(f"FAILED: {e}")
