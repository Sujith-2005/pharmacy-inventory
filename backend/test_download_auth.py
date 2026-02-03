
import requests

BASE_URL = "http://localhost:8002"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
DOWNLOAD_URL = f"{BASE_URL}/api/inventory/download-template?format=excel"
USERNAME = "admin@pharmacy.com"
PASSWORD = "admin123"

def test_download_auth():
    print("--- Testing Download WITH Auth ---")
    
    # Login
    try:
        resp = requests.post(LOGIN_URL, data={"username": USERNAME, "password": PASSWORD})
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Got Token.")
    except Exception as e:
        print(f"Login Failed: {e}")
        return

    # Download
    try:
        print("Requesting download...")
        resp = requests.get(DOWNLOAD_URL, headers=headers)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print(f"Length: {len(resp.content)}")
            print("Download with Auth SUCCESS")
        else:
            print(f"Download with Auth FAILED: {resp.text}")
    except Exception as e:
        print(f"Download Exception: {e}")

if __name__ == "__main__":
    test_download_auth()
