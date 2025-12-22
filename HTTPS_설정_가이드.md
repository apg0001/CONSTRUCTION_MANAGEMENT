# HTTPS 설정 가이드 - 포트 충돌 해결

## 문제
포트 80이 이미 사용 중이라는 오류가 발생합니다. certbot이 시스템 nginx를 설치하고 실행했을 가능성이 높습니다.

## 해결 방법

### 방법 1: 시스템 nginx 중지 및 Docker 사용 (권장)

#### 1. 시스템 nginx 중지
```bash
# nginx 상태 확인
sudo systemctl status nginx

# nginx 중지
sudo systemctl stop nginx
sudo systemctl disable nginx

# 포트 80 사용 확인
sudo lsof -i :80
# 또는
sudo netstat -tulpn | grep :80
```

#### 2. Docker 컨테이너 재시작
```bash
cd ~/CONSTRUCTION_MANAGEMENT
sudo docker-compose -f docker-compose.prod.yml down
sudo docker-compose -f docker-compose.prod.yml up -d
```

### 방법 2: 외부 nginx를 리버스 프록시로 사용 (더 나은 방법)

이 방법은 외부 nginx가 HTTPS를 처리하고, Docker 컨테이너는 내부 포트만 사용합니다.

#### 1. docker-compose.prod.yml 수정

포트 매핑을 제거하고 내부 네트워크만 사용:

```yaml
frontend:
  # ... 기존 설정 ...
  ports:
    - "8080:80"  # 외부 포트를 8080으로 변경 (임시)
  # 또는 포트 매핑 제거하고 외부 nginx가 프록시하도록
```

#### 2. 외부 nginx 설정

`/etc/nginx/sites-available/construction` 파일 생성:

```nginx
# HTTP to HTTPS 리다이렉트
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 서버
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL 인증서 (certbot이 생성한 경로)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 프론트엔드 프록시
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 백엔드 API 프록시
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 3. nginx 설정 활성화
```bash
sudo ln -s /etc/nginx/sites-available/construction /etc/nginx/sites-enabled/
sudo nginx -t  # 설정 테스트
sudo systemctl reload nginx
```

### 방법 3: Docker 컨테이너 내부에서 HTTPS 처리

Docker 컨테이너 내부 nginx가 HTTPS를 직접 처리하도록 설정합니다.

#### 1. 인증서를 Docker 볼륨으로 마운트
```yaml
frontend:
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
    - ./frontend/nginx-ssl.conf:/etc/nginx/conf.d/default.conf
  ports:
    - "443:443"
```

#### 2. nginx-ssl.conf 생성
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # ... 기존 nginx.conf 내용 ...
}
```

## 빠른 해결 (권장)

가장 간단한 방법:

```bash
# 1. 시스템 nginx 중지
sudo systemctl stop nginx
sudo systemctl disable nginx

# 2. 포트 80 사용 중인 프로세스 확인 및 종료
sudo lsof -i :80
# PID 확인 후
sudo kill -9 <PID>

# 3. Docker 컨테이너 재시작
cd ~/CONSTRUCTION_MANAGEMENT
sudo docker-compose -f docker-compose.prod.yml down
sudo docker-compose -f docker-compose.prod.yml up -d

# 4. HTTPS는 나중에 설정 (일단 HTTP로 작동 확인)
```

## HTTPS 설정 (나중에)

Docker가 정상 작동한 후:

### 옵션 A: 외부 nginx 사용
- 위의 "방법 2" 참고

### 옵션 B: Docker 내부에서 HTTPS
- 위의 "방법 3" 참고

### 옵션 C: Cloudflare 사용 (가장 쉬움)
- Cloudflare에서 무료 SSL 사용
- DNS만 Cloudflare로 변경
- 자동 HTTPS 처리

