
import sys
import os

# Ensure backend structure is respected regarding database.py
backend_dir = os.path.join(os.getcwd(), 'backend')
if os.path.isdir(backend_dir):
    os.chdir(backend_dir)
    sys.path.append('.')
    print(f"Changed working directory to: {os.getcwd()}")

try:
    from database import SessionLocal
    from models import Medicine, Batch, InventoryTransaction, Alert
except ImportError:
    sys.path.append('backend')
    from backend.database import SessionLocal
    from backend.models import Medicine, Batch, InventoryTransaction, Alert

def clear_database():
    print("Connecting to database...")
    db = SessionLocal()
    try:
        db_path = db.bind.url.database
        print(f"Using Database: {db_path}")
        
        print("Deleting existing data...")
        db.query(InventoryTransaction).delete()
        db.query(Alert).delete()
        db.query(Batch).delete()
        db.query(Medicine).delete()
        
        db.commit()
        print("Database cleared successfully.")
        
    except Exception as e:
        print(f"Error clearing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_database()
