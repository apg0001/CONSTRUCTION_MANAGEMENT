from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import uuid
from app.database import get_db
from app.models.equipment_record import EquipmentRecord
from app.schemas.equipment_record import EquipmentRecordCreate, EquipmentRecordUpdate, EquipmentRecordResponse
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
    
    # 디버깅: current_user 전체 내용 확인
    print(f"get_equipment_records - DEBUG: current_user: {current_user}")
    print(f"get_equipment_records - DEBUG: current_user.get('role'): {current_user.get('role')}")
    print(f"get_equipment_records - DEBUG: current_user.get('role') == 'manager': {current_user.get('role') == 'manager'}")
    
    # Role-based filtering
    if current_user.get("role") == "manager":
        # Managers can only see their team's records
        user_team_id = current_user.get("team_id")
        print(f"get_equipment_records - manager role, user_team_id from token: {user_team_id} (type: {type(user_team_id)}), team_id param: {team_id} (type: {type(team_id) if team_id else None}), current_user keys: {list(current_user.keys())}")
        
        # team_id가 None이거나 빈 문자열이면 빈 결과 반환
        if not user_team_id or (isinstance(user_team_id, str) and not user_team_id.strip()):
            print(f"get_equipment_records - WARNING: manager role but no team_id in token! user_team_id: {user_team_id}")
            return []
        
        # 문자열로 변환하여 비교 (타입 불일치 방지)
        user_team_id_str = str(user_team_id).strip()
        
        # 전달된 team_id 파라미터가 있으면 JWT의 team_id와 비교하여 검증
        if team_id:
            team_id_str = str(team_id).strip()
            if team_id_str != user_team_id_str:
                print(f"get_equipment_records - WARNING: manager tried to access different team! user_team_id: {user_team_id_str}, requested team_id: {team_id_str}")
                raise HTTPException(
                    status_code=403,
                    detail="You can only access your own team's records"
                )
            # 검증 통과: 전달된 team_id 사용
            print(f"get_equipment_records - Filtering by team_id: {team_id_str}")
            query = query.filter(EquipmentRecord.team_id == team_id_str)
        else:
            # team_id 파라미터가 없으면 JWT의 team_id 사용
            print(f"get_equipment_records - Filtering by user_team_id from token: {user_team_id_str}")
            query = query.filter(EquipmentRecord.team_id == user_team_id_str)
    elif current_user.get("role") == "admin":
        # Admins can filter by team_id parameter
        if team_id:
            query = query.filter(EquipmentRecord.team_id == team_id)
        # team_id가 없으면 모든 기록 반환 (관리자 권한)
    else:
        # 다른 역할은 빈 결과 반환
        return []

    if work_date:
        query = query.filter(EquipmentRecord.work_date == work_date)

    results = query.order_by(EquipmentRecord.work_date.desc()).all()
    print(f"get_equipment_records - found {len(results)} records")
    if results:
        # 모든 결과의 team_id 확인
        team_ids_in_results = [r.team_id for r in results]
        print(f"get_equipment_records - All team_ids in results: {set(team_ids_in_results)}")
    return results


@router.post("", response_model=EquipmentRecordResponse)
def create_equipment_record(
    equipment_record: EquipmentRecordCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new equipment record or update existing one (accumulate quantity)"""
    # Role-based access control
    if current_user.get("role") == "manager":
        user_team_id = current_user.get("team_id")
        # 팀 계정의 경우 user_team_id를 사용 (equipment_record.team_id가 없거나 다를 경우)
        if user_team_id:
            if equipment_record.team_id and equipment_record.team_id != user_team_id:
                raise HTTPException(
                    status_code=403,
                    detail="Managers can only create records for their own team"
                )
            # equipment_record.team_id가 없거나 빈 문자열이면 user_team_id 사용
            final_team_id = equipment_record.team_id if (equipment_record.team_id and equipment_record.team_id.strip()) else user_team_id
        else:
            # user_team_id가 없으면 에러 (팀 계정은 반드시 team_id가 있어야 함)
            raise HTTPException(
                status_code=400,
                detail="Team ID is required for manager accounts"
            )
    else:
        # 관리자 계정의 경우 equipment_record.team_id 사용 (필수)
        if not equipment_record.team_id or not equipment_record.team_id.strip():
            raise HTTPException(
                status_code=400,
                detail="Team ID is required"
            )
        final_team_id = equipment_record.team_id
    
    # Log for debugging
    print(f"Creating equipment record - team_id: {final_team_id}, equipment_type: {equipment_record.equipment_type}, current_user role: {current_user.get('role')}, current_user team_id: {current_user.get('team_id')}, equipment_record.team_id: {equipment_record.team_id}")
    
    # 같은 날짜, 같은 장비 타입, 같은 팀의 기존 레코드 찾기
    existing_record = db.query(EquipmentRecord).filter(
        EquipmentRecord.work_date == equipment_record.work_date,
        EquipmentRecord.equipment_type == equipment_record.equipment_type,
        EquipmentRecord.team_id == final_team_id
    ).first()
    
    if existing_record:
        # 기존 레코드가 있으면 수량 누적
        existing_record.quantity += equipment_record.quantity
        db.commit()
        db.refresh(existing_record)
        print(f"Updated existing equipment record - id: {existing_record.id}, team_id: {existing_record.team_id}, quantity: {existing_record.quantity}")
        return existing_record
    else:
        # 없으면 새로 생성
        db_equipment_record = EquipmentRecord(
            id=str(uuid.uuid4()),
            work_date=equipment_record.work_date,
            equipment_type=equipment_record.equipment_type,
            quantity=equipment_record.quantity,
            team_id=final_team_id,
            created_by=equipment_record.created_by,
        )
        db.add(db_equipment_record)
        db.commit()
        db.refresh(db_equipment_record)
        print(f"Created new equipment record - id: {db_equipment_record.id}, team_id: {db_equipment_record.team_id}")
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


@router.put("/{record_id}", response_model=EquipmentRecordResponse)
def update_equipment_record(
    record_id: str,
    equipment_record: EquipmentRecordUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Update equipment record by ID"""
    db_record = db.query(EquipmentRecord).filter(EquipmentRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Equipment record not found")
    
    # Role-based access control
    if current_user.get("role") == "manager":
        user_team_id = current_user.get("team_id")
        if user_team_id and db_record.team_id != user_team_id:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
    
    # Update fields
    if equipment_record.work_date is not None:
        db_record.work_date = equipment_record.work_date
    if equipment_record.equipment_type is not None:
        db_record.equipment_type = equipment_record.equipment_type
    if equipment_record.quantity is not None:
        db_record.quantity = equipment_record.quantity
    
    db.commit()
    db.refresh(db_record)
    return db_record


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
