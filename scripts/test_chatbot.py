import requests
import json

BASE_URL = "http://localhost:8000/api/chatbot"

def test_chat():
    print(f"\n--- Testing Chatbot at {BASE_URL}/chat ---")
    payload = {
        "message": "Tell me a funny joke about pharmacists.",
        "session_id": "test-ai-key"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/chat", json=payload)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ Chatbox response received.")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"❌ Chatbot failed.")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"[ERROR] Exception: {e}")

if __name__ == "__main__":
    test_chat()
