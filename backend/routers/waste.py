"""
Waste analytics router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
from models import Batch, Medicine, InventoryTransaction, TransactionType
from auth import get_current_active_user

router = APIRouter()
from utils.ai import generate_ai_response

@router.get("/ai-analysis")
async def get_waste_ai_analysis(db: Session = Depends(get_db)):
    """Get AI analysis of waste data"""
    # Reuse existing analytics logic logic or simpler query
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)
    
    analytics = await get_waste_analytics(start_date, end_date, None, db)
    
    prompt = (
        f"Act as a Sustainability & Financial Auditor. Analyze this pharmacy waste data (Last 90 Days):\n"
        f"- Expired Inventory Loss: ₹{analytics['expired']['value']} ({analytics['expired']['count']} batches)\n"
        f"- Damaged Inventory Loss: ₹{analytics['damaged']['value']}\n"
        f"- Overall Wastage Ratio: {analytics['total']['wastage_rate_percent']}%\n\n"
        f"Provide a tactical Waste Reduction Plan:\n"
        f"1. **Root Cause Analysis**: Is the waste driven more by expiration (poor forecasting) or damage (handling issues)?\n"
        f"2. **Wastage by Category**: Provide a breakdown of which medicine categories (Antibiotics, Pain Relief, etc.) are contributing most to waste.\n"
        f"3. **Financial Recovery**: Estimate potential annual savings if wastage is reduced by 50%.\n"
        f"4. **Action Items**: Suggest 2 specific protocols (e.g., 'Implement FEFO visual tags', 'Supplier return policy review').\n"
        f"FORMAT RULE: Do NOT use asterisks (*), bolding (**), or markdown. Use standard numbered lists (1., 2.) only. Plain text."
    )
    
    return {"analysis": generate_ai_response(prompt)}



@router.get("/analytics")
async def get_waste_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get waste analytics from Inventory Transactions and Current Expired Stock"""
    if not end_date:
        end_date = datetime.now()
    if not start_date:
        start_date = end_date - timedelta(days=90)
    
    # 1. Get Historical Waste from Transactions
    waste_transactions = db.query(InventoryTransaction).filter(
        InventoryTransaction.transaction_type.in_([
            TransactionType.EXPIRED, 
            TransactionType.DAMAGED, 
            TransactionType.RECALLED, 
            TransactionType.RETURN
        ]),
        InventoryTransaction.created_at >= start_date,
        InventoryTransaction.created_at <= end_date
    )
    
    if category:
        waste_transactions = waste_transactions.join(Medicine).filter(Medicine.category == category)
        
    waste_transactions = waste_transactions.all()
    
    # Aggregators
    expired_val = 0.0
    expired_qty = 0
    
    damaged_val = 0.0
    damaged_qty = 0
    
    recalled_val = 0.0
    recalled_qty = 0
    
    returned_val = 0.0
    returned_qty = 0
    
    # Sum up transactions
    for tx in waste_transactions:
        # Use transaction unit price if available, else medicine MRP
        price = tx.unit_price if tx.unit_price is not None else (tx.medicine.mrp or 0)
        value = tx.quantity * price
        
        if tx.transaction_type == TransactionType.EXPIRED:
            expired_val += value
            expired_qty += tx.quantity
        elif tx.transaction_type == TransactionType.DAMAGED:
            damaged_val += value
            damaged_qty += tx.quantity
        elif tx.transaction_type == TransactionType.RECALLED:
            recalled_val += value
            recalled_qty += tx.quantity
        elif tx.transaction_type == TransactionType.RETURN:
            returned_val += value
            returned_qty += tx.quantity

    # 2. Add Current Inventory that is Expired (Current Liability)
    # Include ALL currently held expired stock regardless of date window
    current_expired_batches = db.query(Batch).filter(
        Batch.quantity > 0,
        Batch.is_expired == True 
    )
    
    if category:
        current_expired_batches = current_expired_batches.join(Medicine).filter(Medicine.category == category)
        
    for batch in current_expired_batches.all():
        value = batch.quantity * (batch.medicine.mrp or 0)
        expired_val += value
        expired_qty += batch.quantity

    # 3. Add Current Inventory that is marked Damaged/Recalled (if any remaining in stock)
    # Note: Usually damaged items are removed via transaction, but if they exist in batch with flag:
    current_damaged_batches = db.query(Batch).filter(
        Batch.quantity > 0,
        Batch.is_damaged == True,
        Batch.updated_at >= start_date,
        Batch.updated_at <= end_date
    )
    if category:
        current_damaged_batches = current_damaged_batches.join(Medicine).filter(Medicine.category == category)
        
    for batch in current_damaged_batches.all():
        value = batch.quantity * (batch.medicine.mrp or 0)
        damaged_val += value
        damaged_qty += batch.quantity

    total_waste_value = expired_val + damaged_val + recalled_val
    total_waste_quantity = expired_qty + damaged_qty + recalled_qty + returned_qty
    
    # 4. Calculate Total Inventory Value (Current Stock) for Wastage Rate
    # Rate = Total Waste / (Total Current Inventory + Total Waste) * 100
    # This represents the % of total assets that were wasted
    current_inventory_value = db.query(func.sum(Batch.quantity * Medicine.mrp)).join(
        Medicine
    ).filter(
        Batch.quantity > 0
    ).scalar() or 0.0
    
    denominator = current_inventory_value + total_waste_value
    wastage_rate = (total_waste_value / denominator * 100) if denominator > 0 else 0.0
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "expired": {
            "quantity": expired_qty,
            "value": expired_val,
            "count": 0 # Count is less relevant when mixing transactions and batches
        },
        "damaged": {
            "quantity": damaged_qty,
            "value": damaged_val,
            "count": 0
        },
        "recalled": {
            "quantity": recalled_qty,
            "value": recalled_val,
            "count": 0
        },
        "returned": {
            "quantity": returned_qty,
            "value": returned_val,
            "count": 0
        },
        "total": {
            "quantity": total_waste_quantity,
            "value": total_waste_value,
            "wastage_rate_percent": round(wastage_rate, 2)
        }
    }


@router.get("/top-waste-items")
async def get_top_waste_items(
    limit: int = 10,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get top items by waste value"""
    if not end_date:
        end_date = datetime.now()
    if not start_date:
        start_date = end_date - timedelta(days=90)
    
    # Get all wasted batches
    wasted_batches = db.query(Batch).filter(
        and_(
            (Batch.is_expired == True) | (Batch.is_damaged == True) | (Batch.is_recalled == True),
            Batch.updated_at >= start_date,
            Batch.updated_at <= end_date
        )
    ).all()
    
    # Aggregate by medicine
    waste_by_medicine = {}
    for batch in wasted_batches:
        med_id = batch.medicine_id
        if med_id not in waste_by_medicine:
            waste_by_medicine[med_id] = {
                "medicine_id": med_id,
                "medicine_name": batch.medicine.name,
                "sku": batch.medicine.sku,
                "category": batch.medicine.category,
                "quantity": 0,
                "value": 0
            }
        
        waste_by_medicine[med_id]["quantity"] += batch.quantity
        waste_by_medicine[med_id]["value"] += batch.quantity * (batch.medicine.mrp or 0)
    
    # Sort by value and return top N
    sorted_items = sorted(
        waste_by_medicine.values(),
        key=lambda x: x["value"],
        reverse=True
    )
    
    return sorted_items[:limit]


@router.get("/by-category")
async def get_waste_by_category(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get waste breakdown by category"""
    if not end_date:
        end_date = datetime.now()
    if not start_date:
        start_date = end_date - timedelta(days=90)
    
    wasted_batches = db.query(Batch, Medicine).join(Medicine).filter(
        and_(
            (Batch.is_expired == True) | (Batch.is_damaged == True) | (Batch.is_recalled == True),
            Batch.updated_at >= start_date,
            Batch.updated_at <= end_date
        )
    ).all()
    
    waste_by_category = {}
    for batch, medicine in wasted_batches:
        category = medicine.category or "uncategorized"
        if category not in waste_by_category:
            waste_by_category[category] = {
                "category": category,
                "quantity": 0,
                "value": 0,
                "count": 0
            }
        
        waste_by_category[category]["quantity"] += batch.quantity
        waste_by_category[category]["value"] += batch.quantity * (medicine.mrp or 0)
        waste_by_category[category]["count"] += 1
    
    return list(waste_by_category.values())


@router.post("/mark-expired/{batch_id}")
async def mark_batch_expired(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Mark a batch as expired"""
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    batch.is_expired = True
    batch.quantity = 0  # Remove from available stock
    
    # Create transaction
    transaction = InventoryTransaction(
        medicine_id=batch.medicine_id,
        batch_id=batch.id,
        transaction_type=TransactionType.EXPIRED,
        quantity=batch.quantity,
        notes="Marked as expired",
        created_by=current_user.id
    )
    db.add(transaction)
    db.commit()
    
    return {"message": "Batch marked as expired"}


@router.post("/mark-damaged/{batch_id}")
async def mark_batch_damaged(
    batch_id: int,
    quantity: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Mark a batch as damaged"""
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    if quantity > batch.quantity:
        raise HTTPException(status_code=400, detail="Damaged quantity exceeds available stock")
    
    batch.is_damaged = True
    batch.quantity -= quantity
    
    # Create transaction
    transaction = InventoryTransaction(
        medicine_id=batch.medicine_id,
        batch_id=batch.id,
        transaction_type=TransactionType.DAMAGED,
        quantity=quantity,
        notes="Marked as damaged",
        created_by=current_user.id
    )
    db.add(transaction)
    db.commit()
    
    return {"message": "Batch marked as damaged"}


