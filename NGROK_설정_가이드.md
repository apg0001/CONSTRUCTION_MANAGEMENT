# 🌐 ngrok 설정 가이드

## 문제 상황

ngrok으로 80 포트를 열었을 때:
- ✅ 로컬 컴퓨터: 로그인 성공
- ❌ 다른 컴퓨터/모바일: 로그인 실패 (프론트엔드는 나오지만 API 호출 실패)

## 원인

프론트엔드가 `localhost:8000`으로 API를 호출하려고 해서, 다른 기기에서는 접근할 수 없습니다.

## 해결 방법

### 방법 1: ngrok으로 두 포트 모두 열기 (권장)

#### 1. ngrok으로 두 터미널 실행

**터미널 1 - 프론트엔드 (80 포트)**
```bash
ngrok http 80
```

**터미널 2 - 백엔드 (8000 포트)**
```bash
ngrok http 8000
```

#### 2. 환경 변수 설정

`.env` 파일에 ngrok URL 설정:
```bash
# 프론트엔드 ngrok URL
VITE_API_URL=https://your-backend-ngrok-url.ngrok.io
```

#### 3. 재빌드
```bash
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

### 방법 2: Nginx 프록시 사용 (더 나은 방법)

#### 1. nginx.conf 수정

`frontend/nginx.conf`에 API 프록시 추가:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API 프록시
    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 2. 프론트엔드 코드 수정

`frontend/src/lib/storage.ts`에서 상대 경로 사용:
```typescript
// API_URL을 상대 경로로 변경
const API_URL = '/api';
```

#### 3. ngrok으로 하나의 포트만 열기
```bash
ngrok http 80
```

### 방법 3: 런타임 API URL 감지 (현재 구현됨)

코드가 이미 수정되어 있어서, 같은 호스트의 8000 포트를 자동으로 감지합니다.

**하지만 ngrok을 사용하는 경우:**
- 프론트엔드: `https://abc123.ngrok.io` (80 포트)
- 백엔드도 같은 ngrok URL의 8000 포트로 접근 가능해야 함

## 추천 설정 (ngrok)

### 옵션 A: 두 개의 ngrok 터널

```bash
# 터미널 1
ngrok http 80
# URL: https://abc123.ngrok.io

# 터미널 2  
ngrok http 8000
# URL: https://def456.ngrok.io
```

`.env` 파일:
```bash
VITE_API_URL=https://def456.ngrok.io
```

### 옵션 B: Nginx 프록시 (더 간단)

1. `frontend/nginx.conf`에 `/api` 프록시 추가 (이미 있음)
2. `frontend/src/lib/storage.ts`에서 상대 경로 사용
3. 하나의 ngrok 터널만 사용

```bash
ngrok http 80
```

## 빠른 해결 (임시)

### 즉시 테스트하려면:

1. **백엔드 ngrok URL 확인**
   ```bash
   ngrok http 8000
   # 예: https://def456.ngrok.io
   ```

2. **프론트엔드 코드에서 직접 수정** (임시)
   ```typescript
   // frontend/src/lib/storage.ts
   const API_URL = 'https://your-backend-ngrok-url.ngrok.io';
   ```

3. **재빌드**
   ```bash
   docker-compose -f docker-compose.prod.yml build frontend
   docker-compose -f docker-compose.prod.yml up -d frontend
   ```

## 확인 방법

1. 브라우저 개발자 도구 > Network 탭
2. 로그인 시도
3. API 요청 URL 확인
   - ❌ `http://localhost:8000/auth/login` → 실패
   - ✅ `https://your-ngrok-url.ngrok.io/auth/login` → 성공

## 최종 권장 사항

**프로덕션 환경에서는 Nginx 프록시를 사용하세요:**

1. 모든 요청이 같은 도메인으로
2. CORS 문제 없음
3. 하나의 ngrok 터널만 필요
4. 더 안전함

