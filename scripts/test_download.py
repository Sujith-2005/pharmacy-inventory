import requests
import os

BASE_URL = "http://localhost:8000/api/inventory/download-template"

def test_download():
    formats = ["csv", "json", "excel"]
    
    # Login to get token first
    login_url = "http://localhost:8000/api/auth/login"
    try:
        resp = requests.post(login_url, data={"username": "admin@pharmacy.com", "password": "admin123"})
        if resp.status_code != 200:
            print(f"[FAIL] Login failed: {resp.status_code}")
            return
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
    except Exception as e:
        print(f"[FAIL] Login exception: {e}")
        return

    print("--- Testing Download Templates ---")
    for fmt in formats:
        try:
            url = f"{BASE_URL}?format={fmt}"
            print(f"Testing {fmt} -> {url} ... ", end="")
            
            r = requests.get(url, headers=headers)
            
            if r.status_code == 200:
                print(f"[OK] {len(r.content)} bytes")
                # validation
                cd = r.headers.get("Content-Disposition", "")
                ct = r.headers.get("Content-Type", "")
                print(f"       Header: {cd} | Type: {ct}")
            else:
                print(f"[FAIL] Status: {r.status_code}")
                # print(r.text[:200])
        except Exception as e:
            print(f"[FAIL] Exception: {e}")

if __name__ == "__main__":
    test_download()
