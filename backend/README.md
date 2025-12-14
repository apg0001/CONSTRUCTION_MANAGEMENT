# Construction Site Management System - Backend API

건설 현장 관리 시스템의 백엔드 API 서버입니다. FastAPI를 기반으로 구축되었으며, SQLAlchemy를 사용하여 데이터베이스와 상호작용합니다.

## 프로젝트 구조

```
backend/
├── app/
│   ├── __init__.py
│   ├── models/              # SQLAlchemy ORM 모델
│   │   ├── user.py
│   │   ├── team.py
│   │   ├── worker.py
│   │   ├── work_record.py
│   │   └── equipment_record.py
│   ├── schemas/             # Pydantic 스키마
│   │   ├── user.py
│   │   ├── team.py
│   │   ├── worker.py
│   │   ├── work_record.py
│   │   └── equipment_record.py
│   ├── routers/             # API 엔드포인트
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── teams.py
│   │   ├── workers.py
│   │   ├── work_records.py
│   │   └── equipment_records.py
│   ├── database.py          # 데이터베이스 연결 설정
│   ├── security.py          # JWT 및 비밀번호 암호화
│   └── services.py          # 비즈니스 로직
├── main.py                  # FastAPI 애플리케이션 진입점
├── requirements.txt         # 프로젝트 의존성
└── .gitignore              # Git 무시 파일
```

## 설치 및 실행

### 1. 가상환경 생성 및 활성화

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 서버 실행

```bash
# 기본 실행
python main.py

# 개발 모드 (자동 재시작)
uvicorn main:app --reload
```

서버는 `http://localhost:8000`에서 실행됩니다.

## API 엔드포인트

### 인증 (Auth)
- `POST /auth/register` - 사용자 등록
- `POST /auth/login` - 로그인
- `GET /auth/me` - 현재 사용자 정보 조회

### 사용자 (Users)
- `GET /users` - 모든 사용자 조회 (관리자만)
- `GET /users/{user_id}` - 특정 사용자 조회

### 팀 (Teams)
- `GET /teams` - 모든 팀 조회
- `POST /teams` - 팀 생성 (관리자만)
- `GET /teams/{team_id}` - 특정 팀 조회

### 작업자 (Workers)
- `GET /workers?team_id={team_id}` - 팀 소속 작업자 조회
- `POST /workers` - 작업자 추가
- `GET /workers/{worker_id}` - 특정 작업자 조회
- `DELETE /workers/{worker_id}` - 작업자 삭제

### 공수 기록 (Work Records)
- `GET /work-records?team_id={team_id}&work_date={date}` - 공수 기록 조회
- `POST /work-records` - 공수 기록 추가
- `GET /work-records/{record_id}` - 특정 기록 조회
- `PUT /work-records/{record_id}` - 공수 기록 수정
- `DELETE /work-records/{record_id}` - 공수 기록 삭제

### 장비 기록 (Equipment Records)
- `GET /equipment-records?team_id={team_id}&work_date={date}` - 장비 기록 조회
- `POST /equipment-records` - 장비 기록 추가
- `GET /equipment-records/{record_id}` - 특정 기록 조회
- `DELETE /equipment-records/{record_id}` - 장비 기록 삭제

## 인증

모든 API 엔드포인트(인증 관련 제외)는 JWT 토큰 기반 인증을 사용합니다.

### 로그인 요청

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### 응답

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin",
    "team_id": null,
    "team_name": null
  }
}
```

### 인증된 요청

```bash
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer <access_token>"
```

## 데이터베이스

기본적으로 SQLite를 사용합니다. `DATABASE_URL` 환경변수를 설정하여 다른 데이터베이스를 사용할 수 있습니다.

```bash
# PostgreSQL 예시
export DATABASE_URL=postgresql://user:password@localhost/dbname
```

## 환경변수

프로젝트 루트에 `.env` 파일을 생성하여 환경변수를 설정할 수 있습니다:

```bash
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your-secret-key-change-this-in-production
```

## API 문서

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 개발 가이드

### 새 엔드포인트 추가

1. `app/schemas/` 에서 요청/응답 스키마 정의
2. `app/models/` 에서 데이터베이스 모델 정의
3. `app/routers/` 에 라우터 생성
4. `main.py` 에 라우터 포함

### 데이터베이스 마이그레이션

현재는 자동으로 테이블이 생성됩니다. 복잡한 마이그레이션이 필요한 경우 Alembic 사용을 권장합니다.

## 라이센스

MIT License
