"""
Alerts router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta

from database import get_db
from models import Alert, AlertType, Medicine, Batch
from schemas import AlertResponse
from auth import get_current_active_user
from config import settings

router = APIRouter()
from utils.ai import generate_ai_response

@router.get("/ai-analysis")
async def get_alerts_ai_analysis(db: Session = Depends(get_db)):
    """Get AI risk assessment of alerts"""
    alerts = await get_unacknowledged_alerts(db)
    
    if not alerts:
        return {"analysis": "System is stable. No active alerts demanding attention."}

    context = "\n".join([
        f"- {a.alert_type}: {a.message} (Severity: {a.severity})"
        for a in alerts[:10]
    ])
    
    prompt = (
        f"Act as a Crisis Response Manager. Analyze these active pharmacy system alerts:\n{context}\n\n"
        f"Provide a Risk Mitigation Assessment:\n"
        f"1. **Pattern Recognition**: Are these alerts isolated incidents or signs of a systemic failure (e.g., vendor delay pattern, recurring fridge failure)?\n"
        f"2. **Prioritization**: Which single alert requires the most immediate human intervention?\n"
        f"3. **Prevention**: Recommend a systemic fix to prevent recurrence (e.g., 'Adjust safety stock settings', 'Staff training on handling').\n"
        f"FORMAT RULE: Do NOT use asterisks (*), bolding (**), or markdown. Use standard numbered lists (1., 2.) only. Plain text."
    )
    
    return {"analysis": generate_ai_response(prompt)}



@router.get("/", response_model=List[AlertResponse])
async def get_alerts(
    alert_type: AlertType = None,
    acknowledged: bool = None,
    severity: str = None,
    db: Session = Depends(get_db)
):
    """Get all alerts"""
    query = db.query(Alert)
    
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    
    if acknowledged is not None:
        query = query.filter(Alert.is_acknowledged == acknowledged)
    
    if severity:
        query = query.filter(Alert.severity == severity)
    
    alerts = query.order_by(Alert.created_at.desc()).limit(100).all()
    return alerts


@router.get("/unacknowledged", response_model=List[AlertResponse])
async def get_unacknowledged_alerts(db: Session = Depends(get_db)):
    """Get unacknowledged alerts"""
    alerts = db.query(Alert).filter(
        Alert.is_acknowledged == False
    ).order_by(Alert.created_at.desc()).all()
    return alerts


@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Acknowledge an alert"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_acknowledged = True
    alert.acknowledged_by = current_user.id
    alert.acknowledged_at = datetime.now()
    
    db.commit()
    return {"message": "Alert acknowledged"}


@router.post("/run-system-scan")
async def run_system_scan(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Run full system scan for low stock and expiry"""
    medicines = db.query(Medicine).filter(Medicine.is_active == True).all()
    
    alerts_created = 0
    today = datetime.now()
    month_from_now = today + timedelta(days=30)
    
    for medicine in medicines:
        # 1. Check Low Stock
        active_batches = [b for b in medicine.batches if not b.is_expired and not b.is_damaged]
        total_stock = sum([b.quantity for b in active_batches])
        
        # Check existing low stock alert
        existing_stock_alert = db.query(Alert).filter(
            Alert.medicine_id == medicine.id,
            Alert.alert_type.in_([AlertType.LOW_STOCK, AlertType.STOCK_OUT]),
            Alert.is_acknowledged == False
        ).first()
        
        if not existing_stock_alert:
            # Thresholds: Critical=0, High<15, Medium<30
            if total_stock == 0:
                db.add(Alert(
                    alert_type=AlertType.STOCK_OUT,
                    medicine_id=medicine.id,
                    message=f"CRITICAL: {medicine.name} is OUT OF STOCK!",
                    severity="critical"
                ))
                alerts_created += 1
            elif total_stock < 15:
                db.add(Alert(
                    alert_type=AlertType.LOW_STOCK,
                    medicine_id=medicine.id,
                    message=f"Low Stock: {medicine.name} has only {total_stock} units.",
                    severity="high"
                ))
                alerts_created += 1

        # 2. Check Expiry
        for batch in active_batches:
            if batch.expiry_date and batch.expiry_date <= month_from_now:
                # Check existing expiry alert for this batch
                # Note: Simple deduplication by message content comparison for now
                msg = f"Batch {batch.batch_number} for {medicine.name} expires on {batch.expiry_date.date()}"
                
                existing_expiry = db.query(Alert).filter(
                    Alert.medicine_id == medicine.id,
                    Alert.alert_type == AlertType.EXPIRY_WARNING,
                    Alert.message == msg,
                    Alert.is_acknowledged == False
                ).first()
                
                if not existing_expiry:
                    days_left = (batch.expiry_date - today).days
                    severity = "critical" if days_left < 7 else "high"
                    
                    db.add(Alert(
                        alert_type=AlertType.EXPIRY_WARNING,
                        medicine_id=medicine.id,
                        message=msg,
                        severity=severity
                    ))
                    alerts_created += 1
                    
    db.commit()
    return {"message": f"System scan complete. Generated {alerts_created} new alerts."}


@router.get("/stats")
async def get_alert_stats(db: Session = Depends(get_db)):
    """Get alert statistics"""
    total_alerts = db.query(Alert).count()
    unacknowledged = db.query(Alert).filter(Alert.is_acknowledged == False).count()
    
    by_type = db.query(
        Alert.alert_type,
        func.count(Alert.id).label('count')
    ).group_by(Alert.alert_type).all()
    
    by_severity = db.query(
        Alert.severity,
        func.count(Alert.id).label('count')
    ).group_by(Alert.severity).all()
    
    return {
        "total_alerts": total_alerts,
        "unacknowledged": unacknowledged,
        "by_type": {str(t[0]): t[1] for t in by_type},
        "by_severity": {s[0]: s[1] for s in by_severity}
    }


