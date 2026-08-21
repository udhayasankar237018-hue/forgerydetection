from app.routes.auth import router as auth_router
from app.routes.documents import router as documents_router
from app.routes.detection import router as detection_router
from app.routes.ocr import router as ocr_router
from app.routes.history import router as history_router
from app.routes.reports import router as reports_router
from app.routes.admin import router as admin_router

__all__ = [
    "auth_router",
    "documents_router",
    "detection_router",
    "ocr_router",
    "history_router",
    "reports_router",
    "admin_router",
]
