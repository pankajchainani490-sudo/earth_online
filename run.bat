@echo off
chcp 65001 >nul
title 人生协议

echo Starting backend...
start "Backend" cmd /c "life-protocol.exe && pause"

echo Waiting for backend to start...
timeout /t 2 /nobreak >nul

echo Starting frontend...
cd frontend
start "Frontend" cmd /c "npm run dev"

echo Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:8008
