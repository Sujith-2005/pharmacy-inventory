
import requests
import pandas as pd
from io import BytesIO

# Configuration
BASE_URL = "http://localhost:8002"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
UPLOAD_URL = f"{BASE_URL}/api/inventory/upload"
USERNAME = "admin@pharmacy.com"
PASSWORD = "admin123"

def create_sample_excel():
    df = pd.DataFrame([{
        'SKU': 'TEST-001',
        'Medicine Name': 'Test Medicine',
        'Batch No': 'BATCH-001',
        'Quantity': 100,
        'Expiry Date': '2025-12-31',
        'Manufacturer': 'Test Pharma',
        'Brand': 'Test Brand',
        'MRP': 10.0,
        'Cost': 5.0
    }])
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    output.seek(0)
    return output

def test_upload():
    print(f"--- Testing Upload on {BASE_URL} ---")
    
    # 1. Login
    try:
        print(f"Logging in as {USERNAME}...")
        login_resp = requests.post(LOGIN_URL, data={"username": USERNAME, "password": PASSWORD})
        if login_resp.status_code != 200:
            print(f"Login FAILED: {login_resp.status_code} - {login_resp.text}")
            return
        token = login_resp.json()["access_token"]
        print("Login Successful.")
    except Exception as e:
        print(f"Login Connection Refused: {e}")
        print("CRITICAL: Backend is probably not running on port 8001.")
        return

    # 2. Upload
    try:
        headers = {"Authorization": f"Bearer {token}"}
        files = {"file": ("test_inventory.xlsx", create_sample_excel(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        
        print("Uploading file...")
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
    test_upload()
