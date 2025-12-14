from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from app.database import get_db
from app.models.worker import Worker
from app.schemas.worker import WorkerCreate, WorkerResponse
from app.security import get_current_user

router = APIRouter(prefix="/workers", tags=["workers"])


@router.get("", response_model=List[WorkerResponse])
def get_workers(
    team_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get workers by team ID (optional)"""
    query = db.query(Worker)
    
    # Role-based filtering
    if current_user.get("role") == "manager":
        # Managers can only see their team's workers
        user_team_id = current_user.get("team_id")
        if user_team_id:
            query = query.filter(Worker.team_id == user_team_id)
    elif team_id:
        # Admins can filter by team_id
        query = query.filter(Worker.team_id == team_id)
    
    return query.all()


@router.post("", response_model=WorkerResponse)
def create_worker(
    worker: WorkerCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new worker"""
    db_worker = Worker(id=str(uuid.uuid4()), name=worker.name, team_id=worker.team_id)
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker


@router.get("/{worker_id}", response_model=WorkerResponse)
def get_worker(
    worker_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get worker by ID"""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker


@router.delete("/{worker_id}")
def delete_worker(
    worker_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Delete worker by ID"""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    db.delete(worker)
    db.commit()
    return {"message": "Worker deleted successfully"}
