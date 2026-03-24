#!/bin/bash
# Vivian's Signal 一键部署脚本（GitHub Pages）
# 用法：bash deploy.sh 或 bash deploy.sh "commit message"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "开始部署 vivianai.cn (GitHub Pages) ..."
echo ""

# 1. 检查是否有改动
if git diff --quiet && git diff --cached --quiet; then
  echo "没有新改动，跳过部署。"
  exit 0
fi

# 2. 暂存所有改动
echo "暂存文件..."
git add -A

# 3. 提交
MSG="${1:-更新 Signal 页面 $(date +%Y-%m-%d)}"
echo "提交：$MSG"
git commit -m "$MSG"

# 4. 推送到 GitHub（触发 GitHub Pages 自动部署）
echo "推送到 GitHub..."
git push origin master

if [ $? -eq 0 ]; then
  echo ""
  echo "部署成功！GitHub Pages 会在 1-2 分钟内更新。"
  echo "主站：https://vivianai.cn"
  echo "情报站：https://vivianai.cn/signal.html"
else
  echo ""
  echo "推送失败，请检查上面的错误信息"
fi
