
import os
import re

def fix_json_file(filename):
    if not os.path.exists(filename):
        print(f"{filename} not found")
        return
        
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            
        # Check if it's already an array
        if content.startswith('['):
            print(f"{filename} appears to be correct.")
            return

        print(f"Fixing {filename}...")
        # Use regex or simple wrapping. 
        # The user paste usually results in `{obj},{obj}`
        # We need `[{obj},{obj}]`
        new_content = f"[{content}]"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filename}")
    except Exception as e:
        print(f"Error fixing {filename}: {e}")

def update_forecasting():
    path = "backend/ml_models/forecasting.py"
    if not os.path.exists(path):
        print(f"{path} not found")
        return

    print(f"Updating {path}...")
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace days=whatever with days=1500
    # Pattern: days=\d+
    new_content = re.sub(r'days=\d+', 'days=1500', content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Forecasting window updated to 1500 days.")

def reset_db():
    db_path = "backend/pharmacy.db"
    if os.path.exists(db_path):
        os.remove(db_path)
        print("Existing pharmacy.db deleted.")
    else:
        print("No existing pharmacy.db found.")

if __name__ == "__main__":
    fix_json_file("purchases.json")
    fix_json_file("sales.json")
    update_forecasting()
    reset_db()
