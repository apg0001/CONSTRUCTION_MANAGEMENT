# 📱 PWA (Progressive Web App) 설정 가이드

## ✅ PWA 설정 완료!

프로젝트에 PWA 기능이 추가되었습니다. 이제 모바일과 데스크톱에서 앱처럼 설치하고 사용할 수 있습니다.

## 🚀 기능

- ✅ **홈 화면에 추가**: 모바일/데스크톱에서 앱처럼 설치
- ✅ **오프라인 지원**: 인터넷 연결 없이도 기본 기능 사용 가능
- ✅ **빠른 로딩**: 캐싱을 통한 빠른 로딩
- ✅ **앱처럼 동작**: 독립적인 창으로 실행

## 📋 설정된 내용

### 1. Manifest 파일
- `frontend/public/manifest.json` - 앱 메타데이터
- 앱 이름, 아이콘, 테마 색상 등 설정

### 2. Service Worker
- 자동 생성됨 (빌드 시)
- 오프라인 지원 및 캐싱

### 3. Vite PWA 플러그인
- `vite-plugin-pwa` 추가됨
- 자동 Service Worker 생성 및 관리

## 🎨 아이콘 추가 방법

현재 기본 아이콘이 설정되어 있습니다. 커스텀 아이콘을 추가하려면:

### 1. 아이콘 파일 준비
- `icon-192.png` (192x192 픽셀)
- `icon-512.png` (512x512 픽셀)
- `frontend/public/` 디렉토리에 저장

### 2. 아이콘 생성 도구
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### 3. 간단한 아이콘 생성 (온라인)
```bash
# 온라인 도구 사용
# 1. https://www.pwabuilder.com/imageGenerator 방문
# 2. 이미지 업로드
# 3. 생성된 파일 다운로드
# 4. frontend/public/ 에 복사
```

## 🔧 설치 및 사용

### 1. 의존성 설치
```bash
cd frontend
pnpm install
# 또는
npm install
```

### 2. 빌드
```bash
pnpm build
```

### 3. PWA 테스트

#### 개발 환경
```bash
pnpm dev
# 브라우저에서 http://localhost:5173 접속
# 개발자 도구 > Application > Service Workers 확인
```

#### 프로덕션 환경
```bash
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

## 📱 모바일에서 설치

### Android (Chrome)
1. 브라우저에서 사이트 접속
2. 메뉴 (⋮) > "홈 화면에 추가" 또는 "앱 설치"
3. 설치 확인

### iOS (Safari)
1. Safari에서 사이트 접속
2. 공유 버튼 (□↑) > "홈 화면에 추가"
3. 설치 확인

### 데스크톱 (Chrome/Edge)
1. 주소창 오른쪽의 설치 아이콘 클릭
2. "설치" 클릭
3. 독립 창으로 실행됨

## 🔍 PWA 확인 방법

### 브라우저 개발자 도구
1. F12 또는 개발자 도구 열기
2. **Application** 탭
3. **Manifest** - 메타데이터 확인
4. **Service Workers** - Service Worker 상태 확인
5. **Storage** - 캐시 확인

### Lighthouse 테스트
1. 개발자 도구 > **Lighthouse** 탭
2. "Progressive Web App" 체크
3. "Analyze page load" 클릭
4. PWA 점수 확인

## ⚙️ 설정 커스터마이징

### manifest.json 수정
`frontend/public/manifest.json` 파일을 수정하여:
- 앱 이름 변경
- 테마 색상 변경
- 아이콘 변경
- 바로가기 추가/수정

### vite.config.ts 수정
`frontend/vite.config.ts`에서:
- 캐싱 전략 변경
- 오프라인 동작 커스터마이징
- Service Worker 옵션 조정

## 🐛 문제 해결

### Service Worker가 등록되지 않음
```bash
# 1. 브라우저 캐시 삭제
# 2. Service Worker 수동 등록 해제
# 개발자 도구 > Application > Service Workers > Unregister

# 3. 재빌드
pnpm build
```

### 오프라인 모드가 작동하지 않음
- HTTPS 또는 localhost에서만 작동
- Service Worker가 정상 등록되었는지 확인
- 네트워크 탭에서 오프라인 모드 테스트

### 아이콘이 표시되지 않음
- 아이콘 파일이 `public/` 디렉토리에 있는지 확인
- 파일 이름이 정확한지 확인 (icon-192.png, icon-512.png)
- manifest.json의 경로가 올바른지 확인

## 📝 요약

| 기능 | 상태 | 설명 |
|------|------|------|
| Manifest | ✅ 설정됨 | 앱 메타데이터 |
| Service Worker | ✅ 자동 생성 | 오프라인 지원 |
| 아이콘 | ⚠️ 기본값 | 커스텀 아이콘 추가 권장 |
| 설치 가능 | ✅ 가능 | 모바일/데스크톱 |
| 오프라인 | ✅ 지원 | 기본 캐싱 |

## 🎯 다음 단계

1. **커스텀 아이콘 추가** - 브랜드에 맞는 아이콘 생성
2. **오프라인 기능 강화** - 필요한 데이터 캐싱
3. **푸시 알림** (선택사항) - 알림 기능 추가
4. **Lighthouse 최적화** - PWA 점수 향상

## 💡 팁

- **HTTPS 필수**: 프로덕션에서는 HTTPS가 필요합니다
- **아이콘 최적화**: 다양한 크기의 아이콘 제공
- **테마 색상**: 브랜드에 맞는 색상 사용
- **오프라인 전략**: 중요한 데이터는 미리 캐싱

PWA가 정상적으로 작동합니다! 🎉

