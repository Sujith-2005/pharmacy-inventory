
from database import SessionLocal
from models import Supplier

def add_suppliers():
    db = SessionLocal()
    try:
        print("Adding default suppliers...")
        
        suppliers_data = [
            {
                "name": "Tata 1mg",
                "email": "contact@1mg.com",
                "phone": "1800-103-0304",
                "address": "Level 3, Vasant Square Mall, Pocket V, Sector B, Vasant Kunj, New Delhi",
                "lead_time_days": 3
            },
            {
                "name": "Medplus",
                "email": "wecare@medplusmart.com",
                "phone": "040-67006700",
                "address": "Rep. by its Managing Director, H. No: 11-6-56, Survey No: 257 & 258/1, Opp: IDPL Railway Siding Road, Moosapet, Kukatpally, Hyderabad",
                "lead_time_days": 2
            },
            {
                "name": "Apollo Pharmacy",
                "email": "helpdesk@apollopharmacy.org",
                "phone": "1860-500-0101",
                "address": "Apollo Hospitals Complex, Jubilee Hills, Hyderabad",
                "lead_time_days": 2
            },
            {
                "name": "Netmeds",
                "email": "cs@netmeds.com",
                "phone": "7200712345",
                "address": "Express Towers, Nariman Point, Mumbai",
                "lead_time_days": 4
            },
            {
                "name": "PharmEasy",
                "email": "care@pharmeasy.in",
                "phone": "08600990099",
                "address": "Mumbai, Maharashtra",
                "lead_time_days": 3
            }
        ]

        count = 0
        for data in suppliers_data:
            # Check if exists
            exists = db.query(Supplier).filter(Supplier.name == data["name"]).first()
            if not exists:
                supplier = Supplier(**data)
                db.add(supplier)
                count += 1
                print(f"Added {data['name']}")
            else:
                print(f"Skipped {data['name']} (already exists)")
        
        db.commit()
        print(f"Successfully added {count} new suppliers.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_suppliers()
