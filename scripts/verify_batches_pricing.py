
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
import sys
import os

# Setup paths
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from backend.models import Medicine, Batch
from backend.database import Base

# Construct absolute path for DB to avoid CWD issues
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend/pharmacy.db'))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def verify_fix():
    db = SessionLocal()
    print("--- Verifying Fixes ---")
    
    # 1. Check for Duplicate 'SALES-IMPORT' Batches
    print("\n1. Checking for Duplicate Batches...")
    duplicates = db.query(
        Batch.medicine_id, func.count(Batch.id)
    ).filter(
        Batch.batch_number == 'SALES-IMPORT'
    ).group_by(
        Batch.medicine_id
    ).having(
        func.count(Batch.id) > 1
    ).all()
    
    if duplicates:
        print(f"FAIL: Found {len(duplicates)} medicines with duplicate SALES-IMPORT batches.")
        for mid, count in duplicates:
             med = db.query(Medicine).get(mid)
             print(f"   - {med.name}: {count} batches")
    else:
        print("PASS: No duplicate SALES-IMPORT batches found. Merging logic worked.")

    # 2. Check Prices
    print("\n2. Checking Prices (MRP)...")
    zero_mrp = db.query(Medicine).filter(Medicine.mrp == 0).all()
    if zero_mrp:
        print(f"FAIL: {len(zero_mrp)} medicines still have MRP 0.00")
        for m in zero_mrp[:5]:
            print(f"   - {m.name} (SKU: {m.sku})")
    else:
        print("PASS: All medicines have valid MRP.")

    # 3. Check specific example from screenshot
    print("\n3. Checking 'Dolo 650'...")
    dolo = db.query(Medicine).filter(Medicine.name.like("%Dolo 650%")).first()
    if dolo:
        print(f"   - MRP: {dolo.mrp}")
        batches = db.query(Batch).filter(Batch.medicine_id == dolo.id).all()
        for b in batches:
            print(f"   - Batch {b.batch_number}: Qty {b.quantity}")
    else:
        print("   - Dolo 650 not found.")

if __name__ == "__main__":
    verify_fix()
