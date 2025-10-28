@echo off
setlocal

set BACKEND_CMD=cmd /k "cd /d %~dp0backend && npm run start:dev"
set FRONTEND_CMD=cmd /k "cd /d %~dp0frontend && npm run dev"

REM Start backend server
start "Slipknot Shop Backend" %BACKEND_CMD%

REM Start frontend dev server
start "Slipknot Shop Frontend" %FRONTEND_CMD%

echo Backend and frontend startup commands have been issued.
echo Check the opened windows for server logs.
exit /b 0
