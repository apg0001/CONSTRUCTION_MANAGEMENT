# Frontend - Backend 연동 설정 완료

## ✅ 연동 상태

### Frontend 변경사항
- ✅ `storage.ts` - Backend API 호출로 변경
- ✅ `auth.tsx` - Async/await 처리 추가
- ✅ `Login.tsx` - API 기반 로그인 처리
- ✅ `Dashboard.tsx` - API 연동 표시
- ✅ `WorkRecord.tsx` - Async 함수로 변경
- ✅ `.env` 파일 생성 - `VITE_API_URL=http://localhost:8000`

### Backend 변경사항
- ✅ `auth.py` - User 모델 쿼리 수정
- ✅ `init_data.py` - 초기 사용자 데이터 생성
- ✅ `main.py` - 초기화 로직 추가

## 🚀 실행 방법

### 1. Backend 시작
```bash
cd backend
python main.py
```

- 서버: `http://localhost:8000`
- API 문서: `http://localhost:8000/docs`

### 2. Frontend 시작 (다른 터미널)
```bash
cd frontend
pnpm dev
```

- 앱: `http://localhost:5173`

## 📋 로그인 테스트

### 관리자
- 이메일: `ys26k`
- 비밀번호: `ys7502!@02`

### 팀 매니저
- team1 / team1
- team2 / team2
- team3 / team3

## 🔄 API 호출 흐름

### 로그인 예시
1. Frontend: 사용자 입력 (ys26k / ys7502!@02)
2. Frontend → Backend: `POST /auth/login` 요청
3. Backend: 비밀번호 검증, JWT 토큰 생성
4. Backend → Frontend: 토큰 + 사용자 정보 반환
5. Frontend: localStorage에 토큰 저장
6. 이후 API 호청시 Authorization 헤더에 토큰 포함

### 공수 기록 조회 예시
1. Frontend: 날짜 + 팀 ID 선택
2. Frontend → Backend: `GET /work-records?team_id=...&work_date=...` (Authorization 헤더 포함)
3. Backend: 데이터베이스 조회
4. Backend → Frontend: JSON 데이터 반환
5. Frontend: UI 렌더링

## 📊 데이터 저장

- **전체 데이터**: SQLite 데이터베이스 (`backend/test.db`)
- **로그인 토큰**: Frontend localStorage
- **사용자 정보**: Frontend localStorage (현재 로그인 사용자)

## ⚠️ 주요 기능

### 구현됨
- ✅ 사용자 인증 (로그인)
- ✅ JWT 토큰 기반 인증
- ✅ 팀 조회
- ✅ 작업자 조회/추가/삭제
- ✅ 공수 기록 CRUD
- ✅ 장비 기록 CRUD

### 추가 구현 필요
- ⚠️ 공수 기록 수정 (Backend 및 Frontend)
- ⚠️ 장비 기록 수정 (Backend 및 Frontend)
- ⚠️ 월별 리포트 API (Backend)
- ⚠️ 작업자 관리 페이지 (Frontend)

## 🔧 환경변수

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

### Backend (.env)
```
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your-secret-key-change-this-in-production
```

## 🐛 문제 해결

### 1. CORS 오류
- Backend의 CORS 설정 확인 (main.py)
- 현재 모든 origin 허용 설정됨

### 2. 로그인 실패
- Backend 실행 확인
- 사용자 데이터 초기화 확인 (test.db 파일)

### 3. 토큰 만료
- 현재 30분 후 토큰 만료
- 새로 로그인 필요

## 📝 다음 단계

1. 월별 리포트 API 구현
2. 공수 기록/장비 기록 수정 기능 추가
3. 작업자 관리 페이지 구현
4. 오류 처리 강화
5. 로딩 상태 UI 개선
