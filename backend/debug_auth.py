
import sys
import os

# Add current directory to path so we can import app modules
sys.path.append(os.getcwd())

from database import SessionLocal
from models import User
from auth import verify_password, get_password_hash

def debug_auth():
    print("--- Debugging Auth ---")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@pharmacy.com").first()
        if not user:
            print("ERROR: User admin@pharmacy.com NOT FOUND in DB!")
            return

        print(f"User Found: {user.email}")
        print(f"Hash in DB: {user.hashed_password}")
        
        test_pass = "admin123"
        print(f"Testing password: '{test_pass}'")
        
        # Test verification
        is_valid = verify_password(test_pass, user.hashed_password)
        print(f"Verification Result: {is_valid}")
        
        if not is_valid:
            print("\nVerification Failed. Troubleshooting...")
            # Generate a new hash and see if it verifies
            new_hash = get_password_hash(test_pass)
            print(f"New Hash generated now: {new_hash}")
            verify_new = verify_password(test_pass, new_hash)
            print(f"Verifying against NEW hash: {verify_new}")
            
            if verify_new:
                print("Code logic works on fresh hashes. DB hash might be corrupted or from different lib.")
                # Update DB with new hash
                print("ATTEMPTING FIX: Updating DB with fresh hash...")
                user.hashed_password = new_hash
                db.commit()
                print("DB Updated. Try logging in now.")
            else:
                print("CRITICAL: Code logic fails even on fresh hashes. Environment/Library issue.")
                
    except Exception as e:
        print(f"Exception during debug: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_auth()
