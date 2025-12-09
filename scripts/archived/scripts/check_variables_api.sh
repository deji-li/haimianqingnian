#!/bin/bash
echo "=== 1. 检查数据库中的变量数据 ==="
docker exec -i crm-mysql mysql -uroot -p7821630lideji education_crm -e "
SELECT COUNT(*) as total FROM ai_prompt_variables;
SELECT scenario_key, COUNT(*) as count FROM ai_prompt_variables GROUP BY scenario_key;
"

echo ""
echo "=== 2. 检查 ai_prompt_configs 表的ID ==="
docker exec -i crm-mysql mysql -uroot -p7821630lideji education_crm -e "
SELECT id, scenario_key, model_provider FROM ai_prompt_configs LIMIT 5;
"

echo ""
echo "=== 3. 测试API接口（示例：查询ID为1的配置的变量） ==="
curl -s http://localhost:3000/ai-config/1/variables | jq '.' || echo "API返回为空或错误"
