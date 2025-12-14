# 📱 PWA 설치 버튼이 나타나지 않는 문제 해결

## PWA 설치 버튼이 나타나려면 필요한 조건

1. ✅ **HTTPS 또는 localhost** - ngrok은 HTTPS이므로 OK
2. ✅ **manifest.json** - 설정됨
3. ✅ **Service Worker** - vite-plugin-pwa가 자동 생성
4. ⚠️ **아이콘 파일** - 생성 필요 (icon-192.png, icon-512.png)
5. ✅ **start_url** - 설정됨

## 문제 진단

### 1. 브라우저 개발자 도구에서 확인

**Chrome/Edge:**
1. F12 또는 개발자 도구 열기
2. **Application** 탭 클릭
3. 왼쪽 메뉴에서 확인:
   - **Manifest** - 메타데이터 확인
   - **Service Workers** - 등록 상태 확인
   - **Storage** - 캐시 확인

### 2. Manifest 확인

**Application > Manifest**에서:
- ✅ Name: "건설 현장 관리 시스템"
- ✅ Icons: 192x192, 512x512 아이콘 확인
- ⚠️ 아이콘이 빨간색으로 표시되면 파일이 없음

### 3. Service Worker 확인

**Application > Service Workers**에서:
- ✅ Status: activated and is running
- ⚠️ 등록되지 않았다면 빌드 문제

## 해결 방법

### 방법 1: 아이콘 파일 생성 (필수)

아이콘 파일이 실제로 필요합니다. 다음 중 하나를 사용하세요:

#### 온라인 도구 사용
1. https://www.pwabuilder.com/imageGenerator 방문
2. 이미지 업로드 (512x512 권장)
3. 생성된 파일 다운로드
4. `frontend/public/`에 저장:
   - `icon-192.png`
   - `icon-512.png`

#### 간단한 아이콘 생성 (Python)
```python
from PIL import Image, ImageDraw, ImageFont

# 192x192 아이콘
img = Image.new('RGB', (192, 192), color='#3b82f6')
draw = ImageDraw.Draw(img)
# 텍스트 추가 가능
img.save('icon-192.png')

# 512x512 아이콘
img = Image.new('RGB', (512, 512), color='#3b82f6')
img.save('icon-512.png')
```

### 방법 2: 빌드 확인

```bash
# 프론트엔드 재빌드
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

### 방법 3: 브라우저 캐시 삭제

1. 개발자 도구 > **Application** 탭
2. **Clear storage** 클릭
3. **Clear site data** 클릭
4. 페이지 새로고침

### 방법 4: 수동 설치 확인

**Chrome/Edge:**
- 주소창 오른쪽의 설치 아이콘 확인
- 또는 메뉴(⋮) > "앱 설치" 옵션 확인

**수동으로 설치:**
1. 개발자 도구 > **Application** > **Manifest**
2. "Add to homescreen" 버튼 클릭 (있는 경우)

## 빠른 테스트

### 1. Manifest 유효성 검사
```javascript
// 브라우저 콘솔에서 실행
navigator.serviceWorker.getRegistrations().then(console.log);
```

### 2. 설치 가능 여부 확인
```javascript
// 브라우저 콘솔에서 실행
if ('serviceWorker' in navigator) {
  console.log('Service Worker 지원됨');
} else {
  console.log('Service Worker 미지원');
}
```

## 일반적인 문제

### 아이콘 파일이 없음
- **증상**: Manifest에서 아이콘이 빨간색
- **해결**: 실제 PNG 파일 생성 및 추가

### Service Worker가 등록되지 않음
- **증상**: Application > Service Workers에 아무것도 없음
- **해결**: 빌드 확인, 개발자 도구 콘솔에서 에러 확인

### HTTPS가 아님
- **증상**: localhost가 아닌 HTTP 사이트
- **해결**: HTTPS 사용 또는 localhost 사용

### Manifest 오류
- **증상**: Application > Manifest에 오류 표시
- **해결**: manifest.json 문법 확인

## 확인 체크리스트

- [ ] 아이콘 파일 존재 (icon-192.png, icon-512.png)
- [ ] manifest.json이 올바르게 로드됨
- [ ] Service Worker가 등록됨
- [ ] HTTPS 또는 localhost 사용
- [ ] 브라우저 캐시 삭제 후 재시도
- [ ] 개발자 도구에 에러 없음

## 아이콘 파일 생성 스크립트

간단한 아이콘을 생성하려면:

```bash
# ImageMagick 사용 (설치 필요)
convert -size 192x192 xc:#3b82f6 -pointsize 48 -fill white -gravity center -annotate +0+0 "건" icon-192.png
convert -size 512x512 xc:#3b82f6 -pointsize 128 -fill white -gravity center -annotate +0+0 "건" icon-512.png
```

또는 온라인 도구를 사용하세요:
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/

