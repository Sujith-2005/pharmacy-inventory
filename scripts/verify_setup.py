import sys
import os
import time
import requests
import socket

def check_port(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def main():
    print("=========================================")
    print("   Pharmacy System Verification Tool")
    print("=========================================")
    print("")

    # 1. Check Backend Port
    print(f"[1/4] Checking Backend Port (8000)... ", end="")
    if check_port(8000):
        print("[OK] OPEN (Running)")
    else:
        print("[FAIL] CLOSED (Not Running)")
        print("   -> Run 'uvicorn main:app --port 8000' in backend/ folder.")
        return

    # 2. Check Backend Health
    print(f"[2/4] Checking Backend Health API... ", end="")
    try:
        r = requests.get("http://localhost:8000/api/health", timeout=2)
        if r.status_code == 200:
            print("[OK] OK")
        else:
            print(f"[FAIL] ERROR (Status: {r.status_code})")
    except Exception as e:
        print(f"[FAIL] FAILED ({str(e)})")
        return

    # 3. Check Database
    print(f"[3/4] Checking Database File... ", end="")
    # Check both relative from root and relative from scripts/
    db_path_root = os.path.join("backend", "pharmacy.db")
    db_path_scripts = os.path.join("..", "backend", "pharmacy.db")
    
    if os.path.exists(db_path_root) or os.path.exists(db_path_scripts):
        print("[OK] FOUND")
    else:
        print("[FAIL] MISSING")
        print("   -> Run: cd backend && python init_db.py")

    # 4. Login Check
    print(f"[4/4] Verifying Default Admin... ", end="")
    try:
        payload = {
            "username": "admin@pharmacy.com",
            "password": "admin123"
        }
        r = requests.post("http://localhost:8000/api/auth/login", data=payload)
        if r.status_code == 200:
            print("[OK] SUCCESS (Login Working)")
            print("\n-----------------------------------------")
            print("Everything looks correct!")
        else:
            print(f"[FAIL] FAILED (Status: {r.status_code})")
            print(f"   -> Response: {r.text}")
    except Exception as e:
        print(f"[FAIL] FAILED ({str(e)})")

    print("\n=========================================")

if __name__ == "__main__":
    main()
