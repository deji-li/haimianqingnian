@echo off
cd /d D:\CC\1.1
git add frontend/src/views/knowledge/List.vue
git commit -m "fix: 修复知识库列表字段名不匹配"
git push origin master
pause
