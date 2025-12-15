# 🔐 Login Troubleshooting Guide

## Common Login Issues and Solutions

### Issue 1: "Login failed" Error

#### ✅ **FIXED**: Field Name Mismatch
- **Problem**: Frontend was sending `email` field, but backend expects `username` (OAuth2PasswordRequestForm standard)
- **Solution**: Updated `frontend/src/api/auth.ts` to send `username` instead of `email`

#### Other Common Causes:

### 1. Backend Not Running
**Symptoms**: Network error, connection refused, CORS error

**Solution**:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python init_db.py
uvicorn main:app --reload
```

**Check**: Backend should be running at `http://localhost:8000`
- Test: Visit `http://localhost:8000/docs` - should show API documentation

### 2. Database Not Initialized
**Symptoms**: "User not found" or authentication errors

**Solution**:
```bash
cd backend
python init_db.py
```

This creates:
- Database tables
- Default admin user: `admin@pharmacy.com` / `admin123`
- Default manager user: `manager@pharmacy.com` / `manager123`

### 3. Wrong API URL
**Symptoms**: Network error, 404 on login endpoint

**Check**:
- Open browser DevTools (F12) → Network tab
- Try to login and check the request URL
- Should be: `http://localhost:8000/api/auth/login` (for local)
- Or: `https://your-backend-url.com/api/auth/login` (for production)

**Fix**:
- Local: Make sure `VITE_API_URL` is not set, or set to `http://localhost:8000`
- Production: Set `VITE_API_URL` environment variable in Vercel to your backend URL

### 4. CORS Issues
**Symptoms**: CORS error in browser console

**Check** `backend/config.py`:
```python
CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
```

**For Production**: Add your frontend URL to CORS_ORIGINS in backend `.env`:
```
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-frontend.vercel.app
```

### 5. Wrong Credentials
**Default Credentials**:
- **Admin**: 
  - Email: `admin@pharmacy.com`
  - Password: `admin123`
- **Manager**:
  - Email: `manager@pharmacy.com`
  - Password: `manager123`

**Note**: Make sure you're using the exact email (case-sensitive)

### 6. Backend Environment Variables
**Check** `backend/.env` file exists and has:
```
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./pharmacy_inventory.db
```

### 7. Network/Proxy Issues
**For Vercel Deployment**:
- Make sure `VITE_API_URL` environment variable is set in Vercel
- Check that your backend is deployed and accessible
- Verify CORS settings allow your Vercel domain

## 🔍 Debugging Steps

### Step 1: Check Backend is Running
```bash
# Test backend health
curl http://localhost:8000/api/health
# Should return: {"status":"healthy"}
```

### Step 2: Check Login Endpoint
```bash
# Test login endpoint (should return 422 for missing data, not 404)
curl -X POST http://localhost:8000/api/auth/login
# Should return validation error, not 404
```

### Step 3: Check Browser Console
- Open DevTools (F12)
- Go to Console tab
- Look for errors
- Go to Network tab
- Try login and check:
  - Request URL
  - Request payload
  - Response status
  - Response body

### Step 4: Check Backend Logs
- Look at terminal where backend is running
- Check for error messages
- Check for database connection errors

## ✅ Quick Fix Checklist

- [ ] Backend is running on port 8000
- [ ] Database initialized (`python init_db.py`)
- [ ] Using correct credentials:
  - Email: `admin@pharmacy.com`
  - Password: `admin123`
- [ ] Frontend API URL is correct
- [ ] CORS is configured correctly
- [ ] No errors in browser console
- [ ] No errors in backend logs

## 🚀 For Production (Vercel)

1. **Set Environment Variable in Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com`

2. **Update Backend CORS**:
   - Add your Vercel frontend URL to `CORS_ORIGINS` in backend `.env`

3. **Redeploy Frontend**:
   - After setting environment variable, redeploy

## 📝 Test Login Manually

You can test the login endpoint directly:

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@pharmacy.com&password=admin123"
```

Should return:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

If this works but frontend doesn't, the issue is in the frontend configuration.

---

**Most Common Fix**: Make sure backend is running and database is initialized!




