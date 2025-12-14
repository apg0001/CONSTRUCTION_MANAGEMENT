# ✅ PWA 설치 버튼 체크리스트

## 🔍 현재 상태 확인

### 1. 브라우저 개발자 도구에서 확인

**Chrome/Edge:**
1. F12 또는 개발자 도구 열기
2. **Application** 탭 클릭
3. 왼쪽 메뉴 확인:

#### Manifest 확인
- **Application > Manifest** 클릭
- ✅ Name: "건설 현장 관리 시스템"
- ⚠️ Icons: 아이콘이 빨간색이면 파일 없음
- ✅ Start URL: "/"
- ✅ Display: "standalone"

#### Service Workers 확인
- **Application > Service Workers** 클릭
- ✅ Status: "activated and is running" (녹색)
- ❌ 아무것도 없으면 Service Worker 미등록

### 2. 설치 버튼 위치

**Chrome/Edge:**
- 주소창 오른쪽의 설치 아이콘 (📥)
- 또는 메뉴(⋮) > "앱 설치" 또는 "앱으로 설치"

## 🐛 문제 해결

### 문제 1: 아이콘 파일이 없음

**증상**: Manifest에서 아이콘이 빨간색으로 표시

**해결**:
1. `frontend/public/generate-icons.html` 파일을 브라우저에서 열기
2. "아이콘 생성 및 다운로드" 버튼 클릭
3. 다운로드된 `icon-192.png`, `icon-512.png`를 `frontend/public/`에 저장
4. 재빌드

또는 온라인 도구 사용:
- https://www.pwabuilder.com/imageGenerator

### 문제 2: Service Worker가 등록되지 않음

**증상**: Application > Service Workers에 아무것도 없음

**해결**:
1. 개발자 도구 > Console에서 에러 확인
2. 프론트엔드 재빌드:
   ```bash
   docker-compose -f docker-compose.prod.yml build frontend
   docker-compose -f docker-compose.prod.yml up -d frontend
   ```
3. 브라우저 캐시 삭제 후 재시도

### 문제 3: HTTPS가 아님

**증상**: HTTP 사이트 (localhost 제외)

**해결**: 
- ngrok 사용 시 자동으로 HTTPS
- 또는 localhost 사용

### 문제 4: Manifest 오류

**증상**: Application > Manifest에 오류 표시

**해결**:
- `frontend/public/manifest.json` 문법 확인
- 아이콘 경로 확인

## ✅ 빠른 확인 방법

브라우저 콘솔에서 실행:

```javascript
// Service Worker 확인
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
  if (regs.length === 0) {
    console.error('Service Worker가 등록되지 않았습니다!');
  } else {
    console.log('✅ Service Worker 등록됨');
  }
});

// Manifest 확인
fetch('/manifest.json')
  .then(r => r.json())
  .then(m => {
    console.log('Manifest:', m);
    if (!m.icons || m.icons.length === 0) {
      console.error('⚠️ 아이콘이 없습니다!');
    } else {
      console.log('✅ Manifest 정상');
    }
  });
```

## 📋 최종 체크리스트

- [ ] `icon-192.png` 파일이 `frontend/public/`에 있음
- [ ] `icon-512.png` 파일이 `frontend/public/`에 있음
- [ ] 브라우저에서 `/icon-192.png` 접속 시 이미지 표시
- [ ] 브라우저에서 `/icon-512.png` 접속 시 이미지 표시
- [ ] Application > Manifest에서 아이콘 정상 표시
- [ ] Application > Service Workers에서 등록 확인
- [ ] HTTPS 또는 localhost 사용
- [ ] 프론트엔드 재빌드 완료
- [ ] 브라우저 캐시 삭제 후 재시도

## 🚀 아이콘 생성 후 재빌드

```bash
# 1. 아이콘 파일 확인
ls frontend/public/icon-*.png

# 2. 재빌드
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml up -d frontend

# 3. 브라우저에서 확인
# 개발자 도구 > Application > Manifest
```

## 💡 팁

- 아이콘 파일이 없어도 PWA는 작동하지만, 설치 버튼이 나타나지 않을 수 있습니다
- 아이콘은 반드시 PNG 형식이어야 합니다
- 파일 이름은 정확히 `icon-192.png`, `icon-512.png`여야 합니다

