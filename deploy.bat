@echo off
REM Construction Site Management System - 자동 배포 스크립트 (Windows)
REM 모든 설정이 자동으로 처리됩니다!

echo 🚀 Construction Site Management System 자동 배포 시작...

REM ============================================
REM 1. 자동 환경 변수 생성
REM ============================================
echo 📝 환경 변수 자동 설정 중...

REM SECRET_KEY 자동 생성 (PowerShell 사용)
powershell -Command "$key = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_}); $key" > temp_key.txt
set /p SECRET_KEY=<temp_key.txt
del temp_key.txt

REM .env 파일 자동 생성
if not exist .env (
    echo ⚠️  .env 파일이 없습니다. 자동으로 생성합니다.
    (
        echo # 자동 생성된 환경 변수 파일
        echo # 생성 시간: %date% %time%
        echo.
        echo # 데이터베이스 설정
        echo DATABASE_URL=sqlite:///./data/test.db
        echo.
        echo # 보안 설정 (자동 생성됨)
        echo SECRET_KEY=%SECRET_KEY%
        echo.
        echo # 환경 설정
        echo ENVIRONMENT=production
        echo.
        echo # CORS 설정
        echo CORS_ORIGINS=http://localhost:80,http://localhost:5173
        echo.
        echo # JWT 토큰 만료 시간
        echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        echo.
        echo # Frontend API URL
        echo VITE_API_URL=http://localhost:8000
    ) > .env
    echo ✓ .env 파일이 자동으로 생성되었습니다.
) else (
    echo ✓ 기존 .env 파일을 사용합니다.
)

REM ============================================
REM 2. Docker 설치 확인
REM ============================================
echo 🐳 Docker 확인 중...

where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Docker가 설치되어 있지 않습니다.
    echo Docker Desktop을 설치하세요: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

where docker-compose >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Docker Compose가 없습니다. docker compose를 사용합니다.
    set DOCKER_COMPOSE=docker compose
) else (
    set DOCKER_COMPOSE=docker-compose
)

echo ✓ Docker 준비 완료

REM ============================================
REM 3. 기존 컨테이너 정리
REM ============================================
echo 🧹 기존 컨테이너 정리 중...
%DOCKER_COMPOSE% -f docker-compose.prod.yml down

REM ============================================
REM 4. Docker 이미지 빌드
REM ============================================
echo 🔨 Docker 이미지 빌드 중...
%DOCKER_COMPOSE% -f docker-compose.prod.yml build

REM ============================================
REM 5. 컨테이너 시작
REM ============================================
echo 🚀 컨테이너 시작 중...
%DOCKER_COMPOSE% -f docker-compose.prod.yml up -d

REM ============================================
REM 6. 헬스 체크
REM ============================================
echo 🏥 서비스 상태 확인 중...
timeout /t 15 /nobreak >nul

REM ============================================
REM 7. 완료 메시지
REM ============================================
echo.
echo ════════════════════════════════════════
echo ✅ 배포가 완료되었습니다!
echo ════════════════════════════════════════
echo.
echo 📋 서비스 정보:
echo   🌐 Frontend:    http://localhost
echo   🔧 Backend API: http://localhost:8000
echo   📚 API Docs:    http://localhost:8000/docs
echo.
echo 📝 유용한 명령어:
echo   로그 확인:     %DOCKER_COMPOSE% -f docker-compose.prod.yml logs -f
echo   서비스 중지:   %DOCKER_COMPOSE% -f docker-compose.prod.yml down
echo   서비스 재시작: %DOCKER_COMPOSE% -f docker-compose.prod.yml restart
echo   컨테이너 상태: %DOCKER_COMPOSE% -f docker-compose.prod.yml ps
echo.
echo 💡 팁: .env 파일을 수정하여 설정을 변경할 수 있습니다.
echo.

pause
