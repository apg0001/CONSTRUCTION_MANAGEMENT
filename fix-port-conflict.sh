#!/bin/bash
# 포트 충돌 해결 스크립트

echo "포트 80 충돌 해결 중..."

# 1. 시스템 nginx 중지
echo "1. 시스템 nginx 중지 중..."
sudo systemctl stop nginx 2>/dev/null
sudo systemctl disable nginx 2>/dev/null

# 2. 포트 80 사용 중인 프로세스 확인
echo "2. 포트 80 사용 중인 프로세스 확인 중..."
PID=$(sudo lsof -t -i:80 2>/dev/null)

if [ ! -z "$PID" ]; then
    echo "포트 80을 사용 중인 프로세스 발견: PID $PID"
    echo "프로세스 종료 중..."
    sudo kill -9 $PID 2>/dev/null
    sleep 2
fi

# 3. Docker 컨테이너 중지
echo "3. 기존 Docker 컨테이너 중지 중..."
cd ~/CONSTRUCTION_MANAGEMENT
sudo docker-compose -f docker-compose.prod.yml down

# 4. 포트 확인
echo "4. 포트 80 상태 확인 중..."
if sudo lsof -t -i:80 > /dev/null 2>&1; then
    echo "⚠️  경고: 포트 80이 여전히 사용 중입니다."
    echo "수동으로 확인하세요: sudo lsof -i :80"
else
    echo "✅ 포트 80이 사용 가능합니다."
fi

# 5. Docker 컨테이너 시작
echo "5. Docker 컨테이너 시작 중..."
sudo docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "완료! 다음 명령으로 상태를 확인하세요:"
echo "  sudo docker-compose -f docker-compose.prod.yml ps"
echo "  curl http://localhost"

