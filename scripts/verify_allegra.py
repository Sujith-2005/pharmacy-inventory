
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.models import Medicine, Batch

SQLALCHEMY_DATABASE_URL = "sqlite:///./backend/pharmacy.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def verify_allegra():
    db = SessionLocal()
    print("--- Verifying Allegra Stock ---")
    
    med = db.query(Medicine).filter(Medicine.name.like("%Allegra-120%")).first()
    if not med:
        print("Allegra not found.")
        return

    batches = db.query(Batch).filter(Batch.medicine_id == med.id).all()
    total_qty = 0
    expired_qty = 0
    
    print(f"Medicine: {med.name} (SKU: {med.sku})")
    for b in batches:
        print(f" - Batch {b.batch_number}: Qty {b.quantity}, Exp {b.expiry_date}, Expired? {b.is_expired}")
        total_qty += b.quantity
        if b.is_expired:
            expired_qty += b.quantity
            
    print(f"\nTotal Stock: {total_qty}")
    print(f"Total Expired (Waste): {expired_qty}")
    
    # Expected: ~2134 (2463 - 329)
    # Note: 329 sold might have come from specific batches or FEFO.
    
if __name__ == "__main__":
    verify_allegra()
