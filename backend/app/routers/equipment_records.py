from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import uuid
from app.database import get_db
from app.models.equipment_record import EquipmentRecord
from app.schemas.equipment_record import EquipmentRecordCreate, EquipmentRecordResponse
from app.security import get_current_user

router = APIRouter(prefix="/equipment-records", tags=["equipment-records"])


@router.get("", response_model=List[EquipmentRecordResponse])
def get_equipment_records(
    team_id: Optional[str] = Query(None),
    work_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get equipment records by team ID and optional date"""
    query = db.query(EquipmentRecord)
    
    # Role-based filtering
    if current_user.get("role") == "manager":
        # Managers can only see their team's records
        user_team_id = current_user.get("team_id")
        if user_team_id:
            query = query.filter(EquipmentRecord.team_id == user_team_id)
    elif team_id:
        # Admins can filter by team_id
        query = query.filter(EquipmentRecord.team_id == team_id)

    if work_date:
        query = query.filter(EquipmentRecord.work_date == work_date)

    return query.order_by(EquipmentRecord.work_date.desc()).all()


@router.post("", response_model=EquipmentRecordResponse)
def create_equipment_record(
    equipment_record: EquipmentRecordCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new equipment record"""
    # Role-based access control
    if current_user.get("role") == "manager":
        user_team_id = current_user.get("team_id")
        if user_team_id and equipment_record.team_id != user_team_id:
            raise HTTPException(
                status_code=403,
                detail="Managers can only create records for their own team"
            )
    
    db_equipment_record = EquipmentRecord(
        id=str(uuid.uuid4()),
        work_date=equipment_record.work_date,
        site_name=equipment_record.site_name,
        equipment_type=equipment_record.equipment_type,
        quantity=equipment_record.quantity,
        team_id=equipment_record.team_id,
        created_by=equipment_record.created_by,
    )
    db.add(db_equipment_record)
    db.commit()
    db.refresh(db_equipment_record)
    return db_equipment_record


@router.get("/{record_id}", response_model=EquipmentRecordResponse)
def get_equipment_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get equipment record by ID"""
    record = db.query(EquipmentRecord).filter(EquipmentRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Equipment record not found")
    
    # Role-based access control
    if current_user.get("role") == "manager":
        user_team_id = current_user.get("team_id")
        if user_team_id and record.team_id != user_team_id:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
    
    return record


@router.delete("/{record_id}")
def delete_equipment_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Delete equipment record by ID"""
    record = db.query(EquipmentRecord).filter(EquipmentRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Equipment record not found")
    
    # Role-based access control
    if current_user.get("role") == "manager":
        user_team_id = current_user.get("team_id")
        if user_team_id and record.team_id != user_team_id:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

    db.delete(record)
    db.commit()
    return {"message": "Equipment record deleted successfully"}
