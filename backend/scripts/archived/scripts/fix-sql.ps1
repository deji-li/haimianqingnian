$content = Get-Content -Path 'init-ai-script-data.sql' -Raw

# Fix all remaining scenarios (3-9)
for ($i = 3; $i -le 9; $i++) {
    # Pattern for scenario insertion
    $oldPattern = "INSERT INTO ``ai_script_scenario`` \(``function_type``, ``scenario_name``, ``scene_category``, ``scenario_desc``, ``sort_order``\) VALUES`n\('deal_assist', ([^,]+), ([^,]+), ([^,]+), $i\),`n\('reply_assist', ([^,]+), ([^,]+), ([^,]+), $i\);`n`nSET @scenario_deal_$i = LAST_INSERT_ID\(\) - 1;`nSET @scenario_reply_$i = LAST_INSERT_ID\(\);"
    
    $newPattern = "INSERT INTO ``ai_script_scenario`` (``function_type``, ``scenario_name``, ``scene_category``, ``scenario_desc``, ``sort_order``) VALUES`n('deal_assist', `$1, `$2, `$3, $i);`nSET @scenario_deal_$i = LAST_INSERT_ID();`n`nINSERT INTO ``ai_script_scenario`` (``function_type``, ``scenario_name``, ``scene_category``, ``scenario_desc``, ``sort_order``) VALUES`n('reply_assist', `$4, `$5, `$6, $i);`nSET @scenario_reply_$i = LAST_INSERT_ID();"
    
    $content = $content -replace $oldPattern, $newPattern
}

Set-Content -Path 'init-ai-script-data-fixed.sql' -Value $content -Encoding UTF8
Write-Output 'Fixed SQL file created as init-ai-script-data-fixed.sql'
