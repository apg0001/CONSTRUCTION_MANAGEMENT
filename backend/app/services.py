import uuid
from datetime import timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)


class AuthService:
    @staticmethod
    def create_user(db: Session, user: UserCreate) -> User:
        db_user = User(
            id=str(uuid.uuid4()),
            email=user.email,
            password=get_password_hash(user.password),
            role=user.role,
            team_id=user.team_id,
            team_name=user.team_name,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, user: UserLogin) -> dict:
        db_user = db.query(User).filter(User.email == user.email).first()
        if not db_user or not verify_password(user.password, db_user.password):
            return None

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": db_user.id, "email": db_user.email, "role": db_user.role},
            expires_delta=access_token_expires,
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": db_user.id,
                "email": db_user.email,
                "role": db_user.role,
                "team_id": db_user.team_id,
                "team_name": db_user.team_name,
            },
        }

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> User:
        return db.query(User).filter(User.id == user_id).first()
