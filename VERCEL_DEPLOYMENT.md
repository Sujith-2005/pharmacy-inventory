# 🚀 Vercel Deployment Guide

## Fixing the 404 NOT_FOUND Error

If you're getting a `404: NOT_FOUND` error on Vercel, follow these steps:

## ✅ Solution 1: Configure Vercel Project Settings

### In Vercel Dashboard:

1. **Go to your project settings** in Vercel dashboard
2. **Navigate to "Settings" → "General"**
3. **Configure Build & Development Settings:**
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Framework Preset**: `Vite`

4. **Add Environment Variables** (if needed):
   - Go to "Settings" → "Environment Variables"
   - Add `VITE_API_URL` with your backend API URL

## ✅ Solution 2: Use vercel.json Configuration

I've created `vercel.json` files for you. Make sure:

1. **Root `vercel.json`** exists (for monorepo setup)
2. **`frontend/vercel.json`** exists (for frontend-specific config)

## 🔧 Step-by-Step Fix

### Option A: Deploy from Frontend Directory

1. In Vercel dashboard, go to your project
2. Go to **Settings** → **General**
3. Set **Root Directory** to: `frontend`
4. Set **Build Command** to: `npm run build`
5. Set **Output Directory** to: `dist`
6. **Redeploy** your project

### Option B: Deploy from Root with Configuration

1. Make sure `vercel.json` is in the root directory
2. In Vercel dashboard:
   - **Root Directory**: Leave empty or set to root
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
3. **Redeploy** your project

## 📝 Important Notes

### React Router Configuration

Since you're using React Router, Vercel needs to serve `index.html` for all routes. The `vercel.json` files I created include the necessary rewrite rules:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures that all routes (like `/inventory`, `/dashboard`, etc.) are handled by React Router instead of returning 404.

### Backend API Configuration

Your frontend needs to know where your backend API is. Make sure:

1. **Set Environment Variable** in Vercel:
   - Variable: `VITE_API_URL`
   - Value: Your backend API URL (e.g., `https://your-backend.railway.app`)

2. **Update `frontend/src/api/client.ts`** if needed to use the environment variable.

## 🔍 Troubleshooting

### Still Getting 404?

1. **Check Build Logs**: 
   - Go to Vercel dashboard → Your project → Deployments
   - Click on the latest deployment
   - Check if the build completed successfully

2. **Verify Output Directory**:
   - The build should create a `dist` folder in the `frontend` directory
   - Check if `dist/index.html` exists after build

3. **Check Vercel Settings**:
   - Root Directory should be `frontend` OR configured correctly
   - Output Directory should be `dist` (relative to root directory setting)

4. **Clear Cache and Redeploy**:
   - In Vercel dashboard, go to Deployments
   - Click "..." on your deployment
   - Select "Redeploy" → "Use existing Build Cache" (uncheck this)
   - Redeploy

## ✅ Quick Fix Checklist

- [ ] `vercel.json` exists in root or `frontend/` directory
- [ ] Vercel project settings have correct Root Directory
- [ ] Build Command is set to `npm run build`
- [ ] Output Directory is set to `dist`
- [ ] Environment variable `VITE_API_URL` is set (if using backend)
- [ ] Project has been redeployed after configuration changes

## 🎯 Recommended Vercel Settings

```
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Framework Preset: Vite
```

After updating these settings, **redeploy your project** and the 404 error should be resolved!

---

**Note**: If you're deploying both frontend and backend, you'll need to deploy them separately:
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway, Render, or another platform




