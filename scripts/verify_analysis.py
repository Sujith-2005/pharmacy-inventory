import os
import sys
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

# Setup paths
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from backend.models import Medicine, InventoryTransaction, TransactionType, Forecast
from backend.ml_models.forecasting import calculate_demand_forecast

# Updated DB Path Logic
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend/pharmacy.db'))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def verify_data():
    print("--- Database Verification ---")
    
    # 1. Check Medicines
    med_count = db.query(Medicine).count()
    print(f"Medicines: {med_count}")
    
    # 2. Check Transactions
    txn_count = db.query(InventoryTransaction).count()
    out_txns = db.query(InventoryTransaction).filter(InventoryTransaction.transaction_type == TransactionType.OUT).all()
    print(f"Total Transactions: {txn_count}")
    print(f"OUT Transactions: {len(out_txns)}")
    
    if out_txns:
        dates = [t.created_at for t in out_txns]
        min_date = min(dates)
        max_date = max(dates)
        print(f"Transaction Date Range: {min_date} to {max_date}")
        
        # Check against forecasting window (updated to 1500 days to match backend)
        cutoff = datetime.now() - timedelta(days=1500)
        recent_txns = [t for t in out_txns if t.created_at >= cutoff]
        print(f"Transactions in analysis window (last 1500 days, since {cutoff.date()}): {len(recent_txns)}")
        
        if len(recent_txns) == 0 and len(out_txns) > 0:
            print("CRITICAL: Data exists but is too old for the current 90-day forecasting window.")
    
    else:
        print("CRITICAL: No Sales Data Found.")

    # 3. Test Forecast
    print("\n--- Forecast Test ---")
    if med_count > 0:
        med = db.query(Medicine).first()
        print(f"Testing forecast for: {med.name} (ID: {med.id})")
        forecast = calculate_demand_forecast(db, med.id)
        print("Forecast Result:", forecast)
    else:
        print("No medicines to test forecast.")

if __name__ == "__main__":
    verify_data()
