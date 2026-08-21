from app.schemas.user import UserBase, UserCreate, UserLogin, UserUpdate, UserResponse, Token
from app.schemas.document import DocumentBase, DocumentCreate, DocumentResponse
from app.schemas.detection import DetectionResultBase, DetectionResultResponse, ForgeryAnalysisResponse
from app.schemas.ocr import OCRWordBox, OCRResponse
from app.schemas.report import ReportResponse
from app.schemas.admin import SystemStats, ActivityLogResponse, AdminDashboardResponse

__all__ = [
    "UserBase", "UserCreate", "UserLogin", "UserUpdate", "UserResponse", "Token",
    "DocumentBase", "DocumentCreate", "DocumentResponse",
    "DetectionResultBase", "DetectionResultResponse", "ForgeryAnalysisResponse",
    "OCRWordBox", "OCRResponse",
    "ReportResponse",
    "SystemStats", "ActivityLogResponse", "AdminDashboardResponse",
]
