@echo off
title VisionPath AI - Database Setup
echo ======================================
echo   VisionPath AI - Database Setup
echo ======================================
echo.
echo This creates the tables and loads the CSE Block campus data
echo into the PostgreSQL database named in backend\.env.
echo.

cd /d "%~dp0backend"

if not exist ".env" (
    echo [!] backend\.env is missing.
    echo     Copy backend\.env.example to backend\.env and set DATABASE_URL first.
    echo.
    pause
    exit /b 1
)

if not exist "venv\Scripts\python.exe" (
    echo [1/2] Creating the virtual environment and installing dependencies...
    python -m venv venv
    call venv\Scripts\python.exe -m pip install --upgrade pip --quiet
    call venv\Scripts\python.exe -m pip install -r requirements.txt
) else (
    echo [1/2] Virtual environment found.
)

echo [2/2] Seeding...
echo.
call venv\Scripts\python.exe seed.py %*
echo.
pause
