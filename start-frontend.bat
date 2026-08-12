@echo off
title VisionPath AI - Frontend
echo ======================================
echo   VisionPath AI - Frontend (Next.js)
echo ======================================
echo.

cd /d "%~dp0frontend"

where node >nul 2>&1
if errorlevel 1 (
    echo [!] Node.js was not found on PATH.
    echo     Install Node.js 20+ and open a NEW terminal, then run this again.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [1/2] Installing dependencies (first run, this takes a minute)...
    call npm install
    if errorlevel 1 (
        echo [!] npm install failed.
        pause
        exit /b 1
    )
) else (
    echo [1/2] Dependencies already installed.
)

echo [2/2] Starting the development server...
echo.
echo       The browser opens automatically once the server is ready.
echo       The backend must also be running (start-backend.bat).
echo.

REM Wait for the port to accept connections before opening the browser.
REM Opening it immediately races the compiler and shows ERR_CONNECTION_REFUSED.
start "" /b powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "for($i=0; $i -lt 120; $i++){ try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1',3000); $c.Close(); Start-Process 'http://localhost:3000'; break } catch { Start-Sleep -Milliseconds 500 } }"

call npm run dev
pause
