
import requests
import io
import pandas as pd

BASE_URL = "http://localhost:8002"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
DOWNLOAD_URL = f"{BASE_URL}/api/inventory/download-template?format=csv"
UPLOAD_URL = f"{BASE_URL}/api/inventory/upload"
USERNAME = "admin@pharmacy.com"
PASSWORD = "admin123"

def test_csv_round_trip():
    print("--- Testing CSV Round Trip ---")
    
    # 1. Login
    try:
        resp = requests.post(LOGIN_URL, data={"username": USERNAME, "password": PASSWORD})
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login OK.")
    except Exception as e:
        print(f"Login Failed: {e}")
        return

    # 2. Download CSV
    try:
        print("Downloading CSV template...")
        resp = requests.get(DOWNLOAD_URL, headers=headers)
        if resp.status_code != 200:
            print(f"Download Failed: {resp.status_code}")
            return
        
        csv_content = resp.content
        print(f"Downloaded {len(csv_content)} bytes.")
        print(f"Preview: {csv_content[:100]}...")
        
    except Exception as e:
        print(f"Download Exception: {e}")
        return

    # 3. Upload CSV Back
    try:
        print("Uploading CSV back...")
        files = {"file": ("test_template.csv", csv_content, "text/csv")}
        resp = requests.post(UPLOAD_URL, headers=headers, files=files)
        
        if resp.status_code == 200:
            print("CSV Upload SUCCESS")
            print(resp.json())
        else:
            print(f"CSV Upload FAILED: {resp.status_code}")
            print(resp.text)
            
    except Exception as e:
        print(f"Upload Exception: {e}")

if __name__ == "__main__":
    test_csv_round_trip()
