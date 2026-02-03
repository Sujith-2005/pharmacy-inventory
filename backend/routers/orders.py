"""
Orders router for customer prescription requests
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
import shutil
import os
import uuid

from database import get_db
from models import PrescriptionOrder
from pydantic import BaseModel

router = APIRouter()

# --- Schemas ---
class PrescriptionOrderCreate(BaseModel):
    customer_name: str
    contact_info: str
    notification_method: str = "whatsapp"
    notes: str = None
    prescription_image_path: str = None

class PrescriptionOrderResponse(BaseModel):
    id: int
    customer_name: str
    contact_info: str
    notification_method: str
    status: str
    message: str = None # Optional for list view
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Notification Simulation ---
def send_notification(method: str, contact: str, message: str):
    """
    Simulates sending a notification via WhatsApp, SMS, or Email.
    In a real production app, this would call Twilio/SendGrid/Meta APIs.
    """
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"\n{'='*50}")
    print(f"[NOTIFICATION SIMULATION] {timestamp}")
    print(f"CHANNEL: {method.upper()}")
    print(f"TO:      {contact}")
    print(f"MESSAGE: {message}")
    print(f"{'='*50}\n")
    return True

# --- Endpoints ---

@router.post("/upload-prescription")
async def upload_prescription(file: UploadFile = File(...)):
    """Upload prescription image"""
    try:
        # Create uploads directory if not exists
        upload_dir = "uploads/prescriptions"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        filename = f"rx_{uuid.uuid4()}{file_ext}"
        filepath = os.path.join(upload_dir, filename)
        
        # Save file
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"filepath": filepath}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create", response_model=PrescriptionOrderResponse)
async def create_order(
    order: PrescriptionOrderCreate,
    db: Session = Depends(get_db)
):
    """Create a new prescription order and trigger notification"""
    try:
        # 1. Save to DB
        db_order = PrescriptionOrder(
            customer_name=order.customer_name,
            contact_info=order.contact_info,
            notification_method=order.notification_method,
            prescription_image_path=order.prescription_image_path,
            notes=order.notes,
            status="pending"
        )
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        
        # 2. Send Notification
        msg = f"Hello {order.customer_name}, your prescription order #{db_order.id} has been received! We will verify stock and contact you shortly."
        send_notification(order.notification_method, order.contact_info, msg)
        
        return {
            "id": db_order.id,
            "customer_name": db_order.customer_name,
            "contact_info": db_order.contact_info,
            "notification_method": db_order.notification_method,
            "created_at": db_order.created_at,
            "status": "success",
            "message": f"Order received. Notification sent to {order.contact_info} via {order.notification_method}."
        }
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=list[PrescriptionOrderResponse])
async def get_orders(db: Session = Depends(get_db)):
    """Get all orders"""
    return db.query(PrescriptionOrder).order_by(PrescriptionOrder.created_at.desc()).all()
