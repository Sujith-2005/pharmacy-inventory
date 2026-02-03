
import sys
import os
from datetime import datetime

# Add current directory to path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import SessionLocal, engine
    from models import Medicine, Batch, InventoryTransaction, TransactionType, Base, Supplier, Alert, AlertType
except ImportError:
    from backend.database import SessionLocal, engine
    from backend.models import Medicine, Batch, InventoryTransaction, TransactionType, Base, Supplier, Alert, AlertType

import hashlib

def get_sku(name):
    clean_name = name.upper().strip()
    hash_suffix = hashlib.md5(clean_name.encode()).hexdigest()[:6].upper()
    return f"MED-{hash_suffix}"

def ingest_data():
    db = SessionLocal()
    print("Starting manual ingestion with feature population... ")
    
    # CLEAR EXISTING DATA
    print("Clearing existing data...")
    try:
        db.query(Alert).delete()
        db.query(InventoryTransaction).delete()
        db.query(Batch).delete()
        db.query(Medicine).delete()
        db.query(Supplier).delete()
        db.commit()
        print("Database cleared.")
    except Exception as e:
        db.rollback()
        print(f"Error clearing database: {e}")
        return

    data = [
        {"Name": "moxicillin 250mg", "Category": "Antibiotics", "Quantity": 301, "Price": 12.5, "Expiry": "2025-06-30", "Batch": "BATCH002", "Supplier": "Cipla"},
        {"Name": "Aspirin 75mg", "Category": "Cardiovascular", "Quantity": 600, "Price": 4.5, "Expiry": "2026-01-25", "Batch": "BATCH006", "Supplier": "Sun Pharma"},
        {"Name": "Atorvastatin 10mg", "Category": "Cholesterol", "Quantity": 250, "Price": 18, "Expiry": "2025-04-18", "Batch": "BATCH008", "Supplier": "Apollo"},
        {"Name": "Cetirizine 10mg", "Category": "Allergy", "Quantity": 400, "Price": 6.75, "Expiry": "2025-08-05", "Batch": "BATCH007", "Supplier": "Cipla"},
        {"Name": "Ibuprofen 400mg", "Category": "Pain Relief", "Quantity": 450, "Price": 8.99, "Expiry": "2025-09-15", "Batch": "BATCH003", "Supplier": "Apollo"},
        {"Name": "Losartan 50mg", "Category": "Blood Pressure", "Quantity": 280, "Price": 14.5, "Expiry": "2025-07-22", "Batch": "BATCH010", "Supplier": "Amazon Pharma"},
        {"Name": "Metformin 500mg", "Category": "Diabetes", "Quantity": 200, "Price": 15, "Expiry": "2025-03-20", "Batch": "BATCH004", "Supplier": "Mankind"},
        {"Name": "Omeprazole 20mg", "Category": "Digestive", "Quantity": 350, "Price": 10.5, "Expiry": "2025-11-10", "Batch": "BATCH005", "Supplier": "Amazon Pharma"},
        {"Name": "Paracetamol 500mg", "Category": "Pain Relief", "Quantity": 500, "Price": 5.99, "Expiry": "2025-12-31", "Batch": "BATCH001", "Supplier": "Sun Pharma"},
        {"Name": "Salbutamol Inhaler", "Category": "Respiratory", "Quantity": 150, "Price": 25, "Expiry": "2025-10-30", "Batch": "BATCH009", "Supplier": "Mankind"}
    ]

    success_count = 0
    today = datetime.now()
    
    # Cache suppliers to avoid duplicates
    supplier_map = {}

    for row in data:
        try:
            name = row["Name"]
            sku = get_sku(name)
            
            # 0. Create Supplier
            supp_name = row["Supplier"]
            if supp_name not in supplier_map:
                supplier = db.query(Supplier).filter(Supplier.name == supp_name).first()
                if not supplier:
                    supplier = Supplier(
                        name=supp_name,
                        email=f"contact@{supp_name.lower().replace(' ', '')}.com",
                        phone="555-0199",
                        is_active=True
                    )
                    db.add(supplier)
                    db.flush()
                supplier_map[supp_name] = supplier
            
            # 1. Medicine
            med = db.query(Medicine).filter(Medicine.sku == sku).first()
            if not med:
                med = Medicine(
                    sku=sku,
                    name=name,
                    category=row["Category"],
                    manufacturer=supp_name,
                    brand=supp_name,
                    mrp=row["Price"],
                    cost=row["Price"] * 0.7, # 30% margin assumption
                    is_active=True
                )
                db.add(med)
                db.flush()
            
            # 2. Batch
            expiry_date = datetime.strptime(row["Expiry"], "%Y-%m-%d")
            batch = db.query(Batch).filter(Batch.medicine_id == med.id, Batch.batch_number == row["Batch"]).first()
            
            is_expired = expiry_date < today
            
            if not batch:
                batch = Batch(
                    medicine_id=med.id,
                    batch_number=row["Batch"],
                    quantity=row["Quantity"],
                    expiry_date=expiry_date,
                    is_expired=is_expired,
                    purchase_price=row["Price"] * 0.7
                )
                db.add(batch)
                db.flush()
                print(f"Created Batch: {row['Batch']} (Expired: {is_expired})")
                
                # Create Alert if Expired
                if is_expired:
                    alert = Alert(
                        alert_type=AlertType.EXPIRY_WARNING,
                        medicine_id=med.id,
                        batch_id=batch.id,
                        message=f"Batch {batch.batch_number} for {med.name} has expired on {expiry_date.strftime('%Y-%m-%d')}.",
                        severity="high"
                    )
                    db.add(alert)
                    
            # 3. Transaction
            txn = InventoryTransaction(
                medicine_id=med.id,
                batch_id=batch.id,
                transaction_type=TransactionType.IN,
                quantity=row["Quantity"],
                unit_price=row["Price"],
                notes="Data Setup",
                created_by=1
            )
            db.add(txn)
            
            # 4. Generate Sales History (for Forecasting & Analysis)
            # Create random sales over last 60 days
            import random
            from datetime import timedelta
            
            # Only generate sales if batch is NOT expired (logically)
            if not is_expired:
                for i in range(15): # 15 random sales transactions
                    sale_date = today - timedelta(days=random.randint(1, 60))
                    qty_sold = random.randint(1, 20)
                    
                    sale_txn = InventoryTransaction(
                        medicine_id=med.id,
                        batch_id=batch.id,
                        transaction_type=TransactionType.OUT,
                        quantity=qty_sold,
                        unit_price=row["Price"], # Sold at MRP
                        notes=f"Sales History {i+1}",
                        created_by=1,
                        created_at=sale_date # Override creation date
                    )
                    db.add(sale_txn)
            
            success_count += 1
            
        except Exception as e:
            print(f"Error processing {row['Name']}: {e}")
            import traceback
            print(traceback.format_exc())
            
    db.commit()
    print(f"Successfully ingested {success_count} items with full feature support and sales history.")
    db.close()

if __name__ == "__main__":
    ingest_data()
