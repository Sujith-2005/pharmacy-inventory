# Debugging Inventory Upload Issues

## Issue: Data Shows as 0 After Upload

If inventory data is uploaded successfully but shows as 0 everywhere, follow these steps:

### Step 1: Check Backend Logs

After uploading, check the backend console for DEBUG messages:
- `DEBUG: About to commit. Success count: X`
- `DEBUG: Commit successful`
- `DEBUG: After commit - Medicines: X, Active batches: Y`
- `DEBUG: Creating new batch...` or `DEBUG: Updating existing batch...`

### Step 2: Check Upload Response

Look at the upload response in the browser console (F12 → Network tab):
- Check `verification.total_medicines` - should be > 0
- Check `verification.active_batches` - should be > 0
- Check `verification.all_batches` - shows total batches
- Check `verification.expired_batches` - if this equals all batches, they're all expired

### Step 3: Use Debug Endpoint

Access: `http://localhost:8000/api/debug/inventory-state`

This shows:
- Total medicines and batches in database
- Active vs expired batches
- Sample medicines with their batches
- Recent batches with details

**No authentication required** - you can access it directly in browser.

### Step 4: Check Expiry Dates

**Most Common Issue**: If all batches are marked as expired, they won't show in stock levels.

Check in debug endpoint:
- Look at `recent_batches` - check `is_expired` and `expiry_passed` fields
- If `expiry_passed: true`, the expiry date is in the past

**Solution**: Make sure your Excel/CSV has **future expiry dates** (dates after today).

### Step 5: Check Database Directly

If using SQLite, check the database file:
```cmd
cd backend
python -c "from database import SessionLocal; from models import Medicine, Batch; db = SessionLocal(); print(f'Medicines: {db.query(Medicine).count()}'); print(f'Batches: {db.query(Batch).count()}'); print(f'Active batches: {db.query(Batch).filter(Batch.quantity > 0, Batch.is_expired == False).count()}')"
```

### Step 6: Common Issues & Fixes

1. **All batches expired**
   - **Symptom**: `active_batches = 0` but `total_batches > 0`
   - **Fix**: Update expiry dates in your file to future dates

2. **Zero quantities**
   - **Symptom**: Batches exist but `quantity = 0`
   - **Fix**: Check Quantity column in your file has values > 0

3. **Data not committing**
   - **Symptom**: DEBUG shows success but verification shows 0
   - **Fix**: Check backend logs for commit errors

4. **Frontend not refreshing**
   - **Symptom**: Backend has data but frontend shows 0
   - **Fix**: Hard refresh browser (Ctrl+F5) or check browser console for errors

### Step 7: Test with Small File

Upload a test file with 2-3 rows:
- SKU: TEST001
- Medicine Name: Test Medicine
- Batch No: BATCH001
- Quantity: 100
- Expiry Date: 2025-12-31 (future date)
- MRP: 10.00
- Cost: 8.00

Then check:
1. Debug endpoint shows the medicine
2. Inventory page shows the medicine
3. Stock levels shows quantity > 0

## Quick Fixes

### If All Data Shows as 0:

1. **Check expiry dates** - Most common issue
2. **Restart backend server** - Sometimes fixes session issues
3. **Clear browser cache** - Hard refresh (Ctrl+F5)
4. **Check backend logs** - Look for errors or warnings
5. **Use debug endpoint** - See what's actually in database

### If Upload Succeeds But Data Disappears:

1. Check if batches are being marked as expired incorrectly
2. Check if quantities are being set to 0
3. Check backend logs for any errors after commit
4. Verify database file exists and has data

## Getting Help

If issue persists, provide:
1. Backend console output (especially DEBUG messages)
2. Upload response JSON (from browser Network tab)
3. Debug endpoint response (`/api/debug/inventory-state`)
4. Sample of your Excel/CSV file (first few rows)
