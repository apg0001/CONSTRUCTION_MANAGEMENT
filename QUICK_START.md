# 🚀 빠른 시작 가이드 - AWS 배포

이 가이드는 AWS EC2에 5분 안에 배포하는 방법을 설명합니다.

## 1단계: EC2 인스턴스 생성 (2분)

1. AWS 콘솔 → EC2 → 인스턴스 시작
2. 설정:
   - **이름**: construction-site-management
   - **AMI**: Ubuntu Server 22.04 LTS
   - **인스턴스 타입**: t3.small (또는 t2.micro)
   - **키 페어**: 새로 생성 또는 기존 사용
   - **보안 그룹**: 
     - SSH (22) - 내 IP
     - HTTP (80) - 모든 위치 (0.0.0.0/0)
     - Custom TCP (8000) - 모든 위치 (0.0.0.0/0)
3. 인스턴스 시작

## 2단계: EC2 접속 및 Docker 설치 (1분)

```bash
# EC2 접속 (Windows PowerShell)
ssh -i your-key.pem ubuntu@your-ec2-ip

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker $USER
newgrp docker
```

## 3단계: 프로젝트 업로드 (1분)

### 방법 1: Git 사용 (권장)
```bash
git clone <your-repo-url>
cd <project-directory>
```

### 방법 2: SCP로 업로드 (로컬에서 실행)
```bash
# 로컬 컴퓨터에서
scp -r -i your-key.pem ./workspace ubuntu@your-ec2-ip:~/
ssh -i your-key.pem ubuntu@your-ec2-ip
cd workspace
```

## 4단계: 배포 실행 (1분 - 완전 자동!)

```bash
# 배포 스크립트 실행 (모든 설정 자동 처리!)
chmod +x deploy.sh
./deploy.sh
```

**끝입니다!** 🎉 

스크립트가 자동으로 처리합니다:
- ✅ 환경 변수 파일 자동 생성
- ✅ SECRET_KEY 자동 생성
- ✅ EC2 IP 자동 감지 및 설정
- ✅ Docker 자동 설치 (필요시)
- ✅ 모든 서비스 자동 시작

**또는 Docker Compose만 실행해도 됩니다:**
```bash
# .env 파일 없이도 기본값으로 작동!
docker-compose -f docker-compose.prod.yml up -d
```

## 5단계: 접속 확인 ✅

브라우저에서 접속:
- **Frontend**: `http://your-ec2-ip`
- **Backend API**: `http://your-ec2-ip:8000`
- **API 문서**: `http://your-ec2-ip:8000/docs`

## 🎉 완료!

이제 시스템이 실행 중입니다!

### 유용한 명령어

```bash
# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f

# 서비스 재시작
docker-compose -f docker-compose.prod.yml restart

# 서비스 중지
docker-compose -f docker-compose.prod.yml down

# 상태 확인
docker-compose -f docker-compose.prod.yml ps
```

## 문제 해결

### 포트가 열리지 않는 경우
```bash
# 방화벽 확인
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 8000/tcp
```

### 컨테이너가 시작되지 않는 경우
```bash
# 로그 확인
docker-compose -f docker-compose.prod.yml logs

# 재빌드
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

자세한 내용은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

