# Construction Site Management System

건설 현장 관리 시스템 - 공수 기록 및 장비 관리를 위한 전체 솔루션입니다.

## 프로젝트 개요

이 프로젝트는 건설 현장에서의 작업 공수와 장비 사용을 체계적으로 관리하기 위한 웹 애플리케이션입니다.

### 주요 기능

- 👤 **사용자 관리**: 관리자와 팀 매니저 역할 기반 관리
- 🏗️ **작업자 관리**: 팀별 작업자 정보 관리
- 📝 **공수 기록**: 일일 작업 공수 기록 및 조회
- 🚜 **장비 관리**: 현장별 장비 사용량 기록
- 📊 **월별 리포트**: 월별 작업 현황 조회

## 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **React Router** - 라우팅
- **Shadcn/ui** - UI 컴포넌트
- **React Query** - 서버 상태 관리 및 캐싱
- **TanStack Query** - 데이터 페칭 최적화

### Backend
- **FastAPI** - Python 웹 프레임워크
- **SQLAlchemy** - ORM (연결 풀링 지원)
- **Pydantic** - 데이터 검증
- **JWT** - 인증 (토큰 만료 검증)
- **SQLite/PostgreSQL** - 데이터베이스
- **CORS** - 환경 변수 기반 설정

## 프로젝트 구조

```
.
├── frontend/                # React 프론트엔드
│   ├── src/
│   │   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── lib/            # 유틸리티 및 헬퍼
│   │   └── types/          # TypeScript 타입 정의
│   └── package.json
│
├── backend/                 # FastAPI 백엔드
│   ├── app/
│   │   ├── models/         # 데이터베이스 모델
│   │   ├── schemas/        # Pydantic 스키마
│   │   ├── routers/        # API 엔드포인트
│   │   ├── database.py     # DB 연결
│   │   └── security.py     # 인증/보안
│   ├── main.py
│   └── requirements.txt
│
└── README.md               # 이 파일
```

## 빠른 시작

### 전제 조건
- Python 3.9+
- Node.js 18+
- npm 또는 pnpm

### Backend 설정

```bash
cd backend

# Windows
setup.bat

# macOS/Linux
bash setup.sh

# 또는 수동 설정
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 환경 변수 파일 생성 (선택사항)
cp .env.example .env
# .env 파일을 열어서 필요한 설정을 수정하세요
```

### Backend 실행

```bash
cd backend
python main.py
```

서버는 `http://localhost:8000`에서 실행됩니다.

### Frontend 설정

```bash
cd frontend
pnpm install  # 또는 npm install

# 환경 변수 파일 생성 (선택사항)
cp .env.example .env
# .env 파일을 열어서 API URL을 수정하세요
```

### Frontend 실행

```bash
cd frontend
pnpm dev  # 또는 npm run dev
```

애플리케이션은 `http://localhost:5173`에서 접근 가능합니다.

## API 문서

Backend 실행 후 다음 주소에서 API 문서를 확인할 수 있습니다:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 기본 사용자 정보

### 로그인 자격증명

**관리자**
- 이메일: `ys26k`
- 비밀번호: `ys7502!@02`

**팀 매니저**
- Team 1: `team1` / `team1`
- Team 2: `team2` / `team2`
- Team 3: `team3` / `team3`

## 주요 페이지

### Dashboard
- 공수 기록, 작업자 관리, 월별 현황 접근
- 로그인한 사용자의 역할에 따른 메뉴 표시

### Work Record (공수 기록)
- 일일 작업 공수 기록
- 장비 사용량 기록
- 기록 수정 및 삭제

### Worker Management (작업자 관리)
- 팀별 작업자 관리
- 작업자 추가/삭제

### Monthly Report (월별 리포트)
- 월별 작업 현황 조회
- 팀별/개별 통계 확인

## 개발 가이드

### Frontend 개발

```bash
cd frontend

# 개발 모드 실행
pnpm dev

# 빌드
pnpm build

# 미리보기
pnpm preview

# 린트 체크
pnpm lint
```

### Backend 개발

```bash
cd backend

# 개발 모드 실행 (자동 재시작)
uvicorn main:app --reload

# 또는
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 배포

### 🚀 AWS EC2 배포 (권장) - 완전 자동화!

**⚡ 가장 빠른 방법 (1분)**:
```bash
git clone <repo> && cd <dir> && chmod +x deploy.sh && ./deploy.sh
```

**모든 설정이 자동으로 처리됩니다!**
- ✅ 환경 변수 자동 생성
- ✅ SECRET_KEY 자동 생성  
- ✅ EC2 IP 자동 감지
- ✅ Docker 자동 설치 (필요시)

**📖 배포 가이드**:
- [🚀 완전 자동 배포 가이드](./README_DEPLOY.md) - **설정 없이 바로 실행!** ⭐
- [🚀 빠른 시작 (5분)](./QUICK_START.md) - 빠른 배포 방법
- [📋 상세 배포 가이드](./DEPLOYMENT.md) - 자세한 설명 및 고급 설정
- [🇰🇷 한국어 배포 가이드](./배포_실행_방법.md) - 한국어로 된 실행 방법

#### 간단한 배포 방법 (5분)

1. **EC2 인스턴스 준비**
   - Ubuntu 22.04 LTS
   - 보안 그룹: HTTP (80), Custom TCP (8000) 열기

2. **Docker 설치**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **프로젝트 배포**
   ```bash
   # 프로젝트 디렉토리로 이동
   cd /path/to/project
   
   # 환경 변수 설정
   cp .env.example .env
   nano .env  # SECRET_KEY 등 수정
   
   # 배포 실행
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **접속 확인**
   - Frontend: `http://your-ec2-ip`
   - Backend API: `http://your-ec2-ip:8000`
   - API 문서: `http://your-ec2-ip:8000/docs`

자세한 내용은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

### 로컬 Docker 배포

```bash
# 환경 변수 설정
cp .env.example .env

# 개발 환경 실행
docker-compose up -d

# 프로덕션 환경 실행
docker-compose -f docker-compose.prod.yml up -d
```

### 수동 배포

#### Frontend 배포
1. `cd frontend && pnpm build` 실행
2. `dist/` 디렉토리의 파일들을 웹 서버에 배포

#### Backend 배포
1. `.env` 파일에서 `SECRET_KEY`를 안전한 값으로 변경
2. 프로덕션 데이터베이스 연결 설정
3. Gunicorn, uWSGI 등의 ASGI 서버로 배포

## 환경 변수

### Backend (.env)

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

```bash
# 데이터베이스 설정
DATABASE_URL=sqlite:///./test.db
# PostgreSQL 사용 시: DATABASE_URL=postgresql://user:password@localhost/dbname

# 보안 설정 (프로덕션에서는 반드시 변경!)
SECRET_KEY=your-secret-key-change-this-in-production

# 환경 설정
ENVIRONMENT=development  # development 또는 production

# CORS 설정 (쉼표로 구분)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# JWT 토큰 만료 시간 (분)
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env)

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

```bash
# API 서버 URL
VITE_API_URL=http://localhost:8000

# 환경 설정
VITE_ENVIRONMENT=development
```

## 최근 개선 사항

### 보안 개선
- ✅ JWT 토큰 만료 검증 및 자동 로그아웃
- ✅ 환경 변수 기반 CORS 설정
- ✅ 역할 기반 접근 제어 (RBAC) 강화
- ✅ API 에러 처리 개선

### 성능 최적화
- ✅ 데이터베이스 연결 풀링 설정
- ✅ React Query를 통한 데이터 캐싱
- ✅ API 호출 최적화 및 에러 핸들링

### 기능 개선
- ✅ work_records API 엔드포인트 수정 및 개선
- ✅ Optional Query 파라미터 지원
- ✅ 역할별 데이터 필터링 자동화

## 문제 해결

### Backend 연결 오류
- Backend가 실행 중인지 확인 (`http://localhost:8000/health`)
- CORS 설정 확인 (`.env` 파일의 `CORS_ORIGINS` 확인)
- 방화벽 설정 확인
- 환경 변수 파일이 올바르게 설정되었는지 확인

### 데이터베이스 오류
- SQLite 파일 권한 확인
- PostgreSQL 사용 시 연결 문자열 확인
- 데이터베이스 연결 풀 설정 확인

### 인증 오류
- 토큰이 만료되었는지 확인 (자동으로 로그아웃됨)
- `.env` 파일의 `SECRET_KEY`가 올바르게 설정되었는지 확인
- 브라우저의 localStorage를 확인

### API 호출 실패
- 네트워크 연결 확인
- Backend 서버가 실행 중인지 확인
- 브라우저 콘솔에서 에러 메시지 확인

## 라이센스

MIT License

## 지원

문제가 발생하거나 기능을 제안하려면 이슈를 등록해주세요.

## 배포 관련 문서

- 📖 [AWS 배포 가이드](./DEPLOYMENT.md) - 상세한 배포 절차 및 문제 해결
- 🐳 Docker Compose 설정 파일
  - `docker-compose.yml` - 개발 환경
  - `docker-compose.prod.yml` - 프로덕션 환경
- 🚀 배포 스크립트
  - `deploy.sh` - Linux/Mac
  - `deploy.bat` - Windows

## 참고 문서

- [FastAPI 문서](https://fastapi.tiangolo.com/)
- [React 문서](https://react.dev/)
- [SQLAlchemy 문서](https://docs.sqlalchemy.org/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Docker 문서](https://docs.docker.com/)
- [AWS EC2 문서](https://docs.aws.amazon.com/ec2/)
