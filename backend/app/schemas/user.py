from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: str
    password: str
    role: str  # admin, manager
    team_id: Optional[str] = None
    team_name: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    team_id: Optional[str]
    team_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
