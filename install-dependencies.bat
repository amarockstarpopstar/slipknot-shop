@echo off
setlocal

REM Install backend dependencies
pushd "%~dp0backend"
if errorlevel 1 (
  echo Failed to enter backend directory.
  exit /b 1
)
call npm install
if errorlevel 1 (
  echo Backend dependency installation failed.
  popd
  exit /b 1
)
popd

REM Install frontend dependencies
pushd "%~dp0frontend"
if errorlevel 1 (
  echo Failed to enter frontend directory.
  exit /b 1
)
call npm install
if errorlevel 1 (
  echo Frontend dependency installation failed.
  popd
  exit /b 1
)
popd

echo All dependencies installed successfully.
exit /b 0
