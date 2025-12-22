from pydantic import BaseModel
from datetime import datetime, date


class EquipmentRecordCreate(BaseModel):
    work_date: date
    equipment_type: str
    quantity: int
    team_id: str
    created_by: str


class EquipmentRecordUpdate(BaseModel):
    work_date: date | None = None
    equipment_type: str | None = None
    quantity: int | None = None


class EquipmentRecordResponse(BaseModel):
    id: str
    work_date: date
    equipment_type: str
    quantity: int
    team_id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
