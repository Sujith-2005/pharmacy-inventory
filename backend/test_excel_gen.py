
import pandas as pd
from io import BytesIO

def test_excel():
    print("Testing Excel Generation...")
    try:
        df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False)
        print("Excel Generation Successful!")
    except Exception as e:
        print(f"Excel Generation FAILED: {e}")

if __name__ == "__main__":
    test_excel()
