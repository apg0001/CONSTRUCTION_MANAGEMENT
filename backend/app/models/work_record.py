from sqlalchemy import Column, String, Float, DateTime, Date
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class WorkRecord(Base):
    __tablename__ = "work_records"

    id = Column(String(36), primary_key=True, index=True)
    worker_id = Column(String(36))
    worker_name = Column(String(255))
    work_date = Column(Date, index=True)
    work_hours = Column(Float)
    notes = Column(String(1000))
    team_id = Column(String(36), index=True)
    created_by = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
