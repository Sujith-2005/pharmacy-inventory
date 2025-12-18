import requests
import json
import time

BASE_URL = "https://pharmacy-inventory-backend.onrender.com"
# BASE_URL = "http://localhost:8000" # Uncomment to test local if running

print(f"Testing connectivity to: {BASE_URL}")

# 1. Health Check
try:
    print("\n[1] Testing /api/health...")
    start = time.time()
    resp = requests.get(f"{BASE_URL}/api/health", timeout=10)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")
    print(f"Latency: {time.time() - start:.2f}s")
except Exception as e:
    print(f"FAILED: {e}")

# 2. Chatbot Test
try:
    print("\n[2] Testing /api/chatbot/chat...")
    payload = {
        "message": "Do we have Azithromycin?",
        "session_id": "test-session-123"
    }
    start = time.time()
    resp = requests.post(f"{BASE_URL}/api/chatbot/chat", json=payload, timeout=20)
    print(f"Status: {resp.status_code}")
    print(f"Response: {json.dumps(resp.json(), indent=2) if resp.status_code == 200 else resp.text}")
    print(f"Latency: {time.time() - start:.2f}s")
except Exception as e:
    print(f"FAILED: {e}")
