"""
Inventory management router
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
import pandas as pd
from io import BytesIO

from database import get_db
from models import Medicine, Batch, InventoryTransaction, TransactionType, Alert, AlertType
from schemas import MedicineCreate, MedicineResponse, BatchResponse, TransactionCreate, TransactionResponse
from auth import get_current_active_user
from config import settings
from ml_models.categorization import categorize_medicine

router = APIRouter()


@router.post("/upload-excel", response_model=dict)
async def upload_inventory_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Upload Excel file to update inventory"""
    try:
        # Read Excel file
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))
        
        # Validate required columns
        required_columns = ['SKU', 'Medicine Name', 'Batch No', 'Quantity', 'Expiry Date']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required columns: {missing_columns}"
            )
        
        errors = []
        success_count = 0
        
        for idx, row in df.iterrows():
            try:
                sku = str(row['SKU']).strip()
                name = str(row['Medicine Name']).strip()
                batch_no = str(row['Batch No']).strip()
                quantity = int(row['Quantity'])
                
                # Parse expiry date
                expiry_date = pd.to_datetime(row['Expiry Date'])
                
                # Get or create medicine
                medicine = db.query(Medicine).filter(Medicine.sku == sku).first()
                if not medicine:
                    # Auto-categorize using AI
                    category = categorize_medicine(name, row.get('Manufacturer', ''), row.get('Brand', ''))
                    
                    medicine = Medicine(
                        sku=sku,
                        name=name,
                        category=category,
                        manufacturer=row.get('Manufacturer', ''),
                        brand=row.get('Brand', ''),
                        mrp=float(row.get('MRP', 0)) if pd.notna(row.get('MRP')) else None,
                        cost=float(row.get('Cost', 0)) if pd.notna(row.get('Cost')) else None,
                        schedule=row.get('Schedule', ''),
                        storage_requirements=row.get('Storage Requirements', '')
                    )
                    db.add(medicine)
                    db.flush()
                
                # Create or update batch
                batch = db.query(Batch).filter(
                    Batch.medicine_id == medicine.id,
                    Batch.batch_number == batch_no
                ).first()
                
                if batch:
                    old_quantity = batch.quantity
                    batch.quantity = quantity
                    batch.expiry_date = expiry_date
                    if pd.notna(row.get('Purchase Date')):
                        batch.purchase_date = pd.to_datetime(row.get('Purchase Date'))
                    if pd.notna(row.get('Purchase Price')):
                        batch.purchase_price = float(row.get('Purchase Price'))
                    
                    # Create transaction for quantity change
                    if old_quantity != quantity:
                        transaction = InventoryTransaction(
                            medicine_id=medicine.id,
                            batch_id=batch.id,
                            transaction_type=TransactionType.ADJUSTMENT,
                            quantity=quantity - old_quantity,
                            notes=f"Excel upload adjustment"
                        )
                        db.add(transaction)
                else:
                    batch = Batch(
                        medicine_id=medicine.id,
                        batch_number=batch_no,
                        quantity=quantity,
                        expiry_date=expiry_date,
                        purchase_date=pd.to_datetime(row.get('Purchase Date')) if pd.notna(row.get('Purchase Date')) else None,
                        purchase_price=float(row.get('Purchase Price')) if pd.notna(row.get('Purchase Price')) else None
                    )
                    db.add(batch)
                    db.flush()
                    
                    # Create transaction
                    transaction = InventoryTransaction(
                        medicine_id=medicine.id,
                        batch_id=batch.id,
                        transaction_type=TransactionType.IN,
                        quantity=quantity,
                        notes=f"Excel upload - new batch"
                    )
                    db.add(transaction)
                
                success_count += 1
                
            except Exception as e:
                errors.append(f"Row {idx + 2}: {str(e)}")
        
        db.commit()
        
        # Check for expiries and create alerts
        check_expiry_alerts(db)
        
        return {
            "message": "Upload completed",
            "success_count": success_count,
            "error_count": len(errors),
            "errors": errors[:10]  # Return first 10 errors
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing file: {str(e)}"
        )


def check_expiry_alerts(db: Session):
    """Check for upcoming expiries and create alerts"""
    today = datetime.now().date()
    for days in settings.EXPIRY_ALERT_DAYS:
        threshold_date = today + timedelta(days=days)
        # Convert threshold_date to datetime for comparison
        threshold_datetime = datetime.combine(threshold_date, datetime.min.time())
        batches = db.query(Batch).filter(
            Batch.expiry_date <= threshold_datetime,
            Batch.is_expired == False,
            Batch.quantity > 0
        ).all()
        
        for batch in batches:
            # Check if alert already exists
            existing_alert = db.query(Alert).filter(
                Alert.batch_id == batch.id,
                Alert.alert_type == AlertType.EXPIRY_WARNING,
                Alert.is_acknowledged == False
            ).first()
            
            if not existing_alert:
                # Handle both date and datetime expiry_date
                if isinstance(batch.expiry_date, datetime):
                    expiry_date_only = batch.expiry_date.date()
                else:
                    expiry_date_only = batch.expiry_date
                
                days_until_expiry = (expiry_date_only - today).days
                if days_until_expiry >= 0:  # Only alert for future expiries
                    alert = Alert(
                        alert_type=AlertType.EXPIRY_WARNING,
                        medicine_id=batch.medicine_id,
                        batch_id=batch.id,
                        message=f"{batch.medicine.name} (Batch: {batch.batch_number}) expires in {days_until_expiry} days",
                        severity="high" if days_until_expiry <= 30 else "medium"
                    )
                    db.add(alert)
    
    db.commit()


@router.get("/medicines", response_model=List[MedicineResponse])
async def get_medicines(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    search: str = None,
    db: Session = Depends(get_db)
):
    """Get list of medicines"""
    query = db.query(Medicine).filter(Medicine.is_active == True)
    
    if category:
        query = query.filter(Medicine.category == category)
    
    if search:
        query = query.filter(
            (Medicine.name.ilike(f"%{search}%")) |
            (Medicine.sku.ilike(f"%{search}%"))
        )
    
    medicines = query.offset(skip).limit(limit).all()
    return medicines


@router.get("/medicines/{medicine_id}", response_model=MedicineResponse)
async def get_medicine(medicine_id: int, db: Session = Depends(get_db)):
    """Get medicine details"""
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return medicine


@router.post("/medicines", response_model=MedicineResponse)
async def create_medicine(
    medicine: MedicineCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Create a new medicine"""
    # Check if SKU already exists
    existing = db.query(Medicine).filter(Medicine.sku == medicine.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")
    
    # Auto-categorize if not provided
    if not medicine.category:
        medicine.category = categorize_medicine(medicine.name, medicine.manufacturer or "", medicine.brand or "")
    
    db_medicine = Medicine(**medicine.dict())
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine


@router.get("/medicines/{medicine_id}/batches", response_model=List[BatchResponse])
async def get_medicine_batches(
    medicine_id: int,
    db: Session = Depends(get_db)
):
    """Get batches for a medicine"""
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    batches = db.query(Batch).filter(
        Batch.medicine_id == medicine_id,
        Batch.quantity > 0
    ).order_by(Batch.expiry_date).all()
    
    return batches


@router.get("/stock-levels")
async def get_stock_levels(
    low_stock_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get stock levels for all medicines"""
    query = db.query(
        Medicine.id,
        Medicine.sku,
        Medicine.name,
        Medicine.category,
        func.sum(Batch.quantity).label('total_quantity'),
        func.min(Batch.expiry_date).label('nearest_expiry')
    ).join(Batch).filter(
        Batch.quantity > 0,
        Batch.is_expired == False
    ).group_by(Medicine.id)
    
    if low_stock_only:
        # This is simplified - in production, compare against forecasted demand
        query = query.having(func.sum(Batch.quantity) < 50)  # Example threshold
    
    results = query.all()
    
    return [
        {
            "medicine_id": r.id,
            "sku": r.sku,
            "name": r.name,
            "category": r.category,
            "total_quantity": r.total_quantity,
            "nearest_expiry": r.nearest_expiry.isoformat() if r.nearest_expiry else None
        }
        for r in results
    ]


@router.post("/transactions", response_model=TransactionResponse)
async def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Create an inventory transaction"""
    medicine = db.query(Medicine).filter(Medicine.id == transaction.medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    # Update batch quantity if batch_id provided
    if transaction.batch_id:
        batch = db.query(Batch).filter(Batch.id == transaction.batch_id).first()
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        if transaction.transaction_type == TransactionType.OUT:
            if batch.quantity < transaction.quantity:
                raise HTTPException(status_code=400, detail="Insufficient stock")
            batch.quantity -= transaction.quantity
        elif transaction.transaction_type == TransactionType.IN:
            batch.quantity += transaction.quantity
    
    db_transaction = InventoryTransaction(
        **transaction.dict(),
        created_by=current_user.id
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


