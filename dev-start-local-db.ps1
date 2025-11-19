# Start Local Development with Existing MySQL + Redis
# No Docker required

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Local Development Environment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Environment:" -ForegroundColor Yellow
Write-Host "  MySQL:   localhost:3306" -ForegroundColor Cyan
Write-Host "  Redis:   localhost:6379" -ForegroundColor Cyan
Write-Host "  Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5174" -ForegroundColor Cyan
Write-Host ""

# Start Backend in new window
Write-Host "[1/2] Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\CC\1.1\backend'; Write-Host 'Starting Backend Server...' -ForegroundColor Green; pnpm run start:dev"
Write-Host "Backend starting in new window..." -ForegroundColor Green
Write-Host ""

# Wait a bit for backend to start
Write-Host "Waiting 5 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host ""

# Start Frontend in new window
Write-Host "[2/2] Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\CC\1.1\frontend'; Write-Host 'Starting Frontend Dev Server...' -ForegroundColor Green; pnpm dev"
Write-Host "Frontend starting in new window..." -ForegroundColor Green
Write-Host ""

Write-Host "================================" -ForegroundColor Green
Write-Host "Development Started!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5174" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "  API Docs: http://localhost:3000/api" -ForegroundColor White
Write-Host ""
Write-Host "Login:" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit (services will continue running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
