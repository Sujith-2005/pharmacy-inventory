
import requests
import os
import json

BASE_URL = "http://localhost:8002/api"
PURCHASE_FILE = "purchases.json"

def test_upload_resilience():
    print("--- Testing Upload Resilience ---")
    
    # 1. Login
    try:
        login_resp = requests.post(
            f"{BASE_URL}/auth/login", 
            data={"username": "admin@pharmacy.com", "password": "admin123"}
        )
        if login_resp.status_code != 200:
            print(f"Login failed: {login_resp.text}")
            return
        token = login_resp.json()["access_token"]
        print("Login Success.")
    except Exception as e:
        print(f"Login connection failed: {e}")
        return

    # 2. Upload with standard requests (correct headers)
    if not os.path.exists(PURCHASE_FILE):
        print("purchases.json not found.")
        return

    print(f"Uploading {PURCHASE_FILE}...")
    with open(PURCHASE_FILE, "rb") as f:
        files = {"file": (PURCHASE_FILE, f, "application/json")}
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            resp = requests.post(
                f"{BASE_URL}/inventory/upload",
                files=files,
                headers=headers,
                timeout=30
            )
            print(f"Response Status: {resp.status_code}")
            try:
                print(f"Response Body: {json.dumps(resp.json(), indent=2)}")
            except:
                print(f"Response Body (Raw): {resp.text}")
                
            if resp.status_code == 200:
                print("TEST PASSED: Backend accepted the file.")
            else:
                print("TEST FAILED: Backend rejected the file.")
                
        except Exception as e:
            print(f"Upload verify failed: {e}")

if __name__ == "__main__":
    test_upload_resilience()
