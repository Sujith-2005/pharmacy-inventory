
import sys
import os
from datetime import datetime, timedelta
import pandas as pd

# Setup path
# Setup path
# Ensure we are running from backend directory context so database.py finds the correct ./pharmacy.db
backend_dir = os.path.join(os.getcwd(), 'backend')
if os.path.isdir(backend_dir):
    os.chdir(backend_dir)
sys.path.append(os.getcwd())

from database import SessionLocal
from models import Medicine, Batch, InventoryTransaction, TransactionType, Alert
from ml_models.forecasting import calculate_demand_forecast

def generate_report():
    print("Generating Analysis Report...")
    db = SessionLocal()
    report_lines = []
    
    try:
        # Header
        report_lines.append("# Pharmacy Inventory Analysis Report")
        report_lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        report_lines.append("")
        
        # 1. Inventory Summary
        report_lines.append("## 1. Inventory Summary")
        
        total_meds = db.query(Medicine).count()
        total_batches = db.query(Batch).filter(Batch.quantity > 0).count()
        total_value = 0
        batches = db.query(Batch).filter(Batch.quantity > 0).all()
        for b in batches:
            price = b.purchase_price if b.purchase_price else (b.medicine.cost if b.medicine.cost else 0)
            total_value += b.quantity * price
            
        report_lines.append(f"- **Total Medicines (SKUs):** {total_meds}")
        report_lines.append(f"- **Active Batches:** {total_batches}")
        report_lines.append(f"- **Total Inventory Value (Cost):** ₹{total_value:,.2f}")
        report_lines.append("")
        
        # 2. Sales Performance
        report_lines.append("## 2. Sales Performance (All Time)")
        
        sales_txns = db.query(InventoryTransaction).filter(
            InventoryTransaction.transaction_type == TransactionType.OUT
        ).all()
        
        total_sales_count = len(sales_txns)
        total_revenue = sum(t.quantity * (t.medicine.mrp if t.medicine and t.medicine.mrp else 0) for t in sales_txns)
        # Or use unit_price from transaction if recorded
        # For better accuracy let's check unit_price
        total_revenue_precise = sum(t.quantity * (t.unit_price if t.unit_price else (t.medicine.mrp if t.medicine and t.medicine.mrp else 0)) for t in sales_txns)

        report_lines.append(f"- **Total Sales Transactions:** {total_sales_count}")
        report_lines.append(f"- **Total Revenue Generated:** ₹{total_revenue_precise:,.2f}")
        report_lines.append("")
        
        # Top Selling Items
        report_lines.append("### Top 5 Selling Medicines")
        report_lines.append("| Medicine | Qty Sold | Revenue |")
        report_lines.append("|---|---|---|")
        
        sales_data = {}
        for t in sales_txns:
            med_name = t.medicine.name if t.medicine else "Unknown"
            qty = t.quantity
            rev = qty * (t.unit_price if t.unit_price else (t.medicine.mrp if t.medicine and t.medicine.mrp else 0))
            
            if med_name not in sales_data:
                sales_data[med_name] = {'qty': 0, 'rev': 0}
            sales_data[med_name]['qty'] += qty
            sales_data[med_name]['rev'] += rev
            
        sorted_sales = sorted(sales_data.items(), key=lambda x: x[1]['qty'], reverse=True)[:5]
        
        for name, stats in sorted_sales:
            report_lines.append(f"| {name} | {stats['qty']} | ₹{stats['rev']:,.2f} |")
        report_lines.append("")
        
        # 3. Risk Analysis
        report_lines.append("## 3. Risk Analysis")
        
        # Expired
        expired_count = db.query(Batch).filter(Batch.is_expired == True).count()
        
        # Expiring Soon (90 days)
        cutoff = datetime.now() + timedelta(days=90)
        expiring_soon = db.query(Batch).filter(
            Batch.is_expired == False,
            Batch.expiry_date <= cutoff
        ).count()
        
        # Low Stock (arbitrary < 50 units total)
        low_stock_count = 0 
        meds = db.query(Medicine).all()
        for m in meds:
            stock = sum(b.quantity for b in m.batches if not b.is_expired)
            if stock < 50:
                low_stock_count += 1
                
        report_lines.append(f"- **Expired Batches (Current):** {expired_count}")
        report_lines.append(f"- **Expiring Soon (Next 90 Days):** {expiring_soon}")
        report_lines.append(f"- **Low Stock SKUs (< 50 units):** {low_stock_count}")
        report_lines.append("")
        
        # 4. AI Forecasts (Top 3)
        report_lines.append("## 4. AI Demand Forecasts (Top 3 Sellers)")
        
        for name, _ in sorted_sales[:3]:
            # Find ID
            med = db.query(Medicine).filter(Medicine.name == name).first()
            if med:
                forecast = calculate_demand_forecast(db, med.id)
                report_lines.append(f"### {name}")
                report_lines.append(f"- **Projected Demand (30 Days):** {forecast['forecasted_demand']:.1f} units")
                report_lines.append(f"- **Recommended Restock:** {forecast['recommended_quantity']} units")
                report_lines.append(f"- **Confidence:** {forecast['confidence_score']*100:.0f}%")
                report_lines.append(f"- *Reasoning:* {forecast['reasoning']}")
                report_lines.append("")
        
        # Write to file
        with open("analysis_report.md", "w", encoding="utf-8") as f:
            f.write("\n".join(report_lines))
            
        print("Report generated: analysis_report.md")
        
    except Exception as e:
        print(f"Error generating report: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    generate_report()
