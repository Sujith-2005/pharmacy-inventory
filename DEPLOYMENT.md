# 🚀 Deployment Guide

This guide will help you deploy the Smart Pharmacy Inventory Management System to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] Update `SECRET_KEY` in `.env` with a strong random string
- [ ] Set `DEBUG=False` in production
- [ ] Configure production database (PostgreSQL recommended)
- [ ] Update `CORS_ORIGINS` with your frontend domain
- [ ] Test all features locally
- [ ] Build frontend for production (`npm run build`)

## 🌐 Backend Deployment Options

### Option 1: Railway

1. **Create Account**: Sign up at [railway.app](https://railway.app)
2. **New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Configure**:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**: Add all variables from `.env.example`
5. **Database**: Add PostgreSQL service and update `DATABASE_URL`

### Option 2: Render

1. **Create Account**: Sign up at [render.com](https://render.com)
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

Create `Procfile` in backend:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Option 4: AWS EC2

1. **Launch EC2 Instance**: Ubuntu 22.04 LTS
2. **SSH into instance**: `ssh -i key.pem ubuntu@your-ip`
3. **Install dependencies**:
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv nginx
   ```
4. **Clone repository**: `git clone <your-repo-url>`
5. **Setup backend**:
   ```bash
   cd pharmacy-inventory/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
6. **Setup systemd service**: Create `/etc/systemd/system/pharmacy-api.service`
7. **Configure Nginx**: Reverse proxy to `localhost:8000`

### Option 5: Docker

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t pharmacy-backend ./backend
docker run -p 8000:8000 --env-file backend/.env pharmacy-backend
```

## 🎨 Frontend Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Deploy**: `cd frontend && vercel`
3. **Configure**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables**: Add `VITE_API_URL` pointing to your backend

### Option 2: Netlify

1. **Connect Repository**: [netlify.com](https://netlify.com)
2. **Build Settings**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. **Environment Variables**: Add `VITE_API_URL`

### Option 3: GitHub Pages

1. **Install gh-pages**: `npm install --save-dev gh-pages`
2. **Update package.json**:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. **Deploy**: `npm run deploy`

### Option 4: AWS S3 + CloudFront

1. **Build frontend**: `cd frontend && npm run build`
2. **Create S3 bucket**: Enable static website hosting
3. **Upload dist folder**: `aws s3 sync dist/ s3://your-bucket-name`
4. **Create CloudFront distribution**: Point to S3 bucket
5. **Configure CORS**: Update backend CORS_ORIGINS

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-super-secret-key-here
DEBUG=False
CORS_ORIGINS=https://your-frontend-domain.com
HOST=0.0.0.0
PORT=8000
```

### Frontend (.env.production)
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

