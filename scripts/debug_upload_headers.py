
import requests
import os

BASE_URL = "http://localhost:8002/api"
PURCHASE_FILE = "purchases.json"

def test_upload_with_header():
    print("Test 1: Upload with manual Content-Type (Simulating Frontend Bug)")
    if not os.path.exists(PURCHASE_FILE):
        print("File not found.")
        return

    # User login to get token
    login_resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@pharmacy.com", "password": "admin123"})
    token = login_resp.json()["access_token"]
    
    with open(PURCHASE_FILE, "rb") as f:
        # Requests usually sets boundary automatically. 
        # To simulate the bug, we might need to construct the request carefully or use a session that respects the manual override.
        # However, requests might verify this. Let's try sending just the header.
        
        files = {"file": (PURCHASE_FILE, f, "application/json")}
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "multipart/form-data" # This is the suspect line. It lacks boundary.
        }
        
        try:
            # We need to construct the prepared request to strictly force the header without boundary
            # because 'requests.post(..., files=...)' overwrites Content-Type usually.
            
            # Let's try the simple way first. If requests is smart, it might merge them. 
            # If we force it, we expect 400 or 422.
            resp = requests.post(
                f"{BASE_URL}/inventory/upload",
                files=files,
                headers=headers
            )
            print(f"Status: {resp.status_code}")
            print(f"Response: {resp.text}")
        except Exception as e:
            print(f"Error: {e}")

def test_upload_without_header():
    print("\nTest 2: Upload WITHOUT manual Content-Type (Correct Way)")
    # User login to get token
    login_resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@pharmacy.com", "password": "admin123"})
    token = login_resp.json()["access_token"]
    
    with open(PURCHASE_FILE, "rb") as f:
        files = {"file": (PURCHASE_FILE, f, "application/json")}
        headers = {
            "Authorization": f"Bearer {token}"
            # No Content-Type set manually
        }
        
        try:
            resp = requests.post(
                f"{BASE_URL}/inventory/upload",
                files=files,
                headers=headers
            )
            print(f"Status: {resp.status_code}")
            print(f"Response: {resp.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_upload_with_header()
    # test_upload_without_header() # We know this works
