from sqlalchemy import Column, String, Integer, DateTime, Date
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class EquipmentRecord(Base):
    __tablename__ = "equipment_records"

    id = Column(String(36), primary_key=True, index=True)
    work_date = Column(Date, index=True)
    site_name = Column(String(255))
    equipment_type = Column(String(50))
    quantity = Column(Integer)
    team_id = Column(String(36), index=True)
    created_by = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
