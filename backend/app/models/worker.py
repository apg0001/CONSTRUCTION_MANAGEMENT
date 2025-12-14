from sqlalchemy import Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class Worker(Base):
    __tablename__ = "workers"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255))
    team_id = Column(String(36), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
