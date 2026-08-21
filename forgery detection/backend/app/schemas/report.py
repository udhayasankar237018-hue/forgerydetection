from datetime import datetime
# pyrefly: ignore [missing-import]
from pydantic import BaseModel


class ReportResponse(BaseModel):
    id: int
    document_id: int
    document_uuid: str
    filename: str
    report_path: str
    download_url: str
    created_at: datetime

    class Config:
        from_attributes = True
