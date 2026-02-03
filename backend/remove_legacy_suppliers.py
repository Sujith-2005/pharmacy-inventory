from database import SessionLocal
from models import Supplier, PurchaseOrder, PurchaseOrderItem

def remove_legacy_suppliers():
    db = SessionLocal()
    try:
        print("Removing legacy suppliers...")
        
        legacy_names = ['sujith', 'mnc pharma']
        
        deleted_count = 0
        for name in legacy_names:
            supplier = db.query(Supplier).filter(Supplier.name == name).first()
            if supplier:
                # 1. Check for POs
                pos = db.query(PurchaseOrder).filter(PurchaseOrder.supplier_id == supplier.id).all()
                for po in pos:
                    # Delete PO Items first
                    db.query(PurchaseOrderItem).filter(PurchaseOrderItem.po_id == po.id).delete()
                    # Delete PO
                    db.delete(po)
                
                print(f"Deleted {len(pos)} related POs for {name}")

                # 2. Delete Supplier
                db.delete(supplier)
                deleted_count += 1
                print(f"Deleted Supplier: {name}")
            else:
                print(f"Not found: {name}")
        
        db.commit()
        print(f"Successfully removed {deleted_count} legacy suppliers.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    remove_legacy_suppliers()
