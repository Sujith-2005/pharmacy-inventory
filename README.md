# 🏥 Smart Pharmacy Inventory Management System

A professional, AI-powered pharmacy inventory management system built with **FastAPI** (Python) and **React** (TypeScript). This application is designed for efficient inventory tracking, demand forecasting, and waste reduction.

---

## ✨ Key Features

- **📦 Inventory Management**: Full control over stock, batches, and suppliers.
- **🤖 AI Forecasting**: Machine learning models to predict demand and optimize stock.
- **⚡ Real-time Alerts**: Notifications for low stock and expiry dates.
- **📊 Analytics Dashboard**: Visual insights into sales, waste, and inventory health.
- **📤 Smart Data Import**: Drag-and-drop Excel/CSV/JSON uploads with validation.
- **🔐 Secure Access**: Role-based authentication (Admin, Manager, Pharmacist).

---

## 🛠️ Tech Stack

- **Backend**: Python 3.8+, FastAPI, SQLAlchemy, SQLite/PostgreSQL, Pandas, Scikit-learn
- **Frontend**: Node.js 16+, React 18, TypeScript, Vite, Tailwind CSS, Recharts

---

## 🚀 Quick Start (Local Development)

Follow these steps to get the application running on your local machine.

### Prerequisites
- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js 16+](https://nodejs.org/)
- [Git](https://git-scm.com/)

### 1. Backend Setup

Open a terminal in the `backend` folder:

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup Environment Variables
# Copy the example file. Update keys if needed.
copy .env.example .env

# Initialize the Database
python init_db.py

# Start the Server
uvicorn main:app --reload
```
*The backend API will run at `http://localhost:8000`. API Docs: `http://localhost:8000/docs`*

### 2. Frontend Setup

Open a new terminal in the `frontend` folder:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
*The frontend will run at `http://localhost:5173` (or the port shown in terminal).*

---

## 📦 Deployment Guide

This project is ready for deployment on modern cloud platforms.

### 🌐 Frontend Deployment (Vercel)

1.  Push your code to **GitHub**.
2.  Go to [Vercel](https://vercel.com) and **Add New Project**.
3.  Import your repository.
4.  **Configure Project**:
    -   **Root Directory**: `frontend`
    -   **Framework Preset**: `Vite`
    -   **Build Command**: `npm run build`
    -   **Output Directory**: `dist`
5.  **Environment Variables**:
    -   Add `VITE_API_URL` with your deployed backend URL (e.g., `https://my-backend.railway.app`).
6.  **Deploy**.

### ⚙️ Backend Deployment (Railway/Render)

**Recommended: Railway**

1.  Sign up at [Railway.app](https://railway.app).
2.  **New Project** -> **Deploy from GitHub repo**.
3.  Select `backend` as the Root Directory if prompted (or configure in settings).
4.  **Settings**:
    -   **Build Command**: `pip install -r requirements.txt`
    -   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5.  **Variables**: Add the contents of your `.env` file (DATABASE_URL, SECRET_KEY, etc.).
    -   *Note*: For production, use a PostgreSQL database service (Railway provides one) instead of SQLite. Update `DATABASE_URL` to the Postgres connection string.

---

## 🔧 Troubleshooting

### Login Issues
-   **Default Admin**: `admin@pharmacy.com` / `admin123`
-   **Default Manager**: `manager@pharmacy.com` / `manager123`
-   If login fails, ensure the backend is running and `python init_db.py` was executed.

### "Module not found"
-   Ensure your virtual environment is activated (`venv\Scripts\activate`) before running `pip install` or starting the server.
-   Ensure you are in the correct directory (`backend/`).

### Frontend API Connection Error
-   Check if the backend is running on `http://localhost:8000`.
-   Verify `VITE_API_URL` in `frontend/.env` (or creates `.env.development` with `VITE_API_URL=http://localhost:8000`).

---

## 📁 Project Structure

```
pharmacy-inventory/
├── backend/            # FastAPI Backend
│   ├── main.py
│   ├── models.py
│   ├── routers/        # API Endpoints
│   └── ml_models/      # AI/ML Logic
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   └── components/
├── data/               # Sample data files & templates
├── scripts/            # Utility & Maintenance scripts
└── README.md           # This file
```

---
**Made with ❤️ for efficient healthcare.**
