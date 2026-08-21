import os
from typing import List, Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
# pyrefly: ignore [missing-import]
from fastapi.responses import FileResponse
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.document import Document
from app.models.activity_log import ActivityLog
from app.schemas.document import DocumentResponse
from app.services.document_service import save_uploaded_document
from app.routes.auth import get_current_user
from app.core.logger import logger, log_event

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a new document (JPG, PNG, PDF) for forensic analysis."""
    meta = await save_uploaded_document(file, current_user.id)

    doc = Document(
        document_uuid=meta["document_uuid"],
        user_id=current_user.id,
        original_filename=meta["original_filename"],
        stored_filename=meta["stored_filename"],
        file_type=meta["file_type"],
        file_size=meta["file_size"],
        upload_path=meta["upload_path"],
        status="UPLOADED"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Activity log
    log = ActivityLog(
        user_id=current_user.id,
        action="DOCUMENT_UPLOAD",
        description=f"Uploaded document: {doc.original_filename} ({doc.document_uuid})"
    )
    db.add(log)
    db.commit()

    log_event("UPLOAD", f"Uploaded doc {doc.document_uuid}", current_user.email)

    return doc


@router.post("/batch-upload", response_model=List[DocumentResponse], status_code=status.HTTP_201_CREATED)
async def batch_upload_documents(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Batch upload multiple documents for queue analysis."""
    uploaded_docs = []
    for file in files:
        try:
            meta = await save_uploaded_document(file, current_user.id)
            doc = Document(
                document_uuid=meta["document_uuid"],
                user_id=current_user.id,
                original_filename=meta["original_filename"],
                stored_filename=meta["stored_filename"],
                file_type=meta["file_type"],
                file_size=meta["file_size"],
                upload_path=meta["upload_path"],
                status="UPLOADED"
            )
            db.add(doc)
            db.commit()
            db.refresh(doc)
            uploaded_docs.append(doc)
        except Exception as e:
            logger.warning(f"Batch item failed for {file.filename}: {e}")

    log = ActivityLog(
        user_id=current_user.id,
        action="BATCH_DOCUMENT_UPLOAD",
        description=f"Batch uploaded {len(uploaded_docs)} documents."
    )
    db.add(log)
    db.commit()

    log_event("BATCH_UPLOAD", f"Batch uploaded {len(uploaded_docs)} files", current_user.email)
    return uploaded_docs


@router.get("", response_model=List[DocumentResponse])
def get_user_documents(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all documents uploaded by the current user."""
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.upload_date.desc()).offset(skip).limit(limit).all()
    return docs


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document_details(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get single document details."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if doc.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this document")
    return doc


@router.get("/{document_id}/file")
def get_raw_document_file(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Serve the raw uploaded document file or preview."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or not os.path.exists(doc.upload_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document file not found on disk")
    if doc.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    return FileResponse(
        path=doc.upload_path,
        filename=doc.original_filename,
        media_type=doc.file_type
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a document and all related analysis records."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if doc.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Remove physical file
    if os.path.exists(doc.upload_path):
        try:
            os.remove(doc.upload_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()

    # Activity log
    log = ActivityLog(
        user_id=current_user.id,
        action="DOCUMENT_DELETE",
        description=f"Deleted document: {doc.original_filename} ({doc.document_uuid})"
    )
    db.add(log)
    db.commit()

    return None
