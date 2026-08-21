@echo off
title ForgeryGuard AI - Frontend (Port 5173)
if exist "%~dp0forgery detection\frontend" (
    cd /d "%~dp0forgery detection\frontend"
) else if exist "%~dp0frontend" (
    cd /d "%~dp0frontend"
) else (
    cd /d "%~dp0"
)

echo Starting React Vite Frontend...
npm.cmd run dev
pause
