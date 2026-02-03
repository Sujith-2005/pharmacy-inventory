
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_known_medicine():
    print("--- Testing Price Comparison Endpoint (Known Medicine) ---")
    
    # Login
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@pharmacy.com", "password": "admin123"})
        if resp.status_code != 200:
            print("Login Failed")
            return
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
    except Exception as e:
        print(f"Login Error: {e}")
        return

    # Search for 'Paracetamol'
    query = "Paracetamol"
    print(f"\nSearching for '{query}'...")
    try:
        resp = requests.get(f"{BASE_URL}/inventory/price-comparison?query={query}", headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            print(f"Status: 200 OK")
            print(json.dumps(data, indent=2))
        else:
            print(f"Failed: {resp.status_code}")
            print(resp.text)
    except Exception as e:
        print(f"Request Error: {e}")

if __name__ == "__main__":
    test_known_medicine()
