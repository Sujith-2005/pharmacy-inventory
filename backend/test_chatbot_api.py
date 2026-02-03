
import requests
import json

BASE_URL = "http://localhost:8003"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
CHAT_URL = f"{BASE_URL}/api/chatbot/chat"
USERNAME = "admin@pharmacy.com"
PASSWORD = "admin123"

def test_chatbot():
    print("--- Testing Smart Chatbot ---")
    
    # 1. Login (Chatbot might need auth if depends on get_db/user, though checking code it only depends on get_db)
    # The new code: async def chat(req: ChatRequest, db: Session = Depends(get_db)):
    # get_db doesn't require auth token usually, but good to have if we act as a user.
    # Wait, get_db is just database session. 
    # But does the endpoint require auth? 
    # The snippet: @router.post("/chat") - No `Depends(get_current_user)`.
    # So it is public-ish (protected by CORS/Frontend).
    
    # 2. Chat
    try:
        print("Sending message...")
        payload = {"message": "How many expired batches do we have?"}
        
        # We need to send headers if we want to be safe, but let's try without first.
        # Actually, get_db needs nothing.
        
        resp = requests.post(CHAT_URL, json=payload)
        
        if resp.status_code == 200:
            data = resp.json()
            print("Chat Response:", json.dumps(data, indent=2))
        else:
            print(f"Chat FAILED: {resp.status_code}")
            print(resp.text)
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_chatbot()
