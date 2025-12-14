# 건설 현장 인력 관리 시스템 개발 계획

## 기술 스택
- React + TypeScript + Vite
- Shadcn-ui 컴포넌트
- Tailwind CSS
- localStorage (임시, Supabase 연결 후 마이그레이션)

## 데이터 구조
1. 사용자 (users)
   - id, email, password, role (admin/manager), teamId
   
2. 팀 (teams)
   - id, name (팀1, 팀2, 팀3)
   
3. 작업자 (workers)
   - id, name, teamId
   
4. 공수 기록 (workRecords)
   - id, workerId, workerName, siteName, workDate, workHours, teamId, createdBy
   
5. 장비 기록 (equipmentRecords)
   - id, workDate, siteName, equipmentType, quantity, teamId, createdBy

## 파일 구조
1. src/lib/supabase.ts - Supabase 클라이언트 설정
2. src/lib/auth.tsx - 인증 컨텍스트
3. src/lib/storage.ts - localStorage 유틸리티
4. src/types/index.ts - TypeScript 타입 정의
5. src/pages/Login.tsx - 로그인 페이지
6. src/pages/Dashboard.tsx - 대시보드 (매니저/관리자)
7. src/pages/WorkRecord.tsx - 공수 기록 페이지
8. src/pages/WorkerManagement.tsx - 작업자 관리
9. src/pages/MonthlyReport.tsx - 월별 전체 현황
10. src/components/Calendar.tsx - 달력 컴포넌트
11. src/components/WorkRecordForm.tsx - 공수 기록 폼
12. src/components/EquipmentForm.tsx - 장비 기록 폼
13. src/App.tsx - 라우팅 설정

## 주요 기능
1. 로그인/로그아웃 (관리자: ys26k/ys7502!@02, 매니저: team1/team1, team2/team2, team3/team3)
2. 달력 기반 공수 기록 (작업자명, 현장명, 공수 0.5 단위)
3. 장비 기록 (6w, 3w, 035, 덤프, 1t, 3.5t, 살수차, 모범수)
4. 이전 기록 자동 불러오기
5. 작업자 추가/삭제/수정
6. 팀별 데이터 분리 (매니저는 자기 팀만, 관리자는 전체)
7. 월별 현황 - 현장별 분류, 총 공수 표시
8. 모든 사용자 기록 수정 가능

## 디자인 스타일
- 깔끔한 대시보드 레이아웃
- 달력 중심 UI
- 모바일 반응형
- 한국어 인터페이스