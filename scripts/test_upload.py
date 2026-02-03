import requests
import os

BASE_URL = "http://localhost:8000/api/orders"

def test_upload():
    print(f"\n--- Testing File Upload at {BASE_URL}/upload-prescription ---")
    
    # Create a dummy file
    filename = "test_prescription.txt"
    with open(filename, "w") as f:
        f.write("This is a test prescription file.")
        
    try:
        files = {'file': (filename, open(filename, 'rb'))}
        response = requests.post(f"{BASE_URL}/upload-prescription", files=files)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ Upload successful.")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Upload failed.")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"[ERROR] Exception: {e}")
    finally:
        # Cleanup
        if os.path.exists(filename):
            pass # Keep it for debugging if needed, or os.remove(filename)

if __name__ == "__main__":
    test_upload()
