@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;C:\Program Files\Git\cmd;%PATH%"
echo ============================================================
echo Starting Snack Production Planner Dev Server...
echo URL: http://127.0.0.1:3000
echo ============================================================
start http://127.0.0.1:3000
call npm run dev
pause
