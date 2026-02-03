
import requests
import sys

def test_login():
    url = "http://localhost:8000/api/auth/login"
    payload = {
        "username": "admin@pharmacy.com",
        "password": "admin123"
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    print(f"Attempting POST to {url}")
    print(f"Payload: {payload}")
    
    try:
        response = requests.post(url, data=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            print("\nSUCCESS: API is working correctly. The issue is in the Frontend.")
        elif response.status_code == 401:
            print("\nFAILURE: API rejected credentials. The issue is in the Backend/DB.")
        else:
            print("\nFAILURE: Unexpected error.")
            
    except Exception as e:
        print(f"CONNECTION ERROR: {e}")
        print("Is the backend server running on port 8000?")

if __name__ == "__main__":
    test_login()
