from pydantic import BaseModel
from datetime import datetime, date


class WorkRecordCreate(BaseModel):
    worker_id: str
    worker_name: str
    site_name: str  # 작업자 기록의 현장명은 필요
    work_date: date
    work_hours: float
    notes: str | None = None
    team_id: str
    created_by: str


class WorkRecordUpdate(BaseModel):
    worker_id: str | None = None
    worker_name: str | None = None
    site_name: str | None = None
    work_hours: float | None = None
    notes: str | None = None


class WorkRecordResponse(BaseModel):
    id: str
    worker_id: str
    worker_name: str
    site_name: str  # 작업자 기록의 현장명은 필요
    work_date: date
    work_hours: float
    notes: str | None
    team_id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
