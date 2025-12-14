#!/bin/bash

# Construction Site Management System - 자동 배포 스크립트
# 모든 설정이 자동으로 처리됩니다!

set -e

echo "🚀 Construction Site Management System 자동 배포 시작..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# 1. 자동 환경 변수 생성
# ============================================
echo -e "${BLUE}📝 환경 변수 자동 설정 중...${NC}"

# EC2 IP 자동 감지
detect_ip() {
    # AWS EC2 메타데이터에서 퍼블릭 IP 가져오기
    if curl -s --max-time 2 http://169.254.169.254/latest/meta-data/public-ipv4 > /dev/null 2>&1; then
        EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
        echo -e "${GREEN}✓ EC2 퍼블릭 IP 자동 감지: ${EC2_IP}${NC}"
    else
        # 로컬 네트워크 IP 감지
        EC2_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
        echo -e "${YELLOW}⚠️  로컬 환경으로 감지됨: ${EC2_IP}${NC}"
    fi
}

detect_ip

# SECRET_KEY 자동 생성
generate_secret_key() {
    if command -v python3 &> /dev/null; then
        python3 -c "import secrets; print(secrets.token_urlsafe(32))"
    elif command -v openssl &> /dev/null; then
        openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
    else
        # 기본값 (프로덕션에서는 변경 권장)
        echo "auto-generated-secret-key-$(date +%s | sha256sum | base64 | head -c 32)"
    fi
}

SECRET_KEY=$(generate_secret_key)
echo -e "${GREEN}✓ SECRET_KEY 자동 생성 완료${NC}"

# .env 파일 자동 생성
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env 파일이 없습니다. 자동으로 생성합니다.${NC}"
    cat > .env << EOF
# 자동 생성된 환경 변수 파일
# 생성 시간: $(date)

# 데이터베이스 설정
DATABASE_URL=sqlite:///./data/test.db

# 보안 설정 (자동 생성됨)
SECRET_KEY=${SECRET_KEY}

# 환경 설정
ENVIRONMENT=production

# CORS 설정 (자동으로 서버 IP 감지)
CORS_ORIGINS=http://${EC2_IP},http://${EC2_IP}:80,http://localhost:80,http://localhost:5173

# JWT 토큰 만료 시간
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend API URL (자동으로 서버 IP 감지)
VITE_API_URL=http://${EC2_IP}:8000
EOF
    echo -e "${GREEN}✓ .env 파일이 자동으로 생성되었습니다.${NC}"
else
    echo -e "${GREEN}✓ 기존 .env 파일을 사용합니다.${NC}"
    # 기존 .env 파일에 누락된 변수 추가
    if ! grep -q "SECRET_KEY=" .env || grep -q "SECRET_KEY=$" .env; then
        echo "SECRET_KEY=${SECRET_KEY}" >> .env
        echo -e "${YELLOW}⚠️  .env 파일에 SECRET_KEY가 추가되었습니다.${NC}"
    fi
    if ! grep -q "CORS_ORIGINS=" .env; then
        echo "CORS_ORIGINS=http://${EC2_IP},http://${EC2_IP}:80,http://localhost:80" >> .env
    fi
    if ! grep -q "VITE_API_URL=" .env; then
        echo "VITE_API_URL=http://${EC2_IP}:8000" >> .env
    fi
fi

# 환경 변수 로드
export $(grep -v '^#' .env | xargs)

# ============================================
# 2. Docker 설치 확인
# ============================================
echo -e "${BLUE}🐳 Docker 확인 중...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker가 설치되어 있지 않습니다.${NC}"
    echo -e "${YELLOW}Docker 자동 설치를 시도합니다...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Docker 설치 완료. 재로그인 후 다시 실행하세요.${NC}"
    exit 0
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker Compose가 없습니다. 설치합니다...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# docker compose (v2) 또는 docker-compose (v1) 확인
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo -e "${RED}✗ Docker Compose를 찾을 수 없습니다.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker 준비 완료${NC}"

# ============================================
# 3. 기존 컨테이너 정리
# ============================================
echo -e "${BLUE}🧹 기존 컨테이너 정리 중...${NC}"
$DOCKER_COMPOSE -f docker-compose.prod.yml down || true

# ============================================
# 4. Docker 이미지 빌드
# ============================================
echo -e "${BLUE}🔨 Docker 이미지 빌드 중...${NC}"
$DOCKER_COMPOSE -f docker-compose.prod.yml build

# ============================================
# 5. 컨테이너 시작
# ============================================
echo -e "${BLUE}🚀 컨테이너 시작 중...${NC}"
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d

# ============================================
# 6. 헬스 체크
# ============================================
echo -e "${BLUE}🏥 서비스 상태 확인 중...${NC}"
sleep 15

# Backend 헬스 체크
if curl -f http://localhost:8000/health > /dev/null 2>&1 || wget --quiet --spider http://localhost:8000/health 2>&1; then
    echo -e "${GREEN}✓ Backend 서비스 정상 실행 중${NC}"
else
    echo -e "${YELLOW}⚠️  Backend 서비스 시작 중... (로그 확인: $DOCKER_COMPOSE -f docker-compose.prod.yml logs backend)${NC}"
fi

# Frontend 헬스 체크
if curl -f http://localhost:80 > /dev/null 2>&1 || wget --quiet --spider http://localhost:80 2>&1; then
    echo -e "${GREEN}✓ Frontend 서비스 정상 실행 중${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend 서비스 시작 중... (로그 확인: $DOCKER_COMPOSE -f docker-compose.prod.yml logs frontend)${NC}"
fi

# ============================================
# 7. 완료 메시지
# ============================================
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ 배포가 완료되었습니다!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 서비스 정보:${NC}"
echo -e "  🌐 Frontend:    ${GREEN}http://${EC2_IP}${NC}"
echo -e "  🔧 Backend API: ${GREEN}http://${EC2_IP}:8000${NC}"
echo -e "  📚 API Docs:    ${GREEN}http://${EC2_IP}:8000/docs${NC}"
echo ""
echo -e "${BLUE}📝 유용한 명령어:${NC}"
echo -e "  로그 확인:     ${YELLOW}$DOCKER_COMPOSE -f docker-compose.prod.yml logs -f${NC}"
echo -e "  서비스 중지:   ${YELLOW}$DOCKER_COMPOSE -f docker-compose.prod.yml down${NC}"
echo -e "  서비스 재시작: ${YELLOW}$DOCKER_COMPOSE -f docker-compose.prod.yml restart${NC}"
echo -e "  컨테이너 상태: ${YELLOW}$DOCKER_COMPOSE -f docker-compose.prod.yml ps${NC}"
echo ""
echo -e "${YELLOW}💡 팁: .env 파일을 수정하여 설정을 변경할 수 있습니다.${NC}"
echo ""
