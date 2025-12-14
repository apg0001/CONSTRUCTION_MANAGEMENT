# shadcn-ui 템플릿 (로컬 실행 안내)

간단한 데모/관리용 React + TypeScript 템플릿입니다. TailwindCSS 기반의 shadcn UI 컴포넌트들이 포함되어 있습니다.

## 기술 스택

- React 19 + TypeScript
- Vite (번들러 / 개발 서버)
- Tailwind CSS (+ animate, aspect-ratio 플러그인)
- shadcn-ui 컴포넌트 (src/components/ui)

## 주요 파일/진입점

- `index.html` — HTML 진입점
- `src/main.tsx` — React 진입점
- `src/App.tsx` — 루트 컴포넌트
- `src/index.css` — 글로벌 Tailwind 스타일
- `vite.config.ts` — Vite 설정 (`@` → `src` alias 포함)

## 로컬에서 실행 (npm 사용 예제)

> 이 프로젝트는 pnpm으로 락파일이 관리되어 있지만, npm으로도 실행할 수 있도록 `start` 스크립트를 추가해 두었습니다.

1) 의존성 설치

```bat
npm install
```

2) 개발 서버 시작

```bat
npm start
```

또는

```bat
npm run dev
```

3) 빌드

```bat
npm run build
```

4) 빌드 결과 미리보기

```bat
npm run preview
```

참고: 권장 패키지 매니저는 `pnpm`입니다(프로젝트 루트에 `pnpm-lock.yaml` 존재). pnpm을 사용하려면 `npm install -g pnpm` 또는 corepack을 이용해 활성화하세요.

## 저장(데이터 보관) 방식

이 템플릿은 서버 백엔드 없이 클라이언트에 데이터를 저장하기 위해 브라우저의 `localStorage`를 사용합니다. 구현 파일: `src/lib/storage.ts`.

- 초기화: 앱 시작 시(`AuthProvider` 내부) `initializeStorage()`가 호출되어 기본 사용자(관리자, 매니저)와 팀 목록을 `localStorage`에 시드합니다.
- 데이터 모델: 사용자(users), 팀(teams), 작업자(workers), 공수 기록(work_records), 장비 기록(equipment_records) 등 여러 키로 구분해 저장합니다.
- CRUD 유틸: `getUsers`, `login`, `getWorkers`, `addWorker`, `getWorkRecords`, `addWorkRecord` 등 함수로 로컬 스토리지를 읽고 쓰는 형태로 구현되어 있습니다.

장단점 요약:
- 장점: 별도 서버 불필요, 빠른 로컬 데모/개발에 적합
- 단점: 브라우저별로 데이터가 분리되고(동기화 불가), 보안(비밀번호 평문 저장 등)과 데이터 영속성 측면에서 제한적입니다. 실사용/협업 환경에서는 서버(예: Supabase, REST API 등)로 이전이 필요합니다.

## 인증 및 시드 계정

- 기본 시드 계정(예시): `ys26k / ys7502!@02` (role: admin)
- 매니저용 계정: `team1/team2/team3` (비밀번호: `team1`, `team2`, `team3`)

이 계정들은 `localStorage`에 초기화되며, 저장된 데이터를 삭제하면 계정도 사라집니다.

## 참고 / 문제 해결
- 개발 서버에서 스타일( Tailwind )이 적용되지 않으면 `src/index.css`에 `@tailwind base; @tailwind components; @tailwind utilities;`가 있는지 확인하세요.
- Vite 관련 문제 발생 시 `vite.config.ts`의 커스텀 플러그인(`@metagptx/vite-plugin-source-locator`)을 주석 처리해보세요.
- Node 버전은 보통 Node 18+ 권장입니다.

---

원하시면 README를 영어 버전으로도 추가하거나, `localStorage` 대신 Supabase/백엔드로 전환하는 작업(간단한 마이그레이션 가이드 포함)을 도와드리겠습니다.
