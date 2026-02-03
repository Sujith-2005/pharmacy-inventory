
import requests

BASE_URL = "http://localhost:8002"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
CATS_URL = f"{BASE_URL}/api/inventory/categories"
MEDS_URL = f"{BASE_URL}/api/inventory/medicines"
USERNAME = "admin@pharmacy.com"
PASSWORD = "admin123"

def test_search_and_cats():
    print("--- Testing Search and Categories ---")
    
    # 1. Login
    try:
        resp = requests.post(LOGIN_URL, data={"username": USERNAME, "password": PASSWORD})
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login OK.")
    except Exception as e:
        print(f"Login Failed: {e}")
        return

    # 2. Get Categories
    try:
        print("Fetching Categories...")
        resp = requests.get(CATS_URL, headers=headers)
        if resp.status_code == 200:
            cats = resp.json()
            print(f"Categories found ({len(cats)}): {cats}")
        else:
            print(f"Get Categories FAILED: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Categories Exception: {e}")

    # 3. Test Text Search (Manufacturer)
    try:
        # Search for something likely in our simulated data
        search_term = "Pharma" 
        print(f"Searching for '{search_term}' (Manufacturer Check)...")
        resp = requests.get(MEDS_URL, params={"search": search_term}, headers=headers)
        meds = resp.json()
        print(f"Found {len(meds)} results.")
        if len(meds) > 0:
            print(f"First result: {meds[0]['name']} | Mfg: {meds[0]['manufacturer']}")
    except Exception as e:
        print(f"Search Exception: {e}")

if __name__ == "__main__":
    test_search_and_cats()
