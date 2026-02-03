
import json
import pandas as pd

def check_quantities():
    print("--- Checking File Quantities ---")
    
    # Purchases
    try:
        with open('purchases.json', 'r') as f:
            p_data = json.load(f)
        df_p = pd.DataFrame(p_data)
        
        allegra_p = df_p[df_p['Drug_Name'].str.contains('Allegra-120', case=False, na=False)]
        print(f"\nPurchases 'Allegra-120':")
        print(f"Total Entries: {len(allegra_p)}")
        print(f"Total Qty: {allegra_p['Qty_Received'].sum() if not allegra_p.empty else 0}")
        if not allegra_p.empty:
             print(f"Sample Expiry: {allegra_p['Expiry_Date'].iloc[0]}")
    except Exception as e:
        print(f"Error reading purchases: {e}")

    # Sales
    try:
        with open('sales.json', 'r') as f:
            s_data = json.load(f)
        df_s = pd.DataFrame(s_data)
        
        allegra_s = df_s[df_s['Drug_Name'].str.contains('Allegra-120', case=False, na=False)]
        print(f"\nSales 'Allegra-120':")
        print(f"Total Entries: {len(allegra_s)}")
        print(f"Total Qty Sold: {allegra_s['Qty_Sold'].sum() if not allegra_s.empty else 0}")
    except Exception as e:
        print(f"Error reading sales: {e}")
        
if __name__ == "__main__":
    check_quantities()
