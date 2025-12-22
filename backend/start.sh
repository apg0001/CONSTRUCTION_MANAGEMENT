#!/bin/bash

# 환경변수 설정 (cron에서 사용할 수 있도록)
export DATABASE_URL=${DATABASE_URL:-sqlite:///./data/test.db}
export BACKUP_DIR=${BACKUP_DIR:-/app/backups}

# cron 데몬 시작
cron

# 애플리케이션 실행
exec uvicorn main:app --host 0.0.0.0 --port 8000

