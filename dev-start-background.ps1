# Start Local Development Environment in Background (Hidden Windows)
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Starting Development Environment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend in background (hidden window)
Write-Host "[1/2] Starting Backend..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList "-WindowStyle Hidden", "-Command", "cd 'D:\CC\1.1\backend'; pnpm run start:dev" -PassThru
Write-Host "Backend started in background (PID: $($backendProcess.Id))" -ForegroundColor Green
Write-Host ""

# Wait for Backend initialization
Write-Host "Waiting 5 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host ""

# Start Frontend in background (hidden window)
Write-Host "[2/2] Starting Frontend..." -ForegroundColor Yellow
$frontendProcess = Start-Process powershell -ArgumentList "-WindowStyle Hidden", "-Command", "cd 'D:\CC\1.1\frontend'; pnpm dev" -PassThru
Write-Host "Frontend started in background (PID: $($frontendProcess.Id))" -ForegroundColor Green
Write-Host ""

Write-Host "================================" -ForegroundColor Green
Write-Host "Development Environment Started!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5174" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Login:" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Tip: Use kill-backend.bat to stop all services" -ForegroundColor Yellow
Write-Host ""
