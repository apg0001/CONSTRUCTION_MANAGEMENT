# 🐳 Docker 문제 해결 가이드

## Windows에서 Docker Desktop이 실행되지 않는 경우

### 오류 메시지
```
unable to get image: error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/images/...": open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

### 해결 방법

#### 1. Docker Desktop 실행 확인
- Windows 시작 메뉴에서 **Docker Desktop** 검색 후 실행
- 시스템 트레이에서 Docker 아이콘 확인 (고래 아이콘)
- Docker Desktop이 완전히 시작될 때까지 대기 (보통 1-2분)

#### 2. Docker Desktop 설치 확인
Docker Desktop이 설치되어 있지 않은 경우:
1. [Docker Desktop 다운로드](https://www.docker.com/products/docker-desktop/)
2. 설치 후 재부팅
3. Docker Desktop 실행

#### 3. Docker 서비스 상태 확인
```powershell
# PowerShell에서 실행
Get-Service docker

# 서비스가 중지되어 있으면 시작
Start-Service docker
```

#### 4. WSL 2 확인 (Windows)
Docker Desktop은 WSL 2를 사용합니다:
```powershell
# WSL 2 설치 확인
wsl --list --verbose

# WSL 2가 없으면 설치
wsl --install
```

### 확인 방법

```bash
# Docker가 정상 작동하는지 확인
docker --version
docker ps

# Docker Compose 확인
docker-compose --version
```

정상적으로 작동하면 다음이 표시됩니다:
```
Docker version 24.x.x
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

## Linux/Mac에서 Docker 문제

### Docker가 설치되지 않은 경우

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

**Mac:**
- [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) 다운로드 및 설치

### 권한 문제

```bash
# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
newgrp docker

# 또는 sudo 사용
sudo docker-compose -f docker-compose.prod.yml up -d
```

## 일반적인 문제

### 포트가 이미 사용 중

```bash
# Windows
netstat -ano | findstr :80
netstat -ano | findstr :8000

# Linux/Mac
sudo lsof -i :80
sudo lsof -i :8000

# 프로세스 종료 후 다시 시도
```

### 이미지 빌드 실패

```bash
# 캐시 없이 재빌드
docker-compose -f docker-compose.prod.yml build --no-cache

# 기존 이미지 삭제 후 재빌드
docker-compose -f docker-compose.prod.yml down
docker system prune -a
docker-compose -f docker-compose.prod.yml build
```

### 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker-compose -f docker-compose.prod.yml logs

# 컨테이너 상태 확인
docker-compose -f docker-compose.prod.yml ps -a

# 재시작
docker-compose -f docker-compose.prod.yml restart
```

## 빠른 체크리스트

- [ ] Docker Desktop 실행 중 (Windows/Mac)
- [ ] Docker 서비스 실행 중 (Linux)
- [ ] `docker --version` 명령어 작동
- [ ] `docker ps` 명령어 작동
- [ ] 필요한 포트(80, 8000) 사용 가능
- [ ] 충분한 디스크 공간 (최소 5GB)

## 추가 도움말

문제가 계속되면:
1. Docker Desktop 재시작
2. 컴퓨터 재부팅
3. Docker Desktop 재설치
4. [Docker 공식 문서](https://docs.docker.com/get-started/troubleshooting/) 참고


