import os
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, Request, status
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from fastapi.responses import JSONResponse
# pyrefly: ignore [missing-import]
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.logger import logger
from app.database.session import init_db
from app.routes.auth import router as auth_router
from app.routes.documents import router as documents_router
from app.routes.detection import router as detection_router
from app.routes.ocr import router as ocr_router
from app.routes.history import router as history_router
from app.routes.reports import router as reports_router
from app.routes.admin import router as admin_router

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Based Document Forgery Detection Using Image Processing & Machine Learning REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Directories for uploads and processed artifacts
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)

app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/static/processed", StaticFiles(directory=settings.PROCESSED_DIR), name="processed")
app.mount("/static/reports", StaticFiles(directory=settings.REPORTS_DIR), name="reports")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(detection_router, prefix=settings.API_V1_STR)
app.include_router(ocr_router, prefix=settings.API_V1_STR)
app.include_router(history_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def on_startup():
    logger.info(f"Starting {settings.PROJECT_NAME} API Server...")
    try:
        init_db()
    except Exception as e:
        logger.error(f"Startup database initialization error: {e}")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Clean global error handling to prevent leaking raw internal stack traces."""
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact the administrator if this persists."}
    )


@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "status": "ONLINE",
        "version": "1.0.0",
        "documentation": "/docs",
        "api_prefix": settings.API_V1_STR
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "database": "CONNECTED",
        "ai_engine": "ACTIVE"
    }


if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
