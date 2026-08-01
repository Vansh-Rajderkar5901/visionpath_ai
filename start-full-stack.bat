@echo off
title VisionPath AI - Full Stack (Docker)
echo ====================================
echo   VisionPath AI - Starting Full Stack
echo ====================================
echo.
echo This will start:
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:8000
echo   - API Docs: http://localhost:8000/api/docs
echo.
echo Make sure Docker Desktop is running!
echo.
pause
cd /d "%~dp0"
docker-compose up --build
pause

