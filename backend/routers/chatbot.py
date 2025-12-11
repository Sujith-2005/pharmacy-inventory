"""
AI Chatbot router for inventory queries
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
import re
import uuid

from database import get_db
from models import Medicine, Batch, Alert, AlertType
from schemas import ChatMessage, ChatResponse
from auth import get_current_active_user

router = APIRouter()


def parse_query(query: str) -> dict:
    """Parse user query to extract intent and entities"""
    query_lower = query.lower()
    
    intent = None
    medicine_name = None
    action = None
    
    # Check for stock queries
    if any(word in query_lower for word in ["stock", "available", "have", "inventory"]):
        intent = "check_stock"
        # Try to extract medicine name
        # Simple extraction - look for capitalized words or common patterns
        words = query.split()
        for i, word in enumerate(words):
            if word[0].isupper() and len(word) > 3:
                medicine_name = word
                break
    
    # Check for expiry queries
    if any(word in query_lower for word in ["expire", "expiry", "expiring", "expires"]):
        intent = "check_expiry"
        # Extract medicine name
        words = query.split()
        for i, word in enumerate(words):
            if word[0].isupper() and len(word) > 3:
                medicine_name = word
                break
    
    # Check for low stock queries
    if any(word in query_lower for word in ["low stock", "low inventory", "running out"]):
        intent = "low_stock"
    
    # Check for waste queries
    if any(word in query_lower for word in ["waste", "wastage", "expired", "damaged"]):
        intent = "waste_analytics"
    
    # Check for report requests
    if any(word in query_lower for word in ["report", "show", "list", "generate"]):
        action = "generate_report"
    
    # Check for help
    if any(word in query_lower for word in ["help", "how", "guide", "tutorial"]):
        intent = "help"
    
    return {
        "intent": intent,
        "medicine_name": medicine_name,
        "action": action,
        "original_query": query
    }


@router.post("/chat", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Chatbot endpoint"""
    if not message.session_id:
        session_id = str(uuid.uuid4())
    else:
        session_id = message.session_id
    
    parsed = parse_query(message.message)
    intent = parsed["intent"]
    medicine_name = parsed["medicine_name"]
    
    response_text = ""
    suggested_actions = []
    
    if intent == "check_stock":
        if medicine_name:
            # Search for medicine
            medicine = db.query(Medicine).filter(
                or_(
                    Medicine.name.ilike(f"%{medicine_name}%"),
                    Medicine.sku.ilike(f"%{medicine_name}%")
                )
            ).first()
            
            if medicine:
                batches = db.query(Batch).filter(
                    Batch.medicine_id == medicine.id,
                    Batch.is_expired == False,
                    Batch.quantity > 0
                ).order_by(Batch.expiry_date).all()
                
                total_stock = sum([b.quantity for b in batches])
                
                if total_stock > 0:
                    nearest_expiry = batches[0].expiry_date if batches else None
                    response_text = (
                        f"Yes, {medicine.name} ({medicine.sku}) is available. "
                        f"Total stock: {total_stock} units. "
                        f"Nearest expiry: {nearest_expiry.strftime('%Y-%m-%d') if nearest_expiry else 'N/A'}. "
                        f"Recommended batch to dispense: {batches[0].batch_number} (FEFO)."
                    )
                    suggested_actions.append(f"View details for {medicine.name}")
                else:
                    response_text = f"{medicine.name} is currently out of stock."
                    suggested_actions.append("Check reorder suggestions")
            else:
                response_text = f"I couldn't find a medicine matching '{medicine_name}'. Please check the spelling or try searching by SKU."
        else:
            response_text = "I can check stock for you. Please specify the medicine name or SKU. For example: 'Do we have Azithromycin 500 in stock?'"
    
    elif intent == "check_expiry":
        if medicine_name:
            medicine = db.query(Medicine).filter(
                or_(
                    Medicine.name.ilike(f"%{medicine_name}%"),
                    Medicine.sku.ilike(f"%{medicine_name}%")
                )
            ).first()
            
            if medicine:
                batches = db.query(Batch).filter(
                    Batch.medicine_id == medicine.id,
                    Batch.is_expired == False,
                    Batch.quantity > 0
                ).order_by(Batch.expiry_date).all()
                
                if batches:
                    nearest_batch = batches[0]
                    response_text = (
                        f"The nearest expiry batch for {medicine.name} is: "
                        f"Batch {nearest_batch.batch_number}, "
                        f"expires on {nearest_batch.expiry_date.strftime('%Y-%m-%d')}, "
                        f"quantity: {nearest_batch.quantity} units."
                    )
                    suggested_actions.append(f"View expiry management for {medicine.name}")
                else:
                    response_text = f"No active batches found for {medicine.name}."
            else:
                response_text = f"I couldn't find a medicine matching '{medicine_name}'."
        else:
            response_text = "I can check expiry dates for you. Please specify the medicine name. For example: 'Which batch of Azithromycin expires first?'"
    
    elif intent == "low_stock":
        low_stock_alerts = db.query(Alert).filter(
            Alert.alert_type.in_([AlertType.LOW_STOCK, AlertType.STOCK_OUT]),
            Alert.is_acknowledged == False
        ).limit(10).all()
        
        if low_stock_alerts:
            medicine_names = [a.message.split("(")[0].strip() for a in low_stock_alerts[:5]]
            response_text = f"I found {len(low_stock_alerts)} low stock items. Top items: {', '.join(medicine_names)}."
            suggested_actions.append("View all low stock alerts")
            suggested_actions.append("Generate reorder suggestions")
        else:
            response_text = "No low stock items found. All items are well-stocked."
    
    elif intent == "waste_analytics":
        # Get recent waste data
        from datetime import datetime, timedelta
        start_date = datetime.now() - timedelta(days=30)
        
        expired_count = db.query(Batch).filter(
            Batch.is_expired == True,
            Batch.updated_at >= start_date
        ).count()
        
        damaged_count = db.query(Batch).filter(
            Batch.is_damaged == True,
            Batch.updated_at >= start_date
        ).count()
        
        response_text = (
            f"In the last 30 days, we have: "
            f"{expired_count} expired batches and {damaged_count} damaged batches. "
            f"Would you like to see detailed waste analytics?"
        )
        suggested_actions.append("View waste analytics dashboard")
        suggested_actions.append("Generate waste report")
    
    elif intent == "help":
        response_text = (
            "I can help you with:\n"
            "- Checking stock availability: 'Do we have [medicine name] in stock?'\n"
            "- Checking expiry dates: 'Which batch of [medicine] expires first?'\n"
            "- Low stock alerts: 'Show me low stock items'\n"
            "- Waste analytics: 'How much did we waste last month?'\n"
            "- Generating reports: 'Generate low stock report'\n\n"
            "Try asking me a question!"
        )
    
    else:
        response_text = (
            "I can help you with inventory queries. Try asking:\n"
            "- 'Do we have [medicine name] in stock?'\n"
            "- 'Show me low stock items'\n"
            "- 'Which batch expires first?'\n"
            "- 'How much did we waste last month?'\n"
            "Or type 'help' for more options."
        )
    
    return ChatResponse(
        response=response_text,
        session_id=session_id,
        suggested_actions=suggested_actions if suggested_actions else None
    )


@router.get("/suggestions")
async def get_chat_suggestions():
    """Get suggested queries for the chatbot"""
    return {
        "suggestions": [
            "Do we have Azithromycin 500 in stock?",
            "Show me low stock items",
            "Which batch of Paracetamol expires first?",
            "How much did we waste last month?",
            "Generate low stock report"
        ]
    }


