@echo off
title ForgeryGuard AI - Complete Launcher
echo ===================================================
echo   Starting ForgeryGuard AI (Backend + Frontend)
echo ===================================================

start "ForgeryGuard AI - Backend (Port 8000)" cmd /k "%~dp0start_backend.bat"
timeout /t 2 /nobreak >nul
start "ForgeryGuard AI - Frontend (Port 5173)" cmd /k "%~dp0start_frontend.bat"

echo.
echo Both servers are launching!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
