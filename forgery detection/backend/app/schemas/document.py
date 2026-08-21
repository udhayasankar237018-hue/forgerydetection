from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DocumentBase(BaseModel):
    original_filename: str
    file_type: str
    file_size: int


class DocumentCreate(DocumentBase):
    user_id: int
    stored_filename: str
    upload_path: str


class DocumentResponse(DocumentBase):
    id: int
    document_uuid: str
    user_id: int
    stored_filename: str
    upload_date: datetime
    status: str
    preview_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
