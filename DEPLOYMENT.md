# 🚀 Deployment Guide

Complete deployment guide for Smart Pharmacy Inventory Management System.

## 📋 Pre-Deployment Checklist

- [ ] Update `SECRET_KEY` in `.env` with a strong random string
- [ ] Set `DEBUG=False` in production
- [ ] Configure production database (PostgreSQL recommended)
- [ ] Update `CORS_ORIGINS` with your frontend domain
- [ ] Test all features locally
- [ ] Build frontend for production (`npm run build`)

## 🌐 Frontend Deployment (Vercel)

### Step 1: Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository

### Step 2: Configure Project Settings
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework Preset**: `Vite`
- **Install Command**: `npm install`

### Step 3: Environment Variables
Add in Vercel Dashboard → Settings → Environment Variables:
- `VITE_API_URL` = `https://your-backend-url.com`

### Step 4: Deploy
Click "Deploy" and wait for build to complete.

## 🔧 Backend Deployment Options

### Option 1: Railway (Recommended)

1. **Create Account**: [railway.app](https://railway.app)
2. **New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Configure**:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**: Add all variables from `.env.example`
5. **Database**: Add PostgreSQL service and update `DATABASE_URL`

### Option 2: Render

1. **Create Account**: [render.com](https://render.com)
2. **New Web Service**: Connect your GitHub repository
3. **Settings**:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment**: Add variables from `.env.example`
5. **Database**: Create PostgreSQL database and update `DATABASE_URL`

### Option 3: Heroku

1. **Install Heroku CLI**: [heroku.com](https://devcenter.heroku.com/articles/heroku-cli)
2. **Login**: `heroku login`
3. **Create App**: `heroku create your-app-name`
4. **Add PostgreSQL**: `heroku addons:create heroku-postgresql:hobby-dev`
5. **Set Config Vars**: `heroku config:set SECRET_KEY=your-secret-key`
6. **Deploy**: `git push heroku main`

Create `backend/Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

## 🔒 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-super-secret-key-here
DEBUG=False
CORS_ORIGINS=https://your-frontend-domain.com
HOST=0.0.0.0
PORT=8000
```

### Frontend (Vercel Environment Variables)
```env
VITE_API_URL=https://your-backend-api.com
```

## 📊 Database Migration

After deploying, initialize the database:

```bash
# SSH into your server or use Railway/Render shell
cd backend
python init_db.py
```

## 🔒 Security Checklist

- [ ] Use strong `SECRET_KEY` (generate with: `openssl rand -hex 32`)
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Set `DEBUG=False` in production
- [ ] Use PostgreSQL instead of SQLite
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable database backups
- [ ] Use environment variables for secrets
- [ ] Regular security updates

## 🧪 Post-Deployment Testing

1. **Health Check**: `curl https://your-api.com/api/health`
2. **API Docs**: Visit `https://your-api.com/docs`
3. **Login Test**: Test authentication endpoint
4. **Frontend**: Verify frontend connects to backend
5. **Database**: Check database connection and data

## 📞 Troubleshooting

### Backend won't start
- Check environment variables
- Verify database connection
- Check logs: `heroku logs --tail` or platform logs

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check CORS configuration
- Verify backend is running

### Database errors
- Check `DATABASE_URL` format
- Verify database is accessible
- Run `init_db.py` to create tables

## 🎉 Success!

Your application should now be live! Share your deployed URLs:
- Backend API: `https://your-api.com`
- Frontend: `https://your-frontend.com`
