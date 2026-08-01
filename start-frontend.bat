@echo off
title VisionPath AI - Frontend
echo ====================================
echo   VisionPath AI - Starting Frontend
echo ====================================
echo.
cd /d "%~dp0frontend"
echo [1/2] Installing dependencies (if needed)...
call npm install --silent 2>nul
echo [2/2] Starting development server...
echo.
echo The app will open at: http://localhost:3000
echo.
start http://localhost:3000
npm run dev
pause

