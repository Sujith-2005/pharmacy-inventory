"""
Medicine categorization using ML/NLP
"""
import re
from typing import Dict, Optional


# Common medicine categories and keywords
MEDICINE_CATEGORIES = {
    "Antibiotics": ["antibiotic", "amoxicillin", "penicillin", "cephalexin", "azithromycin", "ciprofloxacin"],
    "Pain Relief": ["paracetamol", "acetaminophen", "ibuprofen", "aspirin", "diclofenac", "naproxen"],
    "Cardiovascular": ["atenolol", "amlodipine", "lisinopril", "metoprolol", "ramipril", "blood pressure"],
    "Diabetes": ["metformin", "insulin", "glipizide", "diabetes", "blood sugar"],
    "Respiratory": ["salbutamol", "inhaler", "asthma", "cough", "expectorant"],
    "Gastrointestinal": ["omeprazole", "ranitidine", "antacid", "laxative", "stomach"],
    "Vitamins & Supplements": ["vitamin", "calcium", "iron", "multivitamin", "supplement"],
    "Dermatology": ["ointment", "cream", "skin", "dermatitis", "eczema"],
    "Eye Care": ["eye drops", "ophthalmic", "conjunctivitis"],
    "Ear Care": ["ear drops", "otic"],
    "Antiseptics": ["antiseptic", "disinfectant", "betadine", "dettol"],
    "First Aid": ["bandage", "gauze", "plaster", "first aid"],
    "General": []  # Default category
}


import google.generativeai as genai
from config import settings

# Configure Gemini
try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("models/gemini-2.0-flash-lite")
except:
    model = None

# Circuit breaker for API errors
FAILED_API_CALLS = 0
MAX_FAILED_CALLS = 1

def categorize_medicine_ai(name: str, description: Optional[str] = None) -> str:
    """Use Gemini to categorize medicine"""
    global FAILED_API_CALLS
    
    if not model or FAILED_API_CALLS >= MAX_FAILED_CALLS:
        return None
        
    try:
        prompt = f"""
        Categorize the following medicine into exactly one of these categories:
        {list(MEDICINE_CATEGORIES.keys())}
        
        Medicine: {name}
        Description: {description or 'N/A'}
        
        Return ONLY the category name.
        """
        response = model.generate_content(prompt)
        category = response.text.strip()
        
        # Verify it's a valid category
        if category in MEDICINE_CATEGORIES:
            return category
        
        # Fuzzy match or default
        for valid_cat in MEDICINE_CATEGORIES:
            if valid_cat in category:
                return valid_cat
                
        return None
    except Exception as e:
        error_str = str(e)
        print(f"AI Categorization failed: {error_str}")
        
        # Check for 403/PermissionDenied or Quota exceeded
        if "403" in error_str or "PermissionDenied" in error_str or "quota" in error_str.lower():
            print("CRITICAL: API Key blocked or quota exceeded. Disabling AI for this session.")
            FAILED_API_CALLS = MAX_FAILED_CALLS + 1
            
        return None

def categorize_medicine(name: str, description: Optional[str] = None) -> str:
    """
    Categorize medicine using AI, falling back to keyword matching
    """
    # Try AI first
    ai_category = categorize_medicine_ai(name, description)
    if ai_category:
        return ai_category

    # Fallback to legacy keyword matching
    if not name:
        return "General"
    
    # Combine name and description for analysis
    text = name.lower()
    if description:
        text += " " + description.lower()
    
    # Score each category
    category_scores = {}
    for category, keywords in MEDICINE_CATEGORIES.items():
        if category == "General":
            continue
        score = 0
        for keyword in keywords:
            if keyword.lower() in text:
                score += 1
        if score > 0:
            category_scores[category] = score
    
    # Return category with highest score, or General if no match
    if category_scores:
        return max(category_scores.items(), key=lambda x: x[1])[0]
    
    return "General"

