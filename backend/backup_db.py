#!/usr/bin/env python3
"""
데이터베이스 백업 스크립트
매일 실행되어 SQLite 데이터베이스를 백업하고, 최근 10개만 유지합니다.
"""
import os
import shutil
import glob
from datetime import datetime
from pathlib import Path

# 설정
DB_PATH = os.getenv("DATABASE_URL", "sqlite:///./data/test.db").replace("sqlite:///", "")
BACKUP_DIR = os.getenv("BACKUP_DIR", "/app/backups")
MAX_BACKUPS = 10

def ensure_backup_dir():
    """백업 디렉토리가 없으면 생성"""
    Path(BACKUP_DIR).mkdir(parents=True, exist_ok=True)

def backup_database():
    """데이터베이스 백업 실행"""
    try:
        # DB 파일 경로 확인
        if not os.path.exists(DB_PATH):
            print(f"경고: 데이터베이스 파일을 찾을 수 없습니다: {DB_PATH}")
            return False
        
        # 백업 디렉토리 확인
        ensure_backup_dir()
        
        # 백업 파일명 생성 (타임스탬프 포함)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"backup_{timestamp}.db"
        backup_path = os.path.join(BACKUP_DIR, backup_filename)
        
        # 데이터베이스 파일 복사
        shutil.copy2(DB_PATH, backup_path)
        print(f"백업 완료: {backup_path}")
        
        # 최근 백업 파일 목록 가져오기 (시간순 정렬)
        backup_files = glob.glob(os.path.join(BACKUP_DIR, "backup_*.db"))
        backup_files.sort(key=os.path.getmtime, reverse=True)
        
        # 최근 10개만 유지하고 나머지 삭제
        if len(backup_files) > MAX_BACKUPS:
            files_to_delete = backup_files[MAX_BACKUPS:]
            for file_path in files_to_delete:
                try:
                    os.remove(file_path)
                    print(f"오래된 백업 삭제: {file_path}")
                except Exception as e:
                    print(f"백업 파일 삭제 실패: {file_path}, 오류: {e}")
        
        print(f"현재 백업 파일 수: {min(len(backup_files), MAX_BACKUPS)}/{MAX_BACKUPS}")
        return True
        
    except Exception as e:
        print(f"백업 중 오류 발생: {e}")
        return False

if __name__ == "__main__":
    success = backup_database()
    exit(0 if success else 1)

