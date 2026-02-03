
from database import SessionLocal
from models import Batch, InventoryTransaction, TransactionType
from datetime import datetime, timedelta
import random

def update_inventory_dates():
    db = SessionLocal()
    try:
        print("Updating inventory expiry dates to future...")
        
        # 1. Update Batches
        batches = db.query(Batch).all()
        count = 0
        for batch in batches:
            # Shift expiry to 2026-2027 range (since we are in Dec 2025)
            # Give it 6 months to 2 years of shelf life from "now"
            days_valid = random.randint(180, 730)
            new_expiry = datetime.now() + timedelta(days=days_valid)
            
            batch.expiry_date = new_expiry
            batch.is_expired = False
            count += 1
            
        print(f"Updated {count} batches to have future expiry dates.")

        # 2. Clear old 'Expired' transactions to reset history
        # (Since we are effectively rewriting history to say these items are new)
        deleted = db.query(InventoryTransaction).filter(
            InventoryTransaction.transaction_type == TransactionType.EXPIRED
        ).delete(synchronize_session=False)
        
        print(f"Cleared {deleted} historical expiration transactions.")

        db.commit()
        print("Successfully refreshed inventory data for Real-Time demo.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_inventory_dates()
