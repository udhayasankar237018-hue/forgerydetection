from typing import List, Dict, Any
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import desc

from app.database.session import get_db
from app.models.user import User
from app.models.document import Document
from app.models.detection_result import DetectionResult
from app.models.activity_log import ActivityLog
from app.schemas.user import UserResponse, AdminCreateUserRequest
from app.schemas.admin import AdminDashboardResponse, ActivityLogResponse, SystemStats
from app.services.admin_service import get_admin_dashboard_metrics
from app.routes.auth import get_current_admin
from app.core.security import get_password_hash
from app.core.logger import log_event

router = APIRouter(prefix="/admin", tags=["Administrator Dashboard"])


@router.get("/statistics", response_model=SystemStats)
def get_system_statistics(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve full system metrics, accuracy, and genuine vs forged distributions."""
    return get_admin_dashboard_metrics(db)


@router.get("/dashboard", response_model=AdminDashboardResponse)
def get_admin_full_dashboard(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Aggregated admin dashboard overview with stats, recent docs, and activity logs."""
    stats = get_admin_dashboard_metrics(db)
    
    # Recent documents with detection result
    recent_docs_raw = (
        db.query(Document, DetectionResult, User.email)
        .join(User, Document.user_id == User.id)
        .outerjoin(DetectionResult, Document.id == DetectionResult.document_id)
        .order_by(desc(Document.upload_date))
        .limit(8)
        .all()
    )

    recent_documents = []
    for doc, det, u_email in recent_docs_raw:
        recent_documents.append({
            "document_id": doc.id,
            "document_uuid": doc.document_uuid,
            "original_filename": doc.original_filename,
            "user_email": u_email,
            "upload_date": doc.upload_date,
            "status": doc.status,
            "prediction": det.prediction if det else None,
            "confidence": det.confidence if det else None,
            "forgery_type": det.forgery_type if det else None,
            "risk_level": det.risk_level if det else None,
        })

    # Recent activity logs
    logs = (
        db.query(ActivityLog, User.email)
        .outerjoin(User, ActivityLog.user_id == User.id)
        .order_by(desc(ActivityLog.created_at))
        .limit(15)
        .all()
    )

    recent_activities = []
    for log_item, u_email in logs:
        recent_activities.append({
            "id": log_item.id,
            "user_id": log_item.user_id,
            "user_email": u_email or "System",
            "action": log_item.action,
            "description": log_item.description,
            "created_at": log_item.created_at
        })

    return {
        "stats": stats,
        "recent_documents": recent_documents,
        "recent_activities": recent_activities
    }


@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all registered system users."""
    users = db.query(User).order_by(desc(User.created_at)).offset(skip).limit(limit).all()
    return users


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_by_admin(
    user_in: AdminCreateUserRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin direct enrollment of a new forensic analyst or administrator."""
    clean_email = user_in.email.lower().strip()
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email {clean_email} already exists."
        )

    clean_role = user_in.role.lower().strip() if user_in.role else "user"
    normalized_role = "admin" if clean_role == "admin" else "user"

    new_user = User(
        name=user_in.name.strip(),
        email=clean_email,
        password_hash=get_password_hash(user_in.password),
        role=normalized_role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Activity log
    log = ActivityLog(
        user_id=current_admin.id,
        action="ADMIN_ENROLL_USER",
        description=f"Admin {current_admin.email} enrolled new account: {new_user.email} (Role: {new_user.role})"
    )
    db.add(log)
    db.commit()

    log_event("ADMIN_ENROLL", f"Enrolled {new_user.email} as {new_user.role}", current_admin.email)

    return new_user


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    role: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Toggle user role between 'user'/'analyst' and 'admin'."""
    clean_role = role.lower().strip()
    normalized_role = "user" if clean_role in ["user", "analyst"] else ("admin" if clean_role == "admin" else None)
    if not normalized_role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role. Must be 'user', 'analyst', or 'admin'")
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    target_user.role = normalized_role
    db.commit()
    db.refresh(target_user)

    # Activity log
    log = ActivityLog(
        user_id=current_admin.id,
        action="USER_ROLE_CHANGED",
        description=f"Admin {current_admin.email} changed role of {target_user.email} to {normalized_role}"
    )
    db.add(log)
    db.commit()

    log_event("ADMIN_ROLE_CHANGE", f"Changed {target_user.email} role to {normalized_role}", current_admin.email)

    return target_user


@router.get("/activity", response_model=List[ActivityLogResponse])
def get_all_activity_logs(
    limit: int = 50,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve system-wide audit activity logs."""
    logs = (
        db.query(ActivityLog, User.email)
        .outerjoin(User, ActivityLog.user_id == User.id)
        .order_by(desc(ActivityLog.created_at))
        .limit(limit)
        .all()
    )

    items = []
    for log_item, u_email in logs:
        items.append({
            "id": log_item.id,
            "user_id": log_item.user_id,
            "user_email": u_email or "System",
            "action": log_item.action,
            "description": log_item.description,
            "created_at": log_item.created_at
        })
    return items
