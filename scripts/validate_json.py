
import json
import sys

def validate(filename):
    print(f"Validating {filename}...")
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"SUCCESS: {filename} is valid JSON. Contains {len(data)} items.")
    except json.JSONDecodeError as e:
        print(f"ERROR: {filename} is INVALID.")
        print(f"Message: {e.msg}")
        print(f"Line: {e.lineno}")
        print(f"Column: {e.colno}")
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")

if __name__ == "__main__":
    import sys
    files = sys.argv[1:] if len(sys.argv) > 1 else ["sales.json"]
    for f in files:
        validate(f)
