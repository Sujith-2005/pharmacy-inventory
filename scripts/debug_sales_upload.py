
import requests
import json
import sys

# Using port 8002 as validated before
BASE_URL = "http://localhost:8002/api"
FILE_PATH = "sales.json"

def debug_upload():
    print("--- Debugging Sales Upload ---")
    
    # 1. Login
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@pharmacy.com", "password": "admin123"})
        if resp.status_code != 200:
            print("Login Failed")
            return
        token = resp.json()["access_token"]
    except Exception as e:
        print(f"Login Error: {e}")
        return

    # 2. Upload
    try:
        with open(FILE_PATH, "rb") as f:
            files = {"file": (FILE_PATH, f, "application/json")}
            headers = {"Authorization": f"Bearer {token}"}
            print(f"Uploading {FILE_PATH}...")
            resp = requests.post(f"{BASE_URL}/inventory/upload", files=files, headers=headers)
            
            data = resp.json()
            print(f"Status Code: {resp.status_code}")
            print(f"Success Count: {data.get('success_count')}")
            print(f"Error Count: {data.get('error_count')}")
            
            errors = data.get('errors', [])
            if errors:
                print("\n--- FIRST 10 ERRORS ---")
                for err in errors[:10]:
                    print(err)
            else:
                print("No errors returned in list.")
                
    except Exception as e:
        print(f"Upload Error: {e}")

if __name__ == "__main__":
    debug_upload()
