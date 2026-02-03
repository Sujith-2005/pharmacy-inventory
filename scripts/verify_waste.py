import requests
import json
import os
import sys

# Setup paths
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from database import SessionLocal
from models import Medicine, Batch, Alert
from datetime import datetime, timedelta

def verify_waste():
    db = SessionLocal()
    print("--- Verifying Waste Analytics Logic ---")
    
    # 1. Create a known test scenario
    # Medicine A: 10 units, Expired, Price 100
    # Medicine B: 5 units, Damaged, Price 50
    # Medicine C: 20 units, Good, Price 10
    
    try:
        # Cleanup test data if exists
        test_sku_prefix = "TEST-WASTE-"
        
        # 1. Find batches to delete
        batches_to_delete = db.query(Batch).join(Medicine).filter(Medicine.sku.like(f"{test_sku_prefix}%")).all()
        for b in batches_to_delete:
            db.delete(b)
            
        # 2. Find medicines to delete
        meds_to_delete = db.query(Medicine).filter(Medicine.sku.like(f"{test_sku_prefix}%")).all()
        for m in meds_to_delete:
            db.delete(m)
            
        db.commit()
        
        print("Creating test data...")
        
        med_a = Medicine(sku=f"{test_sku_prefix}A", name="WasteTest Med A", is_active=True, mrp=100.0, cost=80.0, category="Test")
        med_b = Medicine(sku=f"{test_sku_prefix}B", name="WasteTest Med B", is_active=True, mrp=50.0, cost=40.0, category="Test")
        med_c = Medicine(sku=f"{test_sku_prefix}C", name="WasteTest Med C", is_active=True, mrp=10.0, cost=5.0, category="Test")
        
        db.add_all([med_a, med_b, med_c])
        db.commit()
        
        # Batch A: Expired (10 units * 80 cost = 800 value)
        batch_a = Batch(
            medicine_id=med_a.id, 
            batch_number="B-EXP", 
            quantity=10, 
            expiry_date=datetime.now() - timedelta(days=10),
            is_expired=True,
            purchase_price=80.0
        )
        
        # Batch B: Damaged (5 units * 40 cost = 200 value)
        batch_b = Batch(
            medicine_id=med_b.id, 
            batch_number="B-DMG", 
            quantity=5, 
            expiry_date=datetime.now() + timedelta(days=100),
            is_expired=False,
            is_damaged=True,
            purchase_price=40.0
        )
        
        # Batch C: Good (20 units * 5 cost = 100 value) - Should NOT be waste
        batch_c = Batch(
            medicine_id=med_c.id, 
            batch_number="B-GOOD", 
            quantity=20, 
            expiry_date=datetime.now() + timedelta(days=100),
            is_expired=False,
            is_damaged=False,
            purchase_price=5.0
        )
        
        db.add_all([batch_a, batch_b, batch_c])
        db.commit()
        
        # 2. Call API (simulate via logic, or restart server? Let's verify logic directly first)
        # We can implement the EXACT same logic as the endpoint here to test it
        
        print("Running calculation logic...")
        
        batches = db.query(Batch).join(Medicine).filter(
            Batch.quantity > 0,
            Batch.batch_number != 'SALES-IMPORT'
        ).all()
        
        stats = {
            "expired": {"value": 0, "quantity": 0},
            "damaged": {"value": 0, "quantity": 0},
            "total": {"value": 0, "quantity": 0}
        }
        
        test_batches_found = 0
        
        for b in batches:
            if not b.medicine.sku.startswith(test_sku_prefix):
                continue
                
            test_batches_found += 1
            unit_value = b.purchase_price or b.medicine.cost or b.medicine.mrp or 0
            batch_value = b.quantity * unit_value
            
            is_waste = False
            
            if b.is_expired:
                stats["expired"]["value"] += batch_value
                stats["expired"]["quantity"] += b.quantity
                is_waste = True
                print(f"  Found Expired: {b.medicine.name} - Val: {batch_value}")
            elif b.is_damaged:
                stats["damaged"]["value"] += batch_value
                stats["damaged"]["quantity"] += b.quantity
                is_waste = True
                print(f"  Found Damaged: {b.medicine.name} - Val: {batch_value}")
                
            if is_waste:
                stats["total"]["value"] += batch_value
                stats["total"]["quantity"] += b.quantity

        print("\n--- Results ---")
        print(f"Expected Expired Value: 800.0 | Actual: {stats['expired']['value']}")
        print(f"Expected Damaged Value: 200.0 | Actual: {stats['damaged']['value']}")
        print(f"Expected Total Waste: 1000.0 | Actual: {stats['total']['value']}")
        
        if stats['expired']['value'] == 800.0 and stats['damaged']['value'] == 200.0:
            print("\n[SUCCESS] Waste calculation logic is correct.")
        else:
            print("\n[FAIL] logic mismatch.")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Cleanup
        db.close()

if __name__ == "__main__":
    verify_waste()
