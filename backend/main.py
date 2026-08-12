"""
VisionPath AI — backend entry point.

Run from the backend/ directory:

    uvicorn main:app --reload --port 8000
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.routers import (
    admin,
    auth,
    dashboard,
    emergency,
    navigation,
    notifications,
    ocr,
    users,
    voice,
)
from core.config import settings
from database.config import check_db_connection, init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("visionpath")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if check_db_connection():
        init_db()
        logger.info("Database ready at %s", _safe_db_label())
    else:
        # Don't crash the process: the API can still serve /api/health so the
        # operator gets a clear diagnosis instead of a stack trace on boot.
        logger.error(
            "Could not connect to PostgreSQL. Check DATABASE_URL in backend/.env "
            "and that the server is running."
        )
    yield


app = FastAPI(
    title=settings.app_name,
    description="Indoor navigation and accessibility platform API (PostgreSQL).",
    version=settings.version,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(navigation.router, prefix="/api/navigation", tags=["Navigation"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["Emergency"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice Assistant"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])


def _safe_db_label() -> str:
    """Host/database only — never log the credentials in the URL."""
    url = settings.database_url
    return url.rsplit("@", 1)[-1] if "@" in url else url


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong on the server. Please try again."},
    )


@app.get("/api/health", tags=["System"])
def health_check() -> dict:
    database_ok = check_db_connection()
    return {
        "status": "healthy" if database_ok else "degraded",
        "version": settings.version,
        "service": settings.app_name,
        "database": "connected" if database_ok else "unreachable",
        "environment": settings.environment,
    }


@app.get("/", tags=["System"])
def root() -> dict:
    return {
        "message": "VisionPath AI API",
        "version": settings.version,
        "docs": "/api/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True, log_level="info")
