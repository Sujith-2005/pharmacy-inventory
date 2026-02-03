
import sys
import os
import json
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, StaticPool
from sqlalchemy.orm import sessionmaker

# Add current dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Mock settings before importing main/database if possible, 
# but config is likely already evaluated. 
# We'll rely on dependency injection for the specific requests.

from main import app
from database import Base, get_db
from models import User, UserRole
from auth import get_password_hash

# Use an in-memory SQLite database for testing to avoid touching real data
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create tables in the test database
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def setup_admin():
    db = TestingSessionLocal()
    if not db.query(User).filter(User.email == "admin@pharmacy.com").first():
        user = User(
            email="admin@pharmacy.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(user)
        db.commit()
    db.close()

def test_ingestion():
    setup_admin()
    
    # Login
    login_resp = client.post("/api/auth/login", data={"username": "admin@pharmacy.com", "password": "admin123"})
    if login_resp.status_code != 200:
        print(f"Login failed: {login_resp.text}")
        return
    
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Test Purchase Upload
    # Script is in backend/, files are in root (parent)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    purchase_file = os.path.join(base_dir, "purchases.json")
    
    if os.path.exists(purchase_file):
        with open(purchase_file, "rb") as f:
            print(f"\nUploading {purchase_file}...")
            # Reset file pointer if needed, though opening fresh
            resp = client.post(
                "/api/inventory/upload",
                files={"file": ("purchases.json", f, "application/json")},
                headers=headers
            )
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                print("Response:", json.dumps(resp.json(), indent=2))
            else:
                print("Error:", resp.text)
    else:
        print(f"File not found: {purchase_file}")

    # 2. Test Sales Upload
    sales_file = os.path.join(base_dir, "sales.json")
    if os.path.exists(sales_file):
        with open(sales_file, "rb") as f:
            print(f"\nUploading {sales_file}...")
            resp = client.post(
                "/api/inventory/upload",
                files={"file": ("sales.json", f, "application/json")},
                headers=headers
            )
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                print("Response:", json.dumps(resp.json(), indent=2))
            else:
                print("Error:", resp.text)
    else:
        print(f"File not found: {sales_file}")

if __name__ == "__main__":
    test_ingestion()
