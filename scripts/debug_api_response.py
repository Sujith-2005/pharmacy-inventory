
import requests
import json

BASE_URL = "http://localhost:8002/api"

def debug_medicines():
    print("--- Debugging GET /medicines ---")
    
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

    # 2. Get Medicines
    try:
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/inventory/medicines?limit=20", headers=headers)
        
        print(f"Status: {resp.status_code}")
        medicines = resp.json()
        print(f"Count: {len(medicines)}")
        
        print("\n--- First 5 Medicines ---")
        for m in medicines[:5]:
            print(f"Name: {m.get('name')}")
            print(f"SKU: {m.get('sku')}")
            print(f"MRP: {m.get('mrp')}")
            print(f"Cost: {m.get('cost')}")
            print("-" * 20)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_medicines()
