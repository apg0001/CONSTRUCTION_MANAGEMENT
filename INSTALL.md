# 📦 설치 및 실행 가이드

## 🚀 가장 빠른 방법 (권장)

### AWS EC2에서

```bash
# 1. 프로젝트 가져오기
git clone <your-repo> && cd <project-directory>

# 2. 실행 (끝!)
chmod +x deploy.sh && ./deploy.sh
```

**모든 설정이 자동으로 처리됩니다!**

## 📋 자동으로 처리되는 것들

1. **환경 변수 (.env)**
   - 파일이 없으면 자동 생성
   - SECRET_KEY 자동 생성
   - EC2 IP 자동 감지

2. **Docker**
   - 없으면 자동 설치
   - Docker Compose 자동 설치

3. **서비스**
   - Backend 자동 빌드 및 시작
   - Frontend 자동 빌드 및 시작

## 🎯 실행 방법

### 방법 1: 자동 배포 스크립트 (가장 쉬움)

**Linux/Mac:**
```bash
./deploy.sh
```

**Windows:**
```bash
deploy.bat
```

**또는 더 간단하게:**
```bash
./start.sh      # Linux/Mac
start.bat       # Windows (더블클릭)
```

### 방법 2: Docker Compose 직접 실행

```bash
# .env 파일 없이도 작동합니다!
docker-compose -f docker-compose.prod.yml up -d
```

### 방법 3: 수동 설정 (선택사항)

```bash
# 1. 환경 변수 설정 (원하는 경우만)
cp .env.example .env
nano .env

# 2. 실행
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 시스템 요구사항

- **OS**: Ubuntu 22.04 LTS (권장) 또는 Linux/Mac/Windows
- **Docker**: 자동 설치됨 (없는 경우)
- **메모리**: 최소 2GB (권장 4GB)
- **디스크**: 최소 5GB

## 📍 접속 주소

배포 후 자동으로 표시됩니다:

- **Frontend**: `http://your-server-ip`
- **Backend API**: `http://your-server-ip:8000`
- **API Docs**: `http://your-server-ip:8000/docs`

## 🐛 문제 해결

### Docker가 없으면?

스크립트가 자동으로 설치를 시도합니다. 실패하면:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 포트가 사용 중이면?

```bash
# 기존 컨테이너 중지
docker-compose -f docker-compose.prod.yml down

# 다시 시작
./deploy.sh
```

### 로그 확인

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

## ✅ 확인

배포가 완료되면:

```bash
# 컨테이너 상태
docker-compose -f docker-compose.prod.yml ps

# 헬스 체크
curl http://localhost:8000/health
curl http://localhost:80
```

## 💡 팁

1. **첫 실행**: 스크립트가 모든 것을 자동 설정
2. **재실행**: 기존 설정 유지하면서 재배포
3. **설정 변경**: `.env` 파일 수정 후 재배포

## 📚 더 자세한 정보

- [완전 자동 배포 가이드](./README_DEPLOY.md)
- [상세 배포 가이드](./DEPLOYMENT.md)
- [빠른 시작](./QUICK_START.md)

