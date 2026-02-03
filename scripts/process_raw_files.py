
import json
import os
import pandas as pd
from datetime import datetime

class DataProcessor:
    def __init__(self):
        self.sales_file = "sales.json"
        self.purchases_file = "purchases.json"
        self.report_file = "raw_data_analysis.md"
        self.sales_schema = ["Transaction_ID", "Date", "Drug_Name", "Qty_Sold", "MRP_Unit_Price", "Total_Amount"]
        self.purchases_schema = ["Purchase_ID", "Date_Received", "Drug_Name", "Supplier_Name", "Qty_Received", "Total_Purchase_Cost"]

    def clean_and_analyze(self, filename, schema, name):
        print(f"Processing {name} ({filename})...")
        if not os.path.exists(filename):
            print(f"File {filename} not found.")
            return None

        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"CRITICAL JSON ERROR in {filename}: {e}")
            return None

        valid_data = []
        errors = []
        
        for idx, item in enumerate(data):
            # Check required keys
            missing = [key for key in schema if key not in item]
            if missing:
                errors.append(f"Row {idx+1}: Missing keys {missing}")
                continue
            
            # Check critical value types (basic check)
            try:
                if 'Qty_Sold' in item:
                    float(item['Qty_Sold'])
                if 'Total_Amount' in item:
                    float(item['Total_Amount'])
                if 'Qty_Received' in item:
                    float(item['Qty_Received'])
                if 'Total_Purchase_Cost' in item:
                    float(item['Total_Purchase_Cost'])
                
                # Check for Zero Prices
                if 'MRP_Unit_Price' in item and float(item['MRP_Unit_Price']) == 0:
                     errors.append(f"Row {idx+1}: MRP is 0")
                     continue
                if 'Unit_Cost_Price' in item and float(item['Unit_Cost_Price']) == 0:
                     errors.append(f"Row {idx+1}: Unit Cost Price is 0")
                     continue
                     
            except ValueError:
                errors.append(f"Row {idx+1}: Invalid number format")
                continue

            valid_data.append(item)

        # Fix file if errors found
        if len(errors) > 0:
            print(f"Found {len(errors)} invalid records in {filename}. Removing them...")
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(valid_data, f, indent=4)
            print(f"Fixed {filename}. Valid count: {len(valid_data)}")
        else:
            print(f"{filename} is clean. Count: {len(valid_data)}")

        # Analysis
        df = pd.DataFrame(valid_data)
        stats = {
            "count": len(df),
            "errors_fixed": len(errors),
            "unique_drugs": df['Drug_Name'].nunique() if 'Drug_Name' in df else 0,
            "total_value": 0,
            "date_range": "N/A"
        }

        if 'Total_Amount' in df:
            stats['total_value'] = df['Total_Amount'].sum()
        elif 'Total_Purchase_Cost' in df:
            stats['total_value'] = df['Total_Purchase_Cost'].sum()

        date_col = 'Date' if 'Date' in df else ('Date_Received' if 'Date_Received' in df else None)
        if date_col:
            dates = pd.to_datetime(df[date_col], errors='coerce').dropna()
            if not dates.empty:
                stats['date_range'] = f"{dates.min().date()} to {dates.max().date()}"

        return stats

    def generate_report(self, sales_stats, purchase_stats):
        lines = []
        lines.append("# Raw Data Analysis Report")
        lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        lines.append("")
        
        lines.append("## 1. Purchases Data (`purchases.json`)")
        if purchase_stats:
            lines.append(f"- **Total Records:** {purchase_stats['count']}")
            lines.append(f"- **Invalid Records Removed:** {purchase_stats['errors_fixed']}")
            lines.append(f"- **Unique Medicines:** {purchase_stats['unique_drugs']}")
            lines.append(f"- **Total Spend:** ₹{purchase_stats['total_value']:,.2f}")
            lines.append(f"- **Date Range:** {purchase_stats['date_range']}")
        else:
            lines.append("- Failed to analyze.")
        lines.append("")

        lines.append("## 2. Sales Data (`sales.json`)")
        if sales_stats:
            lines.append(f"- **Total Records:** {sales_stats['count']}")
            lines.append(f"- **Invalid Records Removed:** {sales_stats['errors_fixed']}")
            lines.append(f"- **Unique Medicines:** {sales_stats['unique_drugs']}")
            lines.append(f"- **Total Revenue:** ₹{sales_stats['total_value']:,.2f}")
            lines.append(f"- **Date Range:** {sales_stats['date_range']}")
        else:
            lines.append("- Failed to analyze.")
        
        with open(self.report_file, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        print(f"Report generated: {self.report_file}")

if __name__ == "__main__":
    processor = DataProcessor()
    p_stats = processor.clean_and_analyze("purchases.json", processor.purchases_schema, "Purchases")
    s_stats = processor.clean_and_analyze("sales.json", processor.sales_schema, "Sales")
    processor.generate_report(s_stats, p_stats)
