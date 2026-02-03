
import sys
import os

# Ensure backend directory is in path
sys.path.append(os.getcwd())

from database import SessionLocal
from models import User
from auth import get_password_hash

def emergency_reset():
    print("--- EMERGENCY ADMIN RESET ---")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@pharmacy.com").first()
        
        new_pass = "admin123"
        hashed = get_password_hash(new_pass)
        
        if user:
            print(f"Found user: {user.email}")
            print("Resetting password to: 'admin123'")
            user.hashed_password = hashed
            user.is_active = True
        else:
            print("User NOT found. Creating new admin...")
            from models import UserRole
            user = User(
                email="admin@pharmacy.com",
                full_name="Admin User",
                role=UserRole.ADMIN,
                hashed_password=hashed,
                is_active=True
            )
            db.add(user)
            
        db.commit()
        print("SUCCESS: Password reset complete.")
        print("Please restart your backend server and login.")
        
    except Exception as e:
        print(f"ERROR: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    emergency_reset()
