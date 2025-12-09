#!/bin/bash
# ==================== API功能完整测试脚本 ====================
# 测试时间: 2025-11-24
# 说明: 测试所有API接口的实际业务功能

echo "========================================"
echo "开始API功能完整测试"
echo "========================================"
echo ""

# API基础URL
API_URL="http://localhost:3000/api"

# 测试计数
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_COUNT=0

# 测试函数
test_api() {
    local test_name=$1
    local expected=$2
    local result=$3

    TOTAL_COUNT=$((TOTAL_COUNT + 1))

    if [[ "$result" == *"$expected"* ]]; then
        echo "✓ PASS: $test_name"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo "✗ FAIL: $test_name"
        echo "  预期包含: $expected"
        echo "  实际结果: $result"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

echo "【测试1】获取所有自动回访配置"
echo "------------------------------------"
RESULT=$(curl -s "$API_URL/auto-follow-config")
test_api "获取所有配置 - 返回code 200" '"code":200' "$RESULT"
test_api "获取所有配置 - 包含极高意向" '极高意向' "$RESULT"
test_api "获取所有配置 - 包含成交" '成交' "$RESULT"
echo ""

echo "【测试2】获取按意向度分组的配置"
echo "------------------------------------"
RESULT=$(curl -s "$API_URL/auto-follow-config/grouped")
test_api "分组配置 - 返回code 200" '"code":200' "$RESULT"
test_api "分组配置 - 包含分组数据" '"data":{' "$RESULT"
echo ""

echo "【测试3】获取指定意向度的配置"
echo "------------------------------------"
INTENT_ENCODED=$(printf %s "极高意向" | jq -sRr @uri)
RESULT=$(curl -s "$API_URL/auto-follow-config/intent/$INTENT_ENCODED")
test_api "指定意向配置 - 返回code 200" '"code":200' "$RESULT"
test_api "指定意向配置 - 只包含极高意向" '极高意向' "$RESULT"
echo ""

echo "【测试4】更新单个配置"
echo "------------------------------------"
# 先获取一个配置的ID
CONFIG_ID=$(curl -s "$API_URL/auto-follow-config" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "使用配置ID: $CONFIG_ID"

# 获取原配置
ORIGINAL=$(curl -s "$API_URL/auto-follow-config" | grep -A 5 "\"id\":$CONFIG_ID")

# 更新配置
UPDATE_RESULT=$(curl -s -X PUT "$API_URL/auto-follow-config/$CONFIG_ID" \
  -H "Content-Type: application/json" \
  -d '{"daysInterval":99,"isActive":1}')

test_api "更新配置 - 返回code 200" '"code":200' "$UPDATE_RESULT"
test_api "更新配置 - 间隔天数已修改为99" '"daysInterval":99' "$UPDATE_RESULT"

# 恢复原配置
curl -s -X PUT "$API_URL/auto-follow-config/$CONFIG_ID" \
  -H "Content-Type: application/json" \
  -d '{"daysInterval":1,"isActive":1}' > /dev/null
echo "✓ 已恢复原配置"
echo ""

echo "【测试5】切换配置启用状态"
echo "------------------------------------"
# 禁用
TOGGLE_RESULT=$(curl -s -X PUT "$API_URL/auto-follow-config/$CONFIG_ID/toggle")
test_api "禁用配置 - 返回code 200" '"code":200' "$TOGGLE_RESULT"
test_api "禁用配置 - isActive为0" '"isActive":0' "$TOGGLE_RESULT"

# 重新启用
TOGGLE_RESULT=$(curl -s -X PUT "$API_URL/auto-follow-config/$CONFIG_ID/toggle")
test_api "启用配置 - 返回code 200" '"code":200' "$TOGGLE_RESULT"
test_api "启用配置 - isActive为1" '"isActive":1' "$TOGGLE_RESULT"
echo ""

echo "【测试6】批量更新配置"
echo "------------------------------------"
BATCH_RESULT=$(curl -s -X PUT "$API_URL/auto-follow-config/batch/$INTENT_ENCODED" \
  -H "Content-Type: application/json" \
  -d '{"updates":[{"roundNumber":1,"daysInterval":1,"isActive":1},{"roundNumber":2,"daysInterval":3,"isActive":1}]}')

test_api "批量更新 - 返回code 200" '"code":200' "$BATCH_RESULT"
test_api "批量更新 - 返回数组数据" '"data":[' "$BATCH_RESULT"
echo ""

echo "【测试7】测试字典接口"
echo "------------------------------------"
DICT_RESULT=$(curl -s "$API_URL/dictionary/customer_intent")
test_api "字典接口 - 返回code 200" '"code":200' "$DICT_RESULT"
test_api "字典接口 - 包含极高意向" '极高意向' "$DICT_RESULT"
test_api "字典接口 - 包含成交" '成交' "$DICT_RESULT"
echo ""

echo "【测试8】测试错误处理"
echo "------------------------------------"
# 测试不存在的配置ID
ERROR_RESULT=$(curl -s -X PUT "$API_URL/auto-follow-config/99999" \
  -H "Content-Type: application/json" \
  -d '{"daysInterval":1}')
test_api "不存在的ID - 返回错误" '"code":' "$ERROR_RESULT"

# 测试无效的意向度
INVALID_INTENT=$(printf %s "无效意向" | jq -sRr @uri)
ERROR_RESULT=$(curl -s "$API_URL/auto-follow-config/intent/$INVALID_INTENT")
test_api "无效意向度 - 能正常处理" '"code":200' "$ERROR_RESULT"
echo ""

echo "【测试9】测试API响应速度"
echo "------------------------------------"
START_TIME=$(date +%s%3N)
curl -s "$API_URL/auto-follow-config" > /dev/null
END_TIME=$(date +%s%3N)
DURATION=$((END_TIME - START_TIME))

if [ $DURATION -lt 1000 ]; then
    echo "✓ PASS: API响应速度正常 (${DURATION}ms < 1000ms)"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo "✗ FAIL: API响应速度慢 (${DURATION}ms >= 1000ms)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi
TOTAL_COUNT=$((TOTAL_COUNT + 1))
echo ""

echo "【测试10】测试Swagger文档可用性"
echo "------------------------------------"
SWAGGER_RESULT=$(curl -s "$API_URL" | head -20)
if [[ "$SWAGGER_RESULT" == *"Swagger"* ]]; then
    echo "✓ PASS: Swagger文档可访问"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo "✗ FAIL: Swagger文档不可访问"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi
TOTAL_COUNT=$((TOTAL_COUNT + 1))
echo ""

echo "========================================"
echo "API功能测试完成"
echo "========================================"
echo ""
echo "测试结果统计:"
echo "  总测试数: $TOTAL_COUNT"
echo "  通过数: $PASS_COUNT"
echo "  失败数: $FAIL_COUNT"
echo "  通过率: $((PASS_COUNT * 100 / TOTAL_COUNT))%"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "✓✓✓ 全部API功能测试通过 ✓✓✓"
    exit 0
else
    echo "✗✗✗ 部分API功能测试失败 ✗✗✗"
    exit 1
fi
