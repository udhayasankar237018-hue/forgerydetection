@echo off
title ForgeryGuard AI - Backend Server (Port 8000)
cd /d "%~dp0backend"

set "PY=C:\Users\udhay\AppData\Local\Programs\Python311\python.exe"

if exist "%PY%" (
    echo Starting FastAPI Backend using Python 3.11...
    "%PY%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    echo Starting FastAPI Backend using system python...
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
)

pause
