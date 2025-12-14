# AWS 배포 가이드

이 가이드는 Construction Site Management System을 AWS EC2에 배포하는 방법을 설명합니다.

## 📋 전제 조건

1. AWS 계정
2. EC2 인스턴스 (Ubuntu 22.04 LTS 권장)
3. Docker 및 Docker Compose 설치
4. 도메인 (선택사항)

## ⚡ 초간단 배포 (1분 - 완전 자동화!)

**가장 빠른 방법**:
```bash
# EC2 접속 후
git clone <your-repo> && cd <project-directory>
chmod +x deploy.sh && ./deploy.sh
```

**끝입니다!** 모든 설정이 자동으로 처리됩니다:
- ✅ 환경 변수 자동 생성
- ✅ SECRET_KEY 자동 생성
- ✅ EC2 IP 자동 감지
- ✅ Docker 자동 설치

자세한 내용은 아래를 참고하세요.

---

## 🚀 빠른 배포 (5분 안에 완료)

### 1단계: EC2 인스턴스 준비

#### EC2 인스턴스 생성
1. AWS 콘솔에서 EC2 인스턴스 생성
2. **AMI**: Ubuntu Server 22.04 LTS 선택
3. **인스턴스 타입**: t3.small 이상 권장 (최소 t2.micro)
4. **보안 그룹 설정**:
   - 인바운드 규칙:
     - SSH (22): 내 IP
     - HTTP (80): 0.0.0.0/0
     - Custom TCP (8000): 0.0.0.0/0 (또는 내부 네트워크만)
5. 키 페어 생성 및 다운로드

#### EC2 인스턴스 접속
```bash
# Windows (PowerShell)
ssh -i your-key.pem ubuntu@your-ec2-ip

# Linux/Mac
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2단계: 시스템 업데이트 및 Docker 설치

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 재로그인 또는 다음 명령 실행
newgrp docker

# 설치 확인
docker --version
docker-compose --version
```

### 3단계: 프로젝트 배포 (완전 자동!)

#### 프로젝트 클론 또는 업로드
```bash
# Git을 사용하는 경우
git clone <your-repo-url>
cd <project-directory>

# 또는 SCP로 파일 업로드 (로컬에서 실행)
# scp -r -i your-key.pem ./workspace ubuntu@your-ec2-ip:~/
```

#### 배포 실행 (자동 설정!)

**방법 1: 자동 배포 스크립트 (권장)**
```bash
# 배포 스크립트 실행 권한 부여
chmod +x deploy.sh

# 배포 실행 - 모든 설정이 자동으로 처리됩니다!
./deploy.sh
```

스크립트가 자동으로 처리하는 것들:
- ✅ `.env` 파일 자동 생성 (없는 경우)
- ✅ `SECRET_KEY` 자동 생성
- ✅ EC2 IP 자동 감지 및 설정
- ✅ Docker 자동 설치 (필요시)
- ✅ 모든 서비스 자동 시작

**방법 2: Docker Compose 직접 실행**
```bash
# .env 파일 없이도 기본값으로 작동합니다!
docker-compose -f docker-compose.prod.yml up -d
```

**방법 3: 수동 설정 (선택사항)**
```bash
# .env 파일 수정 (원하는 경우만)
nano .env

# Docker Compose로 빌드 및 실행
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f
```

### 4단계: 방화벽 설정 (UFW)

```bash
# UFW 활성화
sudo ufw enable

# 필요한 포트 열기
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 8000/tcp # Backend API (선택사항, 내부 네트워크만 접근 가능하게 설정 권장)

# 상태 확인
sudo ufw status
```

### 5단계: 서비스 확인

```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose.prod.yml ps

# 헬스 체크
curl http://localhost:8000/health
curl http://localhost:80

# 로그 확인
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
```

브라우저에서 접속:
- Frontend: `http://your-ec2-ip` 또는 `http://your-domain.com`
- Backend API: `http://your-ec2-ip:8000`
- API 문서: `http://your-ec2-ip:8000/docs`

## 🔧 고급 설정

### 도메인 연결 (선택사항)

#### Route 53을 사용하는 경우
1. Route 53에서 호스팅 영역 생성
2. A 레코드 추가: `your-domain.com` → EC2 IP
3. `.env` 파일의 `CORS_ORIGINS`와 `VITE_API_URL` 업데이트
4. 서비스 재시작: `docker-compose -f docker-compose.prod.yml restart`

#### Nginx 리버스 프록시 설정 (선택사항)

외부 Nginx를 사용하여 80 포트로 모든 요청을 처리:

```nginx
# /etc/nginx/sites-available/construction
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### SSL/TLS 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

### 자동 재시작 설정 (systemd)

서버 재부팅 시 자동으로 서비스가 시작되도록 설정:

```bash
# 서비스 파일 생성
sudo nano /etc/systemd/system/construction.service
```

파일 내용:
```ini
[Unit]
Description=Construction Site Management System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/your-project-directory
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

서비스 활성화:
```bash
sudo systemctl daemon-reload
sudo systemctl enable construction.service
sudo systemctl start construction.service
```

## 📊 모니터링 및 로그

### 로그 확인
```bash
# 모든 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# 최근 100줄만 보기
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### 리소스 사용량 확인
```bash
# 컨테이너 리소스 사용량
docker stats

# 디스크 사용량
df -h
docker system df
```

## 🔄 업데이트 및 유지보수

### 코드 업데이트
```bash
# 1. 최신 코드 가져오기
git pull origin main

# 2. 서비스 중지
docker-compose -f docker-compose.prod.yml down

# 3. 이미지 재빌드
docker-compose -f docker-compose.prod.yml build --no-cache

# 4. 서비스 재시작
docker-compose -f docker-compose.prod.yml up -d

# 5. 로그 확인
docker-compose -f docker-compose.prod.yml logs -f
```

### 데이터베이스 백업
```bash
# SQLite 데이터베이스 백업
docker-compose -f docker-compose.prod.yml exec backend cp /app/data/test.db /app/data/test.db.backup

# 또는 호스트로 복사
docker cp construction-backend:/app/data/test.db ./backup/test.db.$(date +%Y%m%d_%H%M%S).db
```

### 서비스 재시작
```bash
# 전체 재시작
docker-compose -f docker-compose.prod.yml restart

# 특정 서비스만 재시작
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart frontend
```

## 🐛 문제 해결

### 포트가 이미 사용 중인 경우
```bash
# 포트 사용 확인
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :8000

# 프로세스 종료
sudo kill -9 <PID>
```

### 컨테이너가 시작되지 않는 경우
```bash
# 로그 확인
docker-compose -f docker-compose.prod.yml logs

# 컨테이너 상태 확인
docker-compose -f docker-compose.prod.yml ps -a

# 컨테이너 재생성
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

### 메모리 부족 문제
```bash
# Docker 시스템 정리
docker system prune -a

# 사용하지 않는 볼륨 삭제
docker volume prune
```

## 🔒 보안 권장사항

1. **SECRET_KEY**: 반드시 강력한 랜덤 문자열 사용
2. **방화벽**: 필요한 포트만 열기
3. **SSH 키**: 비밀번호 인증 비활성화
4. **정기 업데이트**: 시스템 및 Docker 이미지 정기 업데이트
5. **백업**: 데이터베이스 정기 백업
6. **모니터링**: CloudWatch 또는 다른 모니터링 도구 사용

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 로그 파일: `docker-compose -f docker-compose.prod.yml logs`
2. 컨테이너 상태: `docker-compose -f docker-compose.prod.yml ps`
3. 시스템 리소스: `docker stats`, `htop`

