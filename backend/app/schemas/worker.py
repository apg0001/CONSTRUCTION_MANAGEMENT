from pydantic import BaseModel
from datetime import datetime


class WorkerCreate(BaseModel):
    name: str
    team_id: str


class WorkerResponse(BaseModel):
    id: str
    name: str
    team_id: str
    created_at: datetime

    class Config:
        from_attributes = True
