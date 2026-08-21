@echo off
title ForgeryGuard AI - Backend Server (Port 8000)

if exist "%~dp0forgery detection\backend" (
    cd /d "%~dp0forgery detection\backend"
) else if exist "%~dp0backend" (
    cd /d "%~dp0backend"
) else (
    cd /d "%~dp0"
)

set "PY=C:\Users\udhay\AppData\Local\Programs\Python311\python.exe"

if exist "%PY%" (
    echo Starting FastAPI Backend using Python 3.11...
    "%PY%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    echo Starting FastAPI Backend using system python...
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
)

pause
