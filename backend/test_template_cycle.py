
import requests
import pandas as pd
from io import BytesIO

# Configuration
BASE_URL = "http://localhost:8002"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
DOWNLOAD_URL = f"{BASE_URL}/api/inventory/download-template?format=excel"
UPLOAD_URL = f"{BASE_URL}/api/inventory/upload"
USERNAME = "admin@pharmacy.com"
PASSWORD = "admin123"

def test_round_trip():
    print(f"--- Testing Template Round Trip on {BASE_URL} ---")
    
    # 1. Login
    try:
        print(f"Logging in...")
        session = requests.Session()
        login_resp = session.post(LOGIN_URL, data={"username": USERNAME, "password": PASSWORD})
        if login_resp.status_code != 200:
            print(f"Login FAILED: {login_resp.status_code} - {login_resp.text}")
            return
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login Successful.")
    except Exception as e:
        print(f"Connection Failed: {e}")
        return

    # 2. Download Template
    try:
        print("Downloading template...")
        download_resp = session.get(DOWNLOAD_URL, headers=headers)
        if download_resp.status_code != 200:
            print(f"Download FAILED: {download_resp.status_code}")
            return
        
        # Verify content is valid Excel
        excel_content = download_resp.content
        print(f"Template downloaded ({len(excel_content)} bytes).")
        
    except Exception as e:
        print(f"Download Exception: {e}")
        return

    # 3. Simulate User Editing (Optional) or just Upload Back
    try:
        print("Uploading template back...")
        files = {"file": ("downloaded_template.xlsx", excel_content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        
        upload_resp = requests.post(UPLOAD_URL, headers=headers, files=files)
        
        if upload_resp.status_code == 200:
            print("Upload SUCCESS!")
            print(upload_resp.json())
        else:
            print(f"Upload FAILED: {upload_resp.status_code}")
            print(upload_resp.text)
            
    except Exception as e:
        print(f"Upload Exception: {e}")

if __name__ == "__main__":
    test_round_trip()
