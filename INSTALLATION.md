# 📦 Installation Guide

Complete installation guide for Smart Pharmacy Inventory Management System.

## 🚀 Quick Installation (Recommended)

### Using PowerShell Script (Windows)

Run the automated installation script:

```powershell
.\install-all.ps1
```

This script will:
- ✅ Check Python and Node.js installations
- ✅ Create Python virtual environment
- ✅ Install all backend dependencies
- ✅ Install all frontend dependencies

## 📋 Manual Installation

### Prerequisites

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

### Step 1: Backend Installation

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Frontend Installation

```powershell
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

## ✅ Verify Installation

### Check Backend

```powershell
cd backend
.\venv\Scripts\activate
python -c "import fastapi; print('FastAPI installed successfully')"
```

### Check Frontend

```powershell
cd frontend
npm list --depth=0
```

## 🗄️ Initialize Database

After installing dependencies, initialize the database:

```powershell
cd backend
.\venv\Scripts\activate
python init_db.py
```

This creates:
- Database tables
- Default admin user: `admin@pharmacy.com` / `admin123`
- Default manager user: `manager@pharmacy.com` / `manager123`

## 🚀 Start the Application

### Terminal 1: Backend

```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload
```

Backend will run at: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

### Terminal 2: Frontend

```powershell
cd frontend
npm run dev
```

Frontend will run at: `http://localhost:3000`

## 📦 Package Lists

### Backend Packages (Python)

All packages are listed in `backend/requirements.txt`:

- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation
- **python-jose** - JWT authentication
- **passlib** - Password hashing
- **pandas** - Data processing
- **openpyxl** - Excel file handling

### Frontend Packages (Node.js)

All packages are listed in `frontend/package.json`:

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization

## 🔧 Troubleshooting

### Python Virtual Environment Issues

If activation fails:
```powershell
# Try this instead
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Node.js Installation Issues

If npm install fails:
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Permission Issues

If you get permission errors:
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📝 Installation Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Backend virtual environment created
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Database initialized
- [ ] Backend server starts successfully
- [ ] Frontend dev server starts successfully

## 🎯 Next Steps After Installation

1. **Configure Environment Variables**:
   - Copy `backend/.env.example` to `backend/.env`
   - Update `SECRET_KEY` and other settings

2. **Test the Application**:
   - Start backend and frontend
   - Visit `http://localhost:3000`
   - Login with: `admin@pharmacy.com` / `admin123`

3. **Deploy** (Optional):
   - See `DEPLOYMENT.md` for deployment instructions

---

**Need Help?** Check `LOGIN_TROUBLESHOOTING.md` for common issues.




