from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
import uuid
from app.database import get_db
from app.models.work_record import WorkRecord
from app.schemas.work_record import WorkRecordCreate, WorkRecordUpdate, WorkRecordResponse
from app.security import get_current_user

router = APIRouter(prefix="/work-records", tags=["work-records"])


@router.get("", response_model=List[WorkRecordResponse])
def get_work_records(
    team_id: Optional[str] = Query(None),
    work_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get work records by team ID and optional date"""
    query = db.query(WorkRecord)
    
    # Role-based filtering
    if current_user.get("role") == "manager":
        # Managers can only see their team's records
        user_team_id = current_user.get("team_id")
        if user_team_id:
            query = query.filter(WorkRecord.team_id == user_team_id)
    elif team_id:
        # Admins can filter by team_id
        query = query.filter(WorkRecord.team_id == team_id)
    
    if work_date:
        query = query.filter(WorkRecord.work_date == work_date)
    
    # Log for debugging
    print(f"get_work_records - current_user role: {current_user.get('role')}, team_id param: {team_id}, work_date: {work_date}")
    results = query.order_by(WorkRecord.work_date.desc()).all()
    print(f"get_work_records - found {len(results)} records")
    if results:
        print(f"Sample record - id: {results[0].id}, team_id: {results[0].team_id}, worker_name: {results[0].worker_name}")
    return results


@router.post("", response_model=WorkRecordResponse)
def create_work_record(
    work_record: WorkRecordCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new work record"""
    # Role-based access control
    if current_user.get("role") == "manager":
        user_team_id = current_user.get("team_id")
        if user_team_id and work_record.team_id != user_team_id:
            raise HTTPException(
                status_code=403,
                detail="Managers can only create records for their own team"
            )
    
    # Log for debugging
    print(f"Creating work record - team_id: {work_record.team_id}, worker_name: {work_record.worker_name}, current_user role: {current_user.get('role')}, current_user team_id: {current_user.get('team_id')}")
    
    db_work_record = WorkRecord(
        id=str(uuid.uuid4()),
        worker_id=work_record.worker_id,
        worker_name=work_record.worker_name,
        site_name=work_record.site_name,
        work_date=work_record.work_date,
        work_hours=work_record.work_hours,
        notes=work_record.notes,
        team_id=work_record.team_id,
        created_by=work_record.created_by,
    )
    db.add(db_work_record)
    db.commit()
    db.refresh(db_work_record)
    print(f"Created work record - id: {db_work_record.id}, team_id: {db_work_record.team_id}")
    return db_work_record


@router.get("/{record_id}", response_model=WorkRecordResponse)
def get_work_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get work record by ID"""
    record = db.query(WorkRecord).filter(WorkRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Work record not found")
    
    # Role-based access control
    if current_user.get("role") == "manager":
        user_team_id = current_user.get("team_id")
        if user_team_id and record.team_id != user_team_id:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
    
    return record


@router.put("/{record_id}", response_model=WorkRecordResponse)
def update_work_record(
    record_id: str,
    work_record: WorkRecordUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Update work record by ID"""
    db_record = db.query(WorkRecord).filter(WorkRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Work record not found")
    
    # Role-based access control
    if current_user.get("role") == "manager":
        user_team_id = current_user.get("team_id")
        if user_team_id and db_record.team_id != user_team_id:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
    
    # Update fields
    db_record.worker_id = work_record.worker_id
    db_record.worker_name = work_record.worker_name
    db_record.site_name = work_record.site_name
    db_record.work_hours = work_record.work_hours
    db_record.notes = work_record.notes
    db_record.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_record)
    return db_record


@router.delete("/{record_id}")
def delete_work_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Delete work record by ID"""
    record = db.query(WorkRecord).filter(WorkRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Work record not found")
    
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
    return {"message": "Work record deleted successfully"}
