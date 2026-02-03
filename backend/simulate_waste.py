
from database import SessionLocal
from models import Batch, InventoryTransaction, TransactionType, Medicine
from datetime import datetime
import random

def simulate_waste():
    db = SessionLocal()
    try:
        print("Simulating realistic waste events...")
        
        batches = db.query(Batch).filter(Batch.quantity > 10).limit(50).all()
        
        if not batches:
            print("Not enough inventory to simulate waste.")
            return

        # 1. Simulate Damaged Items (removed from stock)
        # Randomly pick 3-5 batches to have some damage
        damaged_count = 0
        batches_to_damage = random.sample(batches, k=min(len(batches), 5))
        
        for batch in batches_to_damage:
            qty_damaged = random.randint(1, 5)
            
            # Create Transaction
            damage_tx = InventoryTransaction(
                medicine_id=batch.medicine_id,
                batch_id=batch.id,
                transaction_type=TransactionType.DAMAGED,
                quantity=qty_damaged,
                unit_price=batch.medicine.mrp, # valued at MRP for loss
                notes="Accidental breakage during handling",
                created_at=datetime.now()
            )
            db.add(damage_tx)
            
            # Reduce Stock
            batch.quantity -= qty_damaged
            damaged_count += 1
            
        print(f"Created {damaged_count} damage events.")

        # 2. Simulate Recalled Items
        # Pick 1 batch
        recalled_count = 0
        if len(batches) > 5:
            batch_to_recall = batches[5] # Just pick the next one
            qty_recalled = random.randint(10, 20)
            
            recall_tx = InventoryTransaction(
                medicine_id=batch_to_recall.medicine_id,
                batch_id=batch_to_recall.id,
                transaction_type=TransactionType.RECALLED,
                quantity=qty_recalled,
                unit_price=batch_to_recall.medicine.mrp,
                notes="Manufacturer Recall: Batch Quality Issue",
                created_at=datetime.now()
            )
            db.add(recall_tx)
            
            # Reduce Stock (Recalled items sent back)
            batch_to_recall.quantity -= qty_recalled
            recalled_count += 1
            
        print(f"Created {recalled_count} recall events.")

        db.commit()
        print("Successfully injected waste data.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    simulate_waste()
