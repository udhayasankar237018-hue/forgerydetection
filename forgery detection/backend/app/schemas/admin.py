from datetime import datetime
from typing import List, Dict, Any, Optional
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from app.schemas.user import UserResponse


class SystemStats(BaseModel):
    total_users: int
    total_documents: int
    genuine_count: int
    forged_count: int
    pending_count: int
    average_confidence: float
    forgery_types_breakdown: Dict[str, int]
    risk_levels_breakdown: Dict[str, int]
    system_status: str = "ONLINE"
    model_name: str
    model_version: str


class ActivityLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True


class AdminDashboardResponse(BaseModel):
    stats: SystemStats
    recent_documents: List[Any]
    recent_activities: List[ActivityLogResponse]
