
from database import SessionLocal
from models import Medicine
from sqlalchemy import func

def list_categories():
    db = SessionLocal()
    try:
        categories = db.query(Medicine.category).distinct().all()
        print("Available Categories in DB:")
        for cat in categories:
            print(f"'{cat[0]}'")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_categories()
