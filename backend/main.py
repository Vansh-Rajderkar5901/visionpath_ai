"""
VisionPath AI - Backend API
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from api.routers import auth, users, navigation, ocr, emergency, notifications, admin, voice, dashboard
from database.config import engine, Base

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VisionPath AI API",
    description="AI-powered indoor navigation and accessibility platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(navigation.router, prefix="/api/navigation", tags=["Navigation"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["Emergency"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice Assistant"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

# Health Check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0", "service": "VisionPath AI API"}

@app.get("/")
async def root():
    return {
        "message": "Welcome to VisionPath AI API",
        "docs": "/api/docs",
        "version": "1.0.0",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
