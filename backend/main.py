from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import auth, inventory, forecasting, alerts, waste, dashboard, chatbot_v3, suppliers, debug, orders
from config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Pharmacy Inventory API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(inventory.router, prefix="/api/inventory")
app.include_router(forecasting.router, prefix="/api/forecasting")
app.include_router(alerts.router, prefix="/api/alerts")
app.include_router(waste.router, prefix="/api/waste")
app.include_router(dashboard.router, prefix="/api/dashboard")
app.include_router(chatbot_v3.router, prefix="/api/chatbot")
app.include_router(suppliers.router, prefix="/api/suppliers")
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(debug.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "Backend running locally"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("BACKEND SERVER STARTED SUCCESSFULLY!")
    print("------------------------------------------------------------")
    print("Ignore the 'Gemini Initialized' message - that is normal.")
    print("You can now open your App at: http://localhost:3000")
    print("REST API is available at:     http://localhost:8000")
    print("="*60 + "\n")
    
    # Use port 8000 to match frontend client
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
