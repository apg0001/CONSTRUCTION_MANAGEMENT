"""
데이터베이스 마이그레이션 스크립트
기존 테이블에 notes 컬럼을 추가하고, equipment_records 테이블에서 site_name 컬럼을 제거합니다.
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


def migrate_remove_site_name_from_equipment():
    """
    equipment_records 테이블에서 site_name 컬럼을 제거합니다.
    SQLite는 ALTER TABLE DROP COLUMN을 직접 지원하지 않으므로,
    새 테이블을 생성하고 데이터를 복사한 후 기존 테이블을 교체합니다.
    """
    db = SessionLocal()
    try:
        # 테이블 존재 여부 확인
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='equipment_records'"))
        if not result.fetchone():
            print("✓ equipment_records 테이블이 존재하지 않습니다. 마이그레이션 불필요.")
            return
        
        # 컬럼 존재 여부 확인
        result = db.execute(text("PRAGMA table_info(equipment_records)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'site_name' not in columns:
            print("✓ equipment_records 테이블에 site_name 컬럼이 없습니다. 마이그레이션 불필요.")
            return
        
        print("equipment_records 테이블에서 site_name 컬럼을 제거합니다...")
        
        # 새 테이블 생성 (site_name 없이)
        db.execute(text("""
            CREATE TABLE equipment_records_new (
                id VARCHAR(36) PRIMARY KEY,
                work_date DATE,
                equipment_type VARCHAR(50),
                quantity INTEGER,
                team_id VARCHAR(36),
                created_by VARCHAR(255),
                created_at DATETIME,
                updated_at DATETIME
            )
        """))
        
        # 데이터 복사 (site_name 제외)
        db.execute(text("""
            INSERT INTO equipment_records_new 
            (id, work_date, equipment_type, quantity, team_id, created_by, created_at, updated_at)
            SELECT id, work_date, equipment_type, quantity, team_id, created_by, created_at, updated_at
            FROM equipment_records
        """))
        
        # 기존 테이블 삭제
        db.execute(text("DROP TABLE equipment_records"))
        
        # 새 테이블 이름 변경
        db.execute(text("ALTER TABLE equipment_records_new RENAME TO equipment_records"))
        
        # 인덱스 재생성
        db.execute(text("CREATE INDEX IF NOT EXISTS ix_equipment_records_work_date ON equipment_records(work_date)"))
        db.execute(text("CREATE INDEX IF NOT EXISTS ix_equipment_records_team_id ON equipment_records(team_id)"))
        
        db.commit()
        print("✓ site_name 컬럼이 성공적으로 제거되었습니다.")
            
    except Exception as e:
        db.rollback()
        print(f"✗ 마이그레이션 중 오류 발생: {e}")
        raise
    finally:
        db.close()


def migrate_ensure_site_name_in_work_records():
    """
    work_records 테이블에 site_name 컬럼이 있는지 확인하고, 없으면 추가합니다.
    작업자 기록의 현장명은 필요하므로 유지해야 합니다.
    """
    db = SessionLocal()
    try:
        # 테이블 존재 여부 확인
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='work_records'"))
        if not result.fetchone():
            print("✓ work_records 테이블이 존재하지 않습니다. 마이그레이션 불필요.")
            return
        
        # 컬럼 존재 여부 확인
        result = db.execute(text("PRAGMA table_info(work_records)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'site_name' not in columns:
            print("work_records 테이블에 site_name 컬럼을 추가합니다...")
            # SQLite는 ALTER TABLE ADD COLUMN만 지원
            db.execute(text("ALTER TABLE work_records ADD COLUMN site_name VARCHAR(255) DEFAULT ''"))
            db.commit()
            print("✓ site_name 컬럼이 성공적으로 추가되었습니다.")
        else:
            print("✓ work_records 테이블에 site_name 컬럼이 이미 존재합니다.")
            
    except Exception as e:
        db.rollback()
        print(f"✗ 마이그레이션 중 오류 발생: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("데이터베이스 마이그레이션 시작...")
    migrate_add_notes_column()
    migrate_remove_site_name_from_equipment()
    migrate_ensure_site_name_in_work_records()  # work_records에는 site_name이 필요
    print("마이그레이션 완료!")
