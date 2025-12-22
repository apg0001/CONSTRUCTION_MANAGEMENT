# PWA 아이콘 생성 가이드

## 문제
EC2 배포 환경에서 PWA 설치 버튼이 표시되지 않는 이유:
1. **HTTPS 필요**: PWA는 HTTPS 또는 localhost에서만 작동
2. **PNG 아이콘 필요**: SVG만으로는 부족, 정사각형 PNG 아이콘 필요
3. **아이콘 크기**: 192x192, 512x512, 96x96 픽셀 필요

## 해결 방법

### 방법 1: 온라인 도구 사용 (가장 쉬움)

1. **PWA Asset Generator** 사용:
   - https://www.pwabuilder.com/imageGenerator 방문
   - `icon.svg` 파일 업로드
   - 생성된 PNG 파일 다운로드
   - `frontend/public/` 폴더에 복사

2. **RealFaviconGenerator** 사용:
   - https://realfavicongenerator.net/ 방문
   - `icon.svg` 업로드
   - 필요한 크기 선택 (192x192, 512x512, 96x96)
   - 다운로드 후 `frontend/public/`에 복사

### 방법 2: ImageMagick 사용 (서버에서)

```bash
# ImageMagick 설치
sudo apt-get install imagemagick -y

# SVG를 PNG로 변환
cd frontend/public
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 512x512 icon-512.png
convert icon.svg -resize 96x96 icon-96.png
```

### 방법 3: Python 스크립트 사용

```python
from PIL import Image
import cairosvg

# SVG를 PNG로 변환
sizes = [96, 192, 512]
for size in sizes:
    cairosvg.svg2png(url='icon.svg', write_to=f'icon-{size}.png', output_width=size, output_height=size)
```

### 방법 4: 간단한 PNG 생성 (HTML Canvas)

`frontend/public/generate-icons.html` 파일을 브라우저에서 열면 자동으로 아이콘을 생성합니다.

## 필요한 파일

생성 후 `frontend/public/` 폴더에 다음 파일들이 있어야 합니다:
- `icon-192.png` (192x192 픽셀)
- `icon-512.png` (512x512 픽셀)
- `icon-96.png` (96x96 픽셀) - 단축키용

## HTTPS 설정 (필수!)

PWA는 HTTPS가 필수입니다. EC2에서 HTTPS를 설정하는 방법:

### Let's Encrypt 사용 (무료)

```bash
# Certbot 설치
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx -y

# 인증서 발급 (도메인이 있는 경우)
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

### Nginx HTTPS 설정

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
    
    # ... 기존 설정 ...
}
```

### DuckDNS 사용 (무료 도메인)

1. https://www.duckdns.org/ 에서 도메인 생성
2. Let's Encrypt로 인증서 발급
3. Nginx 설정 업데이트

## 배포 후 확인

1. **브라우저 개발자 도구**:
   - F12 → Application → Manifest
   - 아이콘이 모두 로드되는지 확인
   - 오류 메시지 확인

2. **Service Worker 확인**:
   - Application → Service Workers
   - 등록 상태 확인

3. **Lighthouse 테스트**:
   - Lighthouse → Progressive Web App
   - PWA 점수 확인

## 문제 해결

### 아이콘이 여전히 로드되지 않음
- 파일이 `frontend/public/`에 있는지 확인
- 빌드 후 `dist/` 폴더에 복사되었는지 확인
- 브라우저 캐시 삭제 후 재시도

### HTTPS 설정이 어려움
- 임시로 ngrok 사용 (개발/테스트용)
- Cloudflare를 통한 무료 HTTPS 프록시 사용

### 설치 버튼이 여전히 안 나옴
- HTTPS가 적용되었는지 확인
- manifest.json이 올바르게 로드되는지 확인
- Service Worker가 등록되었는지 확인

