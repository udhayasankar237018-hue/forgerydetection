import os
import json
from typing import List
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from fastapi.responses import FileResponse
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.document import Document
from app.models.detection_result import DetectionResult
from app.models.ocr_result import OCRResult
from app.models.report import Report
from app.models.activity_log import ActivityLog
from app.schemas.report import ReportResponse
from app.services.report_service import generate_forensic_pdf_report
from app.routes.auth import get_current_user
from app.core.logger import log_event

router = APIRouter(prefix="/reports", tags=["Forensic Reports"])


@router.post("/generate/{document_id}", response_model=ReportResponse)
def create_forensic_report(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a formal PDF Forensic Verification Report for an analyzed document."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if doc.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    det = db.query(DetectionResult).filter(DetectionResult.document_id == document_id).first()
    if not det:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot generate report before forensic analysis is executed. Run analysis first."
        )

    ocr = db.query(OCRResult).filter(OCRResult.document_id == document_id).first()
    extracted_text = ocr.extracted_text if ocr else ""

    metrics = {}
    detected_categories = []
    modules_dict = {}
    if det.details_json:
        try:
            details_obj = json.loads(det.details_json)
            metrics = details_obj.get("features", {})
            detected_categories = details_obj.get("detected_categories", [])
            modules_dict = details_obj.get("modules", {})
        except Exception:
            metrics = {}

    report_path = generate_forensic_pdf_report(
        document_uuid=doc.document_uuid,
        original_filename=doc.original_filename,
        file_size_bytes=doc.file_size,
        prediction=det.prediction,
        confidence=det.confidence,
        forgery_type=det.forgery_type,
        risk_level=det.risk_level,
        suspicious_regions=det.suspicious_regions,
        model_version=det.model_version,
        processing_time=det.processing_time,
        extracted_text=extracted_text,
        original_img_path=doc.upload_path,
        heatmap_path=det.heatmap_path or "",
        suspicious_path=det.suspicious_regions_path or "",
        ela_path=det.ela_path or "",
        metrics_dict=metrics,
        detected_categories=detected_categories,
        modules_dict=modules_dict
    )

    report_record = db.query(Report).filter(Report.document_id == document_id).first()
    if not report_record:
        report_record = Report(
            document_id=doc.id,
            report_path=report_path
        )
        db.add(report_record)
    else:
        report_record.report_path = report_path

    # Log report creation
    log = ActivityLog(
        user_id=current_user.id,
        action="REPORT_GENERATED",
        description=f"Generated PDF Forensic Report for {doc.document_uuid}"
    )
    db.add(log)
    db.commit()
    db.refresh(report_record)

    log_event("REPORT", f"Generated report for {doc.document_uuid}", current_user.email)

    return {
        "id": report_record.id,
        "document_id": doc.id,
        "document_uuid": doc.document_uuid,
        "filename": doc.original_filename,
        "report_path": report_record.report_path,
        "download_url": f"/api/reports/{doc.id}/download",
        "created_at": report_record.created_at
    }


@router.get("/{document_id}/download")
def download_forensic_report(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download the generated PDF Forensic Report."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if doc.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    report = db.query(Report).filter(Report.document_id == document_id).first()
    if not report or not os.path.exists(report.report_path):
        # Auto-generate if not created yet
        rep_info = create_forensic_report(document_id, current_user, db)
        report_path = rep_info["report_path"]
    else:
        report_path = report.report_path

    return FileResponse(
        path=report_path,
        filename=f"Forensic_Report_{doc.document_uuid}.pdf",
        media_type="application/pdf"
    )


@router.get("", response_model=List[ReportResponse])
def list_user_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all generated forensic reports for the current user."""
    reports = (
        db.query(Report, Document)
        .join(Document, Report.document_id == Document.id)
        .filter(Document.user_id == current_user.id)
        .order_by(Report.created_at.desc())
        .all()
    )

    items = []
    for rep, doc in reports:
        items.append({
            "id": rep.id,
            "document_id": doc.id,
            "document_uuid": doc.document_uuid,
            "filename": doc.original_filename,
            "report_path": rep.report_path,
            "download_url": f"/api/reports/{doc.id}/download",
            "created_at": rep.created_at
        })
    return items
