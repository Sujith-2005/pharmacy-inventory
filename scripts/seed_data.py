
import os
import sys
import json
import requests

# This script uploads the files to the running backend to seed the REAL database
# It assumes backend is running on port 8002 (which we verified)

BASE_URL = "http://localhost:8002/api"
PURCHASE_FILE = "purchases.json"
SALES_FILE = "sales.json"

def get_token():
    # Login as admin
    resp = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": "admin@pharmacy.com", "password": "admin123"}
    )
    if resp.status_code == 200:
        return resp.json()["access_token"]
    else:
        print(f"Login failed: {resp.text}")
        sys.exit(1)

def upload_file(token, filename):
    if not os.path.exists(filename):
        print(f"File not found: {filename}")
        return

    print(f"Uploading {filename}...")
    with open(filename, "rb") as f:
        files = {"file": (filename, f, "application/json")}
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            resp = requests.post(
                f"{BASE_URL}/inventory/upload",
                files=files,
                headers=headers
            )
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                print("Success!")
                print(json.dumps(resp.json(), indent=2))
            else:
                print(f"Failed: {resp.text}")
        except Exception as e:
            print(f"Upload error: {e}")

if __name__ == "__main__":
    print("Seeding Database...")
    try:
        token = get_token()
        print("Logged in.")
        
        # Order matters! Purchases first.
        upload_file(token, PURCHASE_FILE)
        upload_file(token, SALES_FILE)
        
        print("\nSeeding Complete.")
    except Exception as e:
        print(f"Seeding failed: {e}")
        # If connection fails, backend might not be up, but we know it is from previous steps.
