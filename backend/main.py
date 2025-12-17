"""
Smart Pharmacy Inventory Management System - Main API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from database import engine, Base
from routers import (
    auth,
    inventory,
    forecasting,
    alerts,
    waste,
    dashboard,
    chatbot,
    suppliers,
    debug,
)

# -----------------------------
# Create database tables
# -----------------------------
Base.metadata.create_all(bind=engine)

# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI(
    title="Smart Pharmacy Inventory API",
    description="AI-powered pharmacy inventory management system",
    version="1.0.0",
)

# -----------------------------
# CORS (HARD FIX – DO NOT CHANGE)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pharmacy-inventory1.vercel.app",  # Vercel frontend
        "http://localhost:5173",                   # Local dev (Vite)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Routers
# -----------------------------
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(forecasting.router, prefix="/api/forecasting", tags=["Forecasting"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(waste.router, prefix="/api/waste", tags=["Waste Analytics"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(suppliers.router, prefix="/api/suppliers", tags=["Suppliers"])
app.include_router(debug.router, prefix="/api", tags=["Debug"])

# -----------------------------
# Health & Root
# -----------------------------
@app.get("/")
def root():
    return {
        "message": "Smart Pharmacy Inventory Management System API",
        "status": "running",
    }


@app.get("/api/health")
def health():
    return {"status": "healthy"}

# -----------------------------
# Local run (Render ignores this)
# -----------------------------
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
