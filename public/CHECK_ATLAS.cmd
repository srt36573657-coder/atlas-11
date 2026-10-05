@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 24를 먼저 설치한 후 다시 실행하세요: https://nodejs.org/
  pause
  exit /b 1
)
node DEPLOY_NETLIFY.mjs --check
set "ATLAS_EXIT_CODE=%ERRORLEVEL%"
pause
exit /b %ATLAS_EXIT_CODE%
