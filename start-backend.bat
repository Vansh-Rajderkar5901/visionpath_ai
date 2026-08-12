@echo off
title VisionPath AI - Backend API
echo ======================================
echo   VisionPath AI - Backend (FastAPI)
echo ======================================
echo.

cd /d "%~dp0backend"

if not exist ".env" (
    echo [!] backend\.env is missing.
    echo     Copy backend\.env.example to backend\.env and set DATABASE_URL
    echo     to your PostgreSQL connection string, then run this again.
    echo.
    pause
    exit /b 1
)

if not exist "venv\Scripts\python.exe" (
    echo [1/3] Creating the virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [!] Could not create the virtual environment. Is Python 3.11+ installed?
        pause
        exit /b 1
    )
    echo [2/3] Installing dependencies...
    call venv\Scripts\python.exe -m pip install --upgrade pip --quiet
    call venv\Scripts\python.exe -m pip install -r requirements.txt
) else (
    echo [1/3] Virtual environment found.
    echo [2/3] Dependencies already installed.
)

echo [3/3] Starting the API on http://localhost:8000
echo       Interactive docs: http://localhost:8000/api/docs
echo.
call venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
pause
