# 🚀 Quick Start Guide

## For Local Development

### 1. Install Everything
```powershell
.\install-all.ps1
```

### 2. Initialize Database
```powershell
cd backend
.\venv\Scripts\activate
python init_db.py
```

### 3. Start Backend
```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload
```

### 4. Start Frontend (New Terminal)
```powershell
cd frontend
npm run dev
```

### 5. Login
- URL: http://localhost:3000
- Email: `admin@pharmacy.com`
- Password: `admin123`

## For Deployment

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Vercel auto-detects settings from `vercel.json`
3. Add env var: `VITE_API_URL` = your backend URL
4. Deploy!

### Backend (Railway/Render)
1. Deploy backend
2. Set env vars from `backend/.env.example`
3. Run: `python init_db.py`
4. Done!

---

**That's it! Your project is ready to deploy!** ✅



