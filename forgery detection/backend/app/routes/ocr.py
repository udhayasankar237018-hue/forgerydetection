import json
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.document import Document
from app.models.ocr_result import OCRResult
from app.schemas.ocr import OCRResponse
from app.routes.auth import get_current_user

router = APIRouter(prefix="/ocr", tags=["OCR"])


@router.get("/{document_id}", response_model=OCRResponse)
def get_ocr_result(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get extracted OCR text and word bounding boxes for a document."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if doc.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    ocr = db.query(OCRResult).filter(OCRResult.document_id == document_id).first()
    if not ocr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OCR analysis not found for this document")

    boxes = json.loads(ocr.bounding_boxes_json) if ocr.bounding_boxes_json else []
    text = ocr.extracted_text or ""

    return {
        "document_id": doc.id,
        "extracted_text": text,
        "ocr_confidence": ocr.ocr_confidence,
        "word_count": len(text.split()),
        "bounding_boxes": boxes,
        "created_at": ocr.created_at
    }
