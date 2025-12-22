#!/bin/bash
# Docker 내부 nginx에서 HTTPS 설정 스크립트

echo "Docker 내부 nginx HTTPS 설정 중..."

# 도메인 확인
if [ -z "$1" ]; then
    echo "사용법: ./setup-https-docker.sh your-domain.com"
    exit 1
fi

DOMAIN=$1

# 1. 인증서 발급 (아직 없다면)
echo "1. SSL 인증서 확인 중..."
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "인증서가 없습니다. 발급 중..."
    sudo certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
else
    echo "✅ 인증서가 이미 있습니다."
fi

# 2. nginx-ssl.conf에서 도메인 교체
echo "2. nginx 설정 파일 업데이트 중..."
sed "s/YOUR_DOMAIN/$DOMAIN/g" frontend/nginx-ssl.conf > frontend/nginx-ssl-temp.conf
mv frontend/nginx-ssl-temp.conf frontend/nginx-ssl.conf

# 3. docker-compose.prod.yml에서 SSL 설정 활성화
echo "3. docker-compose.prod.yml 업데이트 중..."
# nginx-ssl.conf 볼륨 마운트 주석 해제 필요 (수동으로 해야 함)

# 4. 기존 컨테이너 중지
echo "4. 기존 컨테이너 중지 중..."
cd ~/CONSTRUCTION_MANAGEMENT
sudo docker-compose -f docker-compose.prod.yml down

# 5. 시스템 nginx 중지 (포트 충돌 방지)
echo "5. 시스템 nginx 중지 중..."
sudo systemctl stop nginx 2>/dev/null
sudo systemctl disable nginx 2>/dev/null

# 6. 포트 80, 443 확인
echo "6. 포트 확인 중..."
sudo lsof -t -i:80 | xargs sudo kill -9 2>/dev/null
sudo lsof -t -i:443 | xargs sudo kill -9 2>/dev/null

# 7. 컨테이너 재시작
echo "7. 컨테이너 재시작 중..."
echo ""
echo "⚠️  중요: docker-compose.prod.yml에서 다음 줄의 주석을 해제하세요:"
echo "   - ./frontend/nginx-ssl.conf:/etc/nginx/conf.d/default.conf:ro"
echo ""
read -p "주석을 해제하셨나요? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo docker-compose -f docker-compose.prod.yml up -d
    echo ""
    echo "✅ 설정 완료!"
    echo "HTTPS 접속: https://$DOMAIN"
else
    echo "docker-compose.prod.yml을 수정한 후 다음 명령을 실행하세요:"
    echo "  sudo docker-compose -f docker-compose.prod.yml up -d"
fi

