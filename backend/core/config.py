"""
Application settings.

Every value is read from the environment (optionally via a .env file next to
this project's backend/ folder) so nothing environment-specific is ever
committed. See .env.example for the full list.
"""

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load backend/.env if present. Existing environment variables win.
load_dotenv(BASE_DIR / ".env")


def _get_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


class Settings:
    """Runtime configuration, resolved once at import time."""

    def __init__(self) -> None:
        self.app_name: str = "VisionPath AI API"
        self.version: str = "1.0.0"
        self.environment: str = os.getenv("ENVIRONMENT", "development")
        self.debug: bool = _get_bool("DEBUG", self.environment == "development")

        # --- Database (PostgreSQL only) ---
        self.database_url: str = os.getenv(
            "DATABASE_URL",
            "postgresql+psycopg://postgres:postgres@localhost:5432/visionpath_db",
        )
        self.sql_echo: bool = _get_bool("SQL_ECHO", False)

        # --- Auth ---
        self.secret_key: str = os.getenv("SECRET_KEY", "")
        self.algorithm: str = os.getenv("ALGORITHM", "HS256")
        self.access_token_expire_minutes: int = int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
        )
        self.reset_token_expire_minutes: int = int(
            os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "60")
        )

        # --- CORS ---
        self.cors_origins: list[str] = [
            origin.strip()
            for origin in os.getenv(
                "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
            ).split(",")
            if origin.strip()
        ]

        # --- OCR ---
        # Optional absolute path to the tesseract binary on Windows, e.g.
        # C:\Program Files\Tesseract-OCR\tesseract.exe
        self.tesseract_cmd: str = os.getenv("TESSERACT_CMD", "")
        self.max_upload_bytes: int = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))

        # --- Seeding ---
        self.seed_admin_email: str = os.getenv("SEED_ADMIN_EMAIL", "admin@visionpath.ai")
        self.seed_admin_password: str = os.getenv("SEED_ADMIN_PASSWORD", "Admin@1234")

        self._validate()

    def _validate(self) -> None:
        if not self.secret_key:
            if self.environment == "development":
                # Deterministic-but-local fallback so `uvicorn main:app` works
                # out of the box for a dev checkout. Never used in production.
                self.secret_key = "dev-only-insecure-secret-change-me"
            else:
                raise RuntimeError(
                    "SECRET_KEY must be set when ENVIRONMENT is not 'development'."
                )

        if not self.database_url.startswith("postgresql"):
            raise RuntimeError(
                "VisionPath AI supports PostgreSQL only. "
                f"DATABASE_URL must start with 'postgresql', got: {self.database_url.split(':')[0]}"
            )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
