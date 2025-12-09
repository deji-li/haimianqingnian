Set-Location "D:\CC\1.1"
git add frontend/src/views/knowledge/List.vue
git commit -m "fix: update List.vue data field name"
git push origin master
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
