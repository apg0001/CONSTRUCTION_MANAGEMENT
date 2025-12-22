"""
데이터베이스 마이그레이션 스크립트
기존 테이블에 notes 컬럼을 추가합니다.
"""

import os
from sqlalchemy import text
from app.database import engine, SessionLocal


def migrate_add_notes_column():
    """
    work_records 테이블에 notes 컬럼을 추가합니다.
    이미 컬럼이 존재하면 아무 작업도 하지 않습니다.
    """
    db = SessionLocal()
    try:
        # SQLite에서 컬럼 존재 여부 확인
        result = db.execute(text("PRAGMA table_info(work_records)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'notes' not in columns:
            print("work_records 테이블에 notes 컬럼을 추가합니다...")
            # SQLite는 ALTER TABLE ADD COLUMN만 지원
            db.execute(text("ALTER TABLE work_records ADD COLUMN notes VARCHAR(1000)"))
            db.commit()
            print("✓ notes 컬럼이 성공적으로 추가되었습니다.")
        else:
            print("✓ notes 컬럼이 이미 존재합니다.")
            
    except Exception as e:
        db.rollback()
        print(f"✗ 마이그레이션 중 오류 발생: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("데이터베이스 마이그레이션 시작...")
    migrate_add_notes_column()
    print("마이그레이션 완료!")

