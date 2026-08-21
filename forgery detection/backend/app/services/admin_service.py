from typing import Dict, Any, List
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import func
from app.models.user import User
from app.models.document import Document
from app.models.detection_result import DetectionResult
from app.models.activity_log import ActivityLog


def get_admin_dashboard_metrics(db: Session) -> Dict[str, Any]:
    """
    Aggregates full forensic system metrics and distribution analytics for the admin panel.
    """
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_documents = db.query(func.count(Document.id)).scalar() or 0
    
    genuine_count = db.query(func.count(DetectionResult.id)).filter(DetectionResult.prediction == "GENUINE").scalar() or 0
    forged_count = db.query(func.count(DetectionResult.id)).filter(DetectionResult.prediction == "FORGED").scalar() or 0
    pending_count = db.query(func.count(Document.id)).filter(Document.status == "PROCESSING").scalar() or 0

    avg_conf = db.query(func.avg(DetectionResult.confidence)).scalar() or 0.0

    # Forgery type breakdown
    type_counts = db.query(
        DetectionResult.forgery_type,
        func.count(DetectionResult.id)
    ).group_by(DetectionResult.forgery_type).all()
    
    forgery_types_breakdown = {t: c for t, c in type_counts if t}

    # Risk level breakdown
    risk_counts = db.query(
        DetectionResult.risk_level,
        func.count(DetectionResult.id)
    ).group_by(DetectionResult.risk_level).all()
    
    risk_levels_breakdown = {r: c for r, c in risk_counts if r}

    return {
        "total_users": total_users,
        "total_documents": total_documents,
        "genuine_count": genuine_count,
        "forged_count": forged_count,
        "pending_count": pending_count,
        "average_confidence": round(float(avg_conf), 2),
        "forgery_types_breakdown": forgery_types_breakdown,
        "risk_levels_breakdown": risk_levels_breakdown,
        "system_status": "ONLINE",
        "model_name": "Random Forest / ELA Forensic Classifier",
        "model_version": "RF-Forensic-v1.0",
    }
