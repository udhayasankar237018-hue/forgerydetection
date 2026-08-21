import json
from typing import List, Optional, Dict, Any
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, Query
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import desc

from app.database.session import get_db
from app.models.user import User
from app.models.document import Document
from app.models.detection_result import DetectionResult
from app.routes.auth import get_current_user

router = APIRouter(prefix="/history", tags=["Detection History"])


@router.get("")
def get_user_detection_history(
    search: Optional[str] = None,
    prediction_filter: Optional[str] = None,
    risk_filter: Optional[str] = None,
    file_type: Optional[str] = None,
    sort_by: Optional[str] = Query("date", description="Sort by field: date, filename, confidence, risk, prediction, file_size"),
    sort_order: Optional[str] = Query("desc", description="Sort order: asc, desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Searchable, filterable, and paginated forensic analysis history for the current user.
    Supports multi-field sorting (date, filename, confidence, risk, prediction) and filtering.
    """
    query = (
        db.query(Document, DetectionResult)
        .outerjoin(DetectionResult, Document.id == DetectionResult.document_id)
        .filter(Document.user_id == current_user.id)
    )

    if search and search.strip():
        s_term = f"%{search.strip()}%"
        query = query.filter(
            (Document.original_filename.ilike(s_term)) |
            (Document.document_uuid.ilike(s_term)) |
            (Document.file_type.ilike(s_term)) |
            (DetectionResult.forgery_type.ilike(s_term)) |
            (DetectionResult.prediction.ilike(s_term)) |
            (DetectionResult.risk_level.ilike(s_term))
        )

    if prediction_filter and prediction_filter.upper() in ["GENUINE", "FORGED"]:
        query = query.filter(DetectionResult.prediction == prediction_filter.upper())

    if risk_filter and risk_filter.upper() in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
        query = query.filter(DetectionResult.risk_level == risk_filter.upper())

    if file_type and file_type.strip():
        f_type = file_type.strip().lower()
        if f_type.startswith('.'):
            f_type = f_type[1:]
        query = query.filter(Document.file_type.ilike(f"%{f_type}%"))

    total = query.count()
    offset = (page - 1) * limit

    # Apply sorting dynamically
    is_asc = (sort_order or "desc").lower() == "asc"
    sort_field = (sort_by or "date").lower()

    if sort_field == "filename":
        order_col = Document.original_filename.asc() if is_asc else Document.original_filename.desc()
    elif sort_field == "confidence":
        order_col = DetectionResult.confidence.asc() if is_asc else DetectionResult.confidence.desc()
    elif sort_field == "risk":
        order_col = DetectionResult.risk_level.asc() if is_asc else DetectionResult.risk_level.desc()
    elif sort_field == "prediction":
        order_col = DetectionResult.prediction.asc() if is_asc else DetectionResult.prediction.desc()
    elif sort_field == "file_size":
        order_col = Document.file_size.asc() if is_asc else Document.file_size.desc()
    else:  # default: date
        order_col = Document.upload_date.asc() if is_asc else Document.upload_date.desc()

    results = query.order_by(order_col).offset(offset).limit(limit).all()

    items = []
    for doc, det in results:
        items.append({
            "document_id": doc.id,
            "document_uuid": doc.document_uuid,
            "original_filename": doc.original_filename,
            "file_type": doc.file_type,
            "file_size": doc.file_size,
            "upload_date": doc.upload_date,
            "status": doc.status,
            "prediction": det.prediction if det else None,
            "confidence": det.confidence if det else None,
            "forgery_type": det.forgery_type if det else None,
            "risk_level": det.risk_level if det else None,
            "suspicious_regions": det.suspicious_regions if det else 0,
            "processing_time": det.processing_time if det else 0.0,
            "model_version": det.model_version if det else None,
            "has_report": bool(doc.report)
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1
    }
