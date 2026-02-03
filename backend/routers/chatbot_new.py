import google.generativeai as genai
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from database import get_db
from models import Medicine, Batch
from config import settings

router = APIRouter()

# EMERGENCY FIX: Hardcode the known working key to bypass config caching issues
# This key was validated by test_key_iso.py
final_key = "AIzaSyDlZTrdIjjtRykAgC8_7Nwo_zalM4fLlgU"

print(f"DEBUG: Loading Gemini Key (HARDCODED): {final_key[:10]}...{final_key[-5:]}")
genai.configure(api_key=final_key)

# Use a model optimized for chat
model_name = "models/gemini-2.0-flash"
print(f"DEBUG: Using Model: {model_name}")
model = genai.GenerativeModel(model_name)

class ChatRequest(BaseModel):
    message: str
    session_id: str = None

def get_inventory_context(db: Session) -> str:
    """Summarize inventory state for the AI"""
    try:
        total_meds = db.query(Medicine).filter(Medicine.is_active == True).count()
        
        # Low stock
        low_stock = db.query(Medicine).join(Batch).filter(
            Medicine.is_active == True,
            Batch.quantity > 0,
            Batch.is_expired == False
        ).group_by(Medicine.id).having(func.sum(Batch.quantity) < 20).count()
        
        # Expired batches
        expired = db.query(Batch).filter(Batch.is_expired == True).count()
        
        # Total Value
        total_value = 0 # Simplified to avoid complex query for now/speed
        
        return (
            f"Current Inventory Status:\n"
            f"- Total Medicines: {total_meds}\n"
            f"- Low Stock Items: {low_stock}\n"
            f"- Expired Batches: {expired}\n"
            f"Today is {datetime.now().strftime('%Y-%m-%d')}."
        )
    except Exception as e:
        return f"Error fetching inventory context: {str(e)}"

@router.post("/chat")
async def chat(req: ChatRequest, db: Session = Depends(get_db)):
    with open("debug.log", "a") as f:
        f.write(f"\n[{datetime.now()}] Endpoint hit: {req.message}\n")
        # Log the key being used
        masked_key = f"{final_key[:10]}...{final_key[-5:]}" if final_key else "None"
        f.write(f"[{datetime.now()}] USING KEY: {masked_key}\n")
    
    try:
        # Get real-time context
        context = get_inventory_context(db)
        with open("debug.log", "a") as f:
            f.write(f"[{datetime.now()}] Context retrieved (len): {len(context)}\n")
        
        # Construct the prompt
        prompt = (
            f"System: You are an expert Pharmacy Inventory Assistant. "
            f"Here is the real-time data from the database: {context}\n"
            f"Instructions: Answer the user's question professionally. "
            f"If they ask about stock, use the provided data. "
            f"If they ask for general advice, provide it based on pharmacy best practices.\n"
            f"User: {req.message}"
        )
        
        with open("debug.log", "a") as f:
            f.write(f"[{datetime.now()}] Sending to Gemini...\n")
            
        response = model.generate_content(prompt)
        
        with open("debug.log", "a") as f:
            f.write(f"[{datetime.now()}] Gemini Response: {response.text[:50]}...\n")
            
        return {"response": response.text, "session_id": "session-123"}
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        with open("debug.log", "a") as f:
            f.write(f"[{datetime.now()}] ERROR: {str(e)}\n{tb}\n")
        
        # Check for Quota Error (429) details
        if "429" in str(e) or "quota" in str(e).lower():
             return {
                "response": "My brain power is momentarily exhausted (Quota Limit). Please try again in a minute!",
                "session_id": "error"
             }

        print(f"Chatbot Error: {e}", flush=True)
        return {
            "response": f"Error: {str(e)}",
            "session_id": "error"
        }
