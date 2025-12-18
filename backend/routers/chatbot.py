"""
AI Chatbot router with Gemini integration (dynamic model selection)
Compatible with google-generativeai >= 0.8.5
"""

from dotenv import load_dotenv
load_dotenv()

import os
import uuid
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models import Medicine, Batch, Alert, AlertType
from schemas import ChatMessage, ChatResponse

router = APIRouter()

# =====================================================
# GEMINI INITIALIZATION
# =====================================================

try:
    import google.generativeai as genai

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    print("DEBUG | GEMINI_API_KEY loaded:", bool(GEMINI_API_KEY))

    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY missing")

    genai.configure(api_key=GEMINI_API_KEY)
    GEMINI_AVAILABLE = True

except Exception as e:
    print("❌ Gemini initialization failed:", e)
    GEMINI_AVAILABLE = False


def get_gemini_model():
    """
    Dynamically find a Gemini model that supports generateContent.
    This is REQUIRED for google-generativeai 0.8.x
    """
    models = genai.list_models()
    for m in models:
        if "generateContent" in m.supported_generation_methods:
            print("✅ Using Gemini model:", m.name)
            return genai.GenerativeModel(m.name)
    raise RuntimeError("No Gemini model supports generateContent")


# =====================================================
# CONTEXT BUILDER
# =====================================================

def get_inventory_context(db: Session) -> str:
    try:
        total_medicines = db.query(Medicine).filter(Medicine.is_active == True).count()
        
        # Get low stock items
        low_stock_alerts = db.query(Alert).filter(
            Alert.alert_type.in_([AlertType.LOW_STOCK, AlertType.STOCK_OUT]),
            Alert.is_acknowledged == False
        ).order_by(Alert.severity.desc()).limit(5).all()
        
        low_stock_list = []
        for alert in low_stock_alerts:
            # Extract medicine name from message or query DB if needed
            low_stock_list.append(alert.message)
            
        # Get expiring soon items
        today = __import__('datetime').datetime.now()
        expiring_batches = db.query(Batch).filter(
            Batch.is_expired == False,
            Batch.quantity > 0,
            Batch.expiry_date <= today + __import__('datetime').timedelta(days=90)
        ).order_by(Batch.expiry_date).limit(5).all()
        
        expiring_list = []
        for batch in expiring_batches:
            expiring_list.append(f"{batch.medicine.name} (Batch {batch.batch_number}, Expires {batch.expiry_date.date()})")

        active_batches = db.query(Batch).filter(
            Batch.is_expired == False,
            Batch.quantity > 0
        ).count()

        return f"""
You are an AI assistant for a pharmacy inventory management system.

Current snapshot:
- Total active medicines: {total_medicines}
- Active batches: {active_batches}

CRITICAL ALERTS (Mention these if relevant):
- Low Stock: {"; ".join(low_stock_list) if low_stock_list else "None"}
- Expiring Soon: {"; ".join(expiring_list) if expiring_list else "None"}

Answer clearly, professionally, and helpfully. If asking about stock, verify against the context.
"""
    except Exception as e:
        print(f"Context Error: {e}")
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
                        f"Nearest expiry: {nearest.expiry_date}.\n"
                        f"Dispense batch: {nearest.batch_number} (FEFO)."
                    )
                else:
                    return f"{medicine.name} is currently out of stock."

    if "low stock" in query_lower:
        alerts = db.query(Alert).filter(
            Alert.alert_type.in_([AlertType.LOW_STOCK, AlertType.STOCK_OUT]),
            Alert.is_acknowledged == False
        ).all()

        if alerts:
            items = ", ".join(a.message.split("(")[0] for a in alerts[:5])
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
    print("DEBUG | Gemini available:", GEMINI_AVAILABLE)

    # 1️⃣ Inventory logic first
    inventory_reply = handle_inventory_query(user_query, db)
    if inventory_reply:
        return ChatResponse(
            response=inventory_reply,
            session_id=session_id
        )

    # 2️⃣ Gemini for everything else
    if GEMINI_AVAILABLE:
        try:
            model = get_gemini_model()
            context = get_inventory_context(db)

            prompt = f"""{context}

User question:
{user_query}

Respond naturally and conversationally.
"""

            response = model.generate_content(prompt)
            text = response.text if hasattr(response, "text") else None

            if text:
                return ChatResponse(
                    response=text.strip(),
                    session_id=session_id
                )

            return ChatResponse(
                response="I didn’t quite get that. Could you rephrase?",
                session_id=session_id
            )

        except Exception as e:
            print("❌ GEMINI RUNTIME ERROR:", str(e))
            return ChatResponse(
                response=f"Gemini error: {str(e)}",
                session_id=session_id
            )

    # 3️⃣ Final fallback (Gemini unavailable)
    return ChatResponse(
        response=(
            "I’m here to help with pharmacy inventory, stock levels, expiries, "
            "reorder planning, and general questions. How can I assist you?"
        ),
        session_id=session_id
    )


@router.get("/suggestions")
async def get_chat_suggestions():
    return {
        "suggestions": [
            "Do we have Azithromycin 500 in stock?",
            "Which medicines are low on stock?",
            "Explain FEFO principle",
            "How can we reduce medicine wastage?",
            "Tell me a joke"
        ]
    }
