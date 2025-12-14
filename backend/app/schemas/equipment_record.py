from pydantic import BaseModel
from datetime import datetime, date


class EquipmentRecordCreate(BaseModel):
    work_date: date
    site_name: str
    equipment_type: str
    quantity: int
    team_id: str
    created_by: str


class EquipmentRecordResponse(BaseModel):
    id: str
    work_date: date
    site_name: str
    equipment_type: str
    quantity: int
    team_id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
