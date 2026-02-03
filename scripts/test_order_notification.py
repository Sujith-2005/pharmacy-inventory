import requests
import json

BASE_URL = "http://localhost:8000/api/orders"

def test_create_order():
    print(f"\n--- Testing Order Creation at {BASE_URL}/create ---")
    payload = {
        "customer_name": "Test User",
        "contact_info": "+919876543210",
        "notification_method": "sms",
        "notes": "Urgent delivery"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/create", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.json()}")
        
        if response.status_code == 200:
            print("[OK] Order created successfully.")
            print(f"Notification Message: {response.json().get('message')}")
        else:
            print(f"[FAIL] Order creation failed. Status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"[ERROR] Exception: {e}")

if __name__ == "__main__":
    test_create_order()
