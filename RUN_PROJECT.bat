@echo off
echo ========================================================
echo   🏥 STARTING SMART PHARMACY SYSTEM
echo ========================================================

echo.
echo [1/2] Starting Backend Server...
start "Pharmacy Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo.
echo [2/2] Starting Frontend Application...
start "Pharmacy Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   ✅ SYSTEM STARTING...
echo ========================================================
echo   Backend URL:  http://localhost:8000
echo   Frontend URL: http://localhost:5173
echo.
echo   Please wait a few moments for both windows to initialize.
echo ========================================================
pause
