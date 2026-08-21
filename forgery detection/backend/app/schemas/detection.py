from datetime import datetime
from typing import Optional, Dict, Any, List
# pyrefly: ignore [missing-import]
from pydantic import BaseModel


class DetectedCategoryItem(BaseModel):
    category_id: str
    category_name: str
    severity: str  # "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    confidence: float
    affected_element: str
    description: str
    indicators: List[str] = []


class ModuleResultItem(BaseModel):
    id: str
    name: str
    status: str  # "PASS" | "SUSPICIOUS" | "TAMPERED"
    risk_level: str  # "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    confidence: float
    score: float
    metrics: Dict[str, Any] = {}
    findings: List[str] = []


class DetectionResultBase(BaseModel):
    prediction: str  # "GENUINE" | "FORGED"
    confidence: float  # percentage 0.0 - 100.0
    forgery_type: str
    risk_level: str  # "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    suspicious_regions: int
    processing_time: float
    model_version: str


class DetectionResultResponse(DetectionResultBase):
    id: int
    document_id: int
    preprocessed_path: Optional[str] = None
    heatmap_path: Optional[str] = None
    suspicious_regions_path: Optional[str] = None
    ela_path: Optional[str] = None
    details_json: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ForgeryAnalysisResponse(BaseModel):
    document_id: int
    document_uuid: str
    filename: str
    result: DetectionResultResponse
    extracted_text: Optional[str] = None
    ocr_confidence: Optional[float] = None
    detected_categories: Optional[List[Dict[str, Any]]] = None
    modules: Optional[Dict[str, Any]] = None
