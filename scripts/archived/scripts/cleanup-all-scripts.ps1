# Cleanup Unnecessary Scripts

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Cleanup Scripts" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "D:\CC\1.1"

# Files to DELETE (temporary/duplicate/old scripts)
$filesToDelete = @(
    # Old sync attempts
    "sync-from-server.bat", "sync-from-server.ps1",
    "sync-from-server-ssh.bat", "sync-from-server-ssh.ps1",
    "sync-from-server-simple.ps1",
    "sync-database-now.bat", "sync-database-now.ps1",
    "server-export-and-download.bat", "server-export-and-download.ps1",
    "download-db-from-server.bat", "download-db-from-server.ps1",
    "download-from-server.bat", "download-from-server.ps1",
    "import-downloaded-db.bat", "import-downloaded-db.ps1",

    # Step-by-step guides (merged into one)
    "STEP1-export-on-server.txt",
    "STEP2-download-and-import.bat", "STEP2-download-and-import.ps1",

    # Test scripts
    "test-mysql-password.bat", "test-mysql-password.ps1",
    "test-direct-mysql.bat", "test-direct-mysql.ps1",
    "test-mysql.ps1",
    "check-tables.ps1",

    # Old dev scripts
    "dev-start.bat", "dev-start.ps1",
    "dev-local.bat", "dev-local.ps1",
    "dev-stop.bat", "dev-stop.ps1",
    "ssh-tunnel.bat", "ssh-tunnel.ps1",

    # Utility scripts (no longer needed)
    "check-local-services.bat", "check-local-services.ps1",
    "check-database.ps1",
    "init-database-local.bat", "init-database-local.ps1",
    "fix-local-env.bat", "fix-local-env.ps1",
    "start-redis.ps1",
    "fix-missing-tables.bat", "fix-missing-tables.ps1",

    # Deployment scripts (local dev only now)
    "CLEAN-PORTS.bat", "START-BACKEND.bat", "START-ALL.bat",
    "STOP.bat", "CHECK-BACKEND-HEALTH.bat", "QUICK-DEPLOY.bat",
    "UPDATE-PERMISSIONS.bat", "一键部署.bat",
    "deploy.bat", "deploy_frontend_fix.bat", "deploy.ps1",

    # Old config
    "docker-compose.local.yml",
    "vite.config.local.ts",

    # Temporary files
    "服务器执行命令.txt",
    "plink.exe",
    "backend-sync.log", "backend-sync-error.log",

    # This cleanup script itself
    "cleanup-scripts.bat", "cleanup-scripts.ps1"
)

# Files to KEEP
$filesToKeep = @(
    "dev-start-local-db.bat", "dev-start-local-db.ps1",  # Main dev script
    "git-push.bat", "git-push.ps1",                       # Git push
    "fix-git-push.bat", "fix-git-push.ps1",               # Fix git issues
    "git-pull-and-import-db.bat", "git-pull-and-import-db.ps1",  # DB sync
    "fix-git-pull.bat", "fix-git-pull.ps1",               # Fix pull conflicts
    "reset-local-database.bat", "reset-local-database.ps1",  # Reset DB
    "import-sample-data.bat", "import-sample-data.ps1",   # Import samples
    "LOCAL-DEV-README.md"                                  # Documentation
)

Write-Host "Files to keep:" -ForegroundColor Green
$filesToKeep | ForEach-Object { Write-Host "  ✓ $_" -ForegroundColor Gray }
Write-Host ""

Write-Host "Deleting unnecessary files..." -ForegroundColor Yellow
Write-Host ""

$deleted = 0
$notFound = 0

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  Deleted: $file" -ForegroundColor DarkGray
        $deleted++
    } else {
        $notFound++
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "Deleted: $deleted files" -ForegroundColor White
Write-Host "Not found: $notFound files" -ForegroundColor DarkGray
Write-Host ""

Write-Host "Remaining useful scripts:" -ForegroundColor Cyan
Get-ChildItem *.bat, *.ps1 -File | Where-Object { $_.Name -ne "cleanup-all-scripts.ps1" } | ForEach-Object {
    Write-Host "  $($_.Name)" -ForegroundColor White
}
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
