
import requests

BASE_URL = "http://localhost:8002"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
DOWNLOAD_URL = f"{BASE_URL}/api/inventory/download-template?format=excel"
UPLOAD_URL = f"{BASE_URL}/api/inventory/upload"
USERNAME = "admin@pharmacy.com"
PASSWORD = "admin123"

def test_round_trip_v3():
    print("--- Testing Template Round Trip v3 ---")
    
    # 1. Login
    try:
        resp = requests.post(LOGIN_URL, data={"username": USERNAME, "password": PASSWORD})
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login OK.")
    except Exception as e:
        print(f"Login Failed: {e}")
        return

    # 2. Download
    try:
        print("Downloading...")
        resp = requests.get(DOWNLOAD_URL, headers=headers) 
        if resp.status_code != 200:
            print(f"Download Failed: {resp.status_code}")
            return
        content = resp.content
        print(f"Downloaded {len(content)} bytes.")
    except Exception as e:
        print(f"Download Exception: {e}")
        return

    # 3. Upload
    try:
        print("Uploading back...")
        files = {"file": ("v3_template.xlsx", content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        resp = requests.post(UPLOAD_URL, headers=headers, files=files)
        
        if resp.status_code == 200:
            print("Round Trip SUCCESS")
            print(resp.json())
        else:
            print(f"Upload Failed: {resp.status_code}")
            print(resp.text)
    except Exception as e:
        print(f"Upload Exception: {e}")

if __name__ == "__main__":
    test_round_trip_v3()
