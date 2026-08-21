from datetime import datetime
from typing import Optional, List, Dict, Any
# pyrefly: ignore [missing-import]
from pydantic import BaseModel


class OCRWordBox(BaseModel):
    text: str
    confidence: float
    bbox: List[int]  # [x, y, w, h]


class OCRResponse(BaseModel):
    document_id: int
    extracted_text: str
    ocr_confidence: float
    word_count: int
    bounding_boxes: Optional[List[Dict[str, Any]]] = None
    created_at: datetime

    class Config:
        from_attributes = True
