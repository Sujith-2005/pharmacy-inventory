"""
AI Chatbot router with Gemini integration (dynamic model selection)
Compatible with google-generativeai >= 0.8.5
"""

from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import logging
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models import Medicine, Batch, Alert, AlertType
from schemas import ChatMessage, ChatResponse

# Shared Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# =====================================================
# GEMINI INITIALIZATION
# =====================================================

GEMINI_AVAILABLE = False
try:
    import google.generativeai as genai

    # Try env first, then fallback to known working key (fix for zombie/env issues)
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or "AIzaSyDlZTrdIjjtRykAgC8_7Nwo_zalM4fLlgU"
    
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY missing")

    genai.configure(api_key=GEMINI_API_KEY)
    GEMINI_AVAILABLE = True
    print(f"DEBUG | Gemini Initialized with key ending in ...{GEMINI_API_KEY[-5:]}")

except Exception as e:
    print("❌ Gemini initialization failed:", e)
    GEMINI_AVAILABLE = False


def get_gemini_model():
    """
    Dynamically find a Gemini model that supports generateContent.
    This is REQUIRED for google-generativeai 0.8.x
    """
    try:
        models = genai.list_models()
        for m in models:
            if "generateContent" in m.supported_generation_methods:
                # Prefer newer/faster models
                if "flash" in m.name or "pro" in m.name:
                    print("✅ Using Gemini model:", m.name)
                    return genai.GenerativeModel(m.name)
        
        # Fallback to first available if no preference met
        for m in models:
            if "generateContent" in m.supported_generation_methods:
                return genai.GenerativeModel(m.name)
                
    except Exception as e:
         print(f"Error listing models: {e}")
         
    # Extreme fallback
    return genai.GenerativeModel("gemini-pro")


# =====================================================
# CONTEXT BUILDER
# =====================================================

def get_inventory_context(db: Session) -> str:
    try:
        total_medicines = db.query(Medicine).filter(Medicine.is_active == True).count()
        low_stock_count = db.query(Alert).filter(
            Alert.alert_type.in_([AlertType.LOW_STOCK, AlertType.STOCK_OUT]),
            Alert.is_acknowledged == False
        ).count()
        active_batches = db.query(Batch).filter(
            Batch.is_expired == False,
            Batch.quantity > 0
        ).count()

        return f"""
You are an AI assistant for a pharmacy inventory management system.

Current snapshot:
- Total active medicines: {total_medicines}
- Low stock alerts: {low_stock_count}
- Active batches: {active_batches}

Answer clearly, professionally, and helpfully.
"""
    except Exception:
        return "You are an AI assistant for a pharmacy inventory management system."


# =====================================================
# RULE-BASED INVENTORY HANDLER
# =====================================================

def handle_inventory_query(query: str, db: Session) -> Optional[str]:
    query_lower = query.lower()

    if any(word in query_lower for word in ["stock", "available", "inventory", "have"]):
        words = query.split()
        medicine_name = next((w for w in words if len(w) > 3), None)

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

                total_stock = sum(b.quantity for b in batches)

                if total_stock > 0:
                    nearest = batches[0]
                    return (
                        f"{medicine.name} is in stock.\n"
                        f"Total quantity: {total_stock} units.\n"
                        f"Nearest expiry: {nearest.expiry_date.strftime('%Y-%m-%d')}.\n"
                        f"Dispense batch: {nearest.batch_number} (FEFO)."
                    )
                else:
                    return f"{medicine.name} is currently out of stock."

    if "low stock" in query_lower:
        alerts = db.query(Alert).filter(
            Alert.alert_type.in_([AlertType.LOW_STOCK, AlertType.STOCK_OUT]),
            Alert.is_acknowledged == False
        ).limit(5).all()

        if alerts:
            items = ", ".join(a.message.split("(")[0] for a in alerts)
            return f"Low stock items include: {items}."
        else:
            return "There are no low stock items at the moment."

    return None


# =====================================================
# CHAT ENDPOINT
# =====================================================

@router.post("/chat", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
    db: Session = Depends(get_db)
):
    session_id = message.session_id or str(uuid.uuid4())
    user_query = message.message.strip()

    print("DEBUG | User query:", user_query)

    # 1️⃣ Inventory logic first
    try:
        inventory_reply = handle_inventory_query(user_query, db)
        if inventory_reply:
            return ChatResponse(
                response=inventory_reply,
                session_id=session_id
            )
    except Exception as e:
        print(f"Rule-based error: {e}")

    # 2️⃣ Gemini for everything else
    if GEMINI_AVAILABLE:
        try:
            model = get_gemini_model()
            context = get_inventory_context(db)

            prompt = f"""{context}

User question:
{user_query}

Respond naturally and conversationally. Do not repeat the context.
"""

            response = model.generate_content(prompt)
            text = response.text if hasattr(response, "text") else None

            if text:
                return ChatResponse(
                    response=text.strip(),
                    session_id=session_id
                )

        except Exception as e:
            print("❌ GEMINI RUNTIME ERROR:", str(e))
            # Fallback if quota limit
            if "quota" in str(e).lower() or "429" in str(e):
                 return ChatResponse(
                    response="My AI brain is momentarily tired (Quota Limit). Please ask simple stock questions!",
                    session_id=session_id
                )

    # 3️⃣ Final fallback
    return ChatResponse(
        response=(
            "I’m here to help with pharmacy inventory. You can ask about stock levels, "
            "specific medicines (e.g., 'Do we have Azithromycin?'), or alerts."
        ),
        session_id=session_id
    )


@router.get("/suggestions")
async def get_chat_suggestions():
    return {
        "suggestions": [
            "Do we have Azithromycin in stock?",
            "Which medicines are low on stock?",
            "Explain FEFO principle",
            "How can we reduce medicine wastage?",
            "Tell me a joke"
        ]
    }
