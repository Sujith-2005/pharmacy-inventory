# Fix: Data Disappearing After 2 Seconds

## Problem
After uploading inventory data, it appears for 2 seconds then disappears from the UI.

## Root Cause
1. **Race Condition**: Frontend was refetching data immediately after upload, before backend fully committed
2. **Query Caching**: React Query was using cached/stale data
3. **Timing Issue**: Modal was closing before data was fully loaded

## Fixes Applied

### 1. **Frontend Query Configuration**
- Changed `staleTime` from 0 to 1000ms (1 second) - prevents excessive refetching
- Changed `cacheTime` to `gcTime: 5 * 60 * 1000` (5 minutes) - React Query v5 uses gcTime
- Added `refetchOnWindowFocus: true` - refetch when window regains focus
- Added `refetchOnMount: true` - always refetch on mount
- This ensures queries fetch fresh data but don't refetch too aggressively

### 2. **Improved Refetch Timing**
- Increased delay from 500ms to 1000ms to ensure backend commit is complete
- Added proper async/await to wait for refetch completion
- Added error handling for refetch operations
- Added console logging to track data loading
- Added `exact: false` to refetch queries to catch all related queries

### 3. **Backend Query Debugging**
- Added detailed logging to `get_medicines` endpoint
- Added detailed logging to `get_stock_levels` endpoint
- Shows total medicines in DB vs returned count
- Shows batch details for debugging
- Warns if medicines exist but no stock levels returned

### 4. **Proper Query Invalidation**
- Invalidates queries first, then refetches
- Waits for all refetches to complete before closing modal
- Ensures data is loaded before UI updates
- Logs data counts for debugging

## What Changed

### Frontend (`FileUpload.jsx`)
```javascript
// Before: Immediate refetch, no waiting
queryClient.invalidateQueries(...)
queryClient.refetchQueries(...)

// After: Wait for commit, then refetch and wait for completion
setTimeout(async () => {
  await queryClient.invalidateQueries(...)
  await Promise.all([
    queryClient.refetchQueries({ queryKey: ['medicines'], exact: false }),
    queryClient.refetchQueries({ queryKey: ['stock-levels'], exact: false })
  ])
  // Log results
  onSuccess() // Close modal only after data is loaded
}, 1000)
```

### Frontend (`Inventory.jsx`)
```javascript
// Updated cache control
staleTime: 1000,  // Consider stale after 1 second
gcTime: 5 * 60 * 1000,  // Keep in cache for 5 minutes
refetchOnWindowFocus: true,
refetchOnMount: true,
```

### Backend (`inventory.py`)
- Added debug logging to track data flow
- Shows total vs returned counts
- Logs batch details for debugging
- Warns if data exists but isn't returned

## Testing

1. **Upload a file** - Watch browser console for DEBUG messages
2. **Check backend logs** - Should show medicines and batches being processed
3. **Data should persist** - Should remain visible after upload completes
4. **Check browser console** - Should show "✅ Data successfully loaded"

## If Data Still Disappears

1. **Check browser console** - Look for warnings about no medicines returned
2. **Check backend logs** - Look for WARNING messages about batches being expired
3. **Check expiry dates** - Make sure they're in the future
4. **Check debug endpoint** - `/api/debug/inventory-state` to see what's in DB

## Key Points

- Data is now properly cached for 5 minutes
- Queries refetch on mount and window focus
- Backend logs show exactly what's being returned
- Frontend logs show data counts after refetch
- Modal only closes after data is confirmed loaded
