from datetime import datetime, timezone
import uuid
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, BigInteger, DateTime, ForeignKey
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from app.database.base import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_uuid = Column(String(50), unique=True, index=True, default=lambda: f"DOC-{uuid.uuid4().hex[:10].upper()}", nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # image/jpeg, image/png, application/pdf
    file_size = Column(BigInteger, nullable=False)
    upload_path = Column(String(500), nullable=False)
    upload_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String(30), default="UPLOADED", nullable=False)  # UPLOADED, PROCESSING, COMPLETED, FAILED

    user = relationship("User", back_populates="documents")
    detection_result = relationship("DetectionResult", back_populates="document", uselist=False, cascade="all, delete-orphan")
    ocr_result = relationship("OCRResult", back_populates="document", uselist=False, cascade="all, delete-orphan")
    report = relationship("Report", back_populates="document", uselist=False, cascade="all, delete-orphan")
