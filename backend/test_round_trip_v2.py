
import requests
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
    
    session = requests.Session()
    
    # 1. Login
    try:
        print(f"Logging in...")
        login_resp = session.post(LOGIN_URL, data={"username": USERNAME, "password": PASSWORD})
        if login_resp.status_code != 200:
            print(f"Login FAILED: {login_resp.status_code} - {login_resp.text}")
            return
        token = login_resp.json()["access_token"]
        # Add auth to headers for subsequent requests if needed, 
        # but session handles cookies? No, API uses Bearer token.
        session.headers.update({"Authorization": f"Bearer {token}"})
        print("Login Successful.")
    except Exception as e:
        print(f"Login Connection Failed: {e}")
        return

    # 2. Download Template
    try:
        print("Downloading template...")
        download_resp = session.get(DOWNLOAD_URL)
        if download_resp.status_code != 200:
            print(f"Download FAILED: {download_resp.status_code} - {download_resp.text}")
            return
        
        excel_content = download_resp.content
        print(f"Template downloaded ({len(excel_content)} bytes).")
        
    except Exception as e:
        print(f"Download Exception: {e}")
        return

    # 3. Upload Back
    try:
        print("Uploading template back...")
        # Need to provide filename
        files = {"file": ("round_trip_inventory.xlsx", excel_content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        
        upload_resp = session.post(UPLOAD_URL, files=files)
        
        if upload_resp.status_code == 200:
            print("Round Trip SUCCESS!")
            print(upload_resp.json())
        else:
            print(f"Round Trip Upload FAILED: {upload_resp.status_code}")
            print(upload_resp.text)
            
    except Exception as e:
        print(f"Round Trip Exception: {e}")

if __name__ == "__main__":
    test_round_trip()
