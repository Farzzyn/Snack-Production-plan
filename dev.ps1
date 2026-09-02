$env:Path = "$env:LOCALAPPDATA\Programs\nodejs;C:\Program Files\Git\cmd;$env:Path"
Write-Host "Starting Snack Production Planner on http://127.0.0.1:3000..." -ForegroundColor Cyan
Start-Process "http://127.0.0.1:3000"
npm.cmd run dev
