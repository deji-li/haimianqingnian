# Kill all Node.js processes

Write-Host "Killing all Node.js processes..." -ForegroundColor Yellow

Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Done!" -ForegroundColor Green
Write-Host ""
Write-Host "Now you can run dev-start-local-db.bat again" -ForegroundColor Cyan
