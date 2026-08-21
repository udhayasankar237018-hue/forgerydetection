from datetime import datetime, timezone
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from app.database.base import Base


class DetectionResult(Base):
    __tablename__ = "detection_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    prediction = Column(String(20), nullable=False)  # "GENUINE" or "FORGED"
    confidence = Column(Float, nullable=False)  # e.g. 94.7 (%)
    forgery_type = Column(String(100), default="None", nullable=False)  # Text manipulation, Copy-move, Splicing, Digital editing, Erasing/removal, None
    risk_level = Column(String(20), default="LOW", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    suspicious_regions = Column(Integer, default=0, nullable=False)
    processing_time = Column(Float, default=0.0, nullable=False)  # in seconds
    model_version = Column(String(100), default="RF-Forensic-v1.0 (Real ML)", nullable=False)
    
    # Paths to generated forensic visualization images
    preprocessed_path = Column(String(500), nullable=True)
    heatmap_path = Column(String(500), nullable=True)
    suspicious_regions_path = Column(String(500), nullable=True)
    ela_path = Column(String(500), nullable=True)
    
    # Detailed JSON string of forensic metrics (e.g. noise variance, ELA diff score, copy-move matches)
    details_json = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    document = relationship("Document", back_populates="detection_result")
