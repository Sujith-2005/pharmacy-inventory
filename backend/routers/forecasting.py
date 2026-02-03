"""
Demand forecasting router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import Medicine, Forecast
from schemas import ForecastResponse
from ml_models.forecasting import calculate_demand_forecast, batch_forecast_all_medicines
from auth import get_current_active_user

router = APIRouter()
from utils.ai import generate_ai_response

@router.get("/ai-analysis")
async def get_forecasting_ai_analysis(db: Session = Depends(get_db)):
    """Get AI analysis of demand forecast"""
    # Get critical suggestions
    suggestions = await get_reorder_suggestions(critical_only=True, db=db)
    
    if not suggestions:
        return {"analysis": "Inventory is healthy. No immediate purchasing actions required."}

    context = "\n".join([
        f"- {s['medicine_name']}: Stock {s['current_stock']}, Recommended {s['recommended_quantity']} (Priority: {s['priority']})"
        for s in suggestions[:10]
    ])
    
    prompt = (
        f"Act as a Senior Supply Chain Analyst. Analyze these critical reorder suggestions:\n{context}\n\n"
        f"Develop a Strategic Purchasing Plan:\n"
        f"1. **Sales & Consumption Trends**: Identify high-velocity items and increasing usage trends.\n"
        f"2. **Triage Criticalities**: Identify which items pose an immediate risk to patient care (Stockouts).\n"
        f"3. **Cash Flow Optimization**: Suggest which 'At Risk' items can wait versus which need immediate capital allocation.\n"
        f"4. **Bulk Opportunity**: Identify if any items can be grouped for supplier negotiation (e.g., same category/manufacturer).\n"
        f"Be concise and directive.\n"
        f"FORMAT RULE: Do NOT use asterisks (*), bolding (**), or markdown. Use standard numbered lists (1., 2.) only. Plain text."
    )
    
    return {"analysis": generate_ai_response(prompt)}



@router.get("/medicine/{medicine_id}", response_model=dict)
async def get_forecast(
    medicine_id: int,
    horizon_days: int = 30,
    db: Session = Depends(get_db)
):
    """Get demand forecast for a specific medicine"""
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    forecast_data = calculate_demand_forecast(db, medicine_id, horizon_days)
    
    # Save forecast to database
    forecast = Forecast(
        medicine_id=medicine_id,
        forecast_date=datetime.now(),
        forecasted_demand=forecast_data['forecasted_demand'],
        forecast_horizon_days=horizon_days,
        confidence_score=forecast_data['confidence_score'],
        reorder_point=forecast_data['reorder_point'],
        recommended_quantity=forecast_data['recommended_quantity'],
        reasoning=forecast_data['reasoning']
    )
    db.add(forecast)
    db.commit()
    
    return {
        "medicine_id": medicine_id,
        "medicine_name": medicine.name,
        "sku": medicine.sku,
        **forecast_data
    }


@router.get("/reorder-suggestions", response_model=List[dict])
async def get_reorder_suggestions(
    category: str = None,
    critical_only: bool = False,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get reorder suggestions for all medicines"""
    query = db.query(Medicine).filter(Medicine.is_active == True)
    
    if category:
        query = query.filter(Medicine.category == category)
    
    medicines = query.all()
    
    suggestions = []
    for medicine in medicines:
        forecast_data = calculate_demand_forecast(db, medicine.id)
        
        # Get current stock details
        total_stock = sum([b.quantity for b in medicine.batches])
        valid_stock = sum([b.quantity for b in medicine.batches if not b.is_expired])
        expired_stock = total_stock - valid_stock
        
        current_stock = valid_stock # Logic still uses sellable stock for priority decision
        
        # Determine priority
        if current_stock == 0 and forecast_data['forecasted_demand'] > 0:
            priority = "critical"
        elif current_stock < forecast_data['reorder_point']:
            priority = "low_stock"
        elif current_stock < forecast_data['recommended_quantity']:
            priority = "at_risk"
        else:
            priority = "healthy"
        
        if critical_only and priority not in ["critical", "low_stock"]:
            continue
        
        suggestions.append({
            "medicine_id": medicine.id,
            "medicine_name": medicine.name,
            "sku": medicine.sku,
            "category": medicine.category,
            "current_stock": valid_stock, # Sellable
            "total_physical_stock": total_stock,
            "expired_stock": expired_stock,
            "priority": priority,
            **forecast_data
        })
    
    # Sort by priority
    priority_order = {"critical": 0, "low_stock": 1, "at_risk": 2, "healthy": 3}
    suggestions.sort(key=lambda x: priority_order.get(x['priority'], 99))
    
    return suggestions


@router.post("/batch-forecast")
async def generate_batch_forecast(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Generate forecasts for all medicines (batch job)"""
    forecasts = batch_forecast_all_medicines(db)
    
    # Save to database
    for forecast_data in forecasts:
        forecast = Forecast(
            medicine_id=forecast_data['medicine_id'],
            forecast_date=datetime.now(),
            forecasted_demand=forecast_data['forecasted_demand'],
            forecast_horizon_days=30,
            confidence_score=forecast_data['confidence_score'],
            reorder_point=forecast_data['reorder_point'],
            recommended_quantity=forecast_data['recommended_quantity'],
            reasoning=forecast_data['reasoning']
        )
        db.add(forecast)
    
    db.commit()
    
    
    return {
        "message": f"Generated forecasts for {len(forecasts)} medicines",
        "count": len(forecasts)
    }


@router.post("/simulate")
async def simulate_history(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Generate synthetic history for demo purposes"""
    from ml_models.forecasting import generate_synthetic_history
    return generate_synthetic_history(db)


