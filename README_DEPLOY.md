# 🚀 완전 자동 배포 가이드

이제 **설정 없이 바로 실행**할 수 있습니다!

## ⚡ 가장 빠른 방법 (1분)

### AWS EC2에서

```bash
# 1. 프로젝트 클론 또는 업로드
git clone <your-repo>
cd <project-directory>

# 2. 배포 스크립트 실행 (끝!)
chmod +x deploy.sh
./deploy.sh
```

**끝입니다!** 모든 설정이 자동으로 처리됩니다:
- ✅ 환경 변수 자동 생성
- ✅ SECRET_KEY 자동 생성
- ✅ EC2 IP 자동 감지
- ✅ Docker 자동 설치 (필요시)
- ✅ 모든 서비스 자동 시작

### 로컬에서 (Windows)

```bash
# 더블클릭 또는
start.bat
```

### 로컬에서 (Linux/Mac)

```bash
chmod +x start.sh
./start.sh
```

## 📋 자동으로 처리되는 것들

1. **환경 변수 (.env 파일)**
   - 없으면 자동 생성
   - SECRET_KEY 자동 생성
   - EC2 IP 자동 감지 및 설정

2. **Docker 설치**
   - 없으면 자동 설치 시도
   - Docker Compose 자동 설치

3. **서비스 시작**
   - Backend 자동 빌드 및 시작
   - Frontend 자동 빌드 및 시작
   - 헬스 체크 자동 실행

## 🎯 실행 방법

### 방법 1: 스크립트 사용 (권장)

```bash
./deploy.sh          # Linux/Mac
deploy.bat           # Windows
```

### 방법 2: Docker Compose 직접 실행

```bash
# .env 파일 없이도 작동합니다!
docker-compose -f docker-compose.prod.yml up -d
```

### 방법 3: 한 줄 명령어

```bash
# EC2에서 바로 실행
git clone <repo> && cd <dir> && chmod +x deploy.sh && ./deploy.sh
```

## 🔧 수동 설정이 필요한 경우

대부분의 경우 자동 설정으로 충분하지만, 필요시 `.env` 파일을 수정할 수 있습니다:

```bash
nano .env
```

주요 설정:
- `SECRET_KEY`: 보안 키 (자동 생성됨)
- `CORS_ORIGINS`: 허용된 도메인 (자동 감지됨)
- `VITE_API_URL`: Frontend가 사용할 API URL (자동 감지됨)

## 📍 접속 주소

배포 후 자동으로 표시됩니다:

```
🌐 Frontend:    http://your-ec2-ip
🔧 Backend API: http://your-ec2-ip:8000
📚 API Docs:    http://your-ec2-ip:8000/docs
```

## 🐛 문제 해결

### 포트가 이미 사용 중

```bash
# 포트 확인
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :8000

# 기존 컨테이너 중지
docker-compose -f docker-compose.prod.yml down
```

### 로그 확인

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### 재배포

```bash
./deploy.sh  # 다시 실행하면 자동으로 재배포됩니다
```

## 💡 팁

1. **첫 실행**: 스크립트가 모든 것을 자동으로 설정합니다
2. **재실행**: 기존 설정을 유지하면서 재배포합니다
3. **설정 변경**: `.env` 파일을 수정하고 재배포하면 됩니다

## ✅ 확인 사항

배포 후 다음을 확인하세요:

```bash
# 컨테이너 상태
docker-compose -f docker-compose.prod.yml ps

# 서비스 헬스 체크
curl http://localhost:8000/health
curl http://localhost:80
```

모두 정상이면 배포 완료! 🎉

