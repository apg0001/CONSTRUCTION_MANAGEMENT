from pydantic import BaseModel
from datetime import datetime


class TeamCreate(BaseModel):
    name: str
    manager_id: str


class TeamResponse(BaseModel):
    id: str
    name: str
    manager_id: str
    created_at: datetime

    class Config:
        from_attributes = True
