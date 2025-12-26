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
        print(f"get_work_records - manager role, user_team_id from token: {user_team_id}, team_id param: {team_id}, current_user: {current_user}")
        
        if not user_team_id:
            # team_id가 없으면 빈 결과 반환 (보안상 안전)
            print(f"get_work_records - WARNING: manager role but no team_id in token!")
            return []
        
        # 전달된 team_id 파라미터가 있으면 JWT의 team_id와 비교하여 검증
        if team_id:
            if team_id != user_team_id:
                print(f"get_work_records - WARNING: manager tried to access different team! user_team_id: {user_team_id}, requested team_id: {team_id}")
                raise HTTPException(
                    status_code=403,
                    detail="You can only access your own team's records"
                )
            # 검증 통과: 전달된 team_id 사용
            query = query.filter(WorkRecord.team_id == team_id)
        else:
            # team_id 파라미터가 없으면 JWT의 team_id 사용
            query = query.filter(WorkRecord.team_id == user_team_id)
    elif current_user.get("role") == "admin":
        # Admins can filter by team_id parameter
        if team_id:
            query = query.filter(WorkRecord.team_id == team_id)
        # team_id가 없으면 모든 기록 반환 (관리자 권한)
    else:
        # 다른 역할은 빈 결과 반환
        return []
    
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
        # 팀 계정의 경우 user_team_id를 사용 (work_record.team_id가 없거나 다를 경우)
        if user_team_id:
            if work_record.team_id and work_record.team_id != user_team_id:
                raise HTTPException(
                    status_code=403,
                    detail="Managers can only create records for their own team"
                )
            # work_record.team_id가 없거나 빈 문자열이면 user_team_id 사용
            final_team_id = work_record.team_id if (work_record.team_id and work_record.team_id.strip()) else user_team_id
        else:
            # user_team_id가 없으면 에러 (팀 계정은 반드시 team_id가 있어야 함)
            raise HTTPException(
                status_code=400,
                detail="Team ID is required for manager accounts"
            )
    else:
        # 관리자 계정의 경우 work_record.team_id 사용 (필수)
        if not work_record.team_id or not work_record.team_id.strip():
            raise HTTPException(
                status_code=400,
                detail="Team ID is required"
            )
        final_team_id = work_record.team_id
    
    # Log for debugging
    print(f"Creating work record - team_id: {final_team_id}, worker_name: {work_record.worker_name}, current_user role: {current_user.get('role')}, current_user team_id: {current_user.get('team_id')}, work_record.team_id: {work_record.team_id}")
    
    db_work_record = WorkRecord(
        id=str(uuid.uuid4()),
        worker_id=work_record.worker_id,
        worker_name=work_record.worker_name,
        site_name=work_record.site_name,
        work_date=work_record.work_date,
        work_hours=work_record.work_hours,
        notes=work_record.notes,
        team_id=final_team_id,
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
    
    # Update fields (only if provided)
    if work_record.worker_id is not None:
        db_record.worker_id = work_record.worker_id
    if work_record.worker_name is not None:
        db_record.worker_name = work_record.worker_name
    if work_record.site_name is not None:
        db_record.site_name = work_record.site_name
    if work_record.work_hours is not None:
        db_record.work_hours = work_record.work_hours
    if work_record.notes is not None:
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
