
import json
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup paths
# Setup paths
# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# Add backend directory to path so 'import database' works inside models.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from backend.models import Medicine, Batch, InventoryTransaction, TransactionType

from backend.models import Medicine, Batch, InventoryTransaction, TransactionType

# Construct absolute path for DB to avoid CWD issues
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend/pharmacy.db'))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def verify_coverage():
    db = SessionLocal()
    print("Verifying Data Coverage...")
    
    # Load Files
    try:
        data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data'))
        purchases_path = os.path.join(data_dir, "purchases.json")
        sales_path = os.path.join(data_dir, "sales.json")
        
        with open(purchases_path, "r") as f:
            purchases = json.load(f)
        with open(sales_path, "r") as f:
            sales = json.load(f)
    except FileNotFoundError:
        print(f"WARN: Data files not found in {data_dir}. Skipping file count comparison.")
        purchases = []
        sales = []
        
    # 1. Count Check
    db_purchases = db.query(InventoryTransaction).filter(InventoryTransaction.transaction_type == TransactionType.IN).count()
    db_sales = db.query(InventoryTransaction).filter(InventoryTransaction.transaction_type == TransactionType.OUT).count()
    
    print(f"\n--- Count Comparison ---")
    print(f"Purchases File: {len(purchases)} | DB (IN Txns): {db_purchases}")
    print(f"Sales File: {len(sales)} | DB (OUT Txns): {db_sales}")
    
    if len(purchases) == db_purchases and len(sales) == db_sales:
         print("OK: Counts Match Perfectly.")
    else:
         print("WARN: Counts Mismatch (Note: duplicates/errors might have been filtered).")

    # 4. Global Price Check (Zero Fix Verification)
    print(f"\n--- Global Price Verification ---")
    zero_mrp_count = db.query(Medicine).filter(Medicine.mrp == 0).count()
    if zero_mrp_count == 0:
        print("OK: All Medicines have valid (non-zero) MRP.")
    else:
        print(f"WARN: {zero_mrp_count} Medicines still have MRP=0 (Check ingestion).")
    
    db.close()

if __name__ == "__main__":
    verify_coverage()
